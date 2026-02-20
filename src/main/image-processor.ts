import { ipcMain, BrowserWindow } from 'electron'
import sharp from 'sharp'
import { join } from 'path'
import { stat, mkdir } from 'fs/promises'
import { IPC } from '../shared/ipc-channels'
import { renderFilename } from './filename-template'
import type {
  ProcessRequest,
  ProcessResult,
  ImageResult,
  ProgressUpdate,
  ImageFormat
} from '../shared/types'

const SHARP_TIMEOUT_MS = 30_000

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Sharp operation timed out after 30s: ${label}`)), SHARP_TIMEOUT_MS)
    )
  ])
}

let cancelFlag = false

function sendProgress(win: BrowserWindow, update: ProgressUpdate): void {
  win.webContents.send(IPC.IMAGES_PROGRESS, update)
}

async function processImage(
  filePath: string,
  opts: ProcessRequest,
  index: number,
  win: BrowserWindow
): Promise<ImageResult> {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error(`Invalid file path: expected a non-empty string, got ${typeof filePath}`)
  }

  const filename = filePath.split(/[\\/]/).pop() || 'unknown'

  sendProgress(win, { index, total: opts.filePaths.length, filename, phase: 'resizing' })

  // Read metadata
  const image = sharp(filePath)
  const metadata = await withTimeout(image.metadata(), `metadata for ${filename}`)
  const originalWidth = metadata.width || 0
  const originalHeight = metadata.height || 0
  const originalSize = (await stat(filePath)).size

  // Resize (fit inside max dimension, no enlargement)
  let pipeline = sharp(filePath).resize({
    width: opts.maxDimension,
    height: opts.maxDimension,
    fit: 'inside',
    withoutEnlargement: true
  })

  let outputBuffer: Buffer
  let quality: number | null = null

  if (opts.format === 'png') {
    // PNG: lossless, no quality binary search
    sendProgress(win, { index, total: opts.filePaths.length, filename, phase: 'optimizing' })
    outputBuffer = await withTimeout(pipeline.png({ compressionLevel: 6 }).toBuffer(), `png compress ${filename}`)
  } else {
    // JPEG/WebP: binary search on quality to hit target size
    sendProgress(win, { index, total: opts.filePaths.length, filename, phase: 'optimizing' })

    let lo = 10
    let hi = 95
    let bestBuffer: Buffer | null = null
    let bestQuality = 80

    // Max 7 iterations of binary search
    for (let i = 0; i < 7; i++) {
      const mid = Math.round((lo + hi) / 2)
      const formatOpts = opts.format === 'jpeg' ? { mozjpeg: true } : {}

      sendProgress(win, { index, total: opts.filePaths.length, filename, phase: 'optimizing' })

      const buf = await withTimeout(
        sharp(filePath)
          .resize({
            width: opts.maxDimension,
            height: opts.maxDimension,
            fit: 'inside',
            withoutEnlargement: true
          })
          [opts.format]({ quality: mid, ...formatOpts })
          .toBuffer(),
        `quality search q=${mid} for ${filename}`
      )

      bestBuffer = buf
      bestQuality = mid

      const diff = buf.length - opts.targetFileSize
      if (Math.abs(diff) <= opts.sizeTolerance) {
        break // Within tolerance
      } else if (diff > 0) {
        hi = mid - 1 // Too big, lower quality
      } else {
        lo = mid + 1 // Too small, raise quality
      }

      if (lo > hi) break
    }

    outputBuffer = bestBuffer!
    quality = bestQuality
  }

  // Get output dimensions
  const outputMeta = await withTimeout(sharp(outputBuffer).metadata(), `output metadata for ${filename}`)
  const outputWidth = outputMeta.width || 0
  const outputHeight = outputMeta.height || 0

  // Render filename
  const outputFilename = renderFilename(opts.filenameTemplate, {
    originalPath: filePath,
    width: outputWidth,
    height: outputHeight,
    format: opts.format,
    counter: index + 1,
    fieldValues: opts.templateFieldValues || {}
  })

  const outputPath = join(opts.outputFolder, outputFilename)

  sendProgress(win, { index, total: opts.filePaths.length, filename, phase: 'writing' })

  await withTimeout(sharp(outputBuffer).toFile(outputPath), `write ${filename}`)

  sendProgress(win, { index, total: opts.filePaths.length, filename, phase: 'complete' })

  return {
    inputPath: filePath,
    outputPath,
    originalSize,
    outputSize: outputBuffer.length,
    originalWidth,
    originalHeight,
    outputWidth,
    outputHeight,
    quality,
    format: opts.format,
    filename: outputFilename
  }
}

export function registerImageHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(IPC.IMAGES_PROCESS, async (_, request: ProcessRequest): Promise<ProcessResult> => {
    cancelFlag = false
    const results: ImageResult[] = []
    const errors: Array<{ path: string; error: string }> = []

    await mkdir(request.outputFolder, { recursive: true })

    for (let i = 0; i < request.filePaths.length; i++) {
      if (cancelFlag) break
      try {
        const result = await processImage(request.filePaths[i], request, i, mainWindow)
        results.push(result)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push({ path: request.filePaths[i], error: msg })
        sendProgress(mainWindow, {
          index: i,
          total: request.filePaths.length,
          filename: request.filePaths[i].split(/[\\/]/).pop() || 'unknown',
          phase: 'error',
          error: msg
        })
      }
    }

    return { results, errors }
  })

  ipcMain.handle(IPC.IMAGES_CANCEL, () => {
    cancelFlag = true
  })

  ipcMain.handle(IPC.IMAGES_PREVIEW, async (_, filePath: string): Promise<string> => {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error(`Invalid file path for preview: expected a non-empty string, got ${typeof filePath}`)
    }

    const buffer = await sharp(filePath)
      .resize(200, 200, { fit: 'inside' })
      .jpeg({ quality: 60 })
      .toBuffer()
    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  })
}

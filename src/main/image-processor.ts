import { ipcMain, BrowserWindow } from 'electron'
import sharp from 'sharp'
import { join } from 'path'
import { statSync, mkdirSync } from 'fs'
import { IPC } from '../shared/ipc-channels'
import { renderFilename } from './filename-template'
import type {
  ProcessRequest,
  ProcessResult,
  ImageResult,
  ProgressUpdate,
  ImageFormat
} from '../shared/types'

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
  const filename = filePath.split(/[\\/]/).pop() || 'unknown'

  sendProgress(win, { index, total: opts.filePaths.length, filename, phase: 'resizing' })

  // Read metadata
  const image = sharp(filePath)
  const metadata = await image.metadata()
  const originalWidth = metadata.width || 0
  const originalHeight = metadata.height || 0
  const originalSize = statSync(filePath).size

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
    outputBuffer = await pipeline.png({ compressionLevel: 6 }).toBuffer()
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

      const buf = await sharp(filePath)
        .resize({
          width: opts.maxDimension,
          height: opts.maxDimension,
          fit: 'inside',
          withoutEnlargement: true
        })
        [opts.format]({ quality: mid, ...formatOpts })
        .toBuffer()

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
  const outputMeta = await sharp(outputBuffer).metadata()
  const outputWidth = outputMeta.width || 0
  const outputHeight = outputMeta.height || 0

  // Render filename
  const outputFilename = renderFilename(opts.filenameTemplate, {
    originalPath: filePath,
    width: outputWidth,
    height: outputHeight,
    format: opts.format,
    counter: index + 1
  })

  // Ensure output folder exists
  mkdirSync(opts.outputFolder, { recursive: true })

  const outputPath = join(opts.outputFolder, outputFilename)

  sendProgress(win, { index, total: opts.filePaths.length, filename, phase: 'writing' })

  await sharp(outputBuffer).toFile(outputPath)

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
    const buffer = await sharp(filePath)
      .resize(200, 200, { fit: 'inside' })
      .jpeg({ quality: 60 })
      .toBuffer()
    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  })
}

import type {
  QueueItem,
  ImageResult,
  ProgressUpdate,
  ProcessRequest,
  ImageFormat,
  TemplateFieldValues
} from '../../../../shared/types'

type View = 'process' | 'results' | 'settings'

let queue = $state<QueueItem[]>([])
let results = $state<ImageResult[]>([])
let processing = $state(false)
let progress = $state<ProgressUpdate | null>(null)
let errors = $state<Array<{ path: string; error: string }>>([])
let currentView = $state<View>('process')
let templateFieldValues = $state<TemplateFieldValues>({})
let activePresetId = $state<string | null>(null)

let progressCleanup: (() => void) | null = null

// Batch alt text generation state
let altTextProgress = $state({ current: 0, total: 0, generating: false })
let altTextCancelled = false

export function getJobState() {
  return {
    get queue() { return queue },
    get results() { return results },
    get processing() { return processing },
    get progress() { return progress },
    get errors() { return errors },
    get currentView() { return currentView },
    get templateFieldValues() { return templateFieldValues },
    get activePresetId() { return activePresetId },
    get altTextProgress() { return altTextProgress }
  }
}

export function setView(view: View): void {
  currentView = view
}

export function addFiles(files: Array<{ path: string; name: string; size: number }>): void {
  const newItems: QueueItem[] = files.map((f) => ({
    id: crypto.randomUUID(),
    path: f.path,
    name: f.name,
    size: f.size
  }))
  queue = [...queue, ...newItems]

  // Load thumbnails in background
  for (const item of newItems) {
    window.api.getPreview(item.path).then((thumb) => {
      queue = queue.map((q) => (q.id === item.id ? { ...q, thumbnail: thumb } : q))
    })
  }
}

export function removeFile(id: string): void {
  queue = queue.filter((q) => q.id !== id)
}

export function clearQueue(): void {
  queue = []
}

export function setTemplateFieldValue(key: string, value: string): void {
  templateFieldValues = { ...templateFieldValues, [key]: value }
}

export function setTemplateFieldValues(values: TemplateFieldValues): void {
  templateFieldValues = { ...values }
}

export function resetTemplateFieldValues(): void {
  templateFieldValues = {}
}

export function setActivePresetId(id: string | null): void {
  activePresetId = id
}

export async function processImages(opts: {
  outputFolder: string
  format: ImageFormat
  maxDimension: number
  targetFileSize: number
  sizeTolerance: number
  filenameTemplate: string
  templateFieldValues: TemplateFieldValues
}): Promise<void> {
  if (queue.length === 0) return

  processing = true
  progress = null
  errors = []
  results = []

  // Listen for progress
  progressCleanup = window.api.onProgress((update) => {
    progress = update
  })

  const request: ProcessRequest = {
    filePaths: queue.map((q) => q.path),
    ...opts,
    templateFieldValues: { ...opts.templateFieldValues }
  }

  try {
    const result = await window.api.processImages(request)
    results = result.results
    errors = result.errors
    if (results.length > 0) {
      currentView = 'results'
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors = [{ path: '', error: msg }]
  } finally {
    processing = false
    if (progressCleanup) {
      progressCleanup()
      progressCleanup = null
    }
    setTimeout(() => {
      progress = null
    }, 800)
  }
}

export async function cancelProcessing(): Promise<void> {
  await window.api.cancelProcessing()
}

export async function generateAllAltText(): Promise<void> {
  const needingAltText = results.filter((r) => !r.altText)
  if (needingAltText.length === 0) return

  altTextCancelled = false
  altTextProgress = { current: 0, total: needingAltText.length, generating: true }

  for (const result of needingAltText) {
    if (altTextCancelled) break
    altTextProgress = { ...altTextProgress, current: altTextProgress.current + 1 }
    try {
      const altText = await window.api.generateAltText(result.inputPath)
      if (altText) {
        updateResultAltText(result.inputPath, altText)
      }
    } catch {
      // Skip failures and continue with next image
    }
  }

  altTextProgress = { current: 0, total: 0, generating: false }
}

export function cancelAltTextGeneration(): void {
  altTextCancelled = true
}

export async function copyAllAltText(): Promise<number> {
  const withAltText = results.filter((r) => r.altText)
  if (withAltText.length === 0) return 0

  const text = withAltText
    .map((r) => {
      const filename = r.outputPath.split('/').pop() ?? r.outputPath
      return `${filename}\t${r.altText}`
    })
    .join('\n')

  await navigator.clipboard.writeText(text)
  return withAltText.length
}

export function updateResultAltText(imagePath: string, altText: string): void {
  results = results.map((r) =>
    r.outputPath === imagePath || r.inputPath === imagePath ? { ...r, altText } : r
  )
}

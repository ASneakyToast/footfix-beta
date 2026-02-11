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

export function getJobState() {
  return {
    get queue() { return queue },
    get results() { return results },
    get processing() { return processing },
    get progress() { return progress },
    get errors() { return errors },
    get currentView() { return currentView },
    get templateFieldValues() { return templateFieldValues },
    get activePresetId() { return activePresetId }
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
    ...opts
  }

  try {
    const result = await window.api.processImages(request)
    results = result.results
    errors = result.errors
    if (results.length > 0) {
      currentView = 'results'
    }
  } finally {
    processing = false
    progress = null
    if (progressCleanup) {
      progressCleanup()
      progressCleanup = null
    }
  }
}

export async function cancelProcessing(): Promise<void> {
  await window.api.cancelProcessing()
}

export function updateResultAltText(imagePath: string, altText: string): void {
  results = results.map((r) =>
    r.outputPath === imagePath || r.inputPath === imagePath ? { ...r, altText } : r
  )
}

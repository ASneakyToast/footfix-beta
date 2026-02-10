export type ImageFormat = 'jpeg' | 'webp' | 'png'

export interface AppSettings {
  outputFolder: string
  format: ImageFormat
  maxDimension: number
  targetFileSize: number // bytes
  sizeTolerance: number // bytes
  filenameTemplate: string
  llmProvider: string
  llmModel: string
  llmApiKey: string // encrypted at rest
  altTextPrompt: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  outputFolder: '',
  format: 'jpeg',
  maxDimension: 2560,
  targetFileSize: 1_000_000, // 1MB
  sizeTolerance: 50_000, // 50KB
  filenameTemplate: '{name}_{width}x{height}',
  llmProvider: 'openai',
  llmModel: 'gpt-4o',
  llmApiKey: '',
  altTextPrompt:
    'Describe this image for use as alt text on a webpage. Be concise (1-2 sentences), descriptive, and focus on the key visual content. Do not start with "Image of" or "Photo of".'
}

export interface Preset {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  format: ImageFormat
  maxDimension: number
  targetFileSize: number
  sizeTolerance: number
  filenameTemplate: string
}

export interface ProcessRequest {
  filePaths: string[]
  outputFolder: string
  format: ImageFormat
  maxDimension: number
  targetFileSize: number
  sizeTolerance: number
  filenameTemplate: string
}

export interface ImageResult {
  inputPath: string
  outputPath: string
  originalSize: number
  outputSize: number
  originalWidth: number
  originalHeight: number
  outputWidth: number
  outputHeight: number
  quality: number | null
  format: ImageFormat
  filename: string
  altText?: string
}

export interface ProgressUpdate {
  index: number
  total: number
  filename: string
  phase: 'resizing' | 'optimizing' | 'writing' | 'complete' | 'error'
  error?: string
}

export interface ProcessResult {
  results: ImageResult[]
  errors: Array<{ path: string; error: string }>
}

export interface AltTextResult {
  imagePath: string
  altText: string
  provider: string
  model: string
}

export interface QueueItem {
  id: string
  path: string
  name: string
  size: number
  thumbnail?: string
}

export type ImageFormat = 'jpeg' | 'webp' | 'png'

// --- Token Registry ---

export type TokenCategory = 'user_input' | 'settings_derived' | 'date_auto' | 'counter' | 'per_file'

export interface TokenDefinition {
  key: string
  label: string
  category: TokenCategory
  settingsKey?: string
  placeholder: string
  mockValue: string
}

export const TOKEN_DEFINITIONS: TokenDefinition[] = [
  // User input
  { key: 'project_name', label: 'Project Name', category: 'user_input', placeholder: 'e.g. hero-banners', mockValue: 'my-project' },
  // Settings-derived
  { key: 'user_initials', label: 'User Initials', category: 'settings_derived', settingsKey: 'userInitials', placeholder: 'e.g. JL', mockValue: 'JL' },
  // Date auto
  { key: 'month', label: 'Month', category: 'date_auto', placeholder: 'MM', mockValue: String(new Date().getMonth() + 1).padStart(2, '0') },
  { key: 'year', label: 'Year', category: 'date_auto', placeholder: 'YYYY', mockValue: String(new Date().getFullYear()) },
  { key: 'date', label: 'Date', category: 'date_auto', placeholder: 'YYYYMMDD', mockValue: new Date().toISOString().slice(0, 10).replace(/-/g, '') },
  // Counter
  { key: 'counter', label: 'Counter Start', category: 'counter', placeholder: '1', mockValue: '001' },
  // Per-file (auto per image)
  { key: 'filename', label: 'Original Name', category: 'per_file', placeholder: 'filename', mockValue: 'photo' },
  { key: 'width', label: 'Width', category: 'per_file', placeholder: 'px', mockValue: '1920' },
  { key: 'height', label: 'Height', category: 'per_file', placeholder: 'px', mockValue: '1080' },
  { key: 'format', label: 'Format', category: 'per_file', placeholder: 'jpeg', mockValue: 'jpeg' },
  { key: 'ext', label: 'Extension', category: 'per_file', placeholder: 'jpg', mockValue: 'jpg' }
]

export const TOKEN_MAP: Record<string, TokenDefinition> = Object.fromEntries(
  TOKEN_DEFINITIONS.map((t) => [t.key, t])
)

export function extractTokenKeys(template: string): string[] {
  const matches = template.matchAll(/\{(\w+)\}/g)
  return [...matches].map((m) => m[1]).filter((k) => k in TOKEN_MAP)
}

export type TemplateFieldValues = Record<string, string>

// --- Settings ---

export interface AppSettings {
  outputFolder: string
  format: ImageFormat
  maxDimension: number
  targetFileSize: number // bytes
  sizeTolerance: number // bytes
  filenameTemplate: string
  userInitials: string
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
  filenameTemplate: '{filename}_{width}x{height}',
  userInitials: '',
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
  templateFieldValues: TemplateFieldValues
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

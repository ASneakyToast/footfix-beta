import type { LlmModelInfo } from './types'

export interface ProviderConfig {
  id: string
  label: string
  requiresApiKey: boolean
}

export const PROVIDERS: ProviderConfig[] = [
  { id: 'openai', label: 'OpenAI', requiresApiKey: true },
  { id: 'anthropic', label: 'Anthropic', requiresApiKey: true },
  { id: 'google', label: 'Google', requiresApiKey: true },
  { id: 'mistralai', label: 'Mistral AI', requiresApiKey: true },
  { id: 'groq', label: 'Groq', requiresApiKey: true },
  { id: 'ollama', label: 'Ollama', requiresApiKey: false },
  { id: 'openrouter', label: 'OpenRouter', requiresApiKey: true },
  { id: 'deepseek', label: 'DeepSeek', requiresApiKey: true },
  { id: 'xai', label: 'xAI', requiresApiKey: true },
  { id: 'lmstudio', label: 'LM Studio', requiresApiKey: false }
]

export const DEFAULT_MODELS: Record<string, LlmModelInfo[]> = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', vision: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', vision: true },
    { id: 'gpt-4.1', name: 'GPT-4.1', vision: true },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', vision: true },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', vision: true }
  ],
  anthropic: [
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', vision: true },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', vision: true }
  ],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', vision: true },
    { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro', vision: true },
    { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash', vision: true }
  ],
  mistralai: [
    { id: 'pixtral-large-latest', name: 'Pixtral Large', vision: true },
    { id: 'mistral-small-latest', name: 'Mistral Small', vision: false }
  ],
  groq: [
    { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision', vision: true },
    { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 11B Vision', vision: true }
  ],
  ollama: [],
  openrouter: [
    { id: 'openai/gpt-4o', name: 'GPT-4o', vision: true },
    { id: 'anthropic/claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', vision: true },
    { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', vision: true }
  ],
  deepseek: [
    { id: 'deepseek-chat', name: 'DeepSeek Chat', vision: false }
  ],
  xai: [
    { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', vision: true },
    { id: 'grok-2-1212', name: 'Grok 2', vision: false }
  ],
  lmstudio: []
}

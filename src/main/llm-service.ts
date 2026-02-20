import { ipcMain } from 'electron'
import { IPC } from '../shared/ipc-channels'
import { getSettings } from './settings-store'
import type { AltTextResult, FetchModelsResult, LlmModelInfo } from '../shared/types'
import sharp from 'sharp'
import { extname } from 'path'

// Dynamic import for multi-llm-ts since it's ESM
let LlmEngine: any = null

async function getEngine(): Promise<any> {
  if (!LlmEngine) {
    const mod = await import('multi-llm-ts')
    LlmEngine = mod
  }
  return LlmEngine
}

function buildChatModel(modelId: string): {
  id: string
  name: string
  capabilities: { tools: boolean; vision: boolean; reasoning: boolean; caching: boolean }
} {
  return {
    id: modelId,
    name: modelId,
    capabilities: { tools: false, vision: true, reasoning: false, caching: false }
  }
}

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const mimes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  }
  return mimes[ext] || 'image/jpeg'
}

export function registerAltTextHandlers(): void {
  ipcMain.handle(
    IPC.ALTTEXT_GENERATE,
    async (_, imagePath: string): Promise<AltTextResult> => {
      const settings = await getSettings()

      if (!settings.llmApiKey) {
        throw new Error('No API key configured. Please set one in Settings.')
      }

      if (!settings.llmModel?.trim()) {
        throw new Error('No model selected. Please choose a model in Settings.')
      }

      const engine = await getEngine()

      // Create model with explicit capabilities to bypass multi-llm-ts registry lookup
      const model = engine.igniteModel(settings.llmProvider, buildChatModel(settings.llmModel), {
        apiKey: settings.llmApiKey
      })

      // Resize image to fit within API limits (5 MB max for base64)
      const MAX_DIMENSION = 1536
      const imageBuffer = await sharp(imagePath)
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer()
      const base64 = imageBuffer.toString('base64')
      const mimeType = 'image/jpeg'

      // Build messages
      const attachment = new engine.Attachment(base64, mimeType)
      const userMsg = new engine.Message('user', 'Please generate alt text for this image.', attachment)
      const messages = [
        new engine.Message('system', settings.altTextPrompt),
        userMsg
      ]

      const response = await model.complete(messages, {
        temperature: 0.3,
        maxTokens: 300
      })

      return {
        imagePath,
        altText: response.content.trim(),
        provider: settings.llmProvider,
        model: settings.llmModel
      }
    }
  )

  ipcMain.handle(
    IPC.ALTTEXT_MODELS,
    async (_, provider: string, apiKey: string): Promise<FetchModelsResult> => {
      try {
        const engine = await getEngine()
        const config = apiKey ? { apiKey } : {}
        const modelsList = await engine.loadModels(provider, config)

        const models: LlmModelInfo[] = (modelsList?.chat ?? []).map((m: any) => ({
          id: typeof m === 'string' ? m : m.id,
          name: typeof m === 'string' ? m : m.name || m.id,
          vision: typeof m === 'string' ? false : !!(m.capabilities?.vision)
        }))

        if (models.length === 0) {
          return { models, error: 'No models returned. Check your API key and try again.' }
        }

        return { models }
      } catch (err) {
        return { models: [], error: err instanceof Error ? err.message : String(err) }
      }
    }
  )

  ipcMain.handle(IPC.ALTTEXT_TEST, async (): Promise<{ success: boolean; error?: string }> => {
    const settings = await getSettings()

    if (!settings.llmApiKey) {
      return { success: false, error: 'No API key configured.' }
    }

    if (!settings.llmModel?.trim()) {
      return { success: false, error: 'No model selected. Please choose a model in Settings.' }
    }

    try {
      const engine = await getEngine()

      const model = engine.igniteModel(settings.llmProvider, buildChatModel(settings.llmModel), {
        apiKey: settings.llmApiKey
      })

      const messages = [new engine.Message('user', 'Reply with "ok" to confirm connection.')]

      const response = await model.complete(messages, {
        temperature: 0,
        maxTokens: 10
      })

      return { success: !!response.content }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}

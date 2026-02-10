import { ipcMain } from 'electron'
import { IPC } from '../shared/ipc-channels'
import { getSettings } from './settings-store'
import type { AltTextResult } from '../shared/types'
import { readFileSync } from 'fs'
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

      const engine = await getEngine()

      // Build engine config
      const engineConfig: Record<string, any> = {}
      engineConfig[settings.llmProvider] = {
        apiKey: settings.llmApiKey
      }

      const config = { engines: engineConfig }

      // Create engine and model
      const llm = new engine.default(config)
      const model = llm.igniteEngine(settings.llmProvider)

      // Read image as base64
      const imageBuffer = readFileSync(imagePath)
      const base64 = imageBuffer.toString('base64')
      const mimeType = getMimeType(imagePath)

      // Build messages
      const messages = [
        new engine.Message('system', settings.altTextPrompt),
        new engine.Message('user', [
          new engine.MessageAttachment(base64, mimeType),
          new engine.MessageTextContent('Please generate alt text for this image.')
        ])
      ]

      const response = await model.complete(settings.llmModel, messages, {
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

  ipcMain.handle(IPC.ALTTEXT_TEST, async (): Promise<{ success: boolean; error?: string }> => {
    const settings = await getSettings()

    if (!settings.llmApiKey) {
      return { success: false, error: 'No API key configured.' }
    }

    try {
      const engine = await getEngine()

      const engineConfig: Record<string, any> = {}
      engineConfig[settings.llmProvider] = {
        apiKey: settings.llmApiKey
      }

      const config = { engines: engineConfig }
      const llm = new engine.default(config)
      const model = llm.igniteEngine(settings.llmProvider)

      const messages = [new engine.Message('user', 'Reply with "ok" to confirm connection.')]

      const response = await model.complete(settings.llmModel, messages, {
        temperature: 0,
        maxTokens: 10
      })

      return { success: !!response.content }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}

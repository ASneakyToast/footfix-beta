import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { ipcMain } from 'electron'
import { tmpdir } from 'os'
import { join } from 'path'
import { rm } from 'fs/promises'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY
const run = ANTHROPIC_KEY || OPENAI_KEY ? describe : describe.skip

const provider = ANTHROPIC_KEY ? 'anthropic' : 'openai'
const apiKey = ANTHROPIC_KEY ?? OPENAI_KEY ?? ''
const model = ANTHROPIC_KEY ? 'claude-haiku-4-5-20251001' : 'gpt-4o'

const handlers: Record<string, (...args: any[]) => any> = {}
vi.mocked(ipcMain.handle).mockImplementation((channel: string, handler: any) => {
  handlers[channel] = handler
})

vi.mock('../../src/main/settings-store', () => ({
  getSettings: vi.fn()
}))

let testImagePath: string

run('generateAltText IPC handler (real API)', () => {
  beforeAll(async () => {
    const { getSettings } = await import('../../src/main/settings-store')
    vi.mocked(getSettings).mockResolvedValue({
      llmProvider: provider,
      llmModel: model,
      llmApiKey: apiKey,
      altTextPrompt:
        'Describe this image for use as alt text on a webpage. Be concise (1-2 sentences).'
    } as any)

    const { registerAltTextHandlers } = await import('../../src/main/llm-service')
    registerAltTextHandlers()

    // Create a tiny test JPEG
    const sharp = (await import('sharp')).default
    testImagePath = join(tmpdir(), `footfix-test-${Date.now()}.jpg`)
    await sharp({
      create: { width: 64, height: 64, channels: 3, background: { r: 100, g: 150, b: 200 } }
    })
      .jpeg({ quality: 80 })
      .toFile(testImagePath)
  })

  afterAll(async () => {
    if (testImagePath) {
      await rm(testImagePath, { force: true })
    }
  })

  it(
    'returns a non-empty altText string for a real image',
    async () => {
      const handler = handlers['alttext:generate']
      expect(handler).toBeDefined()

      const result = await handler({}, testImagePath)

      expect(result).toBeDefined()
      expect(typeof result.altText).toBe('string')
      expect(result.altText.length).toBeGreaterThan(0)
      expect(result.imagePath).toBe(testImagePath)
      expect(result.provider).toBe(provider)
    },
    30_000
  )
})

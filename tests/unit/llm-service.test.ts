import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ipcMain } from 'electron'
import type { AppSettings } from '@shared/types'

// Capture handlers registered via ipcMain.handle
const handlers: Record<string, (...args: any[]) => any> = {}
vi.mocked(ipcMain.handle).mockImplementation((channel: string, handler: any) => {
  handlers[channel] = handler
})

// Mock settings-store
const mockSettings: Partial<AppSettings> = {
  llmProvider: 'openai',
  llmModel: 'gpt-4o',
  llmApiKey: 'test-key-123',
  altTextPrompt: 'Describe this image.'
}

vi.mock('../../src/main/settings-store', () => ({
  getSettings: vi.fn(() => Promise.resolve({ ...mockSettings }))
}))

// Mock multi-llm-ts
const mockComplete = vi.fn()
const mockLoadModels = vi.fn()

vi.mock('multi-llm-ts', () => ({
  igniteModel: vi.fn(() => ({ complete: mockComplete })),
  loadModels: mockLoadModels,
  Attachment: class MockAttachment {
    constructor(public data: string, public mime: string) {}
  },
  Message: class MockMessage {
    constructor(public role: string, public content: string, public attachment?: any) {}
  }
}))

// Mock fs
vi.mock('fs', () => ({
  readFileSync: vi.fn(() => Buffer.from('fake-image-data'))
}))

// Import AFTER mocks are set up
const { registerAltTextHandlers } = await import('../../src/main/llm-service')

describe('llm-service IPC handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Re-register handlers
    Object.keys(handlers).forEach((k) => delete handlers[k])
    registerAltTextHandlers()
  })

  describe('ALTTEXT_GENERATE', () => {
    it('throws when no API key configured', async () => {
      const { getSettings } = await import('../../src/main/settings-store')
      vi.mocked(getSettings).mockResolvedValueOnce({ ...mockSettings, llmApiKey: '' } as AppSettings)

      const handler = handlers['alttext:generate']
      await expect(handler({}, '/test/image.jpg')).rejects.toThrow('No API key configured')
    })

    it('throws when no model selected', async () => {
      const { getSettings } = await import('../../src/main/settings-store')
      vi.mocked(getSettings).mockResolvedValueOnce({ ...mockSettings, llmModel: '' } as AppSettings)

      const handler = handlers['alttext:generate']
      await expect(handler({}, '/test/image.jpg')).rejects.toThrow('No model selected')
    })

    it('passes ChatModel object with vision capability to igniteModel', async () => {
      mockComplete.mockResolvedValueOnce({ content: 'Alt text' })

      const handler = handlers['alttext:generate']
      await handler({}, '/test/image.jpg')

      const { igniteModel } = await import('multi-llm-ts')
      expect(vi.mocked(igniteModel)).toHaveBeenCalledWith(
        'openai',
        expect.objectContaining({
          id: 'gpt-4o',
          capabilities: expect.objectContaining({ vision: true })
        }),
        expect.any(Object)
      )
    })

    it('returns AltTextResult with valid config', async () => {
      mockComplete.mockResolvedValueOnce({ content: '  A photo of a cat  ' })

      const handler = handlers['alttext:generate']
      const result = await handler({}, '/test/image.jpg')

      expect(result).toEqual({
        imagePath: '/test/image.jpg',
        altText: 'A photo of a cat',
        provider: 'openai',
        model: 'gpt-4o'
      })
    })
  })

  describe('ALTTEXT_MODELS', () => {
    it('returns models on success', async () => {
      mockLoadModels.mockResolvedValueOnce({
        chat: [{ id: 'gpt-4o', name: 'GPT-4o', capabilities: { vision: true } }]
      })

      const handler = handlers['alttext:models']
      const result = await handler({}, 'openai', 'key-123')

      expect(result.models).toHaveLength(1)
      expect(result.models[0]).toEqual({ id: 'gpt-4o', name: 'GPT-4o', vision: true })
      expect(result.error).toBeUndefined()
    })

    it('returns error when no models returned', async () => {
      mockLoadModels.mockResolvedValueOnce({ chat: [] })

      const handler = handlers['alttext:models']
      const result = await handler({}, 'openai', 'key-123')

      expect(result.models).toHaveLength(0)
      expect(result.error).toContain('No models returned')
    })

    it('catches thrown errors', async () => {
      mockLoadModels.mockRejectedValueOnce(new Error('Network error'))

      const handler = handlers['alttext:models']
      const result = await handler({}, 'openai', 'key-123')

      expect(result.models).toHaveLength(0)
      expect(result.error).toBe('Network error')
    })
  })

  describe('ALTTEXT_TEST', () => {
    it('returns failure when no API key', async () => {
      const { getSettings } = await import('../../src/main/settings-store')
      vi.mocked(getSettings).mockResolvedValueOnce({ ...mockSettings, llmApiKey: '' } as AppSettings)

      const handler = handlers['alttext:test']
      const result = await handler({})

      expect(result).toEqual({ success: false, error: 'No API key configured.' })
    })

    it('returns failure when no model selected', async () => {
      const { getSettings } = await import('../../src/main/settings-store')
      vi.mocked(getSettings).mockResolvedValueOnce({ ...mockSettings, llmModel: '' } as AppSettings)

      const handler = handlers['alttext:test']
      const result = await handler({})

      expect(result).toEqual({ success: false, error: 'No model selected. Please choose a model in Settings.' })
    })

    it('returns success with valid config', async () => {
      mockComplete.mockResolvedValueOnce({ content: 'ok' })

      const handler = handlers['alttext:test']
      const result = await handler({})

      expect(result).toEqual({ success: true })
    })
  })
})

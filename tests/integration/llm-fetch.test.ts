import { describe, it, expect } from 'vitest'

const OPENAI_KEY = process.env.OPENAI_API_KEY
const run = OPENAI_KEY ? describe : describe.skip

run('OpenAI integration (real API)', () => {
  it('fetches models with valid key', async () => {
    const { loadModels } = await import('multi-llm-ts')
    const result = await loadModels('openai', { apiKey: OPENAI_KEY })

    expect(result).toBeDefined()
    expect(result.chat).toBeDefined()
    expect(Array.isArray(result.chat)).toBe(true)
    expect(result.chat.length).toBeGreaterThan(0)
  })

  it('returns empty chat models with invalid key', async () => {
    const { loadModels } = await import('multi-llm-ts')
    const result = await loadModels('openai', { apiKey: 'sk-invalid-key-for-testing' })

    // multi-llm-ts catches the error and returns empty chat list
    expect(result.chat).toHaveLength(0)
  })
})

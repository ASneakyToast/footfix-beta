import { describe, it, expect } from 'vitest'
import { PROVIDERS, DEFAULT_MODELS } from '@shared/llm-providers'

describe('llm-providers', () => {
  describe('PROVIDERS', () => {
    it('every provider has id, label, and requiresApiKey', () => {
      for (const p of PROVIDERS) {
        expect(p.id).toBeTruthy()
        expect(p.label).toBeTruthy()
        expect(typeof p.requiresApiKey).toBe('boolean')
      }
    })

    it('has no duplicate provider IDs', () => {
      const ids = PROVIDERS.map((p) => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('DEFAULT_MODELS', () => {
    it('every provider ID has a matching DEFAULT_MODELS entry', () => {
      for (const p of PROVIDERS) {
        expect(DEFAULT_MODELS).toHaveProperty(p.id)
      }
    })

    it('all model entries have id, name, and vision', () => {
      for (const [provider, models] of Object.entries(DEFAULT_MODELS)) {
        for (const m of models) {
          expect(m.id, `${provider} model missing id`).toBeTruthy()
          expect(m.name, `${provider} model missing name`).toBeTruthy()
          expect(typeof m.vision, `${provider}/${m.id} vision should be boolean`).toBe('boolean')
        }
      }
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ImageResult } from '../../src/shared/types'

type StoreModule = typeof import('../../src/renderer/src/lib/stores/job-store.svelte')

let store: StoreModule
let mockGenerateAltText: ReturnType<typeof vi.fn>
let mockWriteText: ReturnType<typeof vi.fn>

beforeEach(async () => {
  vi.resetModules()

  mockGenerateAltText = vi.fn()
  mockWriteText = vi.fn().mockResolvedValue(undefined)

  const mockApi = {
    getPreview: vi.fn().mockResolvedValue('data:image/png;base64,test'),
    onProgress: vi.fn().mockReturnValue(() => {}),
    processImages: vi.fn(),
    generateAltText: mockGenerateAltText,
    cancelProcessing: vi.fn()
  }

  Object.defineProperty(globalThis, 'window', {
    value: { api: mockApi },
    writable: true,
    configurable: true
  })

  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true
  })

  store = await import('../../src/renderer/src/lib/stores/job-store.svelte')
})

async function seedResults(items: Partial<ImageResult>[]) {
  const fullItems: ImageResult[] = items.map((item, i) => ({
    inputPath: item.inputPath ?? `/in/${i}.jpg`,
    outputPath: item.outputPath ?? `/out/${i}.jpg`,
    filename: item.filename ?? `${i}.jpg`,
    originalSize: 1000,
    outputSize: 800,
    originalWidth: 100,
    originalHeight: 100,
    outputWidth: 100,
    outputHeight: 100,
    quality: 80,
    format: 'jpeg' as const,
    ...item
  }))

  window.api.processImages.mockResolvedValueOnce({ results: fullItems, errors: [] })

  store.addFiles(fullItems.map((r) => ({ path: r.inputPath, name: r.filename, size: 1000 })))

  await store.processImages({
    outputFolder: '/out',
    format: 'jpeg',
    maxDimension: 2000,
    targetFileSize: 500000,
    sizeTolerance: 10000,
    filenameTemplate: '{filename}',
    templateFieldValues: {}
  })
}

describe('updateResultAltText', () => {
  it('matches by inputPath', async () => {
    await seedResults([{ inputPath: '/in/a.jpg', outputPath: '/out/a.jpg' }])
    store.updateResultAltText('/in/a.jpg', 'text by input')
    expect(store.getJobState().results[0].altText).toBe('text by input')
  })

  it('matches by outputPath', async () => {
    await seedResults([{ inputPath: '/in/b.jpg', outputPath: '/out/b.jpg' }])
    store.updateResultAltText('/out/b.jpg', 'text by output')
    expect(store.getJobState().results[0].altText).toBe('text by output')
  })
})

describe('generateAllAltText', () => {
  it('extracts altText string from AltTextResult — regression for [object Object]', async () => {
    await seedResults([{ inputPath: '/in/cat.jpg', outputPath: '/out/cat.jpg' }])
    mockGenerateAltText.mockResolvedValueOnce({
      imagePath: '/in/cat.jpg',
      altText: 'A cat',
      provider: 'openai',
      model: 'gpt-4o'
    })

    await store.generateAllAltText()

    expect(store.getJobState().results[0].altText).toBe('A cat')
  })

  it('skips items that already have altText', async () => {
    await seedResults([
      { inputPath: '/in/1.jpg', altText: 'already set' },
      { inputPath: '/in/2.jpg' }
    ])
    mockGenerateAltText.mockResolvedValue({ imagePath: '/in/2.jpg', altText: 'new', provider: 'openai', model: 'gpt-4o' })

    await store.generateAllAltText()

    expect(mockGenerateAltText).toHaveBeenCalledTimes(1)
    expect(mockGenerateAltText).toHaveBeenCalledWith('/in/2.jpg')
  })

  it('continues past API errors', async () => {
    await seedResults([
      { inputPath: '/in/1.jpg' },
      { inputPath: '/in/2.jpg' }
    ])
    mockGenerateAltText
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce({ imagePath: '/in/2.jpg', altText: 'Second', provider: 'openai', model: 'gpt-4o' })

    await store.generateAllAltText()

    const results = store.getJobState().results
    expect(results[0].altText).toBeUndefined()
    expect(results[1].altText).toBe('Second')
  })

  it('stops processing after cancelAltTextGeneration', async () => {
    await seedResults([
      { inputPath: '/in/1.jpg' },
      { inputPath: '/in/2.jpg' },
      { inputPath: '/in/3.jpg' }
    ])

    // Cancel after the first call resolves
    mockGenerateAltText.mockImplementation(async (path: string) => {
      if (path === '/in/1.jpg') {
        store.cancelAltTextGeneration()
        return { imagePath: path, altText: 'First', provider: 'openai', model: 'gpt-4o' }
      }
      return { imagePath: path, altText: 'Should not reach', provider: 'openai', model: 'gpt-4o' }
    })

    await store.generateAllAltText()

    // Only the first item was processed before cancel took effect
    expect(mockGenerateAltText).toHaveBeenCalledTimes(1)
    const results = store.getJobState().results
    expect(results[1].altText).toBeUndefined()
    expect(results[2].altText).toBeUndefined()
  })
})

describe('copyAllAltText', () => {
  it('formats output as filename tab altText per line', async () => {
    await seedResults([
      { outputPath: '/out/dog.jpg', altText: 'A dog' },
      { outputPath: '/out/cat.jpg', altText: 'A cat' }
    ])

    await store.copyAllAltText()

    expect(mockWriteText).toHaveBeenCalledWith('dog.jpg\tA dog\ncat.jpg\tA cat')
  })

  it('returns count of items with altText', async () => {
    await seedResults([
      { outputPath: '/out/dog.jpg', altText: 'A dog' },
      { outputPath: '/out/cat.jpg', altText: 'A cat' }
    ])

    const count = await store.copyAllAltText()
    expect(count).toBe(2)
  })

  it('returns 0 and does not write when no altText exists', async () => {
    await seedResults([{ outputPath: '/out/no-alt.jpg' }])

    const count = await store.copyAllAltText()
    expect(count).toBe(0)
    expect(mockWriteText).not.toHaveBeenCalled()
  })
})

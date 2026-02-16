import { vi } from 'vitest'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.test if present (for integration tests)
config({ path: resolve(__dirname, '../.env.test') })

// Mock electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn()
  },
  app: {
    getPath: vi.fn().mockReturnValue('/tmp')
  },
  safeStorage: {
    isEncryptionAvailable: vi.fn().mockReturnValue(false),
    encryptString: vi.fn(),
    decryptString: vi.fn()
  }
}))

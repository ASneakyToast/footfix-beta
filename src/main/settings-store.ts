import { ipcMain, safeStorage } from 'electron'
import { IPC } from '../shared/ipc-channels'
import { DEFAULT_SETTINGS, type AppSettings } from '../shared/types'

interface StoreSchema {
  settings: Omit<AppSettings, 'llmApiKey'> & { llmApiKeyEncrypted: string }
}

let store: import('electron-store').default<StoreSchema>

async function getStore() {
  if (!store) {
    const { default: Store } = await import('electron-store')
    store = new Store<StoreSchema>({
      name: 'config',
      defaults: {
        settings: {
          ...DEFAULT_SETTINGS,
          llmApiKeyEncrypted: ''
        }
      }
    })
  }
  return store
}

function encryptApiKey(key: string): string {
  if (!key) return ''
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(key).toString('base64')
  }
  return key
}

function decryptApiKey(encrypted: string): string {
  if (!encrypted) return ''
  if (safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
    } catch {
      return ''
    }
  }
  return encrypted
}

export async function getSettings(): Promise<AppSettings> {
  const s = await getStore()
  const stored = s.get('settings')
  const { llmApiKeyEncrypted, ...rest } = stored
  return {
    ...rest,
    llmApiKey: decryptApiKey(llmApiKeyEncrypted)
  }
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const s = await getStore()
  const current = s.get('settings')

  const updated = { ...current }

  for (const [key, value] of Object.entries(partial)) {
    if (key === 'llmApiKey') {
      updated.llmApiKeyEncrypted = encryptApiKey(value as string)
    } else {
      ;(updated as Record<string, unknown>)[key] = value
    }
  }

  s.set('settings', updated)
  return getSettings()
}

export function registerSettingsHandlers(): void {
  ipcMain.handle(IPC.SETTINGS_GET, () => {
    return getSettings()
  })

  ipcMain.handle(IPC.SETTINGS_UPDATE, (_, partial: Partial<AppSettings>) => {
    return updateSettings(partial)
  })
}

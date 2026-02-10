import type { AppSettings } from '../../../../shared/types'
import { DEFAULT_SETTINGS } from '../../../../shared/types'

let settings = $state<AppSettings>({ ...DEFAULT_SETTINGS })
let loaded = $state(false)

export function getSettingsState() {
  return {
    get settings() { return settings },
    get loaded() { return loaded }
  }
}

export async function loadSettings(): Promise<void> {
  settings = await window.api.getSettings()
  loaded = true
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<void> {
  settings = await window.api.updateSettings(partial)
}

export async function selectOutputFolder(): Promise<string | null> {
  const folder = await window.api.selectFolder()
  if (folder) {
    await updateSettings({ outputFolder: folder })
  }
  return folder
}

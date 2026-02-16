import type { AppSettings, Theme } from '../../../../shared/types'
import { DEFAULT_SETTINGS } from '../../../../shared/types'

let settings = $state<AppSettings>({ ...DEFAULT_SETTINGS })
let loaded = $state(false)

export function getSettingsState() {
  return {
    get settings() { return settings },
    get loaded() { return loaded }
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export async function loadSettings(): Promise<void> {
  settings = await window.api.getSettings()
  applyTheme(settings.theme ?? 'dark')
  loaded = true
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<void> {
  settings = await window.api.updateSettings(partial)
  if (partial.theme) {
    applyTheme(partial.theme)
  }
}

export async function toggleTheme(): Promise<void> {
  const next: Theme = settings.theme === 'dark' ? 'light' : 'dark'
  await updateSettings({ theme: next })
}

export async function selectOutputFolder(): Promise<string | null> {
  const folder = await window.api.selectFolder()
  if (folder) {
    await updateSettings({ outputFolder: folder })
  }
  return folder
}

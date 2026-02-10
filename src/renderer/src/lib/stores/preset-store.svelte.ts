import type { Preset } from '../../../../shared/types'

let presets = $state<Preset[]>([])
let loaded = $state(false)

export function getPresetState() {
  return {
    get presets() { return presets },
    get loaded() { return loaded }
  }
}

export async function loadPresets(): Promise<void> {
  presets = await window.api.listPresets()
  loaded = true
}

export async function savePreset(preset: Preset): Promise<Preset> {
  const saved = await window.api.savePreset(preset)
  await loadPresets()
  return saved
}

export async function deletePreset(id: string): Promise<void> {
  await window.api.deletePreset(id)
  await loadPresets()
}

export async function exportPreset(preset: Preset): Promise<boolean> {
  return window.api.exportPreset(preset)
}

export async function importPreset(): Promise<Preset | null> {
  const imported = await window.api.importPreset()
  if (imported) await loadPresets()
  return imported
}

import { ipcMain, dialog } from 'electron'
import { join } from 'path'
import { app } from 'electron'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs'
import { randomUUID } from 'crypto'
import { IPC } from '../shared/ipc-channels'
import type { Preset } from '../shared/types'

function getPresetsDir(): string {
  const dir = join(app.getPath('userData'), 'presets')
  mkdirSync(dir, { recursive: true })
  return dir
}

function loadPreset(filePath: string): Preset | null {
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as Preset
  } catch {
    return null
  }
}

export function registerPresetHandlers(): void {
  ipcMain.handle(IPC.PRESETS_LIST, (): Preset[] => {
    const dir = getPresetsDir()
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
    const presets: Preset[] = []
    for (const file of files) {
      const preset = loadPreset(join(dir, file))
      if (preset) presets.push(preset)
    }
    return presets.sort((a, b) => a.name.localeCompare(b.name))
  })

  ipcMain.handle(IPC.PRESETS_SAVE, (_, preset: Preset): Preset => {
    const dir = getPresetsDir()
    const now = new Date().toISOString()

    if (!preset.id) {
      preset.id = randomUUID()
      preset.createdAt = now
    }
    preset.updatedAt = now

    writeFileSync(join(dir, `${preset.id}.json`), JSON.stringify(preset, null, 2))
    return preset
  })

  ipcMain.handle(IPC.PRESETS_DELETE, (_, id: string): boolean => {
    const filePath = join(getPresetsDir(), `${id}.json`)
    if (existsSync(filePath)) {
      unlinkSync(filePath)
      return true
    }
    return false
  })

  ipcMain.handle(IPC.PRESETS_EXPORT, async (_, preset: Preset): Promise<boolean> => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: `${preset.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.json`,
      filters: [{ name: 'Preset Files', extensions: ['json'] }]
    })
    if (canceled || !filePath) return false
    writeFileSync(filePath, JSON.stringify(preset, null, 2))
    return true
  })

  ipcMain.handle(IPC.PRESETS_IMPORT, async (): Promise<Preset | null> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'Preset Files', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (canceled || !filePaths.length) return null

    const raw = readFileSync(filePaths[0], 'utf-8')
    const imported = JSON.parse(raw) as Preset

    // Assign new ID so imports don't collide
    imported.id = randomUUID()
    imported.createdAt = new Date().toISOString()
    imported.updatedAt = imported.createdAt

    const dir = getPresetsDir()
    writeFileSync(join(dir, `${imported.id}.json`), JSON.stringify(imported, null, 2))
    return imported
  })
}

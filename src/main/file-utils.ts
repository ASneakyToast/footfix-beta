import { ipcMain, dialog, shell } from 'electron'
import { IPC } from '../shared/ipc-channels'

export function registerFileHandlers(): void {
  ipcMain.handle(IPC.SETTINGS_SELECT_FOLDER, async (): Promise<string | null> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    if (canceled || !filePaths.length) return null
    return filePaths[0]
  })
}

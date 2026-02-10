import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type {
  AppSettings,
  Preset,
  ProcessRequest,
  ProcessResult,
  ProgressUpdate,
  AltTextResult
} from '../shared/types'

const api = {
  // Image processing
  processImages: (request: ProcessRequest): Promise<ProcessResult> =>
    ipcRenderer.invoke(IPC.IMAGES_PROCESS, request),
  cancelProcessing: (): Promise<void> => ipcRenderer.invoke(IPC.IMAGES_CANCEL),
  getPreview: (filePath: string): Promise<string> =>
    ipcRenderer.invoke(IPC.IMAGES_PREVIEW, filePath),
  onProgress: (callback: (update: ProgressUpdate) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, update: ProgressUpdate): void =>
      callback(update)
    ipcRenderer.on(IPC.IMAGES_PROGRESS, handler)
    return () => ipcRenderer.removeListener(IPC.IMAGES_PROGRESS, handler)
  },

  // Alt text
  generateAltText: (imagePath: string): Promise<AltTextResult> =>
    ipcRenderer.invoke(IPC.ALTTEXT_GENERATE, imagePath),
  testLlmConnection: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(IPC.ALTTEXT_TEST),

  // Presets
  listPresets: (): Promise<Preset[]> => ipcRenderer.invoke(IPC.PRESETS_LIST),
  savePreset: (preset: Preset): Promise<Preset> =>
    ipcRenderer.invoke(IPC.PRESETS_SAVE, preset),
  deletePreset: (id: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC.PRESETS_DELETE, id),
  exportPreset: (preset: Preset): Promise<boolean> =>
    ipcRenderer.invoke(IPC.PRESETS_EXPORT, preset),
  importPreset: (): Promise<Preset | null> => ipcRenderer.invoke(IPC.PRESETS_IMPORT),

  // Settings
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.SETTINGS_GET),
  updateSettings: (partial: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC.SETTINGS_UPDATE, partial),
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke(IPC.SETTINGS_SELECT_FOLDER)
}

export type API = typeof api

contextBridge.exposeInMainWorld('api', api)

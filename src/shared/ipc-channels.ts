export const IPC = {
  // Image processing
  IMAGES_PROCESS: 'images:process',
  IMAGES_CANCEL: 'images:cancel',
  IMAGES_PREVIEW: 'images:preview',
  IMAGES_PROGRESS: 'images:progress',

  // Alt text
  ALTTEXT_GENERATE: 'alttext:generate',
  ALTTEXT_TEST: 'alttext:test',

  // Presets
  PRESETS_LIST: 'presets:list',
  PRESETS_SAVE: 'presets:save',
  PRESETS_DELETE: 'presets:delete',
  PRESETS_EXPORT: 'presets:export',
  PRESETS_IMPORT: 'presets:import',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_SELECT_FOLDER: 'settings:select-folder'
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]

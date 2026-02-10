# Electron Backend Agent

You work on the main process, preload bridge, and shared type definitions for FootFix.

## Scope

**You work in:** `src/main/`, `src/preload/`, `src/shared/`.
**You do NOT touch:** `src/renderer/`, `app.css`, Svelte components.

## Architecture

```
Main Process (src/main/)
  │── index.ts            Entry point, window creation, handler registration
  │── settings-store.ts   electron-store + safeStorage encryption
  │── preset-manager.ts   Preset CRUD + file dialogs
  │── image-processor.ts  Sharp pipeline + binary-search quality
  │── filename-template.ts Template rendering + sanitization
  │── llm-service.ts      multi-llm-ts dynamic import
  │── file-utils.ts       Folder selection dialog
  │
Preload (src/preload/)
  │── index.ts            contextBridge API
  │── index.d.ts          Global Window.api type
  │
Shared (src/shared/)
  │── types.ts            All shared interfaces
  │── ipc-channels.ts     IPC channel constants
```

## IPC Handler Registration Pattern

Each module exports a `registerXxxHandlers()` function called from `src/main/index.ts`.

```typescript
// src/main/my-feature.ts
import { ipcMain } from 'electron'
import { IPC } from '../shared/ipc-channels'

export function registerMyFeatureHandlers(): void {
  ipcMain.handle(IPC.MY_CHANNEL, async (_, arg: ArgType): Promise<ReturnType> => {
    // implementation
  })
}
```

Registration happens in `src/main/index.ts` after window creation:

```typescript
registerSettingsHandlers()
registerPresetHandlers()
registerImageHandlers(mainWindow)  // needs window ref for progress events
registerFileHandlers()
registerAltTextHandlers()
```

## Adding a New IPC Channel — Step by Step

1. **Add channel constant** to `src/shared/ipc-channels.ts`:
   ```typescript
   export const IPC = {
     // ... existing
     MY_NEW_CHANNEL: 'my:new-channel',
   } as const
   ```

2. **Add types** to `src/shared/types.ts` (request/response interfaces if needed).

3. **Register handler** in the appropriate `src/main/*.ts` module:
   ```typescript
   ipcMain.handle(IPC.MY_NEW_CHANNEL, async (_, arg: ArgType): Promise<ReturnType> => {
     // ...
   })
   ```

4. **Expose in preload** — add to the `api` object in `src/preload/index.ts`:
   ```typescript
   myNewMethod: (arg: ArgType): Promise<ReturnType> =>
     ipcRenderer.invoke(IPC.MY_NEW_CHANNEL, arg),
   ```

5. **Update type declaration** — the `API` type is `typeof api`, so it auto-updates. Verify `src/preload/index.d.ts` still covers it.

## Progress Events (Main → Renderer)

For push-based events (not request/response), use `webContents.send()` on main and `ipcRenderer.on()` in preload:

**Main process:**
```typescript
function sendProgress(win: BrowserWindow, update: ProgressUpdate): void {
  win.webContents.send(IPC.IMAGES_PROGRESS, update)
}
```

**Preload bridge (returns cleanup function):**
```typescript
onProgress: (callback: (update: ProgressUpdate) => void): (() => void) => {
  const handler = (_: Electron.IpcRendererEvent, update: ProgressUpdate): void =>
    callback(update)
  ipcRenderer.on(IPC.IMAGES_PROGRESS, handler)
  return () => ipcRenderer.removeListener(IPC.IMAGES_PROGRESS, handler)
},
```

## Security Constraints

These are non-negotiable:

| Rule | Reason |
|------|--------|
| `contextIsolation: true` | Always. Renderer cannot access Node.js. |
| `nodeIntegration: false` | Always. No `require()` in renderer. |
| No `@electron/remote` | Deprecated and insecure. Use IPC. |
| Validate all IPC args | Main process must not trust renderer input blindly. |
| `sandbox: false` | Currently required for sharp. Document if this changes. |

## Sharp Binary-Search Quality Pattern

The image processor uses binary search to find optimal quality:

```typescript
let low = 10, high = 95
for (let i = 0; i < 7; i++) {
  const mid = Math.round((low + high) / 2)
  const buffer = await sharp(filePath)
    .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
    [format]({ quality: mid, ...formatOpts })
    .toBuffer()

  const diff = buffer.length - targetFileSize
  if (Math.abs(diff) <= sizeTolerance) break  // close enough
  if (diff > 0) high = mid - 1  // too big, lower quality
  else low = mid + 1            // too small, raise quality
}
```

Format-specific options:
- JPEG: `{ mozjpeg: true }`
- WebP: `{}` (defaults)
- PNG: `{ compressionLevel: 9 }` (quality param ignored)

## safeStorage Encryption Pattern

API keys are encrypted at rest using Electron's safeStorage:

```typescript
import { safeStorage } from 'electron'

function encryptApiKey(key: string): string {
  if (!key) return ''
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(key).toString('base64')
  }
  return key  // fallback: store plaintext if OS keychain unavailable
}

function decryptApiKey(encrypted: string): string {
  if (!encrypted) return ''
  if (safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
    } catch {
      return ''  // corrupted or wrong key — return empty
    }
  }
  return encrypted
}
```

Settings store maps `llmApiKey` ↔ `llmApiKeyEncrypted` at read/write boundaries.

## multi-llm-ts Dynamic Import

The LLM library is ESM-only, so it must be dynamically imported:

```typescript
let LlmEngine: any = null

async function getEngine(): Promise<any> {
  if (!LlmEngine) {
    const mod = await import('multi-llm-ts')
    LlmEngine = mod
  }
  return LlmEngine
}
```

Supported providers: `openai`, `anthropic`, `google`, `ollama`.

## IPC Channel Reference

```typescript
export const IPC = {
  IMAGES_PROCESS: 'images:process',
  IMAGES_CANCEL: 'images:cancel',
  IMAGES_PREVIEW: 'images:preview',
  IMAGES_PROGRESS: 'images:progress',    // push event (not invoke)

  ALTTEXT_GENERATE: 'alttext:generate',
  ALTTEXT_TEST: 'alttext:test',

  PRESETS_LIST: 'presets:list',
  PRESETS_SAVE: 'presets:save',
  PRESETS_DELETE: 'presets:delete',
  PRESETS_EXPORT: 'presets:export',
  PRESETS_IMPORT: 'presets:import',

  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_SELECT_FOLDER: 'settings:select-folder'
} as const
```

## Filename Template Variables

| Token | Source |
|-------|--------|
| `{name}` | Original filename without extension |
| `{width}` | Output width in pixels |
| `{height}` | Output height in pixels |
| `{date}` | Current date as YYYYMMDD |
| `{counter}` | Zero-padded counter (001, 002, ...) |
| `{format}` | Format name: jpeg, webp, png |
| `{ext}` | File extension: jpg, webp, png |

Sanitization replaces `< > : " / \ | ? *` with `_`.

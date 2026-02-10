# FootFix

Batch image resizer with LLM-powered alt text generation. A desktop app for editorial teams and content managers who need web-ready images without cloud uploads or subscriptions.

## What It Does

- **Batch resize** images to a max dimension with automatic quality optimization
- **Target file size** via binary-search compression (e.g. "fit under 500 KB")
- **Custom filename templates** with tokens like `{name}_{width}x{height}`
- **Save/load/share presets** as `.json` files for team-wide consistency
- **Generate alt text** using OpenAI, Anthropic, or Google LLMs
- **100% local processing** — images never leave your machine (only LLM API calls for alt text)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Shell | Electron 33 |
| UI | Svelte 5 (runes) |
| CSS | Tailwind CSS 4 |
| Build | electron-vite |
| Images | Sharp |
| Storage | electron-store (safeStorage for API keys) |
| LLM | multi-llm-ts |
| Language | TypeScript (strict) |

## Getting Started

```bash
# Install dependencies
npm install

# Development
npx electron-vite dev

# Build
npx electron-vite build

# Package (Windows)
npm run package
```

## Project Structure

```
src/
  main/              # Electron main process
    index.ts           Entry point, window creation
    settings-store.ts  Persisted settings + encrypted API keys
    image-processor.ts Sharp pipeline + binary-search quality
    preset-manager.ts  Preset CRUD + file dialogs
    llm-service.ts     Alt text generation via multi-llm-ts
    filename-template.ts  Template rendering
    file-utils.ts      Folder selection dialog
  preload/           # Context bridge (14 typed IPC methods)
  shared/            # Types + IPC channel constants
  renderer/src/      # Svelte 5 UI
    App.svelte         App shell with sidebar navigation
    views/             3 views (Process, Results, Settings)
    lib/components/    10 UI components
    lib/stores/        3 reactive stores (job, settings, preset)
    lib/utils/         Formatters + IPC helper
```

## Architecture

Components call store actions. Stores call `window.api`. The preload bridge maps to `ipcMain.handle()` handlers in the main process. All 14 IPC channels use typed constants from `src/shared/ipc-channels.ts`.

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed architecture and phase status.
See [PRODUCT.md](./PRODUCT.md) for user stories and product requirements.

# FootFix — Implementation Plan

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    Main Process                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ settings-    │ │ image-       │ │ llm-service  │ │
│  │ store.ts     │ │ processor.ts │ │ .ts          │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ preset-      │ │ filename-    │ │ file-utils   │ │
│  │ manager.ts   │ │ template.ts  │ │ .ts          │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
│                        │ ipcMain                      │
├────────────────────────┼─────────────────────────────┤
│                   Preload Bridge                      │
│              contextBridge.exposeInMainWorld          │
│                   (preload/index.ts)                  │
├────────────────────────┼─────────────────────────────┤
│                        │ window.api                   │
│                    Renderer (Svelte 5)                │
│  ┌────────────────────────────────────────────────┐  │
│  │ Stores: job-store · settings-store · preset-   │  │
│  │         store (.svelte.ts)                     │  │
│  ├────────────────────────────────────────────────┤  │
│  │ Views: ProcessView · ResultsView · SettingsView│  │
│  ├────────────────────────────────────────────────┤  │
│  │ Components: DropZone · ImageQueue · Controls   │  │
│  │   SettingsPanel · PresetSelector · ResultsGrid │  │
│  │   ResultCard · ProgressBar · AltTextPanel      │  │
│  │   FilenamePreview                              │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Package | Version |
|-------|---------|---------|
| Shell | Electron | ^33.3.1 |
| Build | electron-vite | ^3.0.0 |
| Packaging | electron-builder | ^25.1.8 |
| UI Framework | Svelte | ^5.19.0 |
| CSS | Tailwind CSS | ^4.0.6 |
| Language | TypeScript | ^5.7.3 |
| Image Processing | Sharp | ^0.33.5 |
| Persistence | electron-store | ^10.0.0 |
| LLM | multi-llm-ts | ^4.6.0 |

## Phase Status Tracker

### Phase 1 — Project Scaffolding ✅ Done

| File | Status |
|------|--------|
| `package.json` | ✅ |
| `electron.vite.config.ts` | ✅ |
| `tsconfig.json` / `tsconfig.node.json` / `tsconfig.web.json` | ✅ |
| `src/shared/types.ts` | ✅ |
| `src/shared/ipc-channels.ts` | ✅ |

### Phase 2 — Backend (Main Process) ✅ Done

| File | Status | Notes |
|------|--------|-------|
| `src/main/index.ts` | ✅ | Entry point, window creation, handler registration |
| `src/main/settings-store.ts` | ✅ | electron-store + safeStorage encryption |
| `src/main/preset-manager.ts` | ✅ | CRUD + export/import dialogs |
| `src/main/image-processor.ts` | ✅ | Sharp pipeline, binary-search quality, progress events |
| `src/main/filename-template.ts` | ✅ | Template rendering + sanitization |
| `src/main/llm-service.ts` | ✅ | Dynamic ESM import of multi-llm-ts |
| `src/main/file-utils.ts` | ✅ | Folder selection dialog |
| `src/preload/index.ts` | ✅ | Typed API bridge, all channels wired |
| `src/preload/index.d.ts` | ✅ | Global `Window.api` type |

### Phase 3 — Renderer Stores ✅ Done

| File | Status | Notes |
|------|--------|-------|
| `src/renderer/src/lib/stores/job-store.svelte.ts` | ✅ | Queue, processing, results, view state |
| `src/renderer/src/lib/stores/settings-store.svelte.ts` | ✅ | Settings load/update, folder selection |
| `src/renderer/src/lib/stores/preset-store.svelte.ts` | ✅ | Preset CRUD, import/export |
| `src/renderer/src/lib/utils/format.ts` | ✅ | File size, percent, dimensions formatters |
| `src/renderer/src/lib/utils/ipc.ts` | ✅ | `window.api` re-export |

### Phase 4 — Renderer App Shell ✅ Done (partial)

| File | Status | Notes |
|------|--------|-------|
| `src/renderer/src/App.svelte` | ✅ | Tab navigation, view switching, sidebar |
| `src/renderer/src/app.css` | ✅ | 11 CSS custom properties, scrollbar, font stack |
| `src/renderer/index.html` | ✅ | Entry HTML |

### Phase 5 — Settings UI ✅ Done

| File | Status | Notes |
|------|--------|-------|
| `src/renderer/src/lib/components/SettingsPanel.svelte` | ✅ | Output folder, format, dimensions, file size, filename template, LLM config with test connection |
| `src/renderer/src/views/SettingsView.svelte` | ✅ | Wraps SettingsPanel with header |

### Phase 6 — Process UI ✅ Done

| File | Status | Notes |
|------|--------|-------|
| `src/renderer/src/lib/components/DropZone.svelte` | ✅ | Drag-and-drop + file picker with visual feedback |
| `src/renderer/src/lib/components/ImageQueue.svelte` | ✅ | File list with thumbnails, remove button, clear all, empty state |
| `src/renderer/src/lib/components/ProcessingControls.svelte` | ✅ | Start/cancel with disable states, embeds PresetSelector + FilenamePreview |
| `src/renderer/src/lib/components/PresetSelector.svelte` | ✅ | Dropdown + save/export/import/delete with inline save dialog |
| `src/renderer/src/lib/components/FilenamePreview.svelte` | ✅ | Live template preview with highlighted tokens |
| `src/renderer/src/lib/components/ProgressBar.svelte` | ✅ | Animated progress bar with phase label and ARIA progressbar role |
| `src/renderer/src/views/ProcessView.svelte` | ✅ | Composes DropZone + ImageQueue + ProcessingControls + ProgressBar |

### Phase 7 — Results UI ✅ Done

| File | Status | Notes |
|------|--------|-------|
| `src/renderer/src/lib/components/ResultsGrid.svelte` | ✅ | List of expandable ResultCards with AltTextPanel, empty state |
| `src/renderer/src/lib/components/ResultCard.svelte` | ✅ | Filename, format badge, size comparison, compression ratio, expandable details |
| `src/renderer/src/lib/components/AltTextPanel.svelte` | ✅ | Generate via LLM, editable textarea, copy to clipboard |
| `src/renderer/src/views/ResultsView.svelte` | ✅ | Summary banner (count, total saved, avg compression) + ResultsGrid |

### Phase 8 — Integration & Polish ✅ Done

- Build verified (`electron-vite build` exits 0, no errors)
- Keyboard accessibility (focus-visible outlines, tab order, disabled cursor states)
- ARIA labels on all interactive elements
- Disable states for Start, Cancel, Test Connection, Save preset, Export/Delete
- Error and loading states throughout
- Design system compliance verified (no hardcoded colors)

## Current State Summary

| Layer | Status |
|-------|--------|
| Main process (6 modules) | ✅ Fully implemented |
| Preload bridge | ✅ Complete with typed API |
| Shared types + IPC channels | ✅ Complete |
| Renderer stores (3 stores + 2 utils) | ✅ Complete |
| Renderer app shell (App.svelte, app.css) | ✅ Complete |
| Renderer components (10 files) | ✅ All implemented |
| Renderer views (3 files) | ✅ All implemented |
| Dependencies | ✅ Installed |
| Build | ✅ `electron-vite build` passes clean |

## Remaining Work

- End-to-end testing with `npx electron-vite dev`
- App packaging with `electron-builder`

## Conventions

### Svelte 5 Runes

All renderer code uses Svelte 5 runes. **No legacy syntax.**

```svelte
<!-- Props -->
<script lang="ts">
  const { label, onclick } = $props<{ label: string; onclick: () => void }>()
</script>

<!-- State -->
let count = $state(0)

<!-- Derived -->
let doubled = $derived(count * 2)

<!-- Effects -->
$effect(() => { console.log(count) })

<!-- Events — use attribute syntax, NOT directive syntax -->
<button onclick={handleClick}>Click</button>
```

**Banned patterns:** `$:`, `export let`, `createEventDispatcher`, `on:click`, `<slot>`, `$$props`, `$$restProps`.

### CSS Custom Properties

All colors come from `app.css` `:root` variables:

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg` | `#0f1117` | Page background |
| `--color-surface` | `#1a1d27` | Card / panel background |
| `--color-surface-alt` | `#232733` | Hover state for surfaces |
| `--color-border` | `#2e3341` | Borders |
| `--color-text` | `#e4e6ed` | Primary text |
| `--color-text-muted` | `#8b8fa3` | Secondary text |
| `--color-accent` | `#6c5ce7` | Primary accent (purple) |
| `--color-accent-hover` | `#7c6ef7` | Accent hover |
| `--color-success` | `#00b894` | Success state |
| `--color-warning` | `#fdcb6e` | Warning state |
| `--color-error` | `#e17055` | Error state |

### Store Access Pattern

Stores expose state via getter functions. Components call store action functions directly.

```typescript
// In component
import { getJobState, addFiles } from '../lib/stores/job-store.svelte'
const job = getJobState()
// Access: job.queue, job.processing, etc. (reactive via getters)
// Mutate: addFiles([...]), processImages({...}), etc.
```

**Rule:** Components call store actions. Stores call `window.api`. Components never call `window.api` directly.

### IPC Pattern

All channels defined in `src/shared/ipc-channels.ts`. Main process registers handlers with `ipcMain.handle()`. Preload wraps with `ipcRenderer.invoke()`. Progress uses `ipcRenderer.on()` with a cleanup function.

### TypeScript Build Split

- `tsconfig.node.json` — main process + preload + shared (no DOM)
- `tsconfig.web.json` — renderer + shared + preload types (has DOM)

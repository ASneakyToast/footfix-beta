# Project Tracker Agent

You maintain big-picture awareness of the FootFix project. You audit progress, check consistency, and suggest next steps. **You are read-only — you report and suggest, you do not write code.**

## Scope

**You read:** all project files, `PRODUCT.md`, `IMPLEMENTATION.md`, agent instructions.
**You produce:** status reports, consistency checks, and prioritized next-step recommendations.

## Phase-by-Phase Status

### Phase 1 — Scaffolding ✅

| File | Status |
|------|--------|
| `package.json` | ✅ Complete |
| `electron.vite.config.ts` | ✅ Complete |
| `tsconfig.json` | ✅ Complete |
| `tsconfig.node.json` | ✅ Complete |
| `tsconfig.web.json` | ✅ Complete |
| `src/shared/types.ts` | ✅ Complete — 9 interfaces/types + DEFAULT_SETTINGS |
| `src/shared/ipc-channels.ts` | ✅ Complete — 14 channels |

### Phase 2 — Backend ✅

| File | Status | Key detail |
|------|--------|------------|
| `src/main/index.ts` | ✅ | Window 1100×750, min 800×600 |
| `src/main/settings-store.ts` | ✅ | electron-store + safeStorage |
| `src/main/preset-manager.ts` | ✅ | JSON files in userData/presets |
| `src/main/image-processor.ts` | ✅ | Sharp + binary search, 7 iterations max |
| `src/main/filename-template.ts` | ✅ | 7 template tokens, sanitization |
| `src/main/llm-service.ts` | ✅ | Dynamic ESM import |
| `src/main/file-utils.ts` | ✅ | openDirectory + createDirectory |
| `src/preload/index.ts` | ✅ | 14 API methods exposed |
| `src/preload/index.d.ts` | ✅ | Global Window.api type |

### Phase 3 — Stores ✅

| File | Status | Key detail |
|------|--------|------------|
| `job-store.svelte.ts` | ✅ | 7 state vars, 7 exported functions |
| `settings-store.svelte.ts` | ✅ | 3 exported functions + getter |
| `preset-store.svelte.ts` | ✅ | 5 exported functions + getter |
| `format.ts` | ✅ | 4 formatting utilities |
| `ipc.ts` | ✅ | window.api re-export |

### Phase 4 — App Shell ✅ (partial)

| File | Status | Key detail |
|------|--------|------------|
| `App.svelte` | ✅ | 3-tab sidebar, view switching |
| `app.css` | ✅ | 11 CSS variables, scrollbar, dark theme |
| `index.html` | ✅ | Entry HTML |

### Phase 5 — Settings UI 🔲

| File | Status |
|------|--------|
| `SettingsPanel.svelte` | 🔲 Stub |
| `SettingsView.svelte` | 🔲 Stub |

### Phase 6 — Process UI 🔲

| File | Status |
|------|--------|
| `DropZone.svelte` | 🔲 Stub |
| `ImageQueue.svelte` | 🔲 Stub |
| `ProcessingControls.svelte` | 🔲 Stub |
| `PresetSelector.svelte` | 🔲 Stub |
| `FilenamePreview.svelte` | 🔲 Stub |
| `ProgressBar.svelte` | 🔲 Stub |
| `ProcessView.svelte` | 🔲 Stub |

### Phase 7 — Results UI 🔲

| File | Status |
|------|--------|
| `ResultsGrid.svelte` | 🔲 Stub |
| `ResultCard.svelte` | 🔲 Stub |
| `AltTextPanel.svelte` | 🔲 Stub |
| `ResultsView.svelte` | 🔲 Stub |

### Phase 8 — Integration & Polish 🔲

Not started.

## Implementation Ordering Rules

These ordering constraints exist because of data dependencies:

1. **SettingsPanel before ProcessingControls** — ProcessingControls reads settings (format, dimensions, file size) that SettingsPanel configures.
2. **DropZone before ImageQueue** — ImageQueue displays items that DropZone adds.
3. **PresetSelector before ProcessingControls** — ProcessingControls embeds or references PresetSelector.
4. **FilenamePreview before ProcessingControls** — ProcessingControls shows live filename preview.
5. **ResultCard before ResultsGrid** — ResultsGrid composes ResultCards.
6. **AltTextPanel before ResultsView** — ResultsView may embed AltTextPanel per result.
7. **All components before their parent View** — Views compose components.

## Convention Enforcement Rules

When auditing code, verify these 7 conventions:

### 1. Svelte 5 Runes Only
No `$:`, no `export let`, no `createEventDispatcher`, no `on:click`, no `<slot>`. Every `.svelte` file must use `$props`, `$state`, `$derived`, `$effect`, `onclick`.

### 2. CSS Variables for All Colors
No hardcoded hex values in `.svelte` style blocks. All colors reference `var(--color-*)`.

### 3. Store → API Boundary
Components call store actions. Stores call `window.api`. Components never call `window.api` directly.

### 4. IPC Channel Constants
All IPC channels use constants from `src/shared/ipc-channels.ts`. No string literals for channel names.

### 5. Handler Registration Pattern
Each main process module exports `registerXxxHandlers()`. No loose `ipcMain.handle()` calls.

### 6. TypeScript Strict Mode
Both tsconfigs have `strict: true`. No `any` types without justification (exception: `multi-llm-ts` dynamic import).

### 7. Security Defaults
`contextIsolation: true`, `nodeIntegration: false`, API keys encrypted with safeStorage.

## Progress Report Template

```
## FootFix Progress Report — [Date]

### Overall
- Phases complete: X/8
- Files implemented: X/Y
- Files stubbed: X remaining

### Completed Since Last Check
- [list files or features completed]

### Blocked / At Risk
- [list any blockers]

### Recommended Next Steps
1. [most important next action]
2. [second priority]
3. [third priority]

### Convention Violations Found
- [list any violations or "None"]
```

## What to Check When Asked

When asked for a status report:

1. **Read** `IMPLEMENTATION.md` for claimed status
2. **Verify** each claimed-complete file actually contains implementation (not stubs)
3. **Verify** each stub file is correctly marked as not-started
4. **Check** for consistency between `PRODUCT.md` user stories and implemented features
5. **Check** for convention violations in recently-changed files
6. **Recommend** next steps based on ordering rules and current state

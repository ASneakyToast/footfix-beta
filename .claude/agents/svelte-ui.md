# Svelte UI Builder Agent

You build renderer UI components and views for FootFix, an Electron + Svelte 5 desktop app.

## Scope

**You work in:** `src/renderer/src/` only.
**You do NOT touch:** `src/main/`, `src/preload/`, `src/shared/`, config files, `package.json`.

## CSS Custom Properties

All colors come from `app.css` `:root`. Use these variables — never hardcode hex values.

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

Font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif` (inherited from body).

## Svelte 5 Runes — Required Syntax

### Props

```svelte
<script lang="ts">
  const { label, count = 0, onclick } = $props<{
    label: string
    count?: number
    onclick: () => void
  }>()
</script>
```

### State

```typescript
let items = $state<string[]>([])
let selected = $state<string | null>(null)
```

### Derived

```typescript
let total = $derived(items.length)
let hasSelection = $derived(selected !== null)
```

### Effects

```typescript
$effect(() => {
  console.log('items changed:', items.length)
})
```

### Events — Attribute Syntax Only

```svelte
<!-- DO -->
<button onclick={handleClick}>Click</button>
<input oninput={(e) => value = e.currentTarget.value} />
<div ondragover={handleDragOver} ondrop={handleDrop}></div>

<!-- DON'T -->
<button on:click={handleClick}>Click</button>
<input on:input={handleInput} />
```

### Children Instead of Slots

```svelte
<!-- DO: use {@render} and {#snippet} -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  const { children } = $props<{ children: Snippet }>()
</script>
{@render children()}

<!-- DON'T -->
<slot />
<slot name="header" />
```

## Banned Patterns

These will **break** the build or violate project conventions:

| Pattern | Replacement |
|---------|-------------|
| `$:` reactive declarations | `$derived()` or `$effect()` |
| `export let prop` | `const { prop } = $props<{...}>()` |
| `createEventDispatcher` | Pass callback props (`onclick`, `onchange`, etc.) |
| `on:click`, `on:input`, etc. | `onclick`, `oninput` (attribute syntax) |
| `<slot>` / `<slot name="x">` | `{@render children()}` / `{@render header()}` |
| `$$props` / `$$restProps` | Destructure what you need from `$props` |
| `import { writable }` | Use `$state` rune instead |
| Hardcoded hex colors | Use `var(--color-*)` CSS variables |
| `window.api.*` in components | Call store action functions instead |

## Store Access Pattern

Stores expose state via getter functions. Import the getter and action functions directly.

```typescript
// ✅ Correct
import { getJobState, addFiles, processImages } from '../lib/stores/job-store.svelte'
const job = getJobState()

// Use in template:
// {job.queue.length} files — reactive via getter
// onclick={() => addFiles(files)} — calls store action

// ❌ Wrong — do not destructure getters (breaks reactivity)
const { queue, processing } = getJobState()

// ❌ Wrong — components must not call window.api directly
const settings = await window.api.getSettings()
```

### Available Stores

**job-store.svelte.ts:**
- `getJobState()` → `{ queue, results, processing, progress, errors, currentView }`
- `setView(view)`, `addFiles(files)`, `removeFile(id)`, `clearQueue()`
- `processImages(opts)`, `cancelProcessing()`, `updateResultAltText(path, text)`

**settings-store.svelte.ts:**
- `getSettingsState()` → `{ settings, loaded }`
- `loadSettings()`, `updateSettings(partial)`, `selectOutputFolder()`

**preset-store.svelte.ts:**
- `getPresetState()` → `{ presets, loaded }`
- `loadPresets()`, `savePreset(preset)`, `deletePreset(id)`
- `exportPreset(preset)`, `importPreset()`

## window.api Type Reference

Components should NOT call these directly — use store actions instead. Listed here for store-level understanding only.

```typescript
interface API {
  // Image processing
  processImages(request: ProcessRequest): Promise<ProcessResult>
  cancelProcessing(): Promise<void>
  getPreview(filePath: string): Promise<string>  // base64 data URI
  onProgress(callback: (update: ProgressUpdate) => void): () => void  // returns cleanup

  // Alt text
  generateAltText(imagePath: string): Promise<AltTextResult>
  testLlmConnection(): Promise<{ success: boolean; error?: string }>

  // Presets
  listPresets(): Promise<Preset[]>
  savePreset(preset: Preset): Promise<Preset>
  deletePreset(id: string): Promise<boolean>
  exportPreset(preset: Preset): Promise<boolean>
  importPreset(): Promise<Preset | null>

  // Settings
  getSettings(): Promise<AppSettings>
  updateSettings(partial: Partial<AppSettings>): Promise<AppSettings>
  selectFolder(): Promise<string | null>
}
```

## Key Types

```typescript
type ImageFormat = 'jpeg' | 'webp' | 'png'

interface QueueItem {
  id: string
  path: string
  name: string
  size: number
  thumbnail?: string
}

interface ImageResult {
  inputPath: string
  outputPath: string
  originalSize: number
  outputSize: number
  originalWidth: number
  originalHeight: number
  outputWidth: number
  outputHeight: number
  quality: number | null
  format: ImageFormat
  filename: string
  altText?: string
}

interface ProgressUpdate {
  index: number
  total: number
  filename: string
  phase: 'resizing' | 'optimizing' | 'writing' | 'complete' | 'error'
  error?: string
}

interface AppSettings {
  outputFolder: string
  format: ImageFormat
  maxDimension: number
  targetFileSize: number
  sizeTolerance: number
  filenameTemplate: string
  llmProvider: string
  llmModel: string
  llmApiKey: string
  altTextPrompt: string
}

interface Preset {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  format: ImageFormat
  maxDimension: number
  targetFileSize: number
  sizeTolerance: number
  filenameTemplate: string
}
```

## Utility Imports

```typescript
import { formatFileSize, formatPercent, compressionRatio, formatDimensions } from '../lib/utils/format'
```

## Component Implementation Order

Build in this order — later components depend on earlier ones:

1. SettingsPanel → SettingsView
2. DropZone → ImageQueue → PresetSelector → FilenamePreview → ProcessingControls → ProgressBar → ProcessView
3. ResultCard → AltTextPanel → ResultsGrid → ResultsView

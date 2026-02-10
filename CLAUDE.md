# CLAUDE.md — Project Instructions for Claude Code

## Project Overview

FootFix is an Electron + Svelte 5 desktop app for batch image processing with LLM-powered alt text. The backend is complete; the UI uses Svelte 5 runes exclusively.

## Key Commands

```bash
npm install              # Install dependencies
npx electron-vite dev    # Run in development
npx electron-vite build  # Production build
npm run package          # Package with electron-builder
```

## Architecture Rules

- **Components call store actions. Stores call `window.api`. Components never call `window.api` directly.**
  - Exception: `AltTextPanel` calls `window.api.generateAltText()` directly (alt text generation is not a store action)
  - Exception: `SettingsPanel` calls `window.api.testLlmConnection()` directly
- **IPC channels** are defined in `src/shared/ipc-channels.ts` — always use the constants, never hardcode strings
- **Main process modules** export `registerXxxHandlers()` functions called from `src/main/index.ts`
- **ESM-only packages** (`electron-store`, `multi-llm-ts`) must use dynamic `import()` in the main process since electron-vite builds CJS

## Svelte 5 — Required Patterns

All renderer code uses Svelte 5 runes. **No legacy syntax.**

| Use | Don't Use |
|-----|-----------|
| `$props<{...}>()` | `export let` |
| `$state()` | `writable()` |
| `$derived()` | `$:` reactive declarations |
| `$effect()` | `$:` side effects |
| `onclick={handler}` | `on:click={handler}` |
| `{@render children()}` | `<slot>` |

## Store Access Pattern

```typescript
import { getJobState, addFiles } from '../lib/stores/job-store.svelte'
const job = getJobState()  // holds reactive proxy
job.queue                  // reactive read via getter
addFiles(files)            // call exported action
```

**Never destructure** the return value of `getXxxState()` — it breaks reactivity.

## CSS Design System

All colors use CSS custom properties from `app.css`. **Never hardcode hex values or named colors.**

Key variables: `--color-bg`, `--color-surface`, `--color-surface-alt`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-accent-hover`, `--color-success`, `--color-warning`, `--color-error`

## File Layout

| Path | What |
|------|------|
| `src/main/` | Electron main process (6 modules) |
| `src/preload/` | Context bridge + types |
| `src/shared/` | Shared types + IPC constants |
| `src/renderer/src/` | Svelte UI |
| `src/renderer/src/lib/stores/` | 3 reactive stores (.svelte.ts) |
| `src/renderer/src/lib/components/` | 10 components |
| `src/renderer/src/views/` | 3 views |
| `.claude/agents/` | Specialized agent instructions |

## Agent Files

The `.claude/agents/` directory contains detailed instructions for specialized roles:
- `svelte-ui.md` — UI component builder (renderer scope only)
- `electron-backend.md` — Main process / preload work
- `qa-verify.md` — Read-only verification checklists
- `project-tracker.md` — Progress auditing

## TypeScript

- `tsconfig.node.json` — main + preload + shared (no DOM)
- `tsconfig.web.json` — renderer (has DOM)
- Strict mode enabled

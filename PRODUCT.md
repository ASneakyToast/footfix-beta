# FootFix — Product Document

## Vision

FootFix is a desktop application for editorial teams and content managers who need to batch-process images for the web. It resizes, compresses, and renames images locally — no cloud uploads, no subscriptions — and optionally generates accessible alt text using the LLM provider of the user's choice. The goal is to turn a tedious, error-prone manual workflow into a predictable one-click operation.

## Target Users

- **Editorial teams** publishing articles with 5–50 images per piece
- **Content managers** maintaining CMS-driven websites with strict image budgets
- **Non-designers** who need web-safe images without learning Photoshop or CLI tools

## Core Value Props

| Prop | Why it matters |
|------|---------------|
| **Local-only processing** | Images never leave the machine. No privacy concerns, no bandwidth costs. |
| **Batch resize to web-safe sizes** | Drop a folder of camera originals, get publication-ready output in seconds. |
| **Target file size with quality optimization** | Binary-search compression finds the best quality that fits a byte budget. |
| **Custom filename templates** | Consistent, CMS-friendly naming (`hero_1920x1080.webp`) without manual renames. |
| **Save / load / share presets** | Teams standardize settings by sharing `.json` preset files. |
| **LLM-powered alt text** | Accessibility compliance without writing descriptions by hand. |
| **Multiple LLM providers** | Works with OpenAI, Anthropic, Google, and local Ollama models. |

## User Stories

### Image Processing

1. **Batch resize** — As a content manager, I want to drop multiple images onto the app and have them all resized to a maximum dimension so they fit my site's layout without manual cropping.

2. **Target file size** — As a web editor, I want to specify a target file size (e.g., 500 KB) so the app automatically finds the best compression quality that meets my bandwidth budget.

3. **Custom filenames** — As a CMS operator, I want to define a filename template (e.g., `{name}_{width}x{height}`) so every output file follows our naming convention.

4. **Output folder** — As a user, I want to choose an output folder so processed images land where my publishing workflow expects them.

### Presets

5. **Save preset** — As a team lead, I want to save my processing settings as a named preset so I can reuse them across batches.

6. **Share preset** — As a team lead, I want to export a preset to a `.json` file and share it with colleagues so the whole team uses identical settings.

### Alt Text

7. **Generate alt text** — As an accessibility-conscious editor, I want the app to generate descriptive alt text for each processed image so I can paste it into my CMS.

8. **Configure LLM provider** — As a user, I want to choose my LLM provider (OpenAI, Anthropic, Google, or Ollama) and enter my API key so alt-text generation uses the model I trust.

### Review

9. **Before / after review** — As a user, I want to see each image's original size, output size, compression ratio, and dimensions so I can verify the results before publishing.

10. **Error visibility** — As a user, I want to see clear error messages when a file fails to process so I can fix the issue and retry.

## Non-Goals (v1)

- **Cloud processing** — all work stays on the local machine.
- **Image editing / cropping** — FootFix resizes and compresses; it is not an editor.
- **CDN upload** — output goes to a local folder; deployment is out of scope.
- **Team / collaboration features** — no accounts, no shared state, no real-time sync.
- **Video processing** — images only.

## Success Criteria (v1.0)

| Metric | Target |
|--------|--------|
| Process a 20-image batch (mixed JPEG/PNG, 5–15 MB each) | < 30 seconds on an M1 Mac or equivalent |
| Output file size within tolerance of target | ± 50 KB default (configurable) |
| Alt-text round-trip (single image, GPT-4o) | < 10 seconds |
| Zero data leaves the machine (except LLM API calls for alt text) | Verified by architecture |
| App launches and shows UI without errors | On macOS, Windows, Linux |
| All IPC channels round-trip without type errors | Verified by QA checklist |

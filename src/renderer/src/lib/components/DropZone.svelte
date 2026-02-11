<script lang="ts">
  import { addFiles } from '../stores/job-store.svelte'

  let dragging = $state(false)
  let fileInput: HTMLInputElement | undefined = $state()

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    dragging = true
  }

  function handleDragLeave() {
    dragging = false
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    dragging = false
    if (!e.dataTransfer?.files.length) return
    processFileList(e.dataTransfer.files)
  }

  function handleFileInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    if (!input.files?.length) return
    processFileList(input.files)
    input.value = ''
  }

  function processFileList(fileList: FileList) {
    const files = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({
        path: window.api.getFilePath(f),
        name: f.name,
        size: f.size
      }))
    if (files.length > 0) {
      addFiles(files)
    }
  }
</script>

<button
  type="button"
  class="w-full rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
  style="border-color: {dragging ? 'var(--color-accent)' : 'var(--color-border)'}; background: {dragging ? 'var(--color-surface-alt)' : 'var(--color-surface)'};"
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={() => fileInput?.click()}
  aria-label="Drop images here or click to browse"
>
  <div class="flex flex-col items-center gap-3">
    <span class="text-3xl">📁</span>
    <p class="text-sm font-medium" style="color: var(--color-text);">
      Drop images here or click to browse
    </p>
    <p class="text-xs" style="color: var(--color-text-muted);">
      Supports JPEG, PNG, WebP
    </p>
  </div>
</button>

<input
  bind:this={fileInput}
  type="file"
  multiple
  accept="image/*"
  class="hidden"
  onchange={handleFileInput}
  aria-hidden="true"
  tabindex="-1"
/>

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
  class="dropzone w-full p-12 text-center cursor-pointer"
  class:dragging
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={() => fileInput?.click()}
  aria-label="Drop images here or click to browse"
  style="border-radius: var(--radius-xl);"
>
  <div class="flex flex-col items-center gap-3">
    <span class="drop-icon" style="color: {dragging ? 'var(--color-accent-2)' : 'var(--color-text-muted)'};">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
        <path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
      </svg>
    </span>
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

<style>
  .dropzone {
    position: relative;
    border: 2px dashed var(--color-border);
    background: var(--color-surface-1);
    transition: all var(--transition-base);
  }
  .dropzone::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    border: 2px dashed transparent;
    transition: border-color var(--transition-base);
    pointer-events: none;
  }
  .dropzone:hover {
    border-color: var(--color-accent);
    box-shadow: var(--glow-accent);
    transform: scale(1.005);
  }
  .dropzone:hover .drop-icon {
    color: var(--color-accent) !important;
  }
  .dropzone.dragging {
    border-color: var(--color-accent-2);
    background: var(--color-surface-2);
    box-shadow: var(--glow-accent-2);
    transform: scale(1.01);
  }
  .dropzone.dragging .drop-icon {
    color: var(--color-accent-2) !important;
  }
</style>

<script lang="ts">
  import type { ImageResult } from '../../../../../shared/types'
  import { formatFileSize, compressionRatio, formatDimensions } from '../utils/format'

  const { result, expanded = false, ontoggle } = $props<{
    result: ImageResult
    expanded?: boolean
    ontoggle: () => void
  }>()

  let thumbnailSrc = $state('')

  $effect(() => {
    // Load thumbnail from the processed output file
    const path = result.outputPath
    window.api.getPreview(path).then((src) => {
      thumbnailSrc = src
    }).catch(() => {
      thumbnailSrc = ''
    })
  })
</script>

<div
  class="rounded-lg overflow-hidden"
  style="background: var(--color-surface-alt);"
>
  <button
    onclick={ontoggle}
    class="w-full text-left px-4 py-3 flex items-center gap-4"
    aria-expanded={expanded}
    aria-label="{expanded ? 'Collapse' : 'Expand'} details for {result.filename}"
  >
    <!-- Thumbnail -->
    <div
      class="shrink-0 rounded overflow-hidden flex items-center justify-center"
      style="width: 44px; height: 44px; background: var(--color-bg);"
    >
      {#if thumbnailSrc}
        <img
          src={thumbnailSrc}
          alt={result.filename}
          class="w-full h-full object-cover"
        />
      {:else}
        <span class="text-xs" style="color: var(--color-text-muted);">...</span>
      {/if}
    </div>

    <!-- Filename + Format badge -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium truncate" style="color: var(--color-text);">
        {result.filename}
      </p>
      <div class="flex items-center gap-2 mt-1">
        <span
          class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase"
          style="background: var(--color-accent); color: var(--color-text);"
        >
          {result.format}
        </span>
        {#if result.quality !== null}
          <span class="text-xs" style="color: var(--color-text-muted);">
            Q{result.quality}
          </span>
        {/if}
      </div>
    </div>

    <!-- Size comparison -->
    <div class="text-right shrink-0">
      <p class="text-xs" style="color: var(--color-text-muted);">
        {formatFileSize(result.originalSize)} → {formatFileSize(result.outputSize)}
      </p>
      <p class="text-xs font-medium" style="color: var(--color-success);">
        -{compressionRatio(result.originalSize, result.outputSize)} saved
      </p>
    </div>

    <!-- Expand indicator -->
    <span class="text-xs shrink-0" style="color: var(--color-text-muted);">
      {expanded ? '▲' : '▼'}
    </span>
  </button>

  {#if expanded}
    <div class="px-4 pb-3 border-t" style="border-color: var(--color-border);">
      <div class="flex gap-4 mt-3">
        <!-- Larger preview -->
        {#if thumbnailSrc}
          <div
            class="shrink-0 rounded-lg overflow-hidden"
            style="width: 120px; height: 120px; background: var(--color-bg);"
          >
            <img
              src={thumbnailSrc}
              alt={result.filename}
              class="w-full h-full object-contain"
            />
          </div>
        {/if}

        <!-- Metadata -->
        <div class="grid grid-cols-2 gap-3 text-xs flex-1">
          <div>
            <span style="color: var(--color-text-muted);">Original</span>
            <p style="color: var(--color-text);">
              {formatDimensions(result.originalWidth, result.originalHeight)} · {formatFileSize(result.originalSize)}
            </p>
          </div>
          <div>
            <span style="color: var(--color-text-muted);">Output</span>
            <p style="color: var(--color-text);">
              {formatDimensions(result.outputWidth, result.outputHeight)} · {formatFileSize(result.outputSize)}
            </p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

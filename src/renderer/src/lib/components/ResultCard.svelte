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
    const path = result.outputPath
    window.api.getPreview(path).then((src) => {
      thumbnailSrc = src
    }).catch(() => {
      thumbnailSrc = ''
    })
  })
</script>

<div class="result-card rounded-lg overflow-hidden" class:expanded>
  <button
    onclick={ontoggle}
    class="w-full text-left px-4 py-3 flex items-center gap-4"
    aria-expanded={expanded}
    aria-label="{expanded ? 'Collapse' : 'Expand'} details for {result.filename}"
  >
    <!-- Thumbnail -->
    <div
      class="shrink-0 rounded overflow-hidden flex items-center justify-center"
      style="width: 52px; height: 52px; background: var(--color-bg); border-radius: var(--radius-sm);"
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
        <span class="format-badge px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">
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
      <p class="text-xs font-medium" style="color: var(--color-accent-2);">
        -{compressionRatio(result.originalSize, result.outputSize)} saved
      </p>
    </div>

    <!-- Expand indicator (chevron with rotation) -->
    <span class="chevron shrink-0" class:open={expanded} style="color: var(--color-text-muted);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </span>
  </button>

  {#if expanded}
    <div class="px-4 pb-3" style="background: var(--color-surface-3); border-top: 1px solid var(--color-border); animation: fadeIn var(--transition-fast) ease-out both;">
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

<style>
  .result-card {
    background: var(--color-surface-2);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }
  .result-card:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  .result-card.expanded {
    box-shadow: var(--shadow-md);
  }
  .format-badge {
    background: var(--color-accent-2-muted);
    color: var(--color-accent-2);
  }
  .chevron {
    transition: transform var(--transition-fast);
    display: flex;
    align-items: center;
  }
  .chevron.open {
    transform: rotate(180deg);
  }
</style>

<script lang="ts">
  import { getJobState, removeFile, clearQueue } from '../stores/job-store.svelte'
  import { formatFileSize } from '../utils/format'

  const job = getJobState()
</script>

{#if job.queue.length === 0}
  <div class="py-8 text-center">
    <p class="text-sm" style="color: var(--color-text-muted);">
      No images in queue. Drop files above to get started.
    </p>
  </div>
{:else}
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium" style="color: var(--color-text-muted);">
        {job.queue.length} image{job.queue.length === 1 ? '' : 's'} queued
      </span>
      <button
        onclick={clearQueue}
        class="text-xs px-2 py-1 rounded transition-colors"
        style="color: var(--color-error);"
        aria-label="Clear all images from queue"
      >
        Clear All
      </button>
    </div>

    {#each job.queue as item (item.id)}
      <div
        class="flex items-center gap-3 px-3 py-2 rounded-lg"
        style="background: var(--color-surface-alt);"
      >
        <!-- Thumbnail -->
        <div
          class="w-10 h-10 rounded shrink-0 flex items-center justify-center overflow-hidden"
          style="background: var(--color-bg);"
        >
          {#if item.thumbnail}
            <img src={item.thumbnail} alt={item.name} class="w-full h-full object-cover" />
          {:else}
            <span class="text-xs" style="color: var(--color-text-muted);">🖼</span>
          {/if}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm truncate" style="color: var(--color-text);">{item.name}</p>
          <p class="text-xs" style="color: var(--color-text-muted);">{formatFileSize(item.size)}</p>
        </div>

        <!-- Remove -->
        <button
          onclick={() => removeFile(item.id)}
          class="shrink-0 w-7 h-7 rounded flex items-center justify-center transition-colors"
          style="color: var(--color-text-muted);"
          aria-label="Remove {item.name} from queue"
        >
          ✕
        </button>
      </div>
    {/each}
  </div>
{/if}

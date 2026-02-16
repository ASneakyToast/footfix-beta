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
      <span class="text-sm font-medium flex items-center gap-2" style="color: var(--color-text-muted);">
        <span class="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style="background: var(--color-accent-2-muted); color: var(--color-accent-2); min-width: 20px;">
          {job.queue.length}
        </span>
        image{job.queue.length === 1 ? '' : 's'} queued
      </span>
      <button
        onclick={clearQueue}
        class="clear-btn text-xs px-3 py-1 rounded-full font-medium transition-colors"
        style="background: var(--color-error-muted); color: var(--color-error); transition-duration: var(--transition-fast);"
        aria-label="Clear all images from queue"
      >
        Clear All
      </button>
    </div>

    {#each job.queue as item, i (item.id)}
      <div
        class="flex items-center gap-3 px-3 py-2 rounded-lg"
        style="background: var(--color-surface-3); animation: staggerIn var(--transition-base) ease-out both; animation-delay: {Math.min(i * 30, 300)}ms;"
      >
        <!-- Thumbnail -->
        <div
          class="shrink-0 flex items-center justify-center overflow-hidden"
          style="width: 44px; height: 44px; background: var(--color-bg); border-radius: var(--radius-sm);"
        >
          {#if item.thumbnail}
            <img src={item.thumbnail} alt={item.name} class="w-full h-full object-cover" />
          {:else}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
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
          class="remove-btn shrink-0 w-7 h-7 rounded flex items-center justify-center"
          style="color: var(--color-text-muted);"
          aria-label="Remove {item.name} from queue"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .remove-btn {
    transition: color var(--transition-fast), background var(--transition-fast);
  }
  .remove-btn:hover {
    color: var(--color-error);
    background: var(--color-error-muted);
  }
  .clear-btn:hover {
    filter: brightness(1.2);
  }
</style>

<script lang="ts">
  import { getJobState } from '../lib/stores/job-store.svelte'
  import DropZone from '../lib/components/DropZone.svelte'
  import ImageQueue from '../lib/components/ImageQueue.svelte'
  import ProcessingControls from '../lib/components/ProcessingControls.svelte'
  import ProgressBar from '../lib/components/ProgressBar.svelte'

  const job = getJobState()
</script>

<div class="px-10 py-10 flex flex-col gap-8">
  <div>
    <h1 class="text-3xl font-bold tracking-tight mb-2" style="color: var(--color-text-heading);">Process Images</h1>
    <p style="color: var(--color-text-muted);">
      Drop images here or click Browse to get started.
    </p>
  </div>

  <DropZone />

  <div class="rounded-xl p-5 surface-1" style="border-radius: var(--radius-xl);">
    <ImageQueue />
  </div>

  <ProcessingControls />

  <ProgressBar progress={job.progress} />

  {#if job.errors.length > 0}
    <div class="error-panel rounded-xl p-5">
      <div class="flex items-center gap-2 mb-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-error);">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3 class="text-sm font-medium" style="color: var(--color-error);">
          {job.errors.length} error{job.errors.length === 1 ? '' : 's'} occurred
        </h3>
      </div>
      <ul class="flex flex-col gap-1 text-sm" style="color: var(--color-text-muted);">
        {#each job.errors as err}
          <li>
            {#if err.path}
              <span class="font-medium" style="color: var(--color-text);">{err.path}</span> — {err.error}
            {:else}
              {err.error}
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .error-panel {
    background: var(--color-surface-1);
    border: 1px solid var(--color-error);
    box-shadow: var(--glow-error);
  }
</style>

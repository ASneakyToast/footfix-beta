<script lang="ts">
  import { getJobState } from '../lib/stores/job-store.svelte'
  import DropZone from '../lib/components/DropZone.svelte'
  import ImageQueue from '../lib/components/ImageQueue.svelte'
  import ProcessingControls from '../lib/components/ProcessingControls.svelte'
  import ProgressBar from '../lib/components/ProgressBar.svelte'

  const job = getJobState()
</script>

<div class="p-8 flex flex-col gap-6">
  <div>
    <h1 class="text-2xl font-bold mb-2">Process Images</h1>
    <p style="color: var(--color-text-muted);">
      Drop images here or click Browse to get started.
    </p>
  </div>

  <DropZone />

  <div class="rounded-xl p-4" style="background: var(--color-surface);">
    <ImageQueue />
  </div>

  <ProcessingControls />

  <ProgressBar progress={job.progress} />

  {#if job.errors.length > 0}
    <div class="rounded-xl p-4" style="background: var(--color-surface); border: 1px solid var(--color-error);">
      <h3 class="text-sm font-medium mb-2" style="color: var(--color-error);">
        {job.errors.length} error{job.errors.length === 1 ? '' : 's'} occurred
      </h3>
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

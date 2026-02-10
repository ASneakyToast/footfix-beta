<script lang="ts">
  import { getJobState } from '../lib/stores/job-store.svelte'
  import { formatFileSize } from '../lib/utils/format'
  import ResultsGrid from '../lib/components/ResultsGrid.svelte'

  const job = getJobState()

  let totalSaved = $derived(
    job.results.reduce((sum, r) => sum + (r.originalSize - r.outputSize), 0)
  )

  let avgCompression = $derived(
    job.results.length > 0
      ? job.results.reduce((sum, r) => sum + (1 - r.outputSize / r.originalSize), 0) / job.results.length
      : 0
  )
</script>

<div class="p-8 flex flex-col gap-6">
  <div>
    <h1 class="text-2xl font-bold mb-2">Results</h1>

    {#if job.results.length > 0}
      <div class="flex items-center gap-6 mt-4">
        <div>
          <p class="text-xs" style="color: var(--color-text-muted);">Processed</p>
          <p class="text-lg font-semibold" style="color: var(--color-text);">
            {job.results.length} image{job.results.length === 1 ? '' : 's'}
          </p>
        </div>
        <div>
          <p class="text-xs" style="color: var(--color-text-muted);">Total Saved</p>
          <p class="text-lg font-semibold" style="color: var(--color-success);">
            {formatFileSize(totalSaved)}
          </p>
        </div>
        <div>
          <p class="text-xs" style="color: var(--color-text-muted);">Avg Compression</p>
          <p class="text-lg font-semibold" style="color: var(--color-success);">
            {(avgCompression * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    {/if}
  </div>

  <ResultsGrid />
</div>

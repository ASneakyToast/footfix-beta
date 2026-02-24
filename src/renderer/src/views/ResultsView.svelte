<script lang="ts">
  import { getJobState, generateAllAltText, cancelAltTextGeneration, copyAllAltText } from '../lib/stores/job-store.svelte'
  import { formatFileSize } from '../lib/utils/format'
  import ResultsGrid from '../lib/components/ResultsGrid.svelte'

  const job = getJobState()

  let copyFeedback = $state(false)

  let altTextCount = $derived(
    job.results.filter((r) => r.altText).length
  )

  let missingAltTextCount = $derived(
    job.results.filter((r) => !r.altText).length
  )

  async function handleCopyAll() {
    const count = await copyAllAltText()
    if (count > 0) {
      copyFeedback = true
      setTimeout(() => { copyFeedback = false }, 2000)
    }
  }

  let totalSaved = $derived(
    job.results.reduce((sum, r) => sum + (r.originalSize - r.outputSize), 0)
  )

  let avgCompression = $derived(
    job.results.length > 0
      ? job.results.reduce((sum, r) => sum + (1 - r.outputSize / r.originalSize), 0) / job.results.length
      : 0
  )
</script>

<div class="px-10 py-10 flex flex-col gap-8">
  <div>
    <h1 class="text-3xl font-bold tracking-tight mb-2" style="color: var(--color-text-heading);">Results</h1>

    {#if job.results.length > 0}
      <div class="flex items-center gap-4 mt-4">
        <div class="stat-card surface-1" style="border-radius: var(--radius-md);">
          <p class="text-[10px] font-semibold uppercase tracking-wider" style="color: var(--color-text-muted);">Processed</p>
          <p class="text-lg font-semibold" style="color: var(--color-text);">
            {job.results.length} image{job.results.length === 1 ? '' : 's'}
          </p>
        </div>
        <div class="stat-card surface-1" style="border-radius: var(--radius-md);">
          <div class="stat-accent" style="background: var(--color-accent-2);"></div>
          <p class="text-[10px] font-semibold uppercase tracking-wider" style="color: var(--color-text-muted);">Total Saved</p>
          <p class="text-lg font-semibold" style="color: var(--color-accent-2);">
            {formatFileSize(totalSaved)}
          </p>
        </div>
        <div class="stat-card surface-1" style="border-radius: var(--radius-md);">
          <div class="stat-accent" style="background: var(--color-accent-2);"></div>
          <p class="text-[10px] font-semibold uppercase tracking-wider" style="color: var(--color-text-muted);">Avg Compression</p>
          <p class="text-lg font-semibold" style="color: var(--color-accent-2);">
            {(avgCompression * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-4">
        {#if job.altTextProgress.generating}
          <button
            class="action-btn"
            style="background: var(--color-surface-alt); color: var(--color-text); border: 1px solid var(--color-border);"
            disabled
          >
            Generating {job.altTextProgress.current}/{job.altTextProgress.total}…
          </button>
          <button
            class="action-btn cancel-btn"
            style="background: var(--color-error); color: white; border: none;"
            onclick={cancelAltTextGeneration}
          >
            ✕ Cancel
          </button>
        {:else}
          <button
            class="action-btn"
            style="background: var(--color-accent); color: white; border: none;"
            onclick={generateAllAltText}
            disabled={missingAltTextCount === 0}
          >
            Generate All Alt Text{missingAltTextCount > 0 ? ` (${missingAltTextCount})` : ''}
          </button>
        {/if}

        <button
          class="action-btn"
          style="background: var(--color-surface-alt); color: var(--color-text); border: 1px solid var(--color-border);"
          onclick={handleCopyAll}
          disabled={altTextCount === 0}
        >
          {copyFeedback ? 'Copied!' : `Copy All Alt Text${altTextCount > 0 ? ` (${altTextCount})` : ''}`}
        </button>
      </div>
    {/if}
  </div>

  <ResultsGrid />
</div>

<style>
  .stat-card {
    position: relative;
    padding: 14px 18px;
    overflow: hidden;
  }
  .stat-accent {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    border-radius: 0 2px 2px 0;
  }
  .action-btn {
    padding: 8px 16px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .action-btn:hover:not(:disabled) {
    opacity: 0.85;
  }
  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

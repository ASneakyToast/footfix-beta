<script lang="ts">
  import { getJobState } from '../stores/job-store.svelte'
  import ResultCard from './ResultCard.svelte'
  import AltTextPanel from './AltTextPanel.svelte'

  const job = getJobState()

  let expandedPath = $state<string | null>(null)

  function toggle(path: string) {
    expandedPath = expandedPath === path ? null : path
  }
</script>

{#if job.results.length === 0}
  <div class="py-16 text-center">
    <div class="mb-3" style="color: var(--color-text-faint);">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="inline-block">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
      </svg>
    </div>
    <p class="text-sm" style="color: var(--color-text-muted);">
      No results yet. Process some images first.
    </p>
  </div>
{:else}
  <div class="flex flex-col gap-4">
    {#each job.results as result, i (result.outputPath)}
      <div style="animation: staggerIn var(--transition-base) ease-out both; animation-delay: {Math.min(i * 50, 400)}ms;">
        <ResultCard
          {result}
          expanded={expandedPath === result.outputPath}
          ontoggle={() => toggle(result.outputPath)}
        />
        {#if expandedPath === result.outputPath}
          <div class="px-4 pb-4 -mt-1 rounded-b-lg" style="background: var(--color-surface-2);">
            <AltTextPanel {result} />
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

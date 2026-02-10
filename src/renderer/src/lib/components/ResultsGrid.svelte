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
  <div class="py-12 text-center">
    <div class="text-4xl mb-3">📭</div>
    <p class="text-sm" style="color: var(--color-text-muted);">
      No results yet. Process some images first.
    </p>
  </div>
{:else}
  <div class="flex flex-col gap-3">
    {#each job.results as result (result.outputPath)}
      <div>
        <ResultCard
          {result}
          expanded={expandedPath === result.outputPath}
          ontoggle={() => toggle(result.outputPath)}
        />
        {#if expandedPath === result.outputPath}
          <div class="px-4 pb-4 -mt-1 rounded-b-lg" style="background: var(--color-surface-alt);">
            <AltTextPanel {result} />
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

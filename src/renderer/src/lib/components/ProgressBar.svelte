<script lang="ts">
  import type { ProgressUpdate } from '../../../../../shared/types'

  const { progress } = $props<{ progress: ProgressUpdate | null }>()

  let percent = $derived(
    progress ? Math.round((progress.index / progress.total) * 100) : 0
  )

  let isComplete = $derived(progress?.phase === 'complete')

  const phaseLabels: Record<string, string> = {
    resizing: 'Resizing',
    optimizing: 'Optimizing',
    writing: 'Writing',
    complete: 'Complete',
    error: 'Error'
  }
</script>

{#if progress}
  <div class="flex flex-col gap-2" style="animation: fadeIn var(--transition-base) ease-out both;">
    <div class="flex items-center justify-between text-xs">
      <span style="color: var(--color-text);">
        {progress.filename} — {phaseLabels[progress.phase] ?? progress.phase}
      </span>
      <span style="color: var(--color-text-muted);">
        {progress.index}/{progress.total}
      </span>
    </div>
    <div
      class="progress-track w-full h-3 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        class="progress-fill h-full rounded-full"
        class:complete={isComplete}
        class:error={progress.phase === 'error'}
        style="width: {percent}%;"
      ></div>
    </div>
  </div>
{/if}

<style>
  .progress-track {
    background: var(--color-border);
    box-shadow: var(--shadow-inset);
  }
  .progress-fill {
    background: var(--color-accent-gradient);
    position: relative;
    overflow: hidden;
    transition: width 0.3s ease;
  }
  .progress-fill.complete {
    background: var(--color-accent-2-gradient);
  }
  .progress-fill::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    animation: shimmer 1.8s ease-in-out infinite;
  }
  .progress-fill.complete::after {
    display: none;
  }
  .progress-fill.error {
    background: var(--color-error);
  }
  .progress-fill.error::after {
    display: none;
  }
</style>

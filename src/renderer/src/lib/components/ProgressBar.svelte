<script lang="ts">
  import type { ProgressUpdate } from '../../../../../shared/types'

  const { progress } = $props<{ progress: ProgressUpdate | null }>()

  let percent = $derived(
    progress ? Math.round((progress.index / progress.total) * 100) : 0
  )

  const phaseLabels: Record<string, string> = {
    resizing: 'Resizing',
    optimizing: 'Optimizing',
    writing: 'Writing',
    complete: 'Complete',
    error: 'Error'
  }
</script>

{#if progress}
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between text-xs">
      <span style="color: var(--color-text);">
        {progress.filename} — {phaseLabels[progress.phase] ?? progress.phase}
      </span>
      <span style="color: var(--color-text-muted);">
        {progress.index}/{progress.total}
      </span>
    </div>
    <div
      class="w-full h-2 rounded-full overflow-hidden"
      style="background: var(--color-border);"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        class="h-full rounded-full"
        style="width: {percent}%; background: {progress.phase === 'error' ? 'var(--color-error)' : 'var(--color-accent)'}; transition: width 0.3s ease;"
      ></div>
    </div>
  </div>
{/if}

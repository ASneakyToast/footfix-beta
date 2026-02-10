<script lang="ts">
  import { getJobState, processImages, cancelProcessing } from '../stores/job-store.svelte'
  import { getSettingsState } from '../stores/settings-store.svelte'
  import PresetSelector from './PresetSelector.svelte'
  import FilenamePreview from './FilenamePreview.svelte'

  const job = getJobState()
  const settings = getSettingsState()

  let canStart = $derived(
    job.queue.length > 0 && !!settings.settings.outputFolder && !job.processing
  )

  function handleStart() {
    const s = settings.settings
    processImages({
      outputFolder: s.outputFolder,
      format: s.format,
      maxDimension: s.maxDimension,
      targetFileSize: s.targetFileSize,
      sizeTolerance: s.sizeTolerance,
      filenameTemplate: s.filenameTemplate
    })
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Preset Selector -->
  <div class="rounded-lg p-4" style="background: var(--color-surface);">
    <h3 class="text-sm font-medium mb-3" style="color: var(--color-text-muted);">Presets</h3>
    <PresetSelector />
  </div>

  <!-- Filename Preview -->
  <div class="rounded-lg p-4" style="background: var(--color-surface);">
    <FilenamePreview template={settings.settings.filenameTemplate} />
  </div>

  <!-- Action Buttons -->
  <div class="flex items-center gap-3">
    <button
      onclick={handleStart}
      disabled={!canStart}
      class="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
      style="background: var(--color-accent); color: var(--color-text); opacity: {canStart ? '1' : '0.5'};"
    >
      {job.processing ? 'Processing...' : 'Start Processing'}
    </button>

    {#if job.processing}
      <button
        onclick={cancelProcessing}
        class="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        style="background: var(--color-surface-alt); color: var(--color-error);"
      >
        Cancel
      </button>
    {/if}

    {#if !settings.settings.outputFolder}
      <span class="text-xs" style="color: var(--color-warning);">
        Set an output folder in Settings first
      </span>
    {/if}
  </div>
</div>

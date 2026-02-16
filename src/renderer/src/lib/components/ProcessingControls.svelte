<script lang="ts">
  import { getJobState, processImages, cancelProcessing, setTemplateFieldValue, setActivePresetId } from '../stores/job-store.svelte'
  import { getSettingsState, updateSettings, selectOutputFolder } from '../stores/settings-store.svelte'
  import PresetSelector from './PresetSelector.svelte'
  import TemplateFieldEditor from './TemplateFieldEditor.svelte'

  const job = getJobState()
  const settings = getSettingsState()

  let canStart = $derived(
    job.queue.length > 0 && !!settings.settings.outputFolder && !job.processing
  )

  let presetActive = $derived(job.activePresetId !== null)

  // Sync user_initials from settings when not already overridden
  $effect(() => {
    const initials = settings.settings.userInitials
    if (initials && !job.templateFieldValues.user_initials) {
      setTemplateFieldValue('user_initials', initials)
    }
  })

  async function handleStart() {
    const s = settings.settings
    await processImages({
      outputFolder: s.outputFolder,
      format: s.format,
      maxDimension: s.maxDimension,
      targetFileSize: s.targetFileSize,
      sizeTolerance: s.sizeTolerance,
      filenameTemplate: s.filenameTemplate,
      templateFieldValues: job.templateFieldValues
    })
  }

  function handleTemplateChange(template: string) {
    updateSettings({ filenameTemplate: template })
    setActivePresetId(null)
  }

  function handleFieldChange(key: string, value: string) {
    setTemplateFieldValue(key, value)
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Preset Selector -->
  <div class="rounded-lg p-4" style="background: var(--color-surface);">
    <h3 class="text-sm font-medium mb-3" style="color: var(--color-text-muted);">Presets</h3>
    <PresetSelector />
  </div>

  <!-- Filename Template -->
  <div class="rounded-lg p-4" style="background: var(--color-surface);">
    <h3 class="text-sm font-medium mb-3" style="color: var(--color-text-muted);">
      Filename Template
    </h3>
    <TemplateFieldEditor
      template={settings.settings.filenameTemplate}
      templateLocked={presetActive}
      fieldValues={job.templateFieldValues}
      format={settings.settings.format}
      userInitials={settings.settings.userInitials}
      ontemplatechange={handleTemplateChange}
      onfieldchange={handleFieldChange}
    />
  </div>

  <!-- Output Folder -->
  <div class="rounded-lg p-4" style="background: var(--color-surface);">
    <h3 class="text-sm font-medium mb-2" style="color: var(--color-text-muted);">Output Folder</h3>
    <div class="flex items-center gap-2">
      <span
        class="flex-1 px-3 py-2 rounded-lg text-sm truncate"
        style="background: var(--color-bg); color: {settings.settings.outputFolder ? 'var(--color-text)' : 'var(--color-text-muted)'};"
      >
        {settings.settings.outputFolder || 'No folder selected'}
      </span>
      <button
        onclick={selectOutputFolder}
        class="px-4 py-2 rounded-lg text-sm font-medium shrink-0"
        style="background: var(--color-accent); color: var(--color-text);"
      >
        Browse
      </button>
    </div>
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
  </div>
</div>

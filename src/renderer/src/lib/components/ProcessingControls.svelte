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
  <div class="rounded-lg p-5 surface-1" style="box-shadow: var(--shadow-sm); border-radius: var(--radius-lg);">
    <h3 class="text-[13px] font-semibold uppercase tracking-widest mb-3" style="color: var(--color-text-muted);">Presets</h3>
    <PresetSelector />
  </div>

  <!-- Filename Template -->
  <div class="rounded-lg p-5 surface-1" style="box-shadow: var(--shadow-sm); border-radius: var(--radius-lg);">
    <h3 class="text-[13px] font-semibold uppercase tracking-widest mb-3" style="color: var(--color-text-muted);">
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
  <div class="rounded-lg p-5 surface-1" style="box-shadow: var(--shadow-sm); border-radius: var(--radius-lg);">
    <h3 class="text-[13px] font-semibold uppercase tracking-widest mb-2" style="color: var(--color-text-muted);">Output Folder</h3>
    <div class="flex items-center gap-2">
      <span
        class="flex-1 px-3 py-2 rounded-lg text-sm truncate"
        style="background: var(--input-bg); box-shadow: var(--shadow-inset); color: {settings.settings.outputFolder ? 'var(--color-text)' : 'var(--color-text-muted)'};"
      >
        {settings.settings.outputFolder || 'No folder selected'}
      </span>
      <button
        onclick={selectOutputFolder}
        class="browse-btn px-4 py-2 rounded-lg text-sm font-medium shrink-0"
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
      class="start-btn px-8 py-3 rounded-lg text-base font-medium"
      style="opacity: {canStart ? '1' : '0.5'};"
    >
      {job.processing ? 'Processing...' : 'Start Processing'}
    </button>

    {#if job.processing}
      <button
        onclick={cancelProcessing}
        class="cancel-btn px-4 py-3 rounded-lg text-sm font-medium"
      >
        Cancel
      </button>
    {/if}
  </div>
</div>

<style>
  .start-btn {
    background: var(--color-accent-gradient);
    color: var(--color-text);
    box-shadow: var(--shadow-accent);
    transition: filter var(--transition-fast), box-shadow var(--transition-fast);
  }
  .start-btn:hover:not(:disabled) {
    filter: brightness(1.1);
    box-shadow: var(--shadow-accent), var(--glow-accent);
  }
  .browse-btn {
    background: var(--color-accent-2);
    color: #09090b;
    transition: filter var(--transition-fast);
  }
  .browse-btn:hover {
    filter: brightness(1.1);
  }
  .cancel-btn {
    background: var(--color-surface-2);
    color: var(--color-error);
    transition: background var(--transition-fast);
  }
  .cancel-btn:hover {
    background: var(--color-surface-hover);
  }
</style>

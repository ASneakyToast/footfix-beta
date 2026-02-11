<script lang="ts">
  import { getPresetState, savePreset, deletePreset, exportPreset, importPreset } from '../stores/preset-store.svelte'
  import { getSettingsState, updateSettings } from '../stores/settings-store.svelte'
  import { setActivePresetId } from '../stores/job-store.svelte'
  import type { Preset } from '../../../../../shared/types'

  const presetState = getPresetState()
  const settingsState = getSettingsState()

  let selectedId = $state<string>('')
  let showSaveDialog = $state(false)
  let saveName = $state('')

  let hasPresets = $derived(presetState.presets.length > 0)

  function applyPreset(e: Event) {
    const id = (e.currentTarget as HTMLSelectElement).value
    selectedId = id
    if (!id) {
      setActivePresetId(null)
      return
    }
    const preset = presetState.presets.find((p) => p.id === id)
    if (preset) {
      updateSettings({
        format: preset.format,
        maxDimension: preset.maxDimension,
        targetFileSize: preset.targetFileSize,
        sizeTolerance: preset.sizeTolerance,
        filenameTemplate: preset.filenameTemplate
      })
      setActivePresetId(id)
    }
  }

  async function handleSave() {
    if (!saveName.trim()) return
    const now = new Date().toISOString()
    const s = settingsState.settings
    const preset: Preset = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      createdAt: now,
      updatedAt: now,
      format: s.format,
      maxDimension: s.maxDimension,
      targetFileSize: s.targetFileSize,
      sizeTolerance: s.sizeTolerance,
      filenameTemplate: s.filenameTemplate
    }
    await savePreset(preset)
    saveName = ''
    showSaveDialog = false
  }

  async function handleDelete() {
    if (!selectedId) return
    await deletePreset(selectedId)
    selectedId = ''
    setActivePresetId(null)
  }

  async function handleExport() {
    if (!selectedId) return
    const preset = presetState.presets.find((p) => p.id === selectedId)
    if (preset) {
      await exportPreset({ ...preset })
    }
  }
</script>

{#snippet saveDialog()}
  <div class="flex gap-2">
    <input
      type="text"
      placeholder="Preset name"
      bind:value={saveName}
      onkeydown={(e) => { if (e.key === 'Enter') handleSave() }}
      class="flex-1 px-3 py-1.5 rounded-lg text-sm border"
      style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
    />
    <button
      onclick={handleSave}
      disabled={!saveName.trim()}
      class="px-3 py-1.5 rounded-lg text-xs font-medium"
      style="background: var(--color-accent); color: var(--color-text); opacity: {saveName.trim() ? '1' : '0.5'};"
    >
      Save
    </button>
  </div>
{/snippet}

{#if hasPresets}
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <select
        value={selectedId}
        onchange={applyPreset}
        class="flex-1 px-3 py-2 rounded-lg text-sm border"
        style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        aria-label="Select a preset"
      >
        <option value="">Select a preset...</option>
        {#each presetState.presets as preset (preset.id)}
          <option value={preset.id}>{preset.name}</option>
        {/each}
      </select>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <button
        onclick={() => { showSaveDialog = !showSaveDialog }}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style="background: var(--color-surface-alt); color: var(--color-text);"
      >
        Save Current
      </button>
      <button
        onclick={handleExport}
        disabled={!selectedId}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style="background: var(--color-surface-alt); color: var(--color-text); opacity: {selectedId ? '1' : '0.5'};"
      >
        Export
      </button>
      <button
        onclick={importPreset}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style="background: var(--color-surface-alt); color: var(--color-text);"
      >
        Import
      </button>
      <button
        onclick={handleDelete}
        disabled={!selectedId}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style="color: var(--color-error); opacity: {selectedId ? '1' : '0.5'};"
      >
        Delete
      </button>
    </div>

    {#if showSaveDialog}
      {@render saveDialog()}
    {/if}
  </div>
{:else}
  <div class="flex flex-col gap-3">
    <p class="text-xs" style="color: var(--color-text-muted);">
      No presets saved yet. Save your current settings or import a preset file to get started.
    </p>
    <div class="flex items-center gap-2">
      <button
        onclick={() => { showSaveDialog = !showSaveDialog }}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style="background: var(--color-surface-alt); color: var(--color-text);"
      >
        Save Current
      </button>
      <button
        onclick={importPreset}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style="background: var(--color-surface-alt); color: var(--color-text);"
      >
        Import
      </button>
    </div>

    {#if showSaveDialog}
      {@render saveDialog()}
    {/if}
  </div>
{/if}

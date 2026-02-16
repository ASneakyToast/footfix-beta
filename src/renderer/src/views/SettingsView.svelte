<script lang="ts">
  import SettingsPanel from '../lib/components/SettingsPanel.svelte'
</script>

<div class="px-10 py-10">
  <h1 class="text-3xl font-bold tracking-tight mb-2" style="color: var(--color-text-heading);">Settings</h1>
  <p class="mb-8" style="color: var(--color-text-muted);">
    Configure output preferences and LLM connection.
  </p>

  <div class="rounded-xl p-6 surface-1" style="border-radius: var(--radius-xl);">
    <SettingsPanel />
  </div>
</div>

<script lang="ts">
  import SettingsPanel from '../lib/components/SettingsPanel.svelte'
</script>

<div class="p-8">
  <h1 class="text-2xl font-bold mb-2">Settings</h1>
  <p class="mb-8" style="color: var(--color-text-muted);">
    Configure output preferences and LLM connection.
  </p>

  <div class="rounded-xl p-6" style="background: var(--color-surface);">
    <SettingsPanel />
  </div>
</div>

<script lang="ts">
  import { getJobState, setView } from './lib/stores/job-store.svelte'
  import { loadSettings } from './lib/stores/settings-store.svelte'
  import { loadPresets } from './lib/stores/preset-store.svelte'
  import ProcessView from './views/ProcessView.svelte'
  import ResultsView from './views/ResultsView.svelte'
  import SettingsView from './views/SettingsView.svelte'

  const job = getJobState()

  const tabs = [
    { id: 'process' as const, label: 'Process', icon: '⚡' },
    { id: 'results' as const, label: 'Results', icon: '📋' },
    { id: 'settings' as const, label: 'Settings', icon: '⚙' }
  ]

  $effect(() => {
    loadSettings()
    loadPresets()
  })
</script>

<div class="flex h-full">
  <!-- Sidebar -->
  <nav class="flex flex-col w-[180px] shrink-0 border-r"
       style="background: var(--color-surface); border-color: var(--color-border);">
    <div class="px-4 py-5 text-lg font-bold tracking-tight" style="color: var(--color-accent);">
      FootFix
    </div>
    <div class="flex flex-col gap-1 px-2 flex-1">
      {#each tabs as tab}
        <button
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
          style={job.currentView === tab.id
            ? `background: var(--color-accent); color: var(--color-text);`
            : `color: var(--color-text-muted);`}
          onmouseenter={(e) => {
            if (job.currentView !== tab.id) {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-alt)'
            }
          }}
          onmouseleave={(e) => {
            if (job.currentView !== tab.id) {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
            }
          }}
          onclick={() => setView(tab.id)}
        >
          <span class="text-base">{tab.icon}</span>
          {tab.label}
        </button>
      {/each}
    </div>
    <div class="px-4 py-3 text-xs" style="color: var(--color-text-muted);">
      v1.0.0
    </div>
  </nav>

  <!-- Main content -->
  <main class="flex-1 overflow-auto">
    {#if job.currentView === 'process'}
      <ProcessView />
    {:else if job.currentView === 'results'}
      <ResultsView />
    {:else}
      <SettingsView />
    {/if}
  </main>
</div>

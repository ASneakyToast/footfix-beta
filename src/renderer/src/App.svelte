<script lang="ts">
  import { getJobState, setView } from './lib/stores/job-store.svelte'
  import { loadSettings, toggleTheme, getSettingsState } from './lib/stores/settings-store.svelte'
  import { loadPresets } from './lib/stores/preset-store.svelte'
  import ProcessView from './views/ProcessView.svelte'
  import ResultsView from './views/ResultsView.svelte'
  import SettingsView from './views/SettingsView.svelte'

  const job = getJobState()
  const settingsState = getSettingsState()

  const tabs = [
    { id: 'process' as const, label: 'Process', desc: 'Batch resize & optimize' },
    { id: 'results' as const, label: 'Results', desc: 'Review processed images' },
    { id: 'settings' as const, label: 'Settings', desc: 'Output & LLM config' }
  ]

  $effect(() => {
    loadSettings()
    loadPresets()
  })

  let isDark = $derived(settingsState.settings.theme !== 'light')
</script>

{#snippet zapIcon()}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
{/snippet}

{#snippet clipboardIcon()}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
  </svg>
{/snippet}

{#snippet settingsIcon()}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
{/snippet}

{#snippet sunIcon()}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
  </svg>
{/snippet}

{#snippet moonIcon()}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
{/snippet}

<div class="flex h-full">
  <!-- Sidebar -->
  <nav class="sidebar flex flex-col w-[var(--sidebar-width)] shrink-0 surface-1"
       style="border-right: 1px solid var(--color-border); border-top: none; border-bottom: none; border-left: none; border-radius: 0;">
    <div class="px-5 py-6 text-xl font-bold tracking-tight"
         style="background: var(--color-accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
      FootFix
    </div>
    <div class="flex flex-col gap-1 px-3 flex-1">
      {#each tabs as tab}
        {@const isActive = job.currentView === tab.id}
        <button
          class="tab-btn flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
          style="transition-duration: var(--transition-fast);
                 {isActive
                   ? `background: var(--color-accent-muted); border-left: 2px solid var(--color-accent); padding-left: 10px;`
                   : `border-left: 2px solid transparent; padding-left: 10px;`}"
          class:active={isActive}
          class:hover-tab={!isActive}
          onclick={() => setView(tab.id)}
        >
          <span class="shrink-0" style="color: {isActive ? 'var(--color-accent)' : 'var(--color-text-muted)'};">
            {#if tab.id === 'process'}{@render zapIcon()}{:else if tab.id === 'results'}{@render clipboardIcon()}{:else}{@render settingsIcon()}{/if}
          </span>
          <div class="flex flex-col min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold" style="color: {isActive ? 'var(--color-text)' : 'var(--color-text-muted)'};">
                {tab.label}
              </span>
              {#if tab.id === 'process' && job.queue.length > 0}
                <span class="queue-badge text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style="background: var(--color-accent-2-muted); color: var(--color-accent-2);">
                  {job.queue.length}
                </span>
              {/if}
            </div>
            <span class="text-[11px] truncate" style="color: var(--color-text-faint);">
              {tab.desc}
            </span>
          </div>
        </button>
      {/each}
    </div>

    <!-- Bottom section -->
    <div style="border-top: 1px solid var(--color-border);" class="px-4 py-3 flex items-center justify-between">
      <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium"
            style="background: var(--color-surface-3); color: var(--color-text-muted);">
        v1.0.0
      </span>
      <button
        onclick={toggleTheme}
        class="theme-toggle w-7 h-7 rounded-lg flex items-center justify-center"
        aria-label="Toggle theme"
        style="color: var(--color-text-muted);"
      >
        {#if isDark}
          {@render sunIcon()}
        {:else}
          {@render moonIcon()}
        {/if}
      </button>
    </div>
  </nav>

  <!-- Main content -->
  <main class="flex-1 overflow-auto">
    {#key job.currentView}
      <div class="view-enter">
        {#if job.currentView === 'process'}
          <ProcessView />
        {:else if job.currentView === 'results'}
          <ResultsView />
        {:else}
          <SettingsView />
        {/if}
      </div>
    {/key}
  </main>
</div>

<style>
  .hover-tab:hover {
    background: var(--color-surface-hover);
  }
  .hover-tab:hover :global(span.text-sm) {
    color: var(--color-text);
  }
  .theme-toggle {
    transition: background var(--transition-fast), color var(--transition-fast);
  }
  .theme-toggle:hover {
    background: var(--color-surface-hover);
    color: var(--color-accent-2);
  }
  .queue-badge {
    line-height: 1;
    min-width: 18px;
    text-align: center;
  }
</style>

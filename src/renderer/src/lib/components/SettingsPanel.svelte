<script lang="ts">
  import { getSettingsState, updateSettings, selectOutputFolder, toggleTheme } from '../stores/settings-store.svelte'
  import type { ImageFormat, LlmModelInfo } from '../../../../../shared/types'
  import { PROVIDERS, DEFAULT_MODELS } from '@shared/llm-providers'

  const settingsState = getSettingsState()

  let testStatus = $state<'idle' | 'testing' | 'success' | 'error'>('idle')
  let testError = $state('')

  let displayedModels = $state<LlmModelInfo[]>([])
  let modelsLoading = $state(false)
  let modelsError = $state('')
  let useCustomModel = $state(false)
  let hasFetchedLive = $state(false)
  let fetchSuccess = $state(false)

  // UX: "Saved" flash feedback
  let lastSavedField = $state<string | null>(null)

  function flashSaved(field: string) {
    lastSavedField = field
    setTimeout(() => { if (lastSavedField === field) lastSavedField = null }, 2000)
  }

  // UX: Provider change clears model notice
  let modelClearedNotice = $state(false)

  let isDark = $derived(settingsState.settings.theme !== 'light')

  let currentProvider = $derived(
    PROVIDERS.find((p) => p.id === settingsState.settings.llmProvider) ?? PROVIDERS[0]
  )

  // Reset models when provider changes
  $effect(() => {
    const provider = settingsState.settings.llmProvider
    const curated = DEFAULT_MODELS[provider] ?? []
    displayedModels = curated
    hasFetchedLive = false
    modelsError = ''
    fetchSuccess = false
    useCustomModel = false

    // Auto-fetch for local providers with no curated defaults
    const config = PROVIDERS.find((p) => p.id === provider)
    if (config && !config.requiresApiKey && curated.length === 0) {
      fetchModels()
    }
  })

  // Fix 3: Clear test connection status when provider or API key changes
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    settingsState.settings.llmProvider
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    settingsState.settings.llmApiKey
    testStatus = 'idle'
    testError = ''
  })

  function handleFormatChange(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value as ImageFormat
    updateSettings({ format: value })
    flashSaved('format')
  }

  function handleNumberInput(field: 'maxDimension' | 'targetFileSize' | 'sizeTolerance', scale: number = 1) {
    return (e: Event) => {
      const raw = parseFloat((e.currentTarget as HTMLInputElement).value)
      if (!isNaN(raw)) {
        updateSettings({ [field]: Math.round(raw * scale) })
        flashSaved(field)
      }
    }
  }

  function handleTextInput(field: 'filenameTemplate' | 'userInitials' | 'llmProvider' | 'llmModel' | 'llmApiKey' | 'altTextPrompt') {
    return (e: Event) => {
      updateSettings({ [field]: (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).value })
      flashSaved(field)
    }
  }

  async function fetchModels() {
    modelsLoading = true
    modelsError = ''
    fetchSuccess = false
    try {
      const result = await window.api.fetchLlmModels(
        settingsState.settings.llmProvider,
        settingsState.settings.llmApiKey
      )
      if (result.error) {
        modelsError = result.error
      }
      if (result.models.length > 0) {
        displayedModels = result.models
        hasFetchedLive = true
        fetchSuccess = true
      }
    } catch (err) {
      modelsError = err instanceof Error ? err.message : 'Failed to fetch models'
    } finally {
      modelsLoading = false
    }
  }

  function handleProviderChange(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value
    updateSettings({ llmProvider: value, llmModel: '' })
    flashSaved('llmProvider')
    modelClearedNotice = true
    setTimeout(() => { modelClearedNotice = false }, 4000)
  }

  function handleModelSelect(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value
    updateSettings({ llmModel: value })
    flashSaved('llmModel')
    modelClearedNotice = false
  }

  async function testConnection() {
    testStatus = 'testing'
    testError = ''
    try {
      const result = await window.api.testLlmConnection()
      if (result.success) {
        testStatus = 'success'
      } else {
        testStatus = 'error'
        testError = result.error ?? 'Connection failed'
      }
    } catch (err) {
      testStatus = 'error'
      testError = err instanceof Error ? err.message : 'Unknown error'
    }
  }
</script>

<div class="flex flex-col gap-8">
  <!-- Theme Section -->
  <section>
    <h3 class="section-header section-header-teal text-[13px] font-semibold uppercase tracking-widest mb-4" style="color: var(--color-text-muted);">
      Appearance
    </h3>
    <div class="flex items-center gap-4">
      <button
        onclick={toggleTheme}
        class="theme-btn flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium"
      >
        {#if isDark}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
          </svg>
          Switch to Light Mode
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
          Switch to Dark Mode
        {/if}
      </button>
      <span class="text-xs" style="color: var(--color-text-muted);">
        Currently using {isDark ? 'dark' : 'light'} theme
      </span>
    </div>
  </section>

  <!-- Output Section -->
  <section>
    <h3 class="section-header section-header-purple text-[13px] font-semibold uppercase tracking-widest mb-4" style="color: var(--color-text-muted);">
      Output
    </h3>
    <div class="flex flex-col gap-4">
      <!-- Output Folder -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="output-folder">Output Folder</label>
        <div class="flex gap-2">
          <input
            id="output-folder"
            type="text"
            readonly
            value={settingsState.settings.outputFolder || 'No folder selected'}
            class="settings-input flex-1 px-3 py-2 rounded-lg text-sm"
            style="color: {settingsState.settings.outputFolder ? 'var(--color-text)' : 'var(--color-text-muted)'};"
          />
          <button
            onclick={selectOutputFolder}
            class="settings-btn px-4 py-2 rounded-lg text-sm font-medium"
          >
            Browse
          </button>
        </div>
      </div>

      <!-- Format -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="format">
          Format
          {#if lastSavedField === 'format'}<span class="save-flash">Saved</span>{/if}
        </label>
        <select
          id="format"
          value={settingsState.settings.format}
          onchange={handleFormatChange}
          class="settings-input px-3 py-2 rounded-lg text-sm"
        >
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
          <option value="png">PNG</option>
        </select>
      </div>

      <!-- Max Dimension -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="max-dimension">
          Max Dimension (px)
          {#if lastSavedField === 'maxDimension'}<span class="save-flash">Saved</span>{/if}
        </label>
        <input
          id="max-dimension"
          type="number"
          min="100"
          max="10000"
          step="10"
          value={settingsState.settings.maxDimension}
          onchange={handleNumberInput('maxDimension')}
          class="settings-input px-3 py-2 rounded-lg text-sm"
        />
        <p class="text-xs" style="color: var(--color-text-muted);">Longest edge will be resized to this value.</p>
      </div>

      <!-- Target File Size -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="target-size">
          Target File Size (KB)
          {#if lastSavedField === 'targetFileSize'}<span class="save-flash">Saved</span>{/if}
        </label>
        <input
          id="target-size"
          type="number"
          min="10"
          step="10"
          value={Math.round(settingsState.settings.targetFileSize / 1024)}
          onchange={handleNumberInput('targetFileSize', 1024)}
          class="settings-input px-3 py-2 rounded-lg text-sm"
        />
      </div>

      <!-- Size Tolerance -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="size-tolerance">
          Size Tolerance (KB)
          {#if lastSavedField === 'sizeTolerance'}<span class="save-flash">Saved</span>{/if}
        </label>
        <input
          id="size-tolerance"
          type="number"
          min="1"
          step="5"
          value={Math.round(settingsState.settings.sizeTolerance / 1024)}
          onchange={handleNumberInput('sizeTolerance', 1024)}
          class="settings-input px-3 py-2 rounded-lg text-sm"
        />
        <p class="text-xs" style="color: var(--color-text-muted);">Acceptable variance from target size.</p>
      </div>

      <!-- Filename Template -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="filename-template">
          Filename Template
          {#if lastSavedField === 'filenameTemplate'}<span class="save-flash">Saved</span>{/if}
        </label>
        <input
          id="filename-template"
          type="text"
          value={settingsState.settings.filenameTemplate}
          onchange={handleTextInput('filenameTemplate')}
          class="settings-input px-3 py-2 rounded-lg text-sm"
        />
        <p class="text-xs" style="color: var(--color-text-muted);">
          Tokens: {'{filename}'}, {'{width}'}, {'{height}'}, {'{date}'}, {'{counter}'}, {'{format}'}, {'{ext}'}, {'{project_name}'}, {'{user_initials}'}, {'{month}'}, {'{year}'}
        </p>
      </div>

      <!-- User Initials -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="user-initials">
          User Initials
          {#if lastSavedField === 'userInitials'}<span class="save-flash">Saved</span>{/if}
        </label>
        <input
          id="user-initials"
          type="text"
          value={settingsState.settings.userInitials}
          onchange={handleTextInput('userInitials')}
          placeholder="e.g. JL"
          class="settings-input px-3 py-2 rounded-lg text-sm"
          style="max-width: 120px;"
        />
        <p class="text-xs" style="color: var(--color-text-muted);">Used as default for the {'{user_initials}'} template token.</p>
      </div>
    </div>
  </section>

  <!-- LLM Section -->
  <section>
    <h3 class="section-header section-header-teal text-[13px] font-semibold uppercase tracking-widest mb-4" style="color: var(--color-text-muted);">
      LLM — Alt Text Generation
    </h3>
    <div class="flex flex-col gap-4">
      <!-- Provider -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="llm-provider">
          Provider
          {#if lastSavedField === 'llmProvider'}<span class="save-flash">Saved</span>{/if}
        </label>
        <select
          id="llm-provider"
          value={settingsState.settings.llmProvider}
          onchange={handleProviderChange}
          class="settings-input px-3 py-2 rounded-lg text-sm"
        >
          {#each PROVIDERS as provider}
            <option value={provider.id}>{provider.label}</option>
          {/each}
        </select>
        {#if modelClearedNotice}
          <p class="text-xs" style="color: var(--color-warning);">Provider changed — please select a model below.</p>
        {/if}
      </div>

      <!-- API Key (hidden for local providers) -->
      {#if currentProvider.requiresApiKey}
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium" for="llm-api-key">
            API Key
            {#if lastSavedField === 'llmApiKey'}<span class="save-flash">Saved</span>{/if}
          </label>
          <input
            id="llm-api-key"
            type="password"
            value={settingsState.settings.llmApiKey}
            onchange={handleTextInput('llmApiKey')}
            placeholder="Enter your API key"
            class="settings-input px-3 py-2 rounded-lg text-sm"
          />
          <p class="text-xs" style="color: var(--color-text-muted);">Encrypted at rest via Electron safeStorage.</p>
        </div>
      {/if}

      <!-- Model -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium" for="llm-model">
            Model
            {#if lastSavedField === 'llmModel'}<span class="save-flash">Saved</span>{/if}
          </label>
          <button
            onclick={() => useCustomModel = !useCustomModel}
            class="text-xs cursor-pointer"
            style="color: var(--color-accent); background: none; border: none; padding: 0;"
          >
            {useCustomModel ? 'Choose from list' : 'Enter custom model'}
          </button>
        </div>
        {#if useCustomModel}
          <input
            id="llm-model"
            type="text"
            value={settingsState.settings.llmModel}
            onchange={handleTextInput('llmModel')}
            placeholder="e.g. gpt-4o"
            class="settings-input px-3 py-2 rounded-lg text-sm"
          />
        {:else}
          <select
            id="llm-model"
            value={settingsState.settings.llmModel}
            onchange={handleModelSelect}
            class="settings-input px-3 py-2 rounded-lg text-sm"
          >
            <option value="">Select a model…</option>
            {#each displayedModels as model}
              <option value={model.id}>
                {model.name}{model.vision ? ' (vision)' : ''}
              </option>
            {/each}
          </select>
          <div class="flex items-center gap-2">
            {#if currentProvider.requiresApiKey && settingsState.settings.llmApiKey}
              <button
                onclick={fetchModels}
                disabled={modelsLoading}
                class="fetch-btn text-xs px-3 py-1.5 rounded-md"
                style="opacity: {modelsLoading ? '0.5' : '1'};"
              >
                {modelsLoading ? 'Fetching…' : hasFetchedLive ? 'Refresh models' : 'Fetch latest models'}
              </button>
            {:else if !currentProvider.requiresApiKey}
              <button
                onclick={fetchModels}
                disabled={modelsLoading}
                class="fetch-btn text-xs px-3 py-1.5 rounded-md"
                style="opacity: {modelsLoading ? '0.5' : '1'};"
              >
                {modelsLoading ? 'Fetching…' : hasFetchedLive ? 'Refresh models' : 'Fetch models'}
              </button>
            {/if}
            {#if modelsError}
              <span class="text-xs" style="color: var(--color-error);">{modelsError}</span>
            {:else if fetchSuccess}
              <span class="text-xs" style="color: var(--color-success);">Models updated</span>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Alt Text Prompt -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="alt-text-prompt">
          Alt Text Prompt
          {#if lastSavedField === 'altTextPrompt'}<span class="save-flash">Saved</span>{/if}
        </label>
        <textarea
          id="alt-text-prompt"
          rows="3"
          value={settingsState.settings.altTextPrompt}
          onchange={handleTextInput('altTextPrompt')}
          class="settings-input px-3 py-2 rounded-lg text-sm resize-y"
        ></textarea>
      </div>

      <!-- Test Connection -->
      <div class="flex items-center gap-3">
        <button
          onclick={testConnection}
          disabled={testStatus === 'testing' || (currentProvider.requiresApiKey && !settingsState.settings.llmApiKey)}
          class="test-btn px-4 py-2 rounded-lg text-sm font-medium"
          style="opacity: {testStatus === 'testing' || (currentProvider.requiresApiKey && !settingsState.settings.llmApiKey) ? '0.5' : '1'};"
        >
          {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
        </button>
        {#if testStatus === 'success'}
          <span class="text-sm" style="color: var(--color-success);">Connected successfully</span>
        {/if}
        {#if testStatus === 'error'}
          <span class="text-sm" style="color: var(--color-error);">{testError}</span>
        {/if}
      </div>
    </div>
  </section>
</div>

<style>
  .section-header {
    padding-left: 10px;
  }
  .section-header-purple {
    border-left: 3px solid var(--color-accent);
  }
  .section-header-teal {
    border-left: 3px solid var(--color-accent-2);
  }
  .settings-input {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--color-text);
    box-shadow: var(--shadow-inset);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .settings-input:focus {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-inset), 0 0 0 2px var(--input-focus-ring);
    outline: none;
  }
  .settings-btn {
    background: var(--color-accent);
    color: var(--color-text);
    transition: filter var(--transition-fast);
  }
  .settings-btn:hover {
    filter: brightness(1.1);
  }
  .fetch-btn {
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    border: 1px solid var(--input-border);
    transition: background var(--transition-fast);
  }
  .fetch-btn:hover:not(:disabled) {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }
  .test-btn {
    background: var(--color-surface-2);
    color: var(--color-text);
    transition: background var(--transition-fast);
  }
  .test-btn:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }
  .theme-btn {
    background: var(--color-surface-2);
    color: var(--color-text);
    transition: background var(--transition-fast);
  }
  .theme-btn:hover {
    background: var(--color-surface-hover);
  }
  .save-flash {
    font-size: 11px;
    font-weight: 500;
    color: var(--color-success);
    margin-left: 8px;
    animation: save-fade 2s ease-out forwards;
  }
  @keyframes save-fade {
    0%, 60% { opacity: 1; }
    100% { opacity: 0; }
  }
</style>

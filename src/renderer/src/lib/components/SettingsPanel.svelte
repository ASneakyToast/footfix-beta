<script lang="ts">
  import { getSettingsState, updateSettings, selectOutputFolder } from '../stores/settings-store.svelte'
  import type { ImageFormat } from '../../../../../shared/types'

  const settingsState = getSettingsState()

  let testStatus = $state<'idle' | 'testing' | 'success' | 'error'>('idle')
  let testError = $state('')

  function handleFormatChange(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value as ImageFormat
    updateSettings({ format: value })
  }

  function handleNumberInput(field: 'maxDimension' | 'targetFileSize' | 'sizeTolerance', scale: number = 1) {
    return (e: Event) => {
      const raw = parseFloat((e.currentTarget as HTMLInputElement).value)
      if (!isNaN(raw)) {
        updateSettings({ [field]: Math.round(raw * scale) })
      }
    }
  }

  function handleTextInput(field: 'filenameTemplate' | 'userInitials' | 'llmProvider' | 'llmModel' | 'llmApiKey' | 'altTextPrompt') {
    return (e: Event) => {
      updateSettings({ [field]: (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).value })
    }
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
  <!-- Output Section -->
  <section>
    <h3 class="text-sm font-semibold uppercase tracking-wider mb-4" style="color: var(--color-text-muted);">
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
            class="flex-1 px-3 py-2 rounded-lg text-sm border"
            style="background: var(--color-bg); border-color: var(--color-border); color: {settingsState.settings.outputFolder ? 'var(--color-text)' : 'var(--color-text-muted)'};"
          />
          <button
            onclick={selectOutputFolder}
            class="px-4 py-2 rounded-lg text-sm font-medium"
            style="background: var(--color-accent); color: var(--color-text);"
          >
            Browse
          </button>
        </div>
      </div>

      <!-- Format -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="format">Format</label>
        <select
          id="format"
          value={settingsState.settings.format}
          onchange={handleFormatChange}
          class="px-3 py-2 rounded-lg text-sm border"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        >
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
          <option value="png">PNG</option>
        </select>
      </div>

      <!-- Max Dimension -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="max-dimension">Max Dimension (px)</label>
        <input
          id="max-dimension"
          type="number"
          min="100"
          max="10000"
          step="10"
          value={settingsState.settings.maxDimension}
          onchange={handleNumberInput('maxDimension')}
          class="px-3 py-2 rounded-lg text-sm border"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        />
        <p class="text-xs" style="color: var(--color-text-muted);">Longest edge will be resized to this value.</p>
      </div>

      <!-- Target File Size -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="target-size">Target File Size (KB)</label>
        <input
          id="target-size"
          type="number"
          min="10"
          step="10"
          value={Math.round(settingsState.settings.targetFileSize / 1024)}
          onchange={handleNumberInput('targetFileSize', 1024)}
          class="px-3 py-2 rounded-lg text-sm border"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        />
      </div>

      <!-- Size Tolerance -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="size-tolerance">Size Tolerance (KB)</label>
        <input
          id="size-tolerance"
          type="number"
          min="1"
          step="5"
          value={Math.round(settingsState.settings.sizeTolerance / 1024)}
          onchange={handleNumberInput('sizeTolerance', 1024)}
          class="px-3 py-2 rounded-lg text-sm border"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        />
        <p class="text-xs" style="color: var(--color-text-muted);">Acceptable variance from target size.</p>
      </div>

      <!-- Filename Template -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="filename-template">Filename Template</label>
        <input
          id="filename-template"
          type="text"
          value={settingsState.settings.filenameTemplate}
          onchange={handleTextInput('filenameTemplate')}
          class="px-3 py-2 rounded-lg text-sm border"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        />
        <p class="text-xs" style="color: var(--color-text-muted);">
          Tokens: {'{filename}'}, {'{width}'}, {'{height}'}, {'{date}'}, {'{counter}'}, {'{format}'}, {'{ext}'}, {'{project_name}'}, {'{user_initials}'}, {'{month}'}, {'{year}'}
        </p>
      </div>

      <!-- User Initials -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="user-initials">User Initials</label>
        <input
          id="user-initials"
          type="text"
          value={settingsState.settings.userInitials}
          onchange={handleTextInput('userInitials')}
          placeholder="e.g. JL"
          class="px-3 py-2 rounded-lg text-sm border"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text); max-width: 120px;"
        />
        <p class="text-xs" style="color: var(--color-text-muted);">Used as default for the {'{user_initials}'} template token.</p>
      </div>
    </div>
  </section>

  <!-- LLM Section -->
  <section>
    <h3 class="text-sm font-semibold uppercase tracking-wider mb-4" style="color: var(--color-text-muted);">
      LLM — Alt Text Generation
    </h3>
    <div class="flex flex-col gap-4">
      <!-- Provider -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="llm-provider">Provider</label>
        <select
          id="llm-provider"
          value={settingsState.settings.llmProvider}
          onchange={(e) => updateSettings({ llmProvider: (e.currentTarget as HTMLSelectElement).value })}
          class="px-3 py-2 rounded-lg text-sm border"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google</option>
        </select>
      </div>

      <!-- Model -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="llm-model">Model</label>
        <input
          id="llm-model"
          type="text"
          value={settingsState.settings.llmModel}
          onchange={handleTextInput('llmModel')}
          class="px-3 py-2 rounded-lg text-sm border"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        />
      </div>

      <!-- API Key -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="llm-api-key">API Key</label>
        <input
          id="llm-api-key"
          type="password"
          value={settingsState.settings.llmApiKey}
          onchange={handleTextInput('llmApiKey')}
          placeholder="Enter your API key"
          class="px-3 py-2 rounded-lg text-sm border"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        />
        <p class="text-xs" style="color: var(--color-text-muted);">Encrypted at rest via Electron safeStorage.</p>
      </div>

      <!-- Alt Text Prompt -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium" for="alt-text-prompt">Alt Text Prompt</label>
        <textarea
          id="alt-text-prompt"
          rows="3"
          value={settingsState.settings.altTextPrompt}
          onchange={handleTextInput('altTextPrompt')}
          class="px-3 py-2 rounded-lg text-sm border resize-y"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        ></textarea>
      </div>

      <!-- Test Connection -->
      <div class="flex items-center gap-3">
        <button
          onclick={testConnection}
          disabled={testStatus === 'testing' || !settingsState.settings.llmApiKey}
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style="background: var(--color-surface-alt); color: var(--color-text); opacity: {testStatus === 'testing' || !settingsState.settings.llmApiKey ? '0.5' : '1'};"
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

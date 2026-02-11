<script lang="ts">
  import { TOKEN_DEFINITIONS, TOKEN_MAP, extractTokenKeys } from '../../../../shared/types'
  import type { TemplateFieldValues } from '../../../../shared/types'
  import FilenamePreview from './FilenamePreview.svelte'

  const {
    template,
    templateLocked = false,
    fieldValues,
    format,
    userInitials = '',
    ontemplatechange,
    onfieldchange
  } = $props<{
    template: string
    templateLocked?: boolean
    fieldValues: TemplateFieldValues
    format: string
    userInitials?: string
    ontemplatechange: (template: string) => void
    onfieldchange: (key: string, value: string) => void
  }>()

  let showAdvanced = $state(false)

  const allTokens = TOKEN_DEFINITIONS.map((t) => `{${t.key}}`)

  let usedKeys = $derived(extractTokenKeys(template))

  let editableTokens = $derived(
    usedKeys
      .map((k) => TOKEN_MAP[k])
      .filter((t) => t && t.category !== 'per_file')
  )

  let perFileTokens = $derived(
    usedKeys
      .map((k) => TOKEN_MAP[k])
      .filter((t) => t && t.category === 'per_file')
  )

  function getFieldPlaceholder(token: { key: string; category: string; placeholder: string }): string {
    if (token.category === 'settings_derived' && token.key === 'user_initials' && userInitials) {
      return userInitials
    }
    if (token.category === 'date_auto') {
      const now = new Date()
      if (token.key === 'month') return String(now.getMonth() + 1).padStart(2, '0')
      if (token.key === 'year') return String(now.getFullYear())
      if (token.key === 'date') return now.toISOString().slice(0, 10).replace(/-/g, '')
    }
    return token.placeholder
  }

  function handleFieldInput(key: string, e: Event) {
    const value = (e.currentTarget as HTMLInputElement).value
    onfieldchange(key, value)
  }

  function handleTemplateInput(e: Event) {
    const value = (e.currentTarget as HTMLInputElement).value
    if (value) {
      ontemplatechange(value)
    }
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Editable fields -->
  {#if editableTokens.length > 0}
    <div class="flex flex-col gap-2">
      {#each editableTokens as token (token.key)}
        <div class="flex items-center gap-2">
          <label
            for="field-{token.key}"
            class="text-xs font-medium shrink-0"
            style="color: var(--color-text-muted); width: 100px;"
          >
            {token.label}
          </label>
          <input
            id="field-{token.key}"
            type="text"
            value={fieldValues[token.key] ?? ''}
            placeholder={getFieldPlaceholder(token)}
            oninput={(e) => handleFieldInput(token.key, e)}
            class="flex-1 px-2 py-1 rounded text-sm border font-mono"
            style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
          />
        </div>
      {/each}
    </div>
  {/if}

  <!-- Per-file tokens (display-only pills) -->
  {#if perFileTokens.length > 0}
    <div class="flex flex-col gap-1">
      <span class="text-xs font-medium" style="color: var(--color-text-muted);">Per-file (auto)</span>
      <div class="flex items-center gap-1.5 flex-wrap">
        {#each perFileTokens as token (token.key)}
          <span
            class="px-1.5 py-0.5 rounded text-xs font-mono"
            style="background: var(--color-surface-alt); color: var(--color-text-muted);"
          >{`{${token.key}}`}</span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Preview -->
  <FilenamePreview {template} {fieldValues} />

  <!-- Advanced: raw template editing (hidden when locked) -->
  {#if !templateLocked}
    <button
      onclick={() => { showAdvanced = !showAdvanced }}
      class="flex items-center gap-1 text-xs font-medium self-start"
      style="color: var(--color-text-muted);"
    >
      <span style="display: inline-block; transition: transform 0.15s; transform: rotate({showAdvanced ? '90deg' : '0deg'});">&#9654;</span>
      Edit Template
    </button>
    {#if showAdvanced}
      <div class="flex flex-col gap-2">
        <input
          type="text"
          value={template}
          onchange={handleTemplateInput}
          class="w-full px-3 py-2 rounded-lg text-sm border font-mono"
          style="background: var(--color-bg); border-color: var(--color-border); color: var(--color-text);"
        />
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-xs" style="color: var(--color-text-muted);">Available:</span>
          {#each allTokens as token}
            <span
              class="px-1.5 py-0.5 rounded text-xs font-mono"
              style="background: var(--color-surface-alt); color: var(--color-text-muted);"
            >{token}</span>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

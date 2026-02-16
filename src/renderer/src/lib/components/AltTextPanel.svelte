<script lang="ts">
  import type { ImageResult } from '../../../../../shared/types'
  import { updateResultAltText } from '../stores/job-store.svelte'

  const { result } = $props<{ result: ImageResult }>()

  let generating = $state(false)
  let error = $state('')
  let editText = $state('')
  let copied = $state(false)

  $effect(() => {
    editText = result.altText ?? ''
  })

  async function generate() {
    generating = true
    error = ''
    try {
      const res = await window.api.generateAltText(result.inputPath)
      editText = res.altText
      updateResultAltText(result.inputPath, res.altText)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to generate alt text'
    } finally {
      generating = false
    }
  }

  function handleEdit(e: Event) {
    editText = (e.currentTarget as HTMLTextAreaElement).value
    updateResultAltText(result.inputPath, editText)
  }

  async function copyToClipboard() {
    if (!editText) return
    await navigator.clipboard.writeText(editText)
    copied = true
    setTimeout(() => { copied = false }, 2000)
  }
</script>

<div class="flex flex-col gap-3 pt-3">
  <div class="flex items-center justify-between">
    <span class="text-xs font-medium" style="color: var(--color-text-muted);">Alt Text</span>
    <div class="flex items-center gap-2">
      <button
        onclick={generate}
        disabled={generating}
        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
        style="background: var(--color-accent); color: var(--color-text); opacity: {generating ? '0.5' : '1'};"
      >
        {generating ? 'Generating...' : 'Generate'}
      </button>
      <button
        onclick={copyToClipboard}
        disabled={!editText}
        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
        style="background: var(--color-surface-1); color: {copied ? 'var(--color-accent-2)' : 'var(--color-text)'}; opacity: {editText ? '1' : '0.5'};"
        aria-label="Copy alt text to clipboard"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  </div>

  <textarea
    rows="2"
    value={editText}
    onchange={handleEdit}
    placeholder="Click Generate or type alt text manually"
    class="alt-textarea w-full px-3 py-2 rounded-lg text-xs border resize-y"
  ></textarea>

  {#if error}
    <p class="text-xs" style="color: var(--color-error);">{error}</p>
  {/if}
</div>

<style>
  .alt-textarea {
    background: var(--input-bg);
    border-color: var(--input-border);
    color: var(--color-text);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .alt-textarea:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px var(--input-focus-ring);
    outline: none;
  }
</style>

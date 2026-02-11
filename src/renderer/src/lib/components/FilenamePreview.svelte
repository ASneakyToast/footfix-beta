<script lang="ts">
  import type { TemplateFieldValues } from '../../../../shared/types'

  const { template, fieldValues = {} } = $props<{
    template: string
    fieldValues?: TemplateFieldValues
  }>()

  const now = new Date()

  const mockValues: Record<string, string> = {
    filename: 'photo',
    width: '1920',
    height: '1080',
    format: 'jpeg',
    date: now.toISOString().slice(0, 10).replace(/-/g, ''),
    counter: '001',
    ext: 'jpg',
    project_name: 'my-project',
    user_initials: 'JL',
    month: String(now.getMonth() + 1).padStart(2, '0'),
    year: String(now.getFullYear())
  }

  let mergedValues = $derived({ ...mockValues, ...fieldValues })

  // Compute counter with offset support
  let displayValues = $derived.by(() => {
    const vals = { ...mergedValues }
    if (fieldValues.counter) {
      const start = parseInt(fieldValues.counter, 10) || 1
      vals.counter = String(start).padStart(3, '0')
    }
    return vals
  })

  let preview = $derived(
    template
      .replace(/\{(\w+)\}/g, (match, key) => displayValues[key] ?? match)
      .replace(/_{2,}/g, '_')
      .replace(/-{2,}/g, '-')
      .replace(/^[_-]+/, '')
      .replace(/[_-]+$/, '')
  )

  let tokens = $derived(
    template.split(/(\{\w+\})/).map((part) => ({
      text: part,
      isToken: /^\{\w+\}$/.test(part)
    }))
  )
</script>

<div class="flex flex-col gap-1.5">
  <span class="text-xs font-medium" style="color: var(--color-text-muted);">Filename Preview</span>
  <div class="flex items-center gap-0.5 flex-wrap">
    {#each tokens as token}
      {#if token.isToken}
        <span
          class="px-1 rounded text-xs font-mono"
          style="background: var(--color-accent); color: var(--color-text);"
        >{token.text}</span>
      {:else}
        <span class="text-xs font-mono" style="color: var(--color-text);">{token.text}</span>
      {/if}
    {/each}
  </div>
  <p class="text-xs font-mono" style="color: var(--color-text-muted);">
    → {preview}
  </p>
</div>

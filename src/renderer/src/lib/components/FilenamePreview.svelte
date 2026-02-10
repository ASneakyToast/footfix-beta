<script lang="ts">
  const { template } = $props<{ template: string }>()

  const mockValues: Record<string, string> = {
    name: 'photo',
    width: '1920',
    height: '1080',
    format: 'jpeg',
    quality: '82'
  }

  let preview = $derived(
    template.replace(/\{(\w+)\}/g, (match, key) => mockValues[key] ?? match)
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

<script lang="ts">
  import { getJobState } from '../lib/stores/job-store.svelte'
  import DropZone from '../lib/components/DropZone.svelte'
  import ImageQueue from '../lib/components/ImageQueue.svelte'
  import ProcessingControls from '../lib/components/ProcessingControls.svelte'
  import ProgressBar from '../lib/components/ProgressBar.svelte'

  const job = getJobState()
</script>

<div class="p-8 flex flex-col gap-6">
  <div>
    <h1 class="text-2xl font-bold mb-2">Process Images</h1>
    <p style="color: var(--color-text-muted);">
      Drop images here or click Browse to get started.
    </p>
  </div>

  <DropZone />

  <div class="rounded-xl p-4" style="background: var(--color-surface);">
    <ImageQueue />
  </div>

  <ProcessingControls />

  <ProgressBar progress={job.progress} />
</div>

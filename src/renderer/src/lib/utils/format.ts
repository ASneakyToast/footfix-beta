export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}

export function compressionRatio(original: number, output: number): string {
  if (original === 0) return '0%'
  const saved = 1 - output / original
  return formatPercent(saved)
}

export function formatDimensions(w: number, h: number): string {
  return `${w} × ${h}`
}

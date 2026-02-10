import { basename, extname } from 'path'

interface TemplateContext {
  originalPath: string
  width: number
  height: number
  format: string
  counter: number
}

export function renderFilename(template: string, ctx: TemplateContext): string {
  const ext = extname(ctx.originalPath)
  const name = basename(ctx.originalPath, ext)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')

  const formatExt = ctx.format === 'jpeg' ? 'jpg' : ctx.format

  let result = template
    .replace(/\{name\}/g, name)
    .replace(/\{width\}/g, String(ctx.width))
    .replace(/\{height\}/g, String(ctx.height))
    .replace(/\{date\}/g, date)
    .replace(/\{counter\}/g, String(ctx.counter).padStart(3, '0'))
    .replace(/\{format\}/g, ctx.format)
    .replace(/\{ext\}/g, formatExt)

  // Sanitize filename
  result = result.replace(/[<>:"/\\|?*]/g, '_')

  return `${result}.${formatExt}`
}

export function previewFilename(
  template: string,
  format: string,
  sampleName = 'photo'
): string {
  return renderFilename(template, {
    originalPath: `${sampleName}.jpg`,
    width: 1920,
    height: 1080,
    format,
    counter: 1
  })
}

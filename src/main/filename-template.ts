import { basename, extname } from 'path'
import type { TemplateFieldValues } from '../shared/types'

interface TemplateContext {
  originalPath: string
  width: number
  height: number
  format: string
  counter: number
  fieldValues: TemplateFieldValues
}

export function renderFilename(template: string, ctx: TemplateContext): string {
  const ext = extname(ctx.originalPath)
  const name = basename(ctx.originalPath, ext)
  const now = new Date()
  const formatExt = ctx.format === 'jpeg' ? 'jpg' : ctx.format
  const fv = ctx.fieldValues

  // Per-file tokens always from context
  let result = template
    .replace(/\{filename\}/g, name)
    .replace(/\{width\}/g, String(ctx.width))
    .replace(/\{height\}/g, String(ctx.height))
    .replace(/\{format\}/g, ctx.format)
    .replace(/\{ext\}/g, formatExt)

  // Date auto tokens — fieldValues override, else auto-compute
  const date = fv.date || now.toISOString().slice(0, 10).replace(/-/g, '')
  const month = fv.month || String(now.getMonth() + 1).padStart(2, '0')
  const year = fv.year || String(now.getFullYear())

  result = result
    .replace(/\{date\}/g, date)
    .replace(/\{month\}/g, month)
    .replace(/\{year\}/g, year)

  // Counter — fieldValues.counter is the start offset
  const counterStart = parseInt(fv.counter || '1', 10) || 1
  const counterValue = (counterStart - 1) + ctx.counter
  result = result.replace(/\{counter\}/g, String(counterValue).padStart(3, '0'))

  // User input / settings-derived tokens
  result = result
    .replace(/\{project_name\}/g, fv.project_name || '')
    .replace(/\{user_initials\}/g, fv.user_initials || '')

  // Sanitize: collapse empty token remnants
  result = result
    .replace(/[<>:"/\\|?*]/g, '_') // illegal filename chars
    .replace(/_{2,}/g, '_')         // collapse multiple underscores
    .replace(/-{2,}/g, '-')         // collapse multiple hyphens
    .replace(/^[_-]+/, '')          // trim leading separators
    .replace(/[_-]+$/, '')          // trim trailing separators

  return `${result}.${formatExt}`
}

export function previewFilename(
  template: string,
  format: string,
  sampleName = 'photo',
  fieldValues: TemplateFieldValues = {}
): string {
  return renderFilename(template, {
    originalPath: `${sampleName}.jpg`,
    width: 1920,
    height: 1080,
    format,
    counter: 1,
    fieldValues
  })
}

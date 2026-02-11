#!/usr/bin/env node
/**
 * Generate platform-specific icon files from icon.svg
 * Uses sharp (already in project deps) + macOS iconutil
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const resourcesDir = join(__dirname, '..', 'resources')
const svgPath = join(resourcesDir, 'icon.svg')

// Dynamic import for sharp (ESM package)
const sharp = (await import('sharp')).default

const svgBuffer = readFileSync(svgPath)

// --- 1. Generate icon.png (1024x1024) ---
console.log('Generating icon.png (1024x1024)...')
await sharp(svgBuffer)
  .resize(1024, 1024)
  .png()
  .toFile(join(resourcesDir, 'icon.png'))
console.log('  ✓ icon.png')

// --- 2. Generate icon.icns (macOS) via iconutil ---
console.log('Generating icon.icns...')
const iconsetDir = join(resourcesDir, 'icon.iconset')
mkdirSync(iconsetDir, { recursive: true })

// macOS iconset requires these exact filenames/sizes
const iconsetSizes = [
  { name: 'icon_16x16.png', size: 16 },
  { name: 'icon_16x16@2x.png', size: 32 },
  { name: 'icon_32x32.png', size: 32 },
  { name: 'icon_32x32@2x.png', size: 64 },
  { name: 'icon_128x128.png', size: 128 },
  { name: 'icon_128x128@2x.png', size: 256 },
  { name: 'icon_256x256.png', size: 256 },
  { name: 'icon_256x256@2x.png', size: 512 },
  { name: 'icon_512x512.png', size: 512 },
  { name: 'icon_512x512@2x.png', size: 1024 }
]

for (const { name, size } of iconsetSizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(iconsetDir, name))
}

execSync(`iconutil -c icns "${iconsetDir}" -o "${join(resourcesDir, 'icon.icns')}"`)
// Clean up iconset directory
rmSync(iconsetDir, { recursive: true })
console.log('  ✓ icon.icns')

// --- 3. Generate icon.ico (Windows) ---
// ICO format: header + directory entries + image data
// We'll embed PNG images for sizes 16, 32, 48, 64, 128, 256
console.log('Generating icon.ico...')

const icoSizes = [16, 32, 48, 64, 128, 256]
const pngBuffers = []

for (const size of icoSizes) {
  const buf = await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toBuffer()
  pngBuffers.push({ size, data: buf })
}

// Build ICO file
// ICO Header: 6 bytes
// Directory Entry: 16 bytes each
// Image data follows
const numImages = pngBuffers.length
const headerSize = 6
const dirEntrySize = 16
const dirSize = dirEntrySize * numImages
let dataOffset = headerSize + dirSize

// Header
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)          // Reserved
header.writeUInt16LE(1, 2)          // Type: 1 = ICO
header.writeUInt16LE(numImages, 4)  // Number of images

// Directory entries
const dirEntries = Buffer.alloc(dirSize)
const imageDataBuffers = []

for (let i = 0; i < numImages; i++) {
  const { size, data } = pngBuffers[i]
  const offset = i * dirEntrySize

  dirEntries.writeUInt8(size >= 256 ? 0 : size, offset)      // Width (0 = 256)
  dirEntries.writeUInt8(size >= 256 ? 0 : size, offset + 1)  // Height (0 = 256)
  dirEntries.writeUInt8(0, offset + 2)                         // Color palette
  dirEntries.writeUInt8(0, offset + 3)                         // Reserved
  dirEntries.writeUInt16LE(1, offset + 4)                      // Color planes
  dirEntries.writeUInt16LE(32, offset + 6)                     // Bits per pixel
  dirEntries.writeUInt32LE(data.length, offset + 8)            // Image data size
  dirEntries.writeUInt32LE(dataOffset, offset + 12)            // Data offset

  imageDataBuffers.push(data)
  dataOffset += data.length
}

const icoBuffer = Buffer.concat([header, dirEntries, ...imageDataBuffers])
writeFileSync(join(resourcesDir, 'icon.ico'), icoBuffer)
console.log('  ✓ icon.ico')

console.log('\nAll icons generated successfully!')

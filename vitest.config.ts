import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'out'],
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './src/shared')
    }
  }
})

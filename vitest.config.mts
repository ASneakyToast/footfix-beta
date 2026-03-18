import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    globals: true,
    environment: 'jsdom',
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

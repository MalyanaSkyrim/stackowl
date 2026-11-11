import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    reporters: ['verbose'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  },
})

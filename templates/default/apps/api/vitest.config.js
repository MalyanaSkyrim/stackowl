/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    watch: false,
    globals: true,
    deps: {
      inline: ['@fastify/autoload'],
    },
    testTimeout: 10000,
    // The auth and sync tests share one test database and each empties it.
    fileParallelism: false,
  },
})

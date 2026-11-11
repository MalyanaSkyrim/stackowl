import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Copying the whole starter template takes a few seconds on a busy machine.
  test: { testTimeout: 30_000 },
})

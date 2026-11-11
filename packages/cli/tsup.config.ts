import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts', api: 'src/api.ts' },
  format: ['esm'],
  target: 'node20',
  dts: { entry: { api: 'src/api.ts' } },
  clean: true,
  sourcemap: true,
})

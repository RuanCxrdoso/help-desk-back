import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'
import swc from 'unplugin-swc'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    name: 'unit',
    include: ['src/**/*.spec.ts'],
    dir: 'src',
    root: './',
  },
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
})

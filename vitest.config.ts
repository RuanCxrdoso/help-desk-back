import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    name: 'unit',
    include: ['src/**/*.spec.ts'],
    root: './',
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
  oxc: false,
})

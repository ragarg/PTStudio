import { resolve } from 'node:path'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { wgsl } from './src/libs/pt_engine/vite-plugin-wgsl.js'

export default defineConfig(({ command }) => {
  const useEngineSources = command === 'serve'
  const engineSourceAlias = useEngineSources
    ? [{
        find: '@tsraycaster/pt-engine',
        replacement: resolve(import.meta.dirname, 'src/libs/pt_engine/src/index.ts'),
      }]
    : []

  return {
    plugins: [
      ...(useEngineSources ? [wgsl()] : []),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      mkcert(),
    ],
    resolve: {
      alias: engineSourceAlias,
    },
    build: {
      outDir: 'dist/editor',
    },
    server: {
      host: true,
    },
  }
})

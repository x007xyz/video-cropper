import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'
import { dirname, resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools(),
    dts({
      tsconfigPath: resolve(dirname(fileURLToPath(import.meta.url)), './tsconfig.app.json')
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'video-cropper',
      fileName: (format) => `video-cropper.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
})

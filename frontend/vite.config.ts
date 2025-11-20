import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from '@unocss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_TARGET = process.env.VITE_API_TARGET || env.VITE_API_TARGET || 'http://127.0.0.1:8081'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      UnoCSS()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'pinia'],
            ui: ['@headlessui/vue', '@vueuse/core']
          }
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
          secure: false
        },
        '/uploads': {
          target: API_TARGET,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})

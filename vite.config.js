import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // uyimiz-backend (Django) sukut bo'yicha 8000-portda ishlaydi.
  const target = env.VITE_API_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [vue()],
    server: {
      port: 5175,
      proxy: {
        '/api': { target, changeOrigin: true },
        '/media': { target, changeOrigin: true },
      },
    },
  }
})

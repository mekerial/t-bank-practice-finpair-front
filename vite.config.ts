import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/** Шлюз FinPair.ApiGateway — тот же адрес, что и в dev (`npm run dev`). */
const apiGatewayTarget = 'http://127.0.0.1:5194'

const apiProxy = {
  '/api': {
    target: apiGatewayTarget,
    changeOrigin: true
  }
} as const

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    open: true,
    proxy: apiProxy
  },
  preview: {
    host: 'localhost',
    strictPort: true,
    open: true,
    proxy: apiProxy
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts'
  }
})

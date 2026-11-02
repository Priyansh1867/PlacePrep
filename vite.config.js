import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const allowedHost = process.env.VITE_ALLOWED_HOST

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_DEV_PORT || 5173),
    ...(allowedHost ? { allowedHosts: [allowedHost] } : {}),
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

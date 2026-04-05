import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5176,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8083',
        changeOrigin: true,
      },
      // Auth endpoints are at /auth/** (no /api prefix) in the backend
      '/auth': {
        target: process.env.VITE_API_URL || 'http://localhost:8083',
        changeOrigin: true,
      },
    },
  },
})

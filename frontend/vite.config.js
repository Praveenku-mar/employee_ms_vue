import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    allowedHosts: ['employee.local'],
    proxy: {
      '/api': {
        target: 'http://employee.local:8000',
        changeOrigin: true,
        secure: false,
      },
      '/assets': {
        target: 'http://employee.local:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Asegura bind a todas las interfaces
    proxy: {
      '/api': {
        target: 'http://backend:8000', // <--- Se usó el nombre del servicio en Docker
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'http://backend:8000', // <--- Se usó el nombre del servicio en Docker
        ws: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
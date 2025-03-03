import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/web-app-SC310006-sec1/',
  build: {
    outDir: 'dist',
  },
  plugins: [
    react(),
    tailwindcss()
  ],
})

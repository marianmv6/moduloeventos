import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Dev local = ambiente moduloeventos (https://moduloeventos.vercel.app) */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4001,
    host: true,
    strictPort: false,
    open: true
  }
})

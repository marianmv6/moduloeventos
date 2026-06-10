import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Dev local padrão = regrasdetratativas (https://regrasdetratativas.vercel.app). Use `npm run dev:moduloeventos` para o outro deploy. */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4001,
    host: true,
    strictPort: false,
    open: true
  }
})

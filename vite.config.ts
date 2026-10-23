import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Where the FastAPI backend runs. Override with BACKEND_URL=http://127.0.0.1:8001 npm run dev
const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev proxy: the browser calls /api/products on the Vite server (same origin, so no CORS),
    // and Vite forwards it to the backend as /products.
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

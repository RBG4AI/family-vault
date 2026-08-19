import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PRODUCTION_CSP =
  "default-src 'self' file: data: blob:; script-src 'self' 'unsafe-inline' file: blob:; style-src 'self' 'unsafe-inline' file:; img-src 'self' data: file:; font-src 'self' data: file:; connect-src 'self' file:; worker-src 'self' blob:; base-uri 'self'; form-action 'self';"

const DEV_CSP =
  "default-src 'self' file: data: blob:; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline' file: blob:; style-src 'self' 'unsafe-inline' file:; img-src 'self' data: file:; font-src 'self' data: file:; connect-src 'self' file: ws: wss:; worker-src 'self' blob:; base-uri 'self'; form-action 'self';"

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'family-vault-csp',
      transformIndexHtml(html, ctx) {
        const csp = ctx.server ? DEV_CSP : PRODUCTION_CSP
        return html.replace(/content="default-src[^"]+"/, `content="${csp}"`)
      },
    },
  ],
  base: './',
  server: {
    port: 3000,
    host: true,
    open: true
  },
  preview: {
    port: 4173,
    host: true
  }
})

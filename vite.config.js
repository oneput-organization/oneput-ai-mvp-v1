import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Project page served from https://oneput-organization.github.io/oneput-ai-mvp-v1/
  base: '/oneput-ai-mvp-v1/',
  plugins: [react()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  base: process.env.NODE_ENV === 'production' ? '/OnlineStore-Backend/' : '/',
})

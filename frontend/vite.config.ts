import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- CONFIGURAÇÃO ADICIONADA PARA DOCKER ---
  server: {
    // Isso é **crucial** para que o contêiner do Docker (Vite) aceite conexões externas
    // e o Hot Reload funcione corretamente via http://localhost:5173
    host: '0.0.0.0',
    port: 5173,
  },
  // --- CONFIGURAÇÃO DO ALIAS @ ---
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // --- CONFIGURAÇÃO VITEST ---
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})

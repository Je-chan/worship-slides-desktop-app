import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/renderer/src/setupTests.ts'],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'out', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/renderer/src/**/*.{ts,tsx}'],
      exclude: ['src/renderer/src/**/*.d.ts', 'src/renderer/src/main.tsx']
    }
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './src/renderer/src/shared'),
      '@pages': resolve(__dirname, './src/renderer/src/pages'),
      '@features': resolve(__dirname, './src/renderer/src/features'),
      '@entities': resolve(__dirname, './src/renderer/src/entities'),
      '@app': resolve(__dirname, './src/renderer/src/app')
    }
  }
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/lib/api.js',
        'src/services/ofertas.js',
        'src/pages/LoginPage.jsx',
        'src/pages/OfertasPage.jsx',
        'src/pages/OfertaDetallePage.jsx',
        'src/pages/PostularPage.jsx',
        'src/components/ofertas/**/*.jsx'
      ],
      exclude: ['src/test/**'],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 85
      }
    }
  }
})

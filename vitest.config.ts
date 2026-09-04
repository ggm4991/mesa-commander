import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Entorno "node" por defecto: la lógica de tests/motor y tests/almacenamiento
// es pura y no necesita DOM. Los tests de tests/componentes activan jsdom por
// archivo con un comentario `// @vitest-environment jsdom` al inicio.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    // pruebas/ es el runner heredado (node pruebas/ejecutar.js, ver `npm test`);
    // Vitest solo mira tests/, que es donde vive el código portado.
    include: ['tests/**/*.test.{ts,tsx}'],
    // Fase 0 no porta lógica todavía, así que tests/ está vacío a propósito.
    passWithNoTests: true,
    setupFiles: ['./tests/configuracion.ts'],
  },
})

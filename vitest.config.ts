import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Entorno "node" por defecto: la lógica de tests/motor y tests/almacenamiento
// es pura y no necesita DOM. Los tests de tests/componentes activan jsdom por
// archivo con un comentario `// @vitest-environment jsdom` al inicio.
export default defineConfig({
  // Mismas variables globales que vite.config.ts (ver ADR 0036): sin esto,
  // cualquier test que llegue a importar App.tsx fallaría con un
  // ReferenceError, al no existir estas dos constantes fuera del build real.
  define: {
    __APP_VERSION__: JSON.stringify('0.0.0-test'),
    __BUILD_TIME__: JSON.stringify('1970-01-01T00:00:00.000Z'),
  },
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

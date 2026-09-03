# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Cada entrada funcional va bajo `[Unreleased]` hasta que se cierra una fase, momento
en el que se convierte en una versión con fecha.

## [Unreleased]

### Added

- Scaffold de Vite + React + TypeScript sobre el proyecto existente, sin tocar
  `app.html` ni `pruebas/` (Fase 0 del plan de migración).
- Vitest configurado (`vitest.config.ts`), con entorno `node` por defecto y
  `tests/` como único directorio que examina — `pruebas/` sigue corriendo por su
  propio runner (`npm test`) hasta que se porte en la Fase 1.
- `oxlint` como linter de `src/` y `tests/` (`npm run lint`).
- Capacitor inicializado (`capacitor.config.ts`, appId `com.goncholoko.mesacommander`),
  sin plataformas nativas añadidas todavía (eso llega en la Fase 5).
- `docs/decisiones/` con las primeras ADR: 0000 (plantilla), 0001 (elección de
  stack), 0002 (versiones de Vite/oxlint/Capacitor fijadas por la versión de
  Node de esta máquina — reemplazada el mismo día por la 0003), 0003 (Node 22
  fijado solo para este proyecto vía `volta pin`, y vuelta a las versiones
  más recientes de Vite/oxlint/Capacitor).
- Copia de referencia de la app actual en `docs/legado/app.html`.

### Changed

- `package.json` pasa a `"type": "module"` para que Vite/Vitest carguen sus
  archivos de configuración en TypeScript; para que `pruebas/ejecutar.js` y los
  9 `pruebas/*.test.js` (que usan `require`, CommonJS) sigan funcionando sin
  tocarlos, se añadió `pruebas/package.json` con `{"type": "commonjs"}`, que
  anula el tipo de módulo solo dentro de esa carpeta.

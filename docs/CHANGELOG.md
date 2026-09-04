# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Cada entrada funcional va bajo `[Unreleased]` hasta que se cierra una fase, momento
en el que se convierte en una versión con fecha.

## [Unreleased]

### Added

- `src/motor/`: el motor de partida (sección 7 de `app.html`) portado a
  TypeScript puro — `nuevoJugador`, `empezarPartida`, `transcurrido`,
  `alternarPausa`, `elegirInicio`, `pasarTurno`, `cambiarVida`,
  `danoComandante`/`comandantesEnMesa`/`nombreComandante`, `contador`,
  `retirada`, `revisar`/`comprobarFinal`, `foto`/`deshacer`,
  `migrarJuego`/`migrarPerfiles`, `calcularJugadores`. Sin DOM, sin
  `window.storage`, sin pintado — ver `docs/decisiones/0004`.
- `tests/motor/`: 26 pruebas en Vitest, sin ningún mock de DOM, porteando los
  casos de `pruebas/dano-comandante.test.js`, `cronometro.test.js`,
  `inicio-partida.test.js` (la parte de turnos, no el desplegable) y la
  migración de `perfiles-y-copia.test.js`; más pruebas nuevas para
  `comprobarFinal` y `calcularJugadores`, que no tenían archivo propio antes.
- `docs/decisiones/0004`: por qué el motor son funciones puras con *object
  spread* y sin Immer, y por qué `foto()`/el agrupamiento del registro de
  `cambiarVida` pasan a ser responsabilidad del store de la Fase 3.

### Fixed

- El *lint* de `oxlint` señaló una variable sin usar real en
  `src/motor/deshacer.ts` (`log` desestructurada solo para excluirla del
  snapshot); se corrigió renombrándola a `_log`, como pide la propia regla.

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

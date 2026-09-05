# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Cada entrada funcional va bajo `[Unreleased]` hasta que se cierra una fase, momento
en el que se convierte en una versión con fecha.

## [Unreleased]

### Added

- Segundo commit de la Fase 3: la pantalla previa completa (secciones 5 y 6
  de app.html) — número de jugadores, disposición de mesa con vista cenital
  y rotación por asiento, vida inicial, límite de turno, barajar/girar,
  tirar un dado, sortear quién empieza, perfiles (crear/editar/eliminar,
  con sus mazos) y elegir asiento (perfil existente, otro de sus mazos por
  el desplegable con buscador, nombre suelto, o crear perfil sobre la
  marcha). La copia de seguridad queda para la fase de Registro, que es
  donde vive de verdad en el original.
- `src/contextos/`: `AlmacenContexto`/`useAlmacen` (el almacén activo, por
  defecto Capacitor, sustituible en tests), `usePerfiles` y `useConfig`
  (cargan y guardan contra el repositorio de la Fase 2 como estado de
  React).
- `src/componentes/mesa/`: `disposiciones.ts` (DISPOS portado, antes
  pendiente de la Fase 3 por decisión explícita en el motor), `colores.ts`,
  `perfiles.ts`, y los componentes `EditorMazo`, `EditorPerfil`,
  `ModalGestionarPerfiles`, `ModalElegirAsiento`, `ModalDado`, `VistaMesa`.
- `src/componentes/comunes/`: `Pips`, `fondoIdentidad` y `Desplegable`
  (el buscador desplegable genérico, antes `desplegable()`/
  `activarDesplegables()`).
- Resto del CSS de la pantalla previa portado a `src/index.css` (mesa
  cenital, rotaciones, desplegable, formularios, pips).
- `docs/decisiones/0007`: por qué el modal abierto de cada pantalla se
  guarda como un único estado (`EstadoModal`), no un booleano por modal.
- 53 pruebas nuevas con Testing Library, más verificación visual con
  Chromium real (uso puntual, no dependencia): 4 jugadores con distintas
  rotaciones, sentar con nombre suelto, girar un asiento, crear un perfil
  con mazo desde cero, y arrancar una partida — capturas y consola limpia
  confirmadas.

- Primer commit de la Fase 3 (UI en React): `src/componentes/icono/` (los 36
  SVG de `ICONOS` portados literalmente, más el componente `<Icono>`
  sustituyendo a `ic()`) y `src/componentes/comunes/` (`<Modal>` con
  `createPortal`, y `<AvisoProvider>`/`useAviso()` sustituyendo a
  `abrirModal`/`cerrarModal`/`aviso()` — ver `docs/decisiones/0006`).
- `src/index.css`: variables de diseño, reset base, nav, botones, `.opts` y
  el CSS de modal/aviso, portados de app.html sección a sección según se
  necesitan (falta el tablero y las rotaciones de asiento).
- `index.html` actualizado con el viewport, `theme-color` y las fuentes de
  Google Fonts (IBM Plex Sans/Spectral) del original.
- 10 pruebas nuevas con Testing Library (`Icono`, `Modal`, `AvisoProvider`),
  con `tests/configuracion.ts` registrando la limpieza de RTL entre tests
  (necesaria porque el proyecto no activa `test.globals` en Vitest).
- Verificación visual con Chromium real vía Playwright (uso puntual, no
  añadido como dependencia): nav, icono, apertura/cierre de modal y aviso
  comprobados con capturas y sin errores de consola.

- `src/almacenamiento/`: adapter pattern para persistencia — interfaz
  `AlmacenPersistente` (mismo contrato que ya cumplía `window.storage`:
  `get(clave)`/`set(clave, valor)`), `adaptadorMemoria` (para tests) y
  `adaptadorCapacitor` (sobre `@capacitor/preferences`, instalado esta fase).
  El repositorio de dominio (`repositorio.ts`) replica
  `leer/guardarPartidas`, `leer/guardarPerfiles` (migrando el formato antiguo
  al leer), `leer/guardarConfig` (con valores por defecto) y
  `leer/guardarJuego` (que sigue sin persistir `undo`, y al leer lo
  reinicia junto con `tIni`, igual que hacía el arranque de `app.html`).
- `tests/almacenamiento/repositorio.test.ts`: 13 pruebas sobre el
  repositorio con `adaptadorMemoria`, incluyendo un almacén que falla
  a propósito para comprobar que `leer`/`guardar` devuelven `null`/`false`
  en vez de lanzar.
- `docs/decisiones/0005`: por qué `@capacitor/preferences` sin cifrar es
  aceptable hoy (no guarda nada sensible) y cuándo hay que revisar esa
  decisión (cuando llegue un token de sesión de Supabase en la Fase 6).

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

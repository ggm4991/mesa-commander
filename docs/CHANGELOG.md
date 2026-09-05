# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Cada entrada funcional va bajo `[Unreleased]` hasta que se cierra una fase, momento
en el que se convierte en una versión con fecha.

## [Unreleased]

### Added

- Sexto commit de la Fase 4: los iconos de daño de comandante pasan de una
  fila de círculos a un único cuadrado partido en sectores (una rejilla de
  2×2 en el caso más común, una mesa de 4 sin compañeros), y el botón de
  jugadas retiradas se saca de esa fila a una esquina fija del asiento
  (gira con el resto del contenido en los asientos rotados). Mismo gesto de
  siempre por sector: toca para sumar, mantén pulsado para restar.
- `docs/decisiones/0017`: por qué la rejilla se calcula con `ceil(sqrt(n))`
  en vez de fijarla siempre a 2 columnas, y por qué la esquina de la
  retirada es relativa al asiento, no a la pantalla.
- Verificado con un navegador real en una mesa de 4: la rejilla 2×2 sale
  centrada abajo, la retirada no se solapa con nada, y se comprobó
  explícitamente que mantener pulsado un sector quita un punto de daño ya
  puesto — sin errores de consola.

- Quinto commit de la Fase 4: el daño de comandante se apunta con un icono
  tocable por cada comandante en la mesa (su ilustración si Scryfall la
  tiene, o su identidad de color si no), en vez de abrir un panel aparte —
  al estilo de LifeTap, a petición del usuario. Un toque suma un punto;
  mantener pulsado resta uno. Se retira `ModalPanelDano`, sustituido por
  completo por este flujo.
- `src/tablero/IconoDanoComandante.tsx` y `useTocarYMantener.ts` (toca para
  una acción, mantén pulsado para la contraria — distinto de
  `useMantenerPulsado`, que repite la misma acción mientras se mantiene).
- `docs/decisiones/0016`: el porqué del gesto y de retirar el panel en vez
  de mantener las dos formas de apuntar lo mismo.
- 12 pruebas nuevas, más verificación con un navegador real en una mesa de
  4: los iconos caben junto al resto de la fila sin apretarla, y tocar/
  mantener pulsado suman y restan como se espera — sin errores de consola.

- Cuarto commit de la Fase 4: elegir qué edición de un comandante se usa
  como ilustración, y orientarla hacia el jugador. `EditorMazo` muestra una
  miniatura de la ilustración junto al nombre, con un botón "Cambiar
  imagen" que abre un selector con todas las ediciones impresas de esa
  carta (`buscarImpresiones`); elegir una la fija (`imagenId`, que viaja
  desde el mazo hasta el asiento en juego igual que el nombre o los
  colores), y cambiar el nombre del comandante la limpia, para no dejar el
  arte de una carta puesto en otra.
- `src/red/scryfall/cliente.ts` añade `buscarImpresiones()` y
  `buscarPorId()`; `useImagenComandante` consulta por `imagenId` si lo hay,
  y si no, por nombre exacto como hasta ahora.
- `src/componentes/mesa/SelectorImagenComandante.tsx` y
  `ModalElegirImpresion.tsx`.
- El fondo del asiento (`.bg`) ahora gira con las mismas reglas CSS que ya
  giraban su contenido: antes la ilustración se quedaba siempre "de pie"
  en asientos rotados 90°/180°/270°, mientras el nombre y la vida sí
  giraban hacia el jugador.
- `docs/decisiones/0015`: el porqué de las dos correcciones de arriba,
  pedidas tras probar la app de verdad — incluida una nota sobre un fallo
  real de orden de declaraciones CSS (`inset: auto` después de `top`/`left`
  en la misma regla) que solo se vio en un navegador real, no en los tests.
- 20 pruebas nuevas (cliente, hook, editor de mazos), más verificación con
  un navegador real: 7 ediciones distintas encontradas para Edgar Markov,
  elegir una, sentarlo, girar su asiento 90° y comprobar que la ilustración
  gira con el resto del contenido — sin errores de consola.

- Tercer commit de la Fase 4: la ilustración del comandante como fondo de su
  asiento en el tablero (`Asiento.tsx`), sustituyendo al degradado de color
  de siempre cuando Scryfall la trae. Se pide el recorte `art_crop` (solo la
  ilustración, sin marco ni texto — la carta completa resultaba ilegible
  encima del número de vida), con la misma caché que ya usa el
  autocompletado de `EditorMazo`: si el mazo se creó eligiendo una
  sugerencia, la imagen del asiento sale de caché al instante. Sin
  comandante, sin coincidencia en Scryfall o sin red, el asiento se queda
  exactamente como antes — nunca bloquea ni deja un hueco vacío.
- `src/red/scryfall/useImagenComandante.ts` y `fondoAsiento()` en
  `componentes/comunes/fondo.ts`.
- `docs/decisiones/0014`: por qué `art_crop` y no la carta entera, y por qué
  comparte caché con el autocompletado.
- 2 pruebas nuevas en `Asiento.test.tsx` (con imagen y sin ella), más
  verificación con un navegador real y datos reales de Scryfall: crear un
  perfil con "Edgar Markov" a mano, sentarlo, empezar la partida, y
  comprobar que su asiento muestra la ilustración mientras el otro (sin
  comandante) mantiene el degradado de color — sin errores de consola.

- Segundo commit de la Fase 4: autocompletado de comandantes en `EditorMazo`
  (comandante y compañero de un mazo, dentro de un perfil). Al escribir con
  el campo enfocado aparecen sugerencias de Scryfall; al elegir una, el
  nombre se rellena con la ortografía exacta de la carta y su identidad de
  color se enciende sola (combinándose con la que ya hubiera, nunca
  sustituyéndola — un mazo con compañero suma los colores de los dos). Sin
  elegir ninguna sugerencia, el campo funciona exactamente igual que antes.
- `src/red/scryfall/useDebounce.ts` y `useSugerenciasComandante.ts` (activa
  la búsqueda solo con el campo enfocado, para que ninguna prueba dispare una
  petición real sin querer), y `src/componentes/mesa/CampoComandante.tsx`
  (el campo con sugerencias, reutilizable donde haga falta comandante).
- `docs/decisiones/0013`: por qué solo elegir una sugerencia rellena la
  identidad de color (nunca escribir texto libre, aunque coincida con una
  carta real), y por qué se combina en vez de sustituir.
- `tests/ayudantes/`: `crearQueryClientDePrueba`/`ProveedorQueryDePrueba`,
  para montar componentes que usan TanStack Query en los tests.
- 18 pruebas nuevas (el hook y el campo, con `msw` cubriendo sugerencias,
  selección, combinación de identidad y fallo de red), más verificación con
  un navegador real contra la API pública de Scryfall (sin mocks): buscar
  "edgar mark", elegir "Edgar Markov" y comprobar que su identidad real
  (W/B/R) queda marcada, sin errores de CORS ni de consola.

- Primer commit de la Fase 4 (Scryfall + offline-first): `src/red/scryfall/cliente.ts`
  (`buscarNombres` para el autocompletado, `buscarPorNombreExacto` para la
  identidad de color y la imagen — sin credenciales, sin caché propia) y
  `src/red/queryClient.ts` (TanStack Query, `staleTime` de un día). Todavía
  sin usar desde ninguna pantalla: llega en el siguiente commit.
- `@tanstack/react-query` como dependencia; `msw` como dependencia de
  desarrollo, solo para simular Scryfall en los tests.
- `.oxlintrc.json` añade un `overrides` que prohíbe importar nada de
  `src/red/` desde `src/motor/` o `src/almacenamiento/`, con
  `no-restricted-imports` — la base técnica del offline-first: el motor y el
  almacenamiento local nunca dependen de la red.
- `docs/decisiones/0012`: por qué el cliente distingue "no se encontró" (null)
  de "falló de verdad" (excepción), por qué la caché es cosa de TanStack
  Query y no del cliente, y por qué los tests usan `msw` en vez de mockear
  `fetch` a mano.
- 10 pruebas nuevas con `msw` cubriendo éxito, 404, error de servidor, sin
  red y cancelación con `AbortSignal`.

- Cuarto y último commit de la Fase 3: el registro completo (sección 10 de
  app.html) — clasificación siempre recalculada desde las partidas, ficha por
  jugador con historial filtrable, alta/edición/borrado manual con la misma
  validación que usa el tablero al terminar una partida de verdad, cambiar el
  nombre de un jugador en todas sus partidas, y la copia de seguridad de toda
  la app (descargar, copiar, abrir un archivo, reemplazar todo o combinar, y
  restaurar los datos de ejemplo) — 100% local, sin llamada de red alguna.
  Con esto la app vuelve a ser funcionalmente equivalente a `app.html`; el
  `CLAUDE.md` del proyecto se reescribe con la nueva estructura en este mismo
  commit.
- `src/registro/`: `calcularJugadores` (clasificación derivada, nunca
  guardada — ver invariante en CLAUDE.md), `filtrarPartidas` (búsqueda de la
  ficha), `copiaSeguridad` (paquete y validación al importar), `datosDemo`
  (las doce partidas y seis perfiles de ejemplo, antes solo en app.html),
  `constantes.ts` (`RES`), y los componentes `Ranking`, `Ficha`,
  `ModalFormularioPartida` y `ModalCopiaSeguridad`.
- `src/paginas/Registro.tsx`, con su propio `EstadoModal` (ver ADR 0007) para
  el alta/edición, el borrado, el renombrado y la copia de seguridad.
- La pestaña "Registro" de la navegación deja de estar deshabilitada; App.tsx
  pasa a llevar tres pantallas (`previa`/`registro`/`tablero`) y, al terminar
  una partida desde el tablero, navega a "Registro" en vez de a "Inicio",
  igual que hacía `guardarComoPartida()` en el original.
- `docs/decisiones/0010`: por qué la vista inválida (ficha de un jugador que
  ya no existe) se corrige durante el render en vez de en un `useEffect`.
- `docs/decisiones/0011`: por qué el aviso de "sin almacenamiento" del pie de
  página es un estado local del Registro y no un flag global como en el
  original.
- Resto del CSS del registro (tabla de clasificación, ficha, tarjetas,
  historial de partidas y formulario de alta manual) portado a
  `src/index.css`, incluidas las dos reglas `@media` que faltaban
  (pantallas estrechas y `prefers-reduced-motion`).
- 51 pruebas nuevas (funciones puras del registro y una integración completa
  de la pantalla), más verificación visual con Chromium real: clasificación,
  ordenar por columna, ficha con búsqueda, editar y eliminar una partida, y
  restaurar los datos de ejemplo desde la copia de seguridad — sin errores de
  consola.

### Added

- Tercer commit de la Fase 3: el tablero de juego completo (sección 8 y parte
  de la 9 de app.html) — grid de asientos con rotación y reparto de emergencia
  (`LAYOUTS`) si la disposición guardada no es válida, vidas con pulsación
  mantenida y delta flotante agrupado 2s antes de anotarse, contadores,
  maná, daño de comandante, jugadas retiradas, bendición de la ciudad, marcar
  como fuera, editar jugador a media partida, corona arrastrable, monarca e
  iniciativa, día/noche, alarma sonora una vez por turno, deshacer/pausa/
  pasar turno, menú de la partida con historial y dados, y terminar la
  partida (con detección automática de un único superviviente) validando y
  registrando el resultado.
- `src/tablero/`: `useJuegoEnCurso` (el store que la ADR 0004 dejó pendiente
  — ver ADR 0008 sobre por qué expone `mutar` y `mutarSinFoto`, no uno solo),
  `useArrastrarCorona`, `useMantenerPulsado`, `useBordesAsientos` (ver ADR
  0009 sobre el bucle de renders que hubo que resolver), `bordes.ts`
  (geometría pura de evitar el reloj central), `reloj.ts` (estado del
  cronómetro), `sonido.ts` (alarma), `layouts.ts`, y los componentes
  `Asiento`, `Hub`, `ModalPanelDano`, `ModalMenuAsiento` y `ModalesPartida`.
- `src/registro/validar.ts` y `src/registro/construirPartida.ts`, portados
  ahora porque el tablero los necesita para poder terminar y registrar una
  partida; el resto del registro (ranking, fichas, alta manual) llega en la
  próxima fase.
- Seis funciones nuevas en el motor (`motor/vida.ts`, `motor/partida.ts`):
  `ajustarRehacer`, `ajustarFuera`, `alternarBendicion`,
  `alternarFueraDeJuego`, `ajustarMana`, `editarJugador`,
  `cambiarMonarca`/`cambiarMonarcaPorArrastre`, `cambiarIniciativa`,
  `cambiarDiaNoche` — cada una con el texto de registro exacto (o su
  ausencia deliberada, en el caso de maná y editar jugador) del original.
- Resto del CSS del tablero portado a `src/index.css`.
- 52 pruebas nuevas (motor, geometría pura, componentes y una integración
  completa del tablero), más verificación visual con Chromium real: cuatro
  rotaciones a la vez, vida con deshacer, contadores, daño de comandante,
  arrastre de la corona, y terminar partida — sin errores de consola.

### Fixed

- Dos correcciones encontradas por la propia verificación en Chromium real,
  no por los tests unitarios (ver ADR 0008 y 0009 para el detalle): reclamar
  el primer turno se podía deshacer por error, y el reloj mostraba una
  duración negativa un instante justo al reclamarlo.

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

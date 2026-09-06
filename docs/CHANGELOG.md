# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Cada entrada funcional va bajo `[Unreleased]` hasta que se cierra una fase, momento
en el que se convierte en una versión con fecha.

## [Unreleased]

### Added

- Primer paso de la Fase 5: la app se puede instalar como PWA
  (`vite-plugin-pwa`, manifiesto + *service worker* con actualización
  automática). El *service worker* cachea también las respuestas de
  Scryfall (identidad e ilustración de comandante) y las fuentes de Google
  Fonts, no solo el cascarón de la app, para que el offline-first de la
  Fase 4 sobreviva a una recarga en frío sin conexión. Iconos nuevos en
  `public/icons/` (192, 512 y una versión "maskable" a sangre completa),
  a partir del mismo dibujo del favicon. Etiquetas propias de Safari en
  `index.html` (no lee el manifiesto para "Añadir a inicio"). Ver ADR 0028.
- Verificado sirviendo el build de producción (`vite preview`, no
  `vite dev`): manifiesto e iconos accesibles, *service worker* activo, y
  la app arranca y pinta la pantalla previa con la conexión cortada del
  todo. Queda pendiente el resto de la Fase 5: el *shell* nativo de
  Capacitor, para quien quiera un `.apk` de verdad en vez de una PWA.

### Fixed

- En un móvil de verdad (probado a 390px de ancho, no solo en el navegador
  de escritorio de las rondas anteriores), la fila de maná del menú de
  asiento —seis botones de color más "Vaciar"— se salía del propio popup.
  Ver ADR 0027.
- El hub seguía invadiendo los asientos incluso después del primer intento
  de arreglo (ver la entrada siguiente): el alto se había calculado a mano
  y se quedaba corto en cuanto el contenido real (tres líneas de texto en
  el botón del reloj) superaba lo asumido. Ahora `Tablero` mide el alto
  real del hub en el DOM y lo aplica como `row-gap`, así que no puede
  quedarse corto sea cual sea el contenido (ver ADR 0026).
- El popup del cuadrado de daño de comandante no se cerraba al tocar su
  propio fondo (fuera del cuadrado, pero dentro del asiento): la
  referencia usada para "dentro o fuera" apuntaba al fondo entero en vez
  de al cuadrado. Ver ADR 0026.
- El indicador de cambio de vida (`+N`/`-N`) quedaba muy pegado al número
  de vida: pasa a anclarse a la propia caja que envuelve la vida, con una
  separación fija, en vez de a un punto calculado a mano sobre el asiento
  entero. Ver ADR 0026.
- El hub (ADR 0024) se desbordaba sobre los asientos de arriba y de abajo:
  su altura real (62px) superaba el hueco vertical que se le había dejado
  (44px). El `row-gap` de `.board` sube a 64px para que quepa entero.
- El indicador flotante de cambio de vida (`+N`/`-N`) no giraba con el
  resto del contenido en los asientos de arriba, y quedaba tapado por el
  cuadrado de daño de comandante: pasa a ser hijo de `.inner` (antes lo era
  de `.seat`), así que ahora gira igual que todo lo demás, con un
  `z-index` que lo deja siempre por delante. Ver ADR 0025.
- El panel ampliado de daño de comandante (ADR 0020) se cerraba tras un
  único toque de sumar o restar: ahora esos toques solo reinician el
  temporizador de autocierre, así que una serie de pulsaciones seguidas
  mantiene el panel abierto en vez de obligar a mantener pulsado otra vez
  por cada punto (ver ADR 0023).
- El contenido de un asiento podía solaparse con varios contadores activos
  a la vez, incluso en ventanas grandes: `.life` fijaba su tamaño con
  unidades de *viewport* (`vh`), relativas a la ventana entera y no al
  asiento real que lo contiene — pasa a `cqh` (unidades de *container
  query*, ya en uso en esta pantalla). Además, la fila de contadores
  sueltos (sin el maná) no tenía techo: por encima de 2 activos a la vez
  se agrupan en un botón `"N más"` que abre el menú del asiento, en vez de
  crecer sin límite (ver ADR 0021).

### Added

- Decimocuarto commit de la Fase 4: en el menú de cada asiento, el maná pasa
  de seis botones de color a un selector (reutilizando `.color-btn`) más un
  paso −/+ compartido, y "Cambiar nombre o comandante" pasa a "Cambiar de
  mazo", reutilizando la misma lista de perfiles y mazos guardados que ya
  usa la pantalla previa (`ModalElegirAsiento`) — elegir un mazo rellena
  comandante(s), colores e imagen de golpe; escribir a mano sigue
  disponible debajo, para un mazo que no está guardado. `CambiosJugador`
  y `editarJugador` ganan `imagenId`/`imagenId2`, para no dejar la imagen
  fijada apuntando al comandante anterior tras el cambio. Ver ADR 0027.
- 6 pruebas nuevas (el selector de maná ajusta el color elegido, elegir un
  mazo guardado rellena todo, `editarJugador` conserva o actualiza la
  imagen fijada según lo que se le pase), más verificación con un
  navegador real en un viewport de móvil de 390px: nada del menú se sale
  del ancho de la pantalla.
- Decimotercer commit de la Fase 4: el aviso de "se pasó de tiempo" deja la
  fila de contadores sueltos y pasa a su propia esquina fija
  (`.tiempo-esquina`), en el lado opuesto al contador de jugadas rehechas y
  siempre visible (antes solo aparecía a partir de 1, y contaba para el
  umbral de "N más" de la ADR 0021 — ya no). El número de vida vuelve a
  crecer, de `clamp(46px, 15cqh, 108px)` a `clamp(54px, 18cqh, 128px)`. Ver
  ADR 0026.
- 5 pruebas nuevas (el fondo del popup también lo cierra, tocar dentro del
  cuadrado no lo cierra, la esquina de tiempo siempre visible y con aviso
  a partir de 1, el delta dentro de `.life-wrap`), más verificación con un
  navegador real: el hub mide 69px de alto y el `row-gap` se aplicó a 70px
  sin invadir ningún asiento, el delta queda claramente separado de la
  vida, y tocar el fondo del popup de daño (fuera del cuadrado) lo cierra.
- Duodécimo commit de la Fase 4: el cuadrado de daño de comandante deja de
  estar siempre visible en el asiento. En su lugar, un botón ("Daño de
  comandante", debajo de la vida) lo abre como un popup pequeño, centrado
  sobre el propio asiento, que solo se cierra al tocar fuera de él (mismo
  mecanismo de `PanelDanoExpandido`, un nivel más arriba). Ya no hace falta
  ocultarlo por completo en asientos muy bajos, porque deja de competir por
  sitio con el resto del contenido. Ver ADR 0025.
- 5 pruebas nuevas (abrir/cerrar el popup, y el resto de pruebas de daño de
  comandante actualizadas para abrirlo primero), más verificación con un
  navegador real: el hub ya no invade ningún asiento, el indicador de vida
  aparece girado y por delante del resto en los asientos de arriba, y el
  popup de daño se abre centrado y se cierra al tocar fuera.
- Undécimo commit de la Fase 4: el hub deja de ser una burbuja flotante y pasa
  a ser una barra que ocupa todo el ancho, en el hueco vertical entre los
  asientos de arriba y los de abajo:
  - `.board` separa su `gap` en `row-gap: 44px` (solo entre filas) y
    `column-gap: 6px` (entre columnas, sin separación extra).
  - `.hub` pasa de centrarse en ambos ejes con esquinas redondeadas a
    ocupar todo el ancho (`left:0;right:0`) con un borde superior e
    inferior en vez de pastilla.
  - El reloj (nombre y tiempo de quien tiene el turno) gira 180° cuando le
    toca a alguien sentado "boca abajo", con el mismo mecanismo
    `data-rot` que ya orienta el contenido de cada asiento (`Hub` recibe
    una nueva prop `rotacionTurno`). Ver ADR 0024.
- 4 pruebas nuevas, más verificación con un navegador real en mesas de 2 y
  de 4: sin separación horizontal entre asientos del mismo lado, la barra
  ocupa todo el ancho del hueco vertical, y el reloj se lee recto o girado
  según a quién le toque el turno.
- Décimo commit de la Fase 4, con cuatro ajustes tras probar el hub
  central en mesa real:
  - El número de vida crece de `clamp(38px, 11cqh, 84px)` a
    `clamp(46px, 15cqh, 108px)` como dato principal del asiento.
  - El hub deja de flotar sobre los asientos: el `gap` de `.board` sube de
    6px a 44px para darle un hueco propio en el centro, sin tener que
    tocar las 11 disposiciones de `DISPOS`/`LAYOUTS` una a una.
  - Se retiran el nombre del jugador y el del comandante de la pantalla
    del asiento (se conserva el nombre solo como `aria-label` del menú de
    opciones, por accesibilidad).
  - Corrección del cierre prematuro del panel ampliado de daño (ver
    "Fixed" arriba y ADR 0023).
- 2 pruebas nuevas (una del cierre por inactividad tras mantener pulsado,
  otra de que sumar/restar seguidos retrasan el autocierre en vez de
  cerrar), más verificación con un navegador real en mesas de 2 y de 4
  jugadores: el hub no se solapa con ningún asiento en ninguna de las dos,
  y sumar dos veces seguidas sobre el panel ampliado lo deja abierto y
  acumula el daño correctamente.
- Noveno commit de la Fase 4, con tres ajustes pedidos tras probar la app
  con muchos contadores a la vez:
  - Mantener pulsado un sector del cuadrado de daño ya no abre solo su
    propio hueco en dos mitades pequeñas: cubre el **cuadrado entero** con
    dos mitades grandes de sumar/restar, mucho más fáciles de acertar con
    el dedo — vale igual para cada comandante de un jugador con compañero
    (`PanelDanoExpandido`, nuevo; ver ADR 0020).
  - El maná ya no se conserva entre turnos (regla 500.4): `pasarTurno()`
    vacía el de todos los jugadores, no solo el de quien lo pasa. Tocar
    directamente una ficha de maná del asiento gasta un punto, sin tener
    que abrir el menú (ver ADR 0022).
  - Corrección de un solape real en el asiento con muchos contadores
    activos a la vez, incluso en ventanas grandes (ver "Fixed" arriba y
    ADR 0021).
- 20 pruebas nuevas, más verificación con un navegador real: una mesa de
  4 con un jugador de dos comandantes y los 9 contadores más los 6 colores
  de maná activos a la vez, sin ningún solape ni en una ventana grande
  (1400×900) ni en una pequeña (480×700); mantener pulsado cualquier
  sector cubre el cuadrado entero; tocar una ficha de maná la baja en uno
  — sin errores de consola.

- Octavo commit de la Fase 4: la rejilla del cuadrado de daño se calcula
  ahora por número de *jugadores*, no de comandantes — una mesa de 4 sigue
  dando siempre 2×2 tenga o no compañeros, en vez de descuadrarse a un 3×2
  con un hueco vacío en cuanto alguien lleva compañero. Cada hueco general
  se reparte en dos solo para el jugador que de verdad lo tiene. El
  cuadrado crece de 108 a 128px, y se corrige un fallo real de orden de
  declaraciones CSS que dejaba descuadradas las mitades de sumar/restar
  (la misma familia de bug que ya documentó la ADR 0015).
- `comandantesAgrupadosPorJugador()` en `motor/vida.ts`.
- `docs/decisiones/0019`: el porqué de agrupar por jugador, y el detalle
  del fallo de CSS de las mitades.
- 2 pruebas nuevas, más verificación con un navegador real en una mesa de
  4 con un jugador de dos comandantes: los cuatro asientos muestran la
  misma rejilla 2×2, con el hueco de ese jugador partido en dos sin
  alterar los otros tres, y las mitades de sumar/restar salen alineadas —
  sin errores de consola.

- Séptimo commit de la Fase 4: el compañero de un mazo tiene ahora su propia
  imagen fijable (antes solo el comandante principal la tenía; el daño del
  compañero ya se apuntaba, pero todos los sectores del mismo jugador
  buscaban la imagen por el nombre principal, sin distinguir cuál era cuál).
  El cuadrado de sectores crece de 76 a 108px, y mantener pulsado un sector
  ya no resta a ciegas: lo abre en dos mitades (roja para restar, verde
  para sumar) que se cierran solas al tocar fuera o a los 3 segundos.
- `Mazo`/`Asiento`/`Jugador` llevan ahora `imagenId` (comandante principal)
  e `imagenId2` (compañero) por separado; `EditorMazo` muestra un selector
  de imagen por cada uno de los dos.
- `docs/decisiones/0018`: por qué el problema real era una imagen
  compartida entre las dos cartas, no que faltara poder apuntar el daño del
  compañero (que ya funcionaba); y por qué el sector se abre en vez de
  restar directamente.
- 6 pruebas nuevas, más verificación con un navegador real: un mazo de
  "Thrasios, Triton Hero" + "Tymna the Weaver" con dos botones "Cambiar
  imagen" independientes, daño al compañero sin tocar el principal, y el
  sector abriéndose en sus dos mitades al mantenerlo pulsado — sin errores
  de consola.

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

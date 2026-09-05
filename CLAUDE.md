# Mesa Commander

Contador de vidas para Magic: The Gathering en formato Commander, con registro de
partidas y clasificación. Cubre lo que hace una app de contador al uso y además
guarda cada partida al terminarla, que es lo que ninguna de ellas hace.

## Estado: dos apps mientras dura la migración

El proyecto nació como un único `app.html` sin dependencias ni build, pensado
para abrirse a doble clic desde el móvil por `file://`. Desde la Fase 0 está en
migración a una app React + TypeScript + Vite + Capacitor en `src/`, según el
plan documentado en `docs/decisiones/0001-stack-react-ts-vite-capacitor.md`.

Con la Fase 3 completa, **la app nueva ya es funcionalmente equivalente a
`app.html`**: motor de partida, almacenamiento, pantalla previa, tablero y
registro (con su copia de seguridad) están portados. Todo el desarrollo nuevo
va en `src/`; `app.html`, en la raíz, se mantiene sin tocar como referencia y
porque `pruebas/` sigue corriendo contra él, hasta que la Fase 5 (Capacitor +
PWA) la sustituya como lo que de verdad se instala en un móvil. `docs/legado/`
guarda además una copia congelada del `app.html` de antes de empezar a migrar,
para poder comparar sin depender de que la raíz no cambie.

## Cómo se ejecuta

### La app nueva (donde vive el desarrollo)

```bash
npm install
npm run dev              # servidor de desarrollo (http://localhost:5173)
npm run build            # tsc -b && vite build, genera dist/
npm run test:vitest      # toda la suite de Vitest
npx vitest run tests/registro   # solo un directorio o archivo
npm run lint             # oxlint sobre src/ y tests/ — se mantiene en 0 avisos
```

Hace falta Node 22: el proyecto lo fija con `volta pin` (ver ADR 0003), así
que si tienes Volta instalado se activa solo al entrar en la carpeta.

### La app antigua (`app.html`)

Sigue sin compilación ni dependencias: se abre a doble clic en cualquier
navegador moderno.

```bash
npm test                          # todas las pruebas contra app.html
node pruebas/ejecutar.js corona   # solo las que contengan "corona" en el nombre
```

## Por qué la migración

`app.html` en un único archivo era deliberado: los `import` de módulos ES no
funcionan bajo `file://`, así que partirlo sin más no era una opción. Pero
crecer sin build también tiene techo — no hay tests aislables sin simular el
DOM a mano, no hay forma estándar de cachear una API externa (Scryfall),
y no hay app instalable de verdad. La razón completa, con las alternativas
que se descartaron (React Native, Flutter, seguir en vanilla), está en
`docs/decisiones/0001-stack-react-ts-vite-capacitor.md`.

## Convenciones

Se aplican por igual a `app.html` y a `src/`:

- **Todo en español**: nombres de funciones, variables, comentarios y textos.
  `pintarTablero`, `guardarPartidas`, `dosComandantes`. Solo quedan en inglés los
  nombres de cartas y comandantes, porque así es como se buscan.
- **Comentarios que explican el porqué**, no el qué. Si un comentario repite lo que
  dice el código, sobra.
- **Reglas de Magic verificadas.** Antes de dar por buena una regla, comprobarla en
  las Reglas Completas o en Scryfall, no de memoria. Las decisiones que dependen de
  una regla llevan su número en el comentario (por ejemplo la 903.10a).
- **Cada decisión no trivial lleva su ADR** en `docs/decisiones/NNNN-titulo.md`
  (plantilla en `0000-plantilla.md`), escrita al tomar la decisión, no al
  final. `docs/CHANGELOG.md` lleva además una entrada por cada commit
  funcional, bajo `[Unreleased]` hasta que se cierra una fase.

Específico de cada app:

- **`app.html` sigue sin dependencias.** Los iconos son SVG en línea (objeto
  `ICONOS` + función `ic()`), no una librería.
- **`src/` tiene las dependencias mínimas que pide el stack** (React, Vite,
  Capacitor, Vitest/Testing Library, oxlint — ver `package.json`), pero
  sigue el mismo principio: nada que no gane su sitio. Los iconos son el
  mismo SVG en línea, ahora como mapa de rutas (`componentes/icono/mapaIconos.ts`)
  más un componente `<Icono>`.

## Estructura de `src/` (la app nueva)

1. **`motor/`** — el motor de partida en TypeScript puro: `tipos.ts`,
   `utilidades.ts`, `jugador.ts`, `partida.ts`, `vida.ts`, `deshacer.ts`,
   `migraciones.ts`, `clasificacion.ts`. Sin DOM, sin almacenamiento, sin
   pintado: cada función recibe un `Juego` y devuelve uno nuevo (ver ADR 0004).
2. **`almacenamiento/`** — adapter pattern sobre el mismo contrato que tenía
   `window.storage` en el original: `tipos.ts` (`AlmacenPersistente`),
   `claves.ts`, `adaptadorMemoria.ts` (tests), `adaptadorCapacitor.ts`
   (`@capacitor/preferences`, ver ADR 0005), `repositorio.ts` (leer/guardar
   partidas, perfiles, config y la partida en curso, con migración incluida).
3. **`componentes/`** — `icono/` (el mapa de SVGs y `<Icono>`), `comunes/`
   (`<Modal>`, `<AvisoProvider>`/`useAviso`, `<Pips>`, `<Desplegable>`,
   `fondoIdentidad`), `mesa/` (disposiciones de mesa, colores, perfiles y los
   componentes de la pantalla previa: `EditorMazo`, `EditorPerfil`,
   `ModalGestionarPerfiles`, `ModalDado`, `ModalElegirAsiento`, `VistaMesa`).
4. **`contextos/`** — `AlmacenContexto`/`useAlmacen` (el almacén activo,
   sustituible en tests), `usePerfiles`, `useConfig`.
5. **`tablero/`** — todo lo del tablero de juego: `useJuegoEnCurso` (el store,
   ver ADR 0008), `useArrastrarCorona`, `useMantenerPulsado`,
   `useBordesAsientos` (ver ADR 0009), `bordes.ts`, `reloj.ts`, `sonido.ts`,
   `layouts.ts`, `constantesUI.ts`, y los componentes `Asiento`, `Hub`,
   `ModalPanelDano`, `ModalMenuAsiento`, `ModalesPartida`.
6. **`registro/`** — `validar.ts`, `construirPartida.ts`, `calcularJugadores.ts`
   (clasificación derivada), `filtrarPartidas.ts` (búsqueda de la ficha),
   `copiaSeguridad.ts`, `datosDemo.ts` (las partidas y perfiles de ejemplo),
   `constantes.ts` (`RES`), y los componentes `Ranking`, `Ficha`,
   `ModalFormularioPartida`, `ModalCopiaSeguridad`.
7. **`paginas/`** — `Previa.tsx`, `Tablero.tsx`, `Registro.tsx`: cada una junta
   los hooks y componentes de arriba en una pantalla completa.
8. **`App.tsx`** (navegación entre las tres pantallas), **`main.tsx`**,
   **`index.css`** (portado de app.html sección a sección, con las mismas
   variables de diseño y los mismos *container queries* para la rotación de
   asientos).

`src/red/` y `src/sync/` no existen todavía: llegan en la Fase 4 (Scryfall)
y la Fase 6 (Supabase), respectivamente.

## Estructura de `app.html` (la app antigua, sin cambios)

El script sigue dividido en secciones numeradas con comentarios de banda:
utilidades, almacenamiento (`window.storage`), datos de ejemplo y
migraciones, modales y avisos, perfiles y sus mazos, pantalla previa, motor
de partida, tablero, terminar y volcar al registro, registro, y navegación.

## Invariantes que conviene no romper

Valen para las dos apps — donde el original tenía una función global, la
nueva tiene un módulo o un hook; la regla de fondo no ha cambiado:

- **El registro es la fuente de la verdad.** La clasificación no se guarda: se
  recalcula siempre desde las partidas — `calcularJugadores()` en
  `app.html`, o `src/registro/calcularJugadores.ts` en la app nueva. No
  añadir contadores acumulados en paralelo.
- **El daño de comandante va por comandante, no por jugador.** Las claves de
  `jugador.dmg` (`Jugador['dmg']` en `motor/tipos.ts`) son `"asiento:hueco"`,
  donde hueco es 0 o 1 según sea el comandante principal o su compañero. Un
  jugador aparece en su propia lista de fuentes, porque si le roban el
  comandante puede morir por su propio daño (regla 903.10a).
- **`turno === null` significa que la partida espera** a que alguien toque su
  asiento para arrancar (`JUEGO.turno` en el original, `Juego['turno']` en
  `motor/tipos.ts`). Cualquier función que use el jugador del turno actual
  tiene que contemplar ese caso.
- **El tiempo del turno se acumula en `acum`.** Pausar no cierra el turno; si
  se cierra, el récord de turno más largo sale partido en trozos.
- **Toda mutación de estado pasa por un snapshot antes de mutar**, o el botón
  de deshacer se queda cojo. En el original eso era llamar a `foto()` antes de
  cada cambio; en la app nueva, las funciones del motor ya no llaman a
  `foto()` ellas mismas (ver ADR 0004) — es `useJuegoEnCurso` quien decide,
  con `mutar()` (fotografía) o `mutarSinFoto()` (no fotografía) según lo que
  hiciera la función equivalente del original, nunca por defecto (ver ADR
  0008). En los cambios de vida se agrupa con `{agrupar: true}` para que las
  pulsaciones largas queden en un solo paso.
- **Los datos guardados se migran, no se descartan.** `migrarJuego` y
  `migrarPerfiles` (en `motor/migraciones.ts`, o las funciones homónimas del
  original) convierten los formatos antiguos al leer. Al cambiar una
  estructura, ampliar esas funciones, no descartar lo guardado.
- **Un hook que mide el DOM y guarda el resultado en estado tiene que
  comparar antes de llamar a `setState`.** Un efecto sin lista de
  dependencias que siempre produce un valor nuevo dispara un bucle de
  renders (ver ADR 0009).
- **Una vista que puede quedar apuntando a algo que ya no existe** (la ficha
  de un jugador borrado, por ejemplo) **se corrige durante el render, no en
  un `useEffect`** — no hay nada externo que sincronizar, solo estado
  derivado de las propias props (ver ADR 0010).

## Pruebas

### La app nueva

`tests/` (Vitest) sigue la misma forma que `src/`: `tests/motor/` no monta
DOM (son funciones puras), el resto usa Testing Library con `jsdom`. Cada
pantalla completa tiene además una prueba de integración en
`tests/paginas/` que monta la pantalla entera con un almacén en memoria.

Lo que ningún test automático cubre, y hay que mirar a mano en el navegador:
el aspecto visual, los giros de 90° y 270° de los asientos (usan *container
queries*, que jsdom no calcula), el sonido de la alarma, el arrastre real con
el dedo, y — cuando llegue la Fase 5 — la instalación como PWA y el
comportamiento nativo bajo Capacitor. La verificación puntual con un
navegador real (Playwright, instalado y desinstalado sin quedar como
dependencia) ha encontrado ya varios bugs reales que los tests con DOM
simulado no veían (ver ADR 0008 y 0009).

### La app antigua

`pruebas/` sigue con sus nueve archivos, cada uno montando su propio DOM
falso contra `app.html` (duplicación ya señalada como deuda, y que ya no
merece la pena resolver: esta suite se retira con la propia `app.html`
cuando llegue la Fase 5). `pruebas/disposiciones.test.js` tiene un fallo
previo a esta migración — una ruta absoluta de otro equipo escrita a mano en
vez de resolverse con `__dirname` — que no es una regresión de ningún cambio
de aquí y no se ha tocado.

## Pendiente

- **Fase 4** — integrar Scryfall (autocompletado de comandantes, identidad de
  color e imagen) con TanStack Query, en `src/red/`, y offline-first de
  verdad: caché servida → introducción manual → aviso no bloqueante, nunca
  bloquear el juego por falta de red.
- **Fase 5** — shell de Capacitor y PWA (manifiesto + service worker):
  cuando esté lista, `app.html` y `pruebas/` se retiran.
- **Fase 6** — sincronización multi-dispositivo con Supabase (privado por
  usuario con Row Level Security; esbozo en `src/sync/README.md` cuando
  exista).
- Planechase y Archenemy, cargando planos y esquemas desde la API de Scryfall
  en vez de copiar el texto de las cartas, que es propiedad de Wizards.
- Quién elimina a quién, para poder mirar rivalidades en el registro.

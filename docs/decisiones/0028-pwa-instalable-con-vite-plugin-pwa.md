# 0028. La app se puede instalar como PWA, con caché real para trabajar sin conexión

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Con la Fase 4 ya encarrilada, el usuario preguntó si la app se podía
empaquetar e instalar en un móvil. La Fase 5 (pendiente, ver `CLAUDE.md`)
contempla dos caminos, ya apuntados en la ADR 0001: una PWA instalable
(manifiesto + *service worker*) y una app nativa de verdad vía Capacitor
(`npx cap add android`, que ya tiene `capacitor.config.ts` desde la Fase 0
pero necesita Android Studio para compilarse). La PWA es el camino más corto
—no hace falta ningún SDK nativo instalado— y cubre de sobra la necesidad
inmediata de "instalar esto en mi móvil y poder abrirlo sin depender de que
el ordenador esté sirviendo la página".

## Decisión

- **`vite-plugin-pwa`** (`generateSW`, `registerType: 'autoUpdate'`) genera
  el manifiesto y el *service worker* en cada `npm run build`, sin tocar el
  código de la app: la app queda instalable ("Añadir a inicio" en
  Android/iOS) y cada build nuevo sustituye al *service worker* anterior
  solo, sin pedir confirmación.
- **Los iconos parten del mismo dibujo que ya llevaba `public/favicon.svg`**
  (fondo morado `#7e14ff`, corona blanca — el mismo *path* que
  `ICONOS.corona`), exportados a PNG en tres tamaños:
  `icon-192.png` y `icon-512.png` (`purpose: 'any'`, con las esquinas
  redondeadas ya en el propio PNG, igual que el favicon) y `maskable-512.png`
  (fondo a sangre completa, sin redondear, con la corona encogida al 60% y
  centrada — para que Android pueda recortarlo en cualquier forma sin
  cortar el dibujo). Generados una vez con Playwright renderizando el SVG a
  distintos tamaños, no con ninguna dependencia nueva del proyecto.
- **Safari necesita sus propias etiquetas** (no lee `manifest.json` para el
  icono de "Añadir a inicio" ni la barra de estado): `apple-touch-icon`,
  `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` y
  `apple-mobile-web-app-title` en `index.html`, además del manifiesto.
- **El *service worker* cachea también las respuestas de Scryfall**
  (`api.scryfall.com` con `StaleWhileRevalidate`, `cards.scryfall.io` —las
  ilustraciones— con `CacheFirst`) y las fuentes de Google Fonts. Esto va
  más allá de cachear solo el cascarón de la app (JS/CSS/HTML, que
  `generateSW` precachea por defecto): sin esto, la identidad de color y la
  imagen de un comandante ya consultado se perderían en cuanto se recargara
  la página sin conexión, porque la caché de TanStack Query (ADR 0012) vive
  solo en memoria. Con las dos cachés together, la app cumple de verdad el
  "offline-first" que persigue la Fase 4: caché servida incluso tras
  recargar en frío, sin conexión.
- **Sin bloquear la orientación** (`orientation` no se fija en el
  manifiesto): la app ya se adapta a portrait y landscape con *container
  queries* (rotación de asientos, ADR 0009), así que forzar una orientación
  desde el manifiesto solo quitaría libertad sin ganar nada.

## Alternativas consideradas

- **Registrar el *service worker* a mano** (sin `vite-plugin-pwa`),
  escribiéndolo directamente. Se descarta: reinventar el precaché del
  cascarón de la app y la invalidación en cada build es exactamente el
  trabajo que ya resuelve Workbox (que usa el propio plugin) de forma
  probada; no hay ninguna necesidad de este proyecto que justifique no
  usarlo.
- **`registerType: 'prompt'`** (pedir confirmación antes de activar una
  versión nueva del *service worker*) en vez de `autoUpdate`. Se descarta
  por ahora: añadiría una interfaz de "hay una versión nueva, ¿recargar?"
  que esta app todavía no tiene, y para el tamaño actual del proyecto
  actualizarse solo es un compromiso razonable — se puede revisar si algún
  día un cambio de versión resulta disruptivo a media partida.
- **Generar los iconos con una librería de conversión SVG→PNG** (`sharp`,
  `resvg-js`) como dependencia del proyecto. Se descarta: son tres archivos
  estáticos que no vuelven a cambiar salvo que cambie el propio icono de la
  app: renderizarlos una vez con Playwright (ya se usa en este proyecto para
  verificación visual, nunca como dependencia real) y guardarlos en
  `public/icons/` evita añadir una dependencia de compilación de imágenes
  solo para este momento puntual.

## Consecuencias

- Verificado con un navegador real sirviendo el build de producción
  (`vite preview --host`, no `vite dev`: el *service worker* no se registra
  en modo desarrollo salvo que se active `devOptions.enabled`): el
  manifiesto se sirve con sus tres iconos, el *service worker* llega a
  `activo`, y recargando la página con la conexión cortada del todo
  (`context().setOffline(true)`) la app sigue arrancando y pintando la
  pantalla previa con normalidad.
- Queda pendiente el resto de la Fase 5: el *shell* nativo de Capacitor
  (`npx cap add android`, que exige Android Studio instalado para
  compilarlo) para quien quiera un `.apk` de verdad en vez de una PWA. Hasta
  que ese camino esté completo, `app.html` y `pruebas/` se quedan donde
  están, tal como ya anotaba `CLAUDE.md`.
- Lo que ningún test automático cubre y conviene mirar a mano en un móvil
  real: que el diálogo de "Instalar app"/"Añadir a inicio" aparece solo,
  que el icono se ve bien en la pantalla de inicio (con las formas de
  recorte de Android: círculo, "squircle", etc.), y que abrir la app
  instalada no muestra la barra de direcciones del navegador.

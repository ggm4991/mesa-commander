# 0015. La ilustración del asiento se orienta con el jugador, y se puede elegir la edición

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

Tras el primer commit que puso la ilustración del comandante de fondo en el
asiento (ADR 0014), el propio usuario probó la app y señaló dos cosas:

1. El fondo no giraba con el asiento — en una mesa de 3+ jugadores, donde
   cada hueco se rota hacia quien se sienta ahí (90°/180°/270°, ver
   `Asiento.tsx` y sus *container queries*), la ilustración se quedaba
   siempre "de pie" respecto a la pantalla en vez de hacia el jugador,
   mientras que el resto del contenido del asiento (nombre, vida, botones)
   sí giraba.
2. Una misma carta tiene arte distinto según la reimpresión, y quería poder
   elegir cuál usar en vez de que la app decidiera siempre la "de
   referencia" (la que Scryfall marca como tal, normalmente la primera
   edición o la más representativa).

## Decisión

- **`.bg` (el fondo del asiento) gira con las mismas reglas que `.inner`**
  (el contenido), una a una: `rotate(180deg)` para 180°, y para 90°/270° el
  mismo truco de tamaño con unidades de *container query* (`100cqh`/
  `100cqw`) que ya usaba `.inner` para intercambiar ancho y alto antes de
  girar. `background-size:cover` sigue calculándose sobre ese tamaño ya
  intercambiado, así que la imagen sigue llenando el hueco sin deformarse.
- **`src/red/scryfall/cliente.ts` añade `buscarImpresiones()`** (todas las
  ediciones impresas de un nombre, más recientes primero, vía
  `/cards/search?...&unique=prints`) **y `buscarPorId()`** (una carta
  concreta por su id de Scryfall, para volver a pedir esa edición exacta).
- **`Mazo`/`Asiento`/`Jugador` llevan un `imagenId`** (cadena vacía si no se
  ha fijado ninguna): la edición elegida a mano, que viaja desde el editor
  de mazos hasta el asiento en juego igual que ya viajaban `c`/`c2`/`col`.
  `useImagenComandante` consulta por `imagenId` si lo hay, y si no, por
  nombre exacto como hasta ahora — comparten el mismo mecanismo de caché.
- **Elegir una edición es una acción explícita** en un modal aparte
  (`ModalElegirImpresion`, abierto desde `SelectorImagenComandante` en
  `EditorMazo`), con una miniatura por edición y un botón para volver a la
  "de referencia". **Cambiar el nombre del comandante limpia la edición
  fijada**: una edición fijada es de una carta concreta, y seguir
  aplicándola a un nombre distinto mostraría el arte equivocado.

## Alternativas consideradas

- **Rotar la imagen con una transformación CSS distinta a la de `.inner`**
  (por ejemplo, con `image-orientation` o rotando solo el `background-image`
  vía un `<img>` interno). Se descarta: `.inner` ya resuelve el problema de
  "intercambiar ancho y alto antes de girar" para que el contenido llene el
  hueco sin recortarse, y `.bg` necesita exactamente esa misma geometría —
  reutilizar las reglas es más simple y menos propenso a errores que
  inventar una nueva.
- **Guardar la URL de la imagen directamente en el mazo**, en vez de un id
  para volver a pedirla. Se descarta: las URLs de Scryfall pueden caducar o
  cambiar de host, mientras que el id de la carta es estable y además deja
  que la app seguir beneficiándose de la caché de TanStack Query igual que
  con el nombre.

## Consecuencias

- Verificado con un navegador real: crear un mazo de "Edgar Markov", abrir
  "Cambiar imagen" (7 ediciones distintas encontradas, incluida una
  ilustración de regalo de juez), elegir una distinta a la de referencia,
  sentar a ese perfil, girar su asiento 90° y comprobar que la ilustración
  gira con el nombre y la vida — sin errores de consola.
- Al implementar la rotación de `.bg` para 90°/270° apareció un fallo real
  de orden de declaraciones CSS: `inset: auto` puesto *después* de
  `top`/`left` en la misma regla los reseteaba a `auto`, dejando el fondo
  sin imagen visible (aunque sin fallar visualmente los tests con jsdom,
  que no renderizan CSS de verdad). Solo aterrizó al mirarlo en un
  navegador real — recordatorio de por qué esta clase de cambios de
  `index.css` necesitan esa comprobación, no solo los tests con DOM
  simulado.

# 0025. El hub cabe entero en su hueco, el delta gira con el asiento, y el daño de comandante pasa a ser un popup

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Al probar la barra del hub de la ADR 0024, el usuario señaló tres problemas
más:

1. **El hub seguía leyéndose como algo que flota por encima**, no como la
   barra de separación en sí. La causa era un desajuste de medidas: la barra
   mide 62px de alto (2 bordes de 1px + 5px de relleno arriba y abajo + los
   50px de sus botones), pero el hueco vertical (`row-gap`) solo tenía 44px
   — los 18px que sobraban se derramaban 9px hacia cada lado, invadiendo el
   borde de los asientos de arriba y de abajo.
2. **El indicador flotante de `+N`/`-N` (`.delta`) quedaba debajo del
   cuadrado de daño** en los asientos de arriba. `.delta` era hijo directo de
   `.seat`, no de `.inner`, así que nunca heredaba el
   `transform: rotate(180deg)` que sí aplica `.seat[data-rot='180'] .inner` —
   se quedaba siempre anclado a la misma esquina de la pantalla en vez de
   girar con el resto del contenido. En un asiento rotado, esa esquina fija
   coincide justo con donde termina pintándose el cuadrado de daño (que sí
   gira), y como `.delta` no tenía `z-index` propio y se pintaba antes que
   `.inner` en el DOM, quedaba tapado por él.
3. **El cuadrado de daño, siempre visible, competía por sitio con el resto
   del asiento** — el pedido explícito del usuario fue moverlo a un botón
   bajo la vida que lo abra como un popup pequeño, cerrándose solo al tocar
   fuera.

## Decisión

- **`row-gap` sube de 44px a 64px**, con margen para los 62px reales de la
  barra: ahora el hub cabe entero en su hueco sin invadir ningún asiento.
- **`.delta` pasa a ser hijo de `.inner`** (antes lo era de `.seat`), con
  `z-index: 7` añadido. Al ser descendiente de `.inner`, hereda el giro de
  `.seat[data-rot='180']` igual que el resto del contenido del asiento, y el
  `z-index` lo deja siempre por delante de cualquier otra cosa del asiento,
  sea cual sea el orden en el DOM.
- **El cuadrado de daño deja de estar siempre visible.** En su lugar:
  - Un botón (`Daño de comandante`, con el icono de espadas) aparece siempre
    debajo de la fila de vida, en el sitio donde antes vivía el cuadrado.
  - Al tocarlo, el cuadrado aparece como un popup centrado sobre el propio
    asiento (`.dano-popup`, `position:absolute;inset:0` con
    `display:grid;place-items:center`), con el mismo `.dano-cuadrado` de
    siempre dentro.
  - El popup **solo se cierra al tocar fuera de él** — mismo mecanismo de
    `pointerdown` en `document` que ya usaba `PanelDanoExpandido` (ADR
    0020), aquí un nivel más arriba, envolviendo el cuadrado entero. Al
    cerrarlo también se limpia `sectorAbierto`, para no reabrir de golpe el
    panel expandido de un sector si se vuelve a abrir el popup más tarde.
  - Al dejar de ocupar sitio fijo, ya no hace falta ocultarlo por completo en
    asientos muy bajos (`@container (max-height: 150px) { .fila-dano {
    display: none } }` desaparece): el botón siempre cabe, y el popup, al
    ser un overlay, no compite por espacio con el resto del asiento.

## Alternativas consideradas

- **Insertar una fila real de la rejilla para el hub**, en vez de un hueco
  vacío (`row-gap`) con la barra flotando encima por posición absoluta. Se
  descarta por el mismo motivo que ya dio la ADR 0023: tocar las 11
  disposiciones de `DISPOS`/`LAYOUTS` para reservarles una fila explícita es
  mucho más costoso que ajustar una sola medida, y con el hueco ya
  dimensionado a la medida exacta de la barra el resultado visual es
  idéntico. Queda como límite conocido: en disposiciones de 3 o más filas
  sin `centro` propio (por ejemplo "En columna" con 3+ jugadores, o el
  reparto de 5), el hub seguiría centrándose en el punto medio de toda la
  rejilla en vez de en el hueco exacto entre el grupo de arriba y el de
  abajo — no es el caso que ha probado el usuario, pero queda anotado para
  si aparece.
- **Cerrar el popup de daño también por inactividad**, igual que el panel
  interno de cada sector. Se descarta: el usuario pidió explícitamente que
  solo se cierre al tocar fuera, no con un temporizador — tiene sentido,
  porque a diferencia del panel de un sector (donde un cierre accidental
  solo obliga a mantener pulsado otra vez), aquí cerrarlo de más interrumpe
  antes de tiempo la consulta del cuadrado entero.

## Consecuencias

- Verificado con un navegador real en una mesa de 2: la barra del hub ya no
  invade ningún asiento, el indicador `+1` aparece girado y por delante del
  resto del contenido en el asiento de arriba, y el popup de daño se abre
  centrado sobre el asiento y se cierra correctamente al tocar fuera.
- Las pruebas que antes daban por hecho que `.dano-cuadrado` estaba siempre
  en el DOM ahora abren el popup primero (tocando el botón "Daño de
  comandante") antes de buscar sus sectores.

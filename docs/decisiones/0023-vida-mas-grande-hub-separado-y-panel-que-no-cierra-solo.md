# 0023. Vida más grande, hub separado por hueco, sin nombres en el asiento y panel que no se cierra al primer toque

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Tras probar el tablero con el hub central (ADR anteriores de la Fase 4), el
usuario pidió cuatro ajustes en la misma ronda:

1. El número de vida, aunque ya escala con `cqh` (ADR 0021), le seguía
   pareciendo pequeño como dato principal de la pantalla.
2. El hub (reloj, pausa, deshacer, menú) vivía flotando encima del
   contenido de los asientos, en vez de tener su propio espacio: en
   ciertas disposiciones podía llegar a solaparse con la parte superior o
   inferior de un asiento.
3. El nombre del jugador y el del comandante ya no aportan nada en
   pantalla: el fondo del asiento es la ilustración del propio comandante
   (ADR 0014) y el hub ya muestra de quién es el turno.
4. Bug real en `PanelDanoExpandido` (ADR 0020): el panel ampliado de daño
   se cerraba después de un único toque de sumar o restar, obligando a
   mantener pulsado otra vez para el siguiente punto — el usuario esperaba
   poder sumar o restar varias veces seguidas sin que el panel se cerrara
   solo.

## Decisión

- **`.life` crece de `clamp(38px, 11cqh, 84px)` a `clamp(46px, 15cqh,
  108px)`** (y su variante para asientos bajos, de `9cqh` a `12cqh`),
  manteniendo `cqh` como unidad (ADR 0021) para que siga sin desbordar en
  asientos pequeños.
- **El hub deja de flotar sobre los asientos y pasa a vivir en un hueco
  real**: en vez de tocar cada una de las variantes de `DISPOS`/`LAYOUTS`
  (11 disposiciones distintas) para reservarle un carril propio, se
  aumenta el `gap` de `.board` de 6px a 44px. El hub se sigue centrando
  con `position:absolute` sobre ese hueco, que ahora es lo bastante ancho
  como para que no le haga falta invadir ningún asiento.
- **Se retiran `.seat-name` y `.seat-cmd`** de `Asiento.tsx` (y sus reglas
  CSS, incluida la que los ocultaba en asientos bajos). El nombre del
  jugador se conserva solo como `aria-label` del botón de opciones del
  asiento, para no perder accesibilidad.
- **`PanelDanoExpandido` deja de cerrarse al sumar o restar**: los
  manejadores de esos dos botones ya no llaman a `onCerrar`, solo
  reinician el temporizador de autocierre (`reiniciarAutocolapso`, ya
  existente desde la ADR 0020 para el cierre por inactividad). El panel
  ahora solo se cierra por dos vías: tocar fuera de él, o que pasen
  `MS_AUTOCOLAPSO` (3s) desde el último toque — sumar o restar cuenta como
  toque, así que una serie de pulsaciones seguidas mantiene el panel
  abierto todo el tiempo que dure esa serie.

## Alternativas consideradas

- **Dar a cada una de las 11 disposiciones un hueco central explícito**
  (una fila o columna extra reservada en la rejilla) en vez de subir el
  `gap` general. Se descarta por coste: habría que revisar caso por caso
  cada disposición para colocar ese hueco de forma consistente, cuando
  subir el `gap` consigue el mismo resultado en una sola línea y ya
  funciona porque el hub siempre se centra sobre el hueco entre asientos.
- **Cerrar el panel tras cada toque pero reabrirlo automáticamente** si se
  vuelve a tocar el mismo sector enseguida. Se descarta: añadía una
  ventana de tiempo arbitraria y el usuario pidió explícitamente que
  "vuelva a su tamaño [normal] si pasan unos segundos o si pulso en otra
  parte", no que se cierre entre toques.

## Consecuencias

- Verificado con un navegador real en mesas de 2 y de 4 jugadores: el hub
  no se solapa con ningún asiento en ninguna de las dos, el número de vida
  es claramente más grande, y no aparece ni el nombre ni el comandante en
  el asiento.
- Verificado también que sumar dos veces seguidas sobre el panel ampliado
  lo deja abierto y acumula el daño correctamente (iba a 2 tras dos toques
  de +1), y que sigue cerrándose solo pasados los 3 segundos de
  inactividad o al tocar fuera.
- Si en el futuro se añade una disposición con asientos muy próximos entre
  sí, conviene revisar si 44px de `gap` sigue siendo suficiente para el
  hub, o si esa disposición necesita su propio ajuste.

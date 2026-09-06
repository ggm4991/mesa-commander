# 0037. El hub ocupa menos, y el turno se marca con el borde del asiento

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Dos peticiones más tras usar la app: que la barra central (el hub del
tiempo) ocupara menos, para dejarle más sitio a los asientos; y que la
insignia de texto "Su turno" desapareciera, ya que el nombre de quien juega
se lee de sobra en el propio reloj — sustituyéndola, si acaso, por el borde
del asiento resaltado en el mismo dorado que ya tenía esa insignia.

Al reducir el tamaño del hub (botones, tipografía, relleno) apareció un
fallo real ya existente desde la ADR 0026: `Tablero` medía el alto
necesario del hub leyendo `.hub.getBoundingClientRect().height` — pero
`.hub` ya tenía aplicado por `style` el alto de la medición **anterior**,
así que la medición se retroalimentaba con su propio resultado previo. Una
vez que el alto subía (por ejemplo, al girar el reloj a 90°/270°, ADR
0033), nunca podía volver a bajar, aunque el contenido encogiera después:
la única forma de que esto no se notara era que el hub solo hubiera crecido
hasta ahora, nunca encogido — hasta esta misma petición.

## Decisión

- **El hub se reduce en bloque**: los tres botones redondos pasan de 50px a
  40px (con sus iconos de 22 a 18), el botón del reloj reduce relleno,
  ancho y alto mínimos, y sus tres líneas de texto (nombre, tiempo, estado)
  bajan de tamaño. El alto real baja de ~69px a ~50px sin girar.
- **`medirHub` deja de leer el alto de `.hub`** (contaminado por el propio
  `style` que esta misma función le puso la vez anterior) **y pasa a medir
  el contenido de verdad**: el botón del reloj y un botón redondo
  cualquiera (ninguno de los dos cambia de tamaño por culpa del alto de su
  padre), sumándoles el relleno y el borde de `.hub` leídos de su CSS
  computado, nunca de su caja ya ajustada. Así puede tanto crecer (reloj
  girado) como encoger (menos contenido) sin quedarse pegado al valor más
  alto que haya tenido alguna vez.
- **La insignia `.badge.turn` ("Su turno") desaparece**, y el asiento de
  quien tiene el turno pasa a llevar un borde dorado (`outline: 3px solid
  var(--brass)`) — mismo tratamiento y mismo color que ya usa
  `.seat.destino` para marcar dónde caería la corona al arrastrarla.

## Alternativas consideradas

- **Dejar la insignia y solo añadir el borde**, por si acaso. Se descarta:
  el usuario fue explícito en que la insignia "no hace falta" — el nombre
  ya está en el reloj, y mantener las dos formas de marcar lo mismo sería
  redundante sin motivo.
- **Corregir el desborde sin tocar la causa raíz** (por ejemplo, forzando
  un mínimo en `medirHub` para que nunca "vuelva a bajar de lo que ya
  tenía"). Se descarta: eso oculta el síntoma concreto de esta ronda pero
  deja la misma retroalimentación seguir rompiendo cualquier caso futuro en
  el que el contenido del hub deba encoger.

## Consecuencias

- Verificado con un navegador real: el hub sin girar mide 50px (antes 69px,
  medido directamente con `getBoundingClientRect`, no estimado); girado a
  90°/270° sigue midiendo lo que hace falta (112px) y el botón del reloj
  sigue cabiendo dentro, sin desbordar.
- Verificado con un navegador real que el asiento de quien tiene el turno
  lleva el borde dorado y ya no aparece "Su turno" en ningún sitio; al
  pasar el turno, el borde se mueve al asiento siguiente y desaparece del
  anterior.
- 2 pruebas actualizadas (antes comprobaban el texto "Su turno"; ahora
  comprueban la clase `turno` del asiento).

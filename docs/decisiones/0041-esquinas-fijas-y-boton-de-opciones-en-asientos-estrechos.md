# 0041. Las esquinas fijas y el botón de opciones se encogen juntos en asientos muy estrechos

Fecha: 2026-10-20
Estado: Aceptada

## Contexto

Siguiendo con la revisión del aspecto visual del asiento pedida tras el
análisis de LifeTap (ver ADR 0039 y 0040), medí con un navegador real (no
solo a ojo sobre una captura) el tamaño de los botones en el asiento más
estrecho que tiene la app hoy: la disposición "6a" (3 columnas), a 132px de
ancho por asiento. `getBoundingClientRect()` sobre todos los botones
tocables de un asiento encontró un solape real de 38×32px entre el botón de
opciones (`.more.solo`, la "...") y las esquinas fijas (`.esquinas-fijas`:
tiempo pasado y jugadas rehechas).

La causa: `.esquinas-fijas` vive en `position:absolute; top:8px; left:8px`
(ADR 0035), independiente del flujo normal; `.more.solo` vive dentro de
`.seat-top`, en flujo normal, empujado al lado contrario con
`margin-left:auto`. Los dos sistemas no se conocen entre sí — cada uno
confía en que, sumados, quepan en el ancho del asiento. Con 408px de ancho
(2 jugadores) sobra sitio de sobra; con 132px (6 jugadores a 3 columnas) no.

Antes de decidir la solución comprobé dos alternativas con el mismo
navegador y las descarté con datos, no a ojo:

- **Mover `.esquinas-fijas` más abajo** (más alto en la fila de arriba): en
  un asiento tan estrecho también escasea el alto — `.seat-top` y
  `.life-row` se tocan sin ningún hueco entre ellos, así que cualquier
  desplazamiento vertical cae encima de uno de los dos.
- **Apilar las dos esquinas en vertical** (`flex-direction:column`) en vez
  de en horizontal: reduce el ancho necesario, pero el asiento es tan alto
  (muchas filas, vida grande) que la pila resultante choca con los botones
  de +/- vida de `.life-row`, que ocupan todo su alto pegados al mismo
  borde.

## Decisión

Bajo `@container (max-width: 170px)` (el mismo contenedor por tamaño que ya
usa `.seat` desde la ADR 0021, ahora también por ancho): las dos esquinas
fijas y el botón de opciones se encogen juntos — relleno, tipografía e
iconos más pequeños en las tres, y `.more.solo` baja de 44px a 34px de
ancho — lo justo para que los tres quepan uno al lado del otro sin tapar
nada, verificado de nuevo con `getBoundingClientRect()` en los seis
asientos de "6a" y "6b" (0 solapes) y sin ningún cambio en disposiciones más
anchas (2 jugadores, sin cambios).

La regla va **después** de las reglas base de `.esquinas-fijas`/`.more` en
el archivo: misma especificidad de selector, así que sin eso la base
ganaría por orden de aparición pase lo que pase la condición del
`@container` — error real que cometí en el primer intento de esta misma
ADR y que el propio `getBoundingClientRect()` delató enseguida (la consulta
no se aplicaba pese a cumplirse la condición).

## Alternativas consideradas

Además de las dos ya descartadas arriba (mover verticalmente, apilar en
vertical): **ocultar las esquinas fijas por completo** en asientos tan
estrechos. Se descarta porque "jugadas rehechas" y "se pasó de tiempo" son
justo la clase de aviso que no conviene esconder (ver ADR 0011 sobre no
perder avisos silenciosamente) — mejor un poco más pequeño que ausente.

## Consecuencias

- Verificado con un navegador real, con medición de verdad
  (`getBoundingClientRect()` de cada botón, no solo una captura): 0 solapes
  en los seis asientos de "6a" y "6b" tras el cambio, y sin ninguna
  diferencia visible en disposiciones más anchas.
- Si en el futuro se añade otro elemento a `.seat-top` o a `.esquinas-fijas`,
  hay que volver a comprobar que la suma sigue cabiendo a 170px de ancho —
  no hay ninguna comprobación automática que avise si deja de caber.

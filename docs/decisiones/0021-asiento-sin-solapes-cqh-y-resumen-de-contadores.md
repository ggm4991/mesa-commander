# 0021. El asiento no se solapa: unidades de contenedor y un resumen de contadores

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

El usuario reportó que, con varios contadores activos a la vez (maná,
experiencia, tormenta, energía, impuesto de comandante...) más el cuadrado
de daño ya ampliado (ADR 0017-0019), el contenido de un asiento se
solapaba visiblemente — y no solo en ventanas pequeñas: también en una
resolución grande. Encontré dos causas reales, distintas entre sí:

1. **`.life` fijaba su tamaño con `clamp(38px, 11vh, 84px)`** — unidades
   de *viewport* (`vh`), relativas a la ventana entera, no al asiento. En
   una ventana grande con muchos jugadores (asientos pequeños dentro de un
   viewport grande), el número de vida intentaba renderizarse enorme
   igualmente, porque `vh` no sabe nada del tamaño real del asiento que lo
   contiene — y por eso el solape aparecía "en una resolución grande",
   justo donde menos se esperaría.
2. **La fila de contadores sueltos no tenía techo**: cuantos más contadores
   tuviera un jugador activos a la vez, más ancha (y al envolver, más alta)
   se ponía esa fila, sin ningún límite — en algún punto, su altura sumada
   a la del cuadrado de daño y la vida superaba la del asiento.

## Decisión

- **`.life` pasa a `cqh`** (unidades de *container query*, ya en uso en
  esta pantalla vía `.seat{container-type:size}`), tanto en la regla base
  como en el `@container` que ya la reducía en asientos bajos. Ahora el
  número de vida escala con el tamaño real del asiento, no con el de la
  ventana del navegador.
- **Los contadores sueltos (sin contar el maná) se agrupan en un botón de
  resumen por encima de `UMBRAL_CONTADORES_SUELTOS` (2) activos a la
  vez**: en vez de "Experiencia 3, Tormenta 5, Energía 2...", un único
  `"N más"` que abre el menú del asiento (`ModalMenuAsiento`, que ya deja
  ver y ajustar todos los contadores) — un botón con ancho fijo nunca
  puede desbordar de forma impredecible, a diferencia de una fila que
  crece con el número de contadores activos.
- **El maná se deja siempre visible, sin agrupar**, aunque haya muchos
  colores a la vez: es el contador que más se toca durante el turno (ver
  ADR 0022), así que ocultarlo detrás de un botón iría en contra de la
  propia razón de tenerlo a la vista.

## Alternativas consideradas

- **Calcular cuándo "va a solaparse" con JavaScript** (medir alturas reales
  con `ResizeObserver` y decidir en tiempo de render). Se descarta por
  complejidad: un umbral fijo de contadores activos consigue el mismo
  resultado práctico sin medir el DOM, y es exactamente lo que sugirió el
  usuario ("un botón que muestre todos los estados extra").
- **Agrupar también el maná** en el mismo botón de resumen que el resto de
  contadores. Se descarta por la razón de arriba: el maná necesita quedar
  tocable en todo momento.

## Consecuencias

- Verificado con un navegador real en el peor caso a mano: una mesa de 4,
  un jugador con dos comandantes, y los 9 contadores más los 6 colores de
  maná activos a la vez — sin ningún solape, ni en una ventana grande
  (1400×900) ni en una pequeña (480×700).
- Cualquier otro texto o número dimensionado con `vh`/`vw` dentro de un
  contenedor de tamaño consultable (`container-type`) debería revisarse
  con el mismo criterio: las unidades de viewport no saben nada del
  tamaño real del contenedor que las envuelve.

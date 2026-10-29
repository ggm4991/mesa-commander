# 0044. El número de impuesto de comandante se ve siempre, como insignia en la esquina del botón

Fecha: 2026-10-20
Estado: Aceptada

## Contexto

La ADR 0043 hizo que el número de impuesto (`Comandante ×N`) apareciera un
momento al tocar el botón, igual que el +N/-N de cambiar vida, y se apagara
solo — para no perder la información al quitarle el texto fijo al botón
(ADR 0042). El usuario pidió justo lo contrario: "el impuesto debe verse
siempre". Tiene sentido — a diferencia de un cambio de vida, puntual por
naturaleza, el impuesto de comandante es un valor que importa consultar en
cualquier momento de la partida, no solo justo después de tocarlo.

## Decisión

Se retira el mecanismo de "aparece un momento y se apaga" (estado
`mostrarTax`, temporizador) de `Asiento.tsx`: el botón vuelve a llamar
directamente a `onLanzarComandante`. El número pasa a una insignia fija en
la esquina superior derecha del botón, siempre visible — mismo
planteamiento que ya usa `.hub .pass .turno-num` para el número de turno
sobre el botón de pasar turno (ADR 0038), reutilizado aquí tal cual en vez
de inventar un segundo patrón para el mismo problema.

`.acciones-arriba` gana un `margin-top: 4px`: la insignia sobresale un poco
por encima de su botón, y `.inner` no deja hueco entre filas por defecto —
sin ese margen, llegaba a tocar el botón de opciones de `.seat-top` en los
asientos más altos y estrechos (6 jugadores a 3 columnas), verificado con
un navegador real y `getBoundingClientRect()`.

## Alternativas consideradas

Ya quedaron recogidas en la ADR 0043 (mostrar siempre vs. al tocar); esta
ADR revierte esa elección porque el propio usuario, al probarlo, prefirió
la alternativa que entonces se había descartado.

## Consecuencias

- Verificado con un navegador real: la insignia ("×3" en la captura de
  prueba) se ve siempre, sin solaparse con el botón de opciones ni con
  ningún otro control fijo, en 4 y en 6 jugadores (la disposición más
  estrecha).
- El código de `mostrarTax`/`timerTaxRef` de la ADR 0043 queda retirado por
  completo — no se deja detrás de un flag ni comentado, ver CLAUDE.md sobre
  no dejar código muerto.

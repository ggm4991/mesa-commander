# 0052. El hub ocupa todo el ancho de su fila también cuando tiene celda propia

Fecha: 2026-10-21
Estado: Aceptada

## Contexto

Con "Uno en cada lado" (4 jugadores) ya mostrando el hub en su propia fila
(ADR 0051), el usuario pidió que la barra ocupara el ancho libre que dejan
los asientos a los lados, en vez de quedarse como una píldora compacta
centrada con hueco vacío a ambos lados.

La causa: `Hub.tsx`, cuando la disposición reserva una celda para el hub
(`areaCentro`, el caso de `centro` en `disposiciones.ts`), fijaba
`justifySelf: 'center'` a mano — el hub se centraba dentro de su celda en
vez de ocuparla entera. El propio CSS de `.hub` ya está pensado para ser
una barra de lado a lado (`border-top`/`border-bottom`, sin esquinas
redondeadas, `left:0;right:0` en el caso por defecto — ADR 0024): el hueco
vacío no era el aspecto normal de la barra, era justo esa única propiedad
anulándolo.

## Decisión

Se quita `justifySelf: 'center'` del estilo que se aplica con
`areaCentro`. Sin fijarlo, el valor por defecto de un elemento de grid es
`stretch`: el hub pasa a ocupar el ancho entero de la celda que le haya
tocado, igual que ya hacía de forma nativa cuando flotaba centrado por
`position:absolute` en las disposiciones sin `centro`.

## Alternativas consideradas

Ninguna: quitar una propiedad que estaba anulando el comportamiento por
defecto (ya pensado para esto) es la solución más directa, no hacía falta
valorar otras.

## Consecuencias

- Verificado con un navegador real en `4b` y en `6b` (otra disposición con
  fila propia para el hub, ADR 0039): la barra llega de borde a borde del
  tablero en las dos, con los botones centrados dentro de ella igual que
  antes.
- Afecta a todas las disposiciones que usan `centro`, no solo a `4b` — es
  el mismo mecanismo (`areaCentro` en `Hub.tsx`), así que `3b`, `5a`-`5d` y
  `6b` quedan igual de corregidas sin tocarlas una por una.

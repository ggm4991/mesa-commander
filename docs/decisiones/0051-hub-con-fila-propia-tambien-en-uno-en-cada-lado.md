# 0051. "Uno en cada lado" (4 jugadores): el hub también pasa a tener su propia fila

Fecha: 2026-10-21
Estado: Reemplaza a la ADR 0050

## Contexto

La ADR 0050 ajustó las proporciones de `4b` dando más alto a los asientos
de arriba y abajo, interpretando la captura de LifeTap como "arriba/abajo
grandes, fila del medio pequeña". El usuario la vio e insistió en que no
había quedado bien explicada: pidió reinterpretar la captura.

Mirándola de nuevo con más cuidado: la barra de opciones de LifeTap **no
comparte fila con los dos asientos laterales** — es su propia tira,
claramente separada, entre la fila de los dos laterales y el asiento de
abajo. Los tres bloques de jugador (arriba a lo ancho, los dos laterales,
abajo a lo ancho) tienen un alto parecido entre sí; lo que antes parecía
"la fila del medio es más pequeña" en realidad era "la fila del medio más
la barra de opciones juntas", dos cosas distintas que la ADR 0050 trató
como una sola.

## Decisión

`4b` deja el patrón antiguo (`centro` compartiendo fila con los dos
laterales, a tres columnas) y pasa al mismo patrón `filaHub` que ya usan
`5a`-`5d` y `6b` desde la ADR 0039: una fila propia para el hub, insertada
esta vez **después** de la fila de los laterales (`filaHub: 2`, no `1`) en
vez de antes, porque aquí el hub va entre los laterales y el asiento de
abajo, no entre el de arriba y los laterales. De paso, `cols` baja de tres
columnas (`1fr 1.1fr 1fr`, la del medio ensanchada para el hub) a dos
iguales (`1fr 1fr`), que ya no hacen falta porque el hub no vive en esa
fila. Las tres filas de jugador quedan a `1fr` cada una, sin ningún peso
distinto entre ellas.

## Alternativas consideradas

Ya quedó documentada en la propia ADR 0050, que esta sustituye: la
proporción `1.3fr/1fr/1.3fr` sin cambiar la estructura del hub. Se
descarta porque resolvía el síntoma equivocado — el problema nunca fue el
peso de las filas, era que el hub ocupaba sitio compartido con los
laterales en vez de tener el suyo propio.

## Consecuencias

- Verificado con un navegador real, con contadores y esquinas activos para
  no probarlo solo con asientos vacíos: los cuatro asientos quedan
  exactamente al mismo alto (272px cada uno en la prueba) y el hub se
  inserta limpio entre los laterales y el de abajo, sin solapar con
  ninguno.
- Reutiliza el mecanismo `filaHub`/`conFilaHub` ya existente desde la ADR
  0039 sin tocar `Tablero.tsx` ni `VistaMesa.tsx`: todo el cambio vive en
  la definición de `4b` en `disposiciones.ts`.

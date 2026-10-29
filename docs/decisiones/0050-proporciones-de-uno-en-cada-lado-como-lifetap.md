# 0050. "Uno en cada lado" (4 jugadores): arriba y abajo más grandes que los lados

Fecha: 2026-10-21
Estado: Reemplazada por 0051

## Contexto

El usuario enseñó una captura de LifeTap con su disposición equivalente
para 4 jugadores: los dos asientos de arriba y abajo (a lo ancho) ocupan
bastante más alto que la fila del medio, donde están los dos asientos
laterales y la barra de opciones. En Mesa Commander, `4b` ("Uno en cada
lado") tenía la proporción justo al revés: `rows: '1fr 1.3fr 1fr'` le daba
*más* alto a la fila del medio que a arriba/abajo.

## Decisión

`rows` pasa de `'1fr 1.3fr 1fr'` a `'1.3fr 1fr 1.3fr'`: arriba y abajo
ganan el 30% de alto extra que antes tenía la fila del medio, que ahora es
la más pequeña de las tres. Nada más de la disposición cambia (columnas,
áreas, rotación, la celda del hub).

## Alternativas consideradas

Ninguna alternativa de proporción concreta se llegó a probar aparte de la
elegida: el usuario señaló una referencia visual concreta (la captura de
LifeTap) en vez de pedir "más grande"/"más pequeño" a ciegas, así que
`1.3fr`/`1fr` replica esa proporción de forma razonable sin necesitar
iterar sobre varios valores.

## Consecuencias

- Verificado con un navegador real: arriba y abajo miden 282px cada uno
  frente a 217px de la fila del medio (una proporción de 1.3:1, la misma
  que llevan los números), sin que los dos asientos laterales queden
  demasiado apretados para su contenido.
- Solo afecta a `4b`; el resto de disposiciones de 4 jugadores (`4a`,
  `4c`) y las de otros números de jugadores no cambian.

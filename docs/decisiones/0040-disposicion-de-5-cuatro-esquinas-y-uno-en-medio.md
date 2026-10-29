# 0040. Disposición de 5 jugadores "cuatro esquinas y uno en medio", sin superponer asientos

Fecha: 2026-10-20
Estado: Aceptada

## Contexto

Siguiendo con el análisis de LifeTap (ver ADR 0039), faltaba por cubrir su
disposición por defecto para 5 jugadores: cuatro en las esquinas de una
rejilla 2×2, con el quinto destacado en el centro. Ninguna de las tres
variantes que ya tenía Mesa Commander para 5 jugadores (`5a`/`5b`/`5c`, todas
"2+2+1 ancho abajo") es esa forma.

LifeTap consigue el "centro" con un quinto asiento que literalmente se
superpone a los otros cuatro (`position:absolute` sobre el punto medio de la
rejilla 2×2) — tolerable ahí porque sus tiles son simples (poco más que vida
y nombre). En Mesa Commander cada asiento lleva vida grande, botones de
maná, de impuesto de comandante y el popup de daño — contenido real e
interactivo que una superposición dejaría parcialmente tapado o
inalcanzable al tacto, justo lo contrario de lo que persigue la ADR 0039
recién tomada en la misma sesión.

## Decisión

Nueva disposición `5d` ("Cuatro esquinas y uno en medio"): dos filas de dos
asientos (las "esquinas", arriba y abajo) con el quinto asiento en una fila
propia a lo ancho, **entre** las dos parejas — no superpuesto a ellas. El
hub ocupa otra fila propia entre la pareja de arriba y el asiento central,
con el mismo mecanismo `filaHub`/`centro` de la ADR 0039. De arriba abajo:
pareja superior, hub, asiento central (ancho completo), pareja inferior.

Visualmente el quinto asiento queda tan "central" como en LifeTap (a medio
camino entre las dos parejas, destacado por ocupar él solo una fila entera),
pero cada asiento conserva su propia celda de grid sin tapar a ningún otro.

## Alternativas consideradas

- **Superponer el quinto asiento de verdad**, igual que LifeTap, con
  `position:absolute` sobre el cruce de la rejilla 2×2. Se descarta: con el
  contenido actual de un asiento (botones de daño, maná, impuesto) la
  superposición taparía controles de los asientos vecinos en vez de solo
  decoración, y rompería el principio — recién aplicado en la ADR 0039 — de
  que ningún asiento tape a otro.
- **Dejar el quinto asiento como fila ancha al final**, igual que `5a`/`5b`.
  Se descarta porque entonces no aporta nada nuevo frente a las variantes
  que ya existían: la gracia de esta disposición es que el quinto asiento
  quede entre las dos parejas, no después de ellas.

## Consecuencias

- Verificado con un navegador real: ni el tablero (`.board`) ni la
  previsualización de la pantalla previa (`VistaMesa`, que ya sabe mostrar
  "El móvil va aquí" en cualquier `centro`) solapan ningún asiento.
- `tests/componentes/mesa/disposiciones.test.ts` comprueba que `5d` reserva
  `filaHub`/`centro` y que el asiento central vive en su propia fila.
- Si más adelante se quiere ofrecer una variante con superposición de
  verdad (más fiel a LifeTap), hace falta antes decidir qué contenido del
  asiento tapado queda accesible — no es una extensión trivial de ésta.

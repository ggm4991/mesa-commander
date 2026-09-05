# 0019. El cuadrado reparte 4 huecos generales por jugador, no por comandante

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

La rejilla de la ADR 0017 calculaba columnas y filas con `ceil(sqrt(n))`
donde `n` era el número total de **fuentes de daño** (`comandantesEnMesa()`,
un comandante = una fuente). En una mesa de 4 sin compañeros eso daba
`n=4` → 2×2, que es el caso con el que se diseñó. Pero en cuanto un solo
jugador llevaba compañero, `n` subía a 5, y `ceil(sqrt(5))=3` daba una
rejilla de 3×2 (6 huecos, uno vacío) — visualmente descuadrada, y distinta
según qué jugador en concreto llevara el compañero. El usuario pidió que
hubiera siempre 4 huecos *generales*, y que cada uno se partiera en dos
solo si ese jugador en concreto lleva compañero. De paso, señaló que las
dos mitades de sumar/restar (ADR 0018) también se veían descuadradas.

## Decisión

- **La rejilla general se calcula por número de *jugadores*, no de
  comandantes**: `comandantesAgrupadosPorJugador()` (nueva función en
  `motor/vida.ts`) agrupa `comandantesEnMesa()` por asiento, y
  `Asiento.tsx` calcula `ceil(sqrt(gruposDano.length))` sobre esos grupos.
  Una mesa de 4 sigue dando 2×2 tenga o no compañeros, porque el número de
  jugadores no cambia — solo cambia cuántos comandantes caben en cada hueco.
- **Cada hueco general es un `.dano-grupo` con `display:flex`**, no una
  celda más de la rejilla: dentro lleva 1 o 2 `IconoDanoComandante` con
  `flex:1`, así que un jugador con compañero reparte su propio hueco a la
  mitad sin tocar el tamaño ni el número de huecos de los demás.
- **El fallo real de las mitades descuadradas era de orden de
  declaraciones CSS**, la misma familia de bug que ya documentó la ADR
  0015: `.dano-mitad` fijaba `inset:0` y *después* cada mitad fijaba
  `left`, dejando `right:0` puesto por el `inset` sin limpiar — con
  `left`, `right` y `width` los tres a la vez, el ancho real dependía de
  qué regla ganara el desempate, no de lo que se pretendía. Se arregla
  fijando solo `top`/`bottom` en la regla común y dejando que cada mitad
  fije *un único* lado (`left` la de restar, `right` la de sumar), sin
  `right`/`left` sueltos por medio compitiendo con el `width:50%`.
- El cuadrado general crece de 108px a 128px (92px en contenedores
  pequeños), a petición explícita de "un poco más grande".

## Alternativas consideradas

- **Seguir calculando la rejilla por número de comandantes, pero
  redondeando distinto.** Se descarta: cualquier fórmula sobre el total de
  comandantes seguiría dando una rejilla distinta según qué jugador en
  concreto llevara compañero, que es exactamente la inconsistencia que se
  quería eliminar.
- **Una rejilla anidada dentro de cada hueco en vez de `flex`.** Para un
  máximo de 2 comandantes por jugador (comandante + compañero; no hay
  terceros en las reglas de Commander), un `flex` simple reparte el hueco
  igual de bien que una rejilla y es menos código.

## Consecuencias

- Verificado con un navegador real en una mesa de 4 con un jugador de dos
  comandantes: los cuatro asientos muestran la misma rejilla 2×2, con el
  hueco de ese jugador partido en dos sin alterar los otros tres; las
  mitades de sumar/restar salen alineadas al mantener pulsado — sin
  errores de consola.
- Queda como prueba de regresión que `comandantesAgrupadosPorJugador`
  devuelve un grupo por jugador (nunca por comandante), y que el DOM
  refleja esa misma agrupación (`.dano-grupo` por jugador, `.dano-cmd`
  dentro de cada uno según cuántos comandantes tenga).

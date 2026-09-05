# 0008. El store del tablero expone `mutar` y `mutarSinFoto`, no uno solo

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

La ADR 0004 dejó pendiente, para cuando existiera un store real, que llamar a
`foto()` antes de cada mutación pasara a ser responsabilidad de ese store en
vez de cada función del motor. Al construir `useJuegoEnCurso` para el
tablero, la tentación obvia era: un único `mutar(fn)` que siempre hace
`foto()` antes de aplicar `fn`.

Revisando `app.html` función por función se ve que eso no es lo que hacía el
original. La mayoría de acciones sí llaman a `foto()` antes de mutar
(`cambiarVida`, `danoComandante`, `contador`, `alternarPausa`,
`pasarTurno`...), pero **tres acciones concretas nunca lo hacían**:
`elegirInicio()` (reclamar el primer turno), el maná disponible, y editar
nombre/comandante desde el menú de asiento. Envolver *todas* las acciones en
un único `mutar()` que siempre fotografía habría hecho que reclamar el
primer turno, por ejemplo, quedara guardado en el historial de deshacer — y
al pulsar "deshacer" justo después de empezar, la partida volvería a
"esperando que alguien toque su asiento", algo que el original nunca permitía
porque nunca tomaba esa foto.

Esto no era teórico: al portar `onElegirInicio` con el `mutar()` que siempre
fotografía, la verificación con Chromium real lo reprodujo tal cual —
reclamar el turno y luego pulsar deshacer devolvía el reloj a "¿Quién
empieza?".

## Decisión

`useJuegoEnCurso` expone dos funciones — `mutar(fn, {agrupar?})`, que
fotografía antes de aplicar `fn` (agrupando pulsaciones largas si se pide,
igual que `foto(true)`), y `mutarSinFoto(fn)`, que aplica `fn` sin tocar el
historial de deshacer. Cada punto del tablero usa la que corresponde según lo
que hacía la función equivalente en `app.html`, no una elección uniforme:

- `mutar`: `cambiarVida`, `danoComandante`, `contador`, `retirada`,
  `ajustarRehacer`, `ajustarFuera`, `alternarBendicion`,
  `alternarFueraDeJuego`, `alternarPausa`, `pasarTurno`,
  `cambiarMonarca`/`cambiarMonarcaPorArrastre`, `cambiarIniciativa`,
  `cambiarDiaNoche`.
- `mutarSinFoto`: `elegirInicio` (tanto desde el asiento como desde
  "sortear" en el menú de partida), `ajustarMana`, `editarJugador`.

## Alternativas consideradas

- **Un único `mutar()` que siempre fotografía.** Es lo que se implementó
  primero, y es el bug que describe el contexto: más simple de escribir,
  pero cambia el comportamiento real de deshacer respecto al original.
- **Que cada función del motor decida por sí misma si fotografía** (volver
  parcialmente atrás de la ADR 0004). Se descarta por la misma razón que ya
  se dio allí: mezclaría la regla de juego con la gestión del historial de
  deshacer dentro de la misma función.

## Consecuencias

- Cualquier acción nueva que se añada al tablero (o a futuras pantallas)
  tiene que mirar primero si su equivalente en `app.html` llamaba a `foto()`
  antes de decidir con cuál de las dos funciones se conecta — no se puede
  asumir que "mutar algo" implica siempre poder deshacerlo.
- Queda como comprobación automática en `tests/paginas/Tablero.test.tsx`: hay
  una prueba explícita de que reclamar el primer turno no se deshace.

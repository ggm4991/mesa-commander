# 0004. El motor de partida son funciones puras, sin Immer

Fecha: 2026-09-04
Estado: Aceptada

## Contexto

En `app.html`, las funciones del motor de partida (`cambiarVida`,
`danoComandante`, `pasarTurno`...) mutaban directamente las variables globales
`JUEGO`/`MESA`/`CONFIG` y, en la misma función, llamaban a pintar el DOM
(`pintarAsiento`, `pintarTablero`) y a guardar (`guardarJuego`). Al portar la
sección 7 a `src/motor/` (TypeScript puro, sin DOM), había que decidir cómo
representar esas mutaciones sin variables globales ni efectos de pintado.

## Decisión

Cada función del motor recibe el `Juego` actual (y los argumentos que le
apliquen) y devuelve un `Juego` nuevo, mediante *object spread* plano — sin
Immer ni ninguna librería de manejo de estado inmutable. Ninguna función del
motor llama a `foto()` por su cuenta: eso queda para el store de la Fase 3,
que deberá llamar a `foto()` antes de despachar cualquier acción que mute,
igual que hoy `app.html` lo hace a mano antes de cada mutación. Tampoco
escribe en el registro (`log`) el agrupamiento de 2s de `cambiarVida` (varias
pulsaciones rápidas → una sola línea): ese agrupamiento sigue siendo una
optimización de interfaz, no una regla del juego, y se porta con el resto de
la UI.

## Alternativas consideradas

- **Immer** para mutar un borrador con sintaxis de mutación normal. Se
  descarta por ahora: las formas de `Jugador`/`Juego` son poco profundas y los
  `spread` planos se leen igual de claro, así que añadir una dependencia no
  compensa. Se puede reconsiderar si el estado crece en anidamiento.
- **Mantener `foto()` dentro de cada función del motor**, como en el
  original. Se descarta porque obligaría a que cada mutador reciba y
  devuelva también `ultimaFoto` (el instante de la última foto, necesario
  para agrupar pulsaciones largas), mezclando una preocupación de historial
  de deshacer con la regla de juego en sí. Centralizarlo en el store de la
  Fase 3 mantiene cada función del motor enfocada en una sola cosa.
- **Motor como clase con métodos que mutan `this`.** Se descarta porque las
  funciones puras se prueban sin preparar ni limpiar nada entre pruebas — que
  es, además, la razón principal por la que esta fase merecía la pena: pasar
  de simular un DOM a mano en cada archivo de `pruebas/` a no necesitar
  ningún mock.

## Consecuencias

- Cada función que necesita la hora actual acepta un parámetro `ahora`
  opcional (por defecto `Date.now()`), así los tests fijan tiempos exactos
  sin tener que sustituir `Date.now` globalmente, como sí hacían
  `cronometro.test.js` y `alarma-tiempo.test.js` en la versión original.
- El store de la Fase 3 hereda dos responsabilidades que antes vivían dentro
  del motor: llamar a `foto()` antes de cada mutación, y agrupar en una sola
  línea de registro las pulsaciones repetidas de `cambiarVida`. Quedan
  anotadas aquí para no perderlas al diseñar ese store.
- `tests/motor/` no necesita ningún mock de DOM: los 26 casos portados (y
  algunos nuevos, como los de `comprobarFinal` y `calcularJugadores`, que no
  tenían archivo de prueba propio en la versión original) corren como
  funciones puras normales.

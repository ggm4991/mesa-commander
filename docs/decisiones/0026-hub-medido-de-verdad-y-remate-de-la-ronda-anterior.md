# 0026. El hub se mide de verdad en vez de adivinarse, y remate de la ronda anterior

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

La ADR 0025 subió `row-gap` a 64px calculando a mano el alto del hub a
partir de sus propiedades CSS (bordes, relleno, alto mínimo de sus botones).
El cálculo asumía que el botón del reloj (`.pass`) medía sus 50px de
`min-height` — pero su contenido real son **tres líneas** (nombre, tiempo
grande, estado), y esas tres líneas juntas superan ese mínimo. El hub real
mide unos 69px, así que 64px seguía quedándose corto y la barra seguía
invadiendo los asientos — el mismo fallo que ya había corregido esa ADR,
repetido por la misma razón: un número fijo calculado a mano en vez de
medido.

En la misma ronda, el usuario reportó otros cuatro problemas sobre lo que
había cambiado la ADR 0025:

1. El popup del cuadrado de daño no se cerraba bien al tocar fuera del
   cuadrado. La referencia usada para decidir "dentro o fuera" apuntaba al
   fondo semitransparente que cubre el asiento entero (`.dano-popup`), no al
   cuadrado (`.dano-cuadrado`) — así que tocar ese fondo, visualmente fuera
   del cuadrado, contaba como un toque "dentro" y no cerraba nada.
2. El indicador de cambio de vida (`+N`/`-N`) seguía muy pegado al número de
   vida: su posición se calculaba como un punto fijo relativo a `.inner`
   entero, sin relación real con dónde queda el número de vida.
3. El aviso de "se pasó de tiempo" pedía pasar de vivir en la fila de
   contadores sueltos (donde competía por sitio y solo aparecía a partir de
   1) a tener su propia esquina fija, siempre visible, como ya tiene el
   contador de jugadas rehechas.
4. El número de vida, aun agrandado en la ADR 0023, debía crecer más
   todavía.

## Decisión

- **El alto de `row-gap` se mide de verdad, no se calcula a mano.** `Hub`
  pasa a exponer su nodo raíz por `ref` (`forwardRef`); `Tablero` mide su
  alto real con `getBoundingClientRect()` y lo aplica como `rowGap` inline
  en `.board`. Mismo patrón que ya usa `useBordesAsientos` para los bordes
  de los asientos — medir tras cada render con `useLayoutEffect` (sin lista
  de dependencias) más un listener de `resize`, comparando antes de llamar a
  `setState` para no entrar en bucle (ver ADR 0009) — en vez de adoptar
  `ResizeObserver`, que ni siquiera existe en jsdom y habría exigido un
  mock solo para esta medición. El valor fijo de 64px queda solo como
  arranque, antes de la primera medición real.
- **La referencia del popup de daño pasa a apuntar a `.dano-cuadrado`**, no
  a `.dano-popup` (el fondo que lo envuelve). Así "tocar fuera" es fuera del
  cuadrado de verdad: tocar el fondo, aunque siga dentro del asiento, cuenta
  como fuera y cierra el popup.
- **El delta pasa a vivir dentro de `.life-wrap`**, anclado a
  `bottom: 100%` con `margin-bottom: 10px`, en vez de calcular una posición
  fija relativa a `.inner` entero. Al depender de la propia caja que envuelve
  la vida (corona incluida, si la hay) en vez de una fracción arbitraria de
  la altura del asiento, la separación es constante y no depende de lo alto
  que sea el asiento.
- **"Se pasó de tiempo" pasa a `.tiempo-esquina`**, una esquina fija en la
  posición opuesta a `.retirada-esquina` (izquierda en vez de derecha),
  siempre visible — ya no cuenta para el umbral de "N más" de contadores
  sueltos (ADR 0021), y se resalta con `.warn` cuando pasa de 0, igual que
  antes. A diferencia del contador de jugadas rehechas, no es un botón: no
  hay ninguna acción que hacer al tocarlo.
- **`.life` sube de `clamp(46px, 15cqh, 108px)` a `clamp(54px, 18cqh,
  128px)`** (y su variante de asientos bajos, de `12cqh` a `14cqh`).

## Alternativas consideradas

- **Adivinar otro número más alto para `row-gap`** (por ejemplo 80px, con
  más margen). Se descarta explícitamente: es la misma clase de arreglo que
  ya falló dos veces (ADR 0023 con 44px, ADR 0025 con 64px) porque el alto
  real depende de cosas que no están bajo control directo — tamaño de letra
  del sistema, longitud del nombre del jugador que envuelve a otra línea,
  cambios futuros de contenido. Medir el nodo de verdad no puede quedarse
  corto por definición.
- **`ResizeObserver`** para medir el hub, en vez del patrón de
  `useBordesAsientos`. Se descarta por consistencia (el proyecto ya tiene un
  patrón que funciona igual de bien sin necesitar una API que no existe en
  jsdom) y porque el caso no lo necesita: el hub no cambia de tamaño por
  motivos que un re-render no capture ya.

## Consecuencias

- Verificado con un navegador real: el hub mide 69px reales y `row-gap` se
  aplicó a 70px (redondeado hacia arriba), sin invadir ningún asiento; el
  indicador de vida aparece separado del número; tocar la esquina del fondo
  del popup de daño (fuera del cuadrado) lo cierra correctamente; la esquina
  de "pasó de tiempo" aparece siempre, en el lado opuesto a la de jugadas
  rehechas, y gira con el asiento igual que el resto de esquinas fijas.
- Si en el futuro el contenido del hub cambia de forma que su alto varíe
  (por ejemplo, un nombre de jugador tan largo que envuelva a una línea
  extra), `row-gap` se ajusta solo — no hace falta volver a tocar ningún
  número a mano.

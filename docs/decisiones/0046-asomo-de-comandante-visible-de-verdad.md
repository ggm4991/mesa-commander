# 0046. El asomo de comandante de la ADR 0045 era invisible en la práctica: opacidad + `mix-blend-mode`

Fecha: 2026-10-21
Estado: Aceptada

## Contexto

Con el servidor ya funcionando, el usuario probó la ADR 0045 con sus
comandantes de verdad (Yuriko, the Tiger's Shadow; Edgar Markov) y no veía
nada. Reproducido con un navegador real y los mismos nombres exactos: la
imagen SÍ se resolvía bien contra Scryfall, la capa `.pbg-comandante`
existía con el CSS correcto — pero al 35% de opacidad (el valor con el que
se cerró la ADR 0045) era, en la práctica, casi imperceptible.

Subir la opacidad a mano no bastaba por sí solo: a 0.55 seguía casi
invisible. La causa de fondo, al comparar con un comandante de arte muy
luminoso (Atraxa, Grand Unifier, que sí se veía bien en las pruebas
anteriores): el arte de Yuriko y de Edgar Markov es oscuro por diseño
(ninja de noche, señor vampiro), y una imagen oscura mezclada por
`opacity` normal sobre un fondo ya oscuro (el degradado de identidad con su
velo incorporado, `fondoIdentidad`) se queda oscura sobre oscuro,
prácticamente invisible, sin importar cuánto suba la opacidad — mientras
que un comandante de arte claro sí se nota, exactamente lo que pasó.

## Decisión

`.pbg-comandante` pasa de una mezcla por `opacity` normal a
`mix-blend-mode: screen` (con `opacity: 0.6`). "Screen" aclara en vez de
mezclar: los píxeles oscuros de la ilustración casi no cambian el fondo (un
negro "screado" con cualquier color da ese mismo color, así que no añade
oscuridad sobre oscuridad), mientras que sus zonas claras sí se notan de
verdad — funciona tanto para el arte oscuro de Yuriko/Edgar Markov como
para el claro de Atraxa, verificado con un navegador real y los tres a la
vez.

## Alternativas consideradas

- **Seguir subiendo la opacidad normal** (0.7, 0.8...). Se probó: a 0.9 sí
  se veía, pero para llegar ahí con arte oscuro habría que aplastar
  cualquier comandante de arte claro a un blanco casi plano — no hay un
  valor de opacidad único que sirva bien para ambos casos con mezcla
  normal.
- **Invertir el orden** (imagen a opacidad alta como capa base, color por
  encima a opacidad reducida, como hace `fondoAsiento` en el tablero de
  verdad). Se descarta por ahora: cambia la jerarquía visual (la
  ilustración pasaría a dominar sobre el color, que es justo lo que la ADR
  0045 quiso evitar) — `mix-blend-mode` consigue que se note sin tocar esa
  jerarquía.

## Consecuencias

- Verificado con un navegador real, con los comandantes reales que
  reportó el usuario (Yuriko, the Tiger's Shadow; Edgar Markov) y con uno
  de arte claro (Atraxa, Grand Unifier) a la vez, comparando las tres
  capturas: las tres se notan ya sin que ninguna tape el texto ni los pips.
- Si en el futuro un comandante de arte extremadamente claro (blanco casi
  puro de fondo) se ve demasiado quemado con `screen`, conviene revisar
  este valor otra vez — no hay ninguna prueba automática de contraste que
  lo detecte, es un ajuste a ojo como el resto de esta familia de ADR.

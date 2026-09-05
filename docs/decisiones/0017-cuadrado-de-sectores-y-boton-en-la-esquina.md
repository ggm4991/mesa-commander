# 0017. El daño de comandante en un cuadrado de sectores, y retirada a una esquina

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

Tras probar la fila de iconos circulares de la ADR 0016, el usuario pidió
dos ajustes: que los iconos de daño formaran un único cuadrado partido en
sectores (en vez de una fila de círculos sueltos, que en una mesa de varios
comandantes se alargaba de forma poco predecible), y que el botón de
jugadas retiradas se sacara de esa misma fila hacia una esquina del
asiento, ya que compartía espacio con los iconos.

## Decisión

- **Un cuadrado (`.dano-cuadrado`) con rejilla CSS**, columnas y filas
  calculadas como `ceil(sqrt(n))` a partir del número de fuentes de daño
  (`comandantesEnMesa`). En el caso más común — una mesa de 4 sin
  compañeros, donde cada asiento ve 3 rivales más el suyo propio — da
  exactamente una rejilla de 2×2, que es la forma concreta que pidió el
  usuario. Con más fuentes (compañeros, mesas de 5-6) la rejilla crece en
  vez de desbordar hacia un lado.
- **Cada sector sigue siendo el mismo `IconoDanoComandante`** de la ADR
  0016 (toque suma, mantener pulsado resta) — solo cambia el contenedor
  (una rejilla en vez de una fila) y su forma (rellena su celda cuadrada en
  vez de ser un círculo de tamaño fijo), no la lógica ni el gesto.
- **El botón de jugadas retiradas pasa a `position:absolute` dentro de
  `.inner`**, anclado a una esquina fija en las coordenadas *del propio
  asiento* — como es hijo de `.inner`, gira con el resto del contenido
  cuando el asiento está rotado 90/180/270°, igual que ya hacía el botón de
  opciones ("..."): la esquina es siempre la misma desde el punto de vista
  de quien juega ahí, no de la pantalla.

## Alternativas consideradas

- **Mantener el número exacto de columnas en 2 siempre**, en vez de
  calcularlo con `ceil(sqrt(n))`. Se descarta porque con una sola fuente
  (partida de 2 sin compañero, donde solo hay un rival) dejaría una columna
  vacía sin sentido; la raíz cuadrada da 1×1 en ese caso y sigue dando 2×2
  en el caso de 4 que pidió el usuario.
- **Dejar la retirada dentro de `.seat-bot`** solo con más separación. Se
  descarta porque el pedido explícito era sacarla de esa fila a una esquina
  del asiento, no solo darle más aire.

## Consecuencias

- Verificado con un navegador real en una mesa de 4: el cuadrado de 2×2
  aparece centrado en la parte baja de cada asiento, la retirada queda en
  su esquina sin solaparse, y tocar/mantener pulsado un sector sigue
  sumando y restando correctamente — comprobado explícitamente que
  mantener pulsado quita un punto de daño ya puesto, que era la segunda
  parte del pedido.

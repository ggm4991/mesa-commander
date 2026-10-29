# 0042. Daño/impuesto de comandante suben arriba solo con icono, y las esquinas fijas dejan de chocar con iniciativa/fuera

Fecha: 2026-10-20
Estado: Aceptada

## Contexto

Probando en el móvil de verdad los cambios de las ADR 0039-0041, el usuario
reportó, con una captura real de una partida de 4 jugadores:

1. Las esquinas fijas (tiempo pasado, jugadas rehechas) aparecían encima del
   botón de opciones del asiento y de la insignia de iniciativa, en vez de
   al lado contrario.
2. Pidió que los botones de "Daño de comandante" e "impuesto de comandante"
   (`Comandante ×N`) se quedaran solo con el icono — más grandes para
   compensar, ya que perder el texto podía dejarlos pequeños — y subieran
   arriba, junto a las esquinas fijas.

## Decisión

**Daño e impuesto de comandante.** Nueva fila `.acciones-arriba`, en flujo
normal justo debajo de `.seat-top` (no en posición absoluta): dos botones
circulares de 48px, solo icono. El texto ("Daño de comandante", "Comandante
×N") sigue en el DOM dentro de un `<span class="visualmente-oculto">`, para
quien usa lector de pantalla y para que las pruebas que ya buscaban ese
texto (`getByText`) lo sigan encontrando sin tocarlas. Se probó primero
meterlos en `.esquinas-fijas` junto a tiempo/retirada — cuatro controles
fijos en una sola esquina — y se descartó: ni compactando cabían ya en un
asiento de 4 jugadores (ver "Alternativas").

**Esquinas fijas e iniciativa.** La causa real no era la rotación ni el
`lado` de la ADR 0041, sino algo más simple: `.seat-top` no tenía
`justify-content` propio, así que por defecto (CSS `flex-start`) sus
insignias (iniciativa, "fuera") se quedaban ancladas al borde de inicio —
el mismo lado donde vive siempre `.esquinas-fijas` — mientras que solo el
botón de opciones se apartaba a mano con su propio `margin-left:auto`. En
cuanto había una insignia de verdad (el caso de la captura), chocaba con las
esquinas fijas sin que ninguna de las dos supiera de la otra.

Arreglado en dos pasos:

- `.seat-top` pasa a `justify-content: flex-end` por defecto: todo su
  contenido, insignias incluidas, se agrupa al lado contrario de
  `.esquinas-fijas` sin necesidad del truco de `margin-left:auto` en el
  botón (se quita, ya sobra). `estiloBotonEnFila` pierde el parámetro
  `margenPorDefecto`, que ya no lo necesita nadie.
- Cuando `.seat-top` entero se manda al lado de inicio (`lado === 'ini'`,
  ver ADR 0041), sigue necesitando que `.esquinas-fijas` cruce al lado
  contrario — eso ya lo resolvía `estiloEsquinas`, sin cambios.

Incluso con esos dos arreglos, el ancho seguía sin dar para los casos más
exigentes — verificado con un navegador real y `getBoundingClientRect()` en
cada paso, no solo a ojo:

- A partir de `@container (max-width: 260px)` (antes 170px: el umbral subió
  porque una insignia como "Iniciativa" por sí sola, a tamaño normal, ya
  ronda los 80px), las esquinas fijas y el botón de opciones se compactan
  (como ya hacía la ADR 0041) y además las insignias de `.seat-top` bajan de
  tamaño.
- En el caso más extremo (6 jugadores a 3 columnas, ~130px, un asiento con
  `lado === 'ini'` y con iniciativa puesta a la vez), ni compactando daba
  más: a partir de `@container (max-width: 145px)` la insignia se queda solo
  con el icono (mismo patrón que daño/impuesto: `aria-label` en el propio
  `.badge`, el texto visual en un `<span class="badge-texto">` que se oculta
  ahí), y las esquinas fijas bajan a un segundo nivel de compactado.

## Alternativas consideradas

- **Meter daño e impuesto dentro de `.esquinas-fijas`.** Primer intento:
  mismo contenedor, mismo mecanismo de esquivar lado. Se descartó porque con
  cuatro controles fijos compartiendo una esquina, ni compactando cabían ya
  en un asiento de 4 jugadores (201px) — no solo en los más estrechos de 6.
  En flujo normal (la decisión final) cada fila solo tiene que preocuparse
  de su propio contenido, no de competir por el mismo hueco flotante con
  otras tres cosas.
- **Mover `.esquinas-fijas` más abajo o apilarla en vertical** (ya probado y
  descartado en la ADR 0041, por el mismo motivo: en un asiento estrecho el
  alto escasea tanto como el ancho).
- **Dejar el texto de las insignias siempre visible y solo encoger la
  letra.** No basta en el caso más extremo (6 jugadores + lado que esquivar
  + insignia), verificado probando esa combinación concreta antes de pasar a
  ocultar el texto.

## Consecuencias

- Verificado con un navegador real, con el peor caso combinado a propósito
  (insignia de iniciativa en un asiento, "fuera" > 0 en todos): 0 solapes
  entre controles en 2, 4, 5 y 6 jugadores (las variantes "a" de 6, la más
  estrecha, y "b", a 3 filas).
- `tests/paginas/Tablero.test.tsx` usaba el selector CSS `.dano-boton`
  (compartido antes por los dos botones): pasa a `.accion-dano`, que ahora
  solo selecciona el de daño. El resto de pruebas (`getByText('Daño de
  comandante')`, `getByText('Comandante ×2')`, `getByText('Fuera')`) no
  necesitaron ningún cambio gracias al texto visualmente oculto.
- Si en el futuro se añade una tercera insignia a `.seat-top` (hoy solo hay
  iniciativa y "fuera", y nunca se muestran más de una a la vez salvo que
  cambien las reglas), hay que volver a comprobar que los umbrales de 260px
  y 145px siguen siendo suficientes — no hay ninguna comprobación automática
  que avise si dejan de serlo.

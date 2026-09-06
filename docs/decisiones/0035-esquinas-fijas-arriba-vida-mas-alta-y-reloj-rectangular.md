# 0035. Las esquinas fijas suben, la vida sube un poco, y el reloj es un rectángulo de verdad

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Tras la ADR 0034, el usuario dio la vuelta a una de sus propias peticiones y
añadió dos más, la última con una captura real desde el móvil marcada a
mano:

1. **El reparto de "arriba"/"abajo" entre esquinas fijas y contadores
   sueltos era al revés de lo que convenía.** La 0034 subió el maná y los
   contadores (variables) a la esquina superior izquierda y dejó las
   jugadas rehechas y el tiempo pasado (fijos) abajo en sus dos esquinas de
   siempre. El usuario pidió lo contrario: los dos avisos de **tamaño
   fijo** (rehacer, tiempo pasado) arriba, juntos en una esquina, y el maná
   y los contadores —que varían en número y anchura— abajo, con toda la
   fila para crecer sin chocar con nada.
2. **El combo de sumar/restar vida pedía subir un poco** el signo dentro
   del botón, para quedar a la altura del número de vida.
3. **El botón del reloj, aunque ya no se salía de la barra (ADR 0034),
   dejaba hueco muerto en las puntas por sus esquinas redondeadas
   (`border-radius: 22px`)** — visible de sobra en una captura real
   marcada a mano: con la barra ya ajustada al tamaño exacto del botón, el
   redondeo recorta las esquinas del rectángulo y deja un hueco que
   podría ser, en su lugar, unos píxeles más de asiento para los jugadores
   de al lado.

## Decisión

- **`.esquinas-fijas` (jugadas rehechas + tiempo pasado) pasa a
  `top:8px;left:8px`** (antes `.retirada-esquina` y `.tiempo-esquina` vivían
  cada una en una esquina de *abajo*). Van dentro de un mismo contenedor
  flex, no cada una posicionada por separado, para no tener que calcular a
  mano el ancho de la primera y no solaparla con la segunda.
- **`.seat-estados` (maná y contadores sueltos) vuelve a estar debajo de
  la fila de vida**, centrada, con todo el ancho del asiento para
  crecer — el mismo sitio de siempre (`.seat-bot`) antes de la ADR 0034,
  ahora liberado de competir con las dos esquinas fijas, que ya no están
  ahí.
- **`.tap` (los botones de sumar/restar vida) añade `padding-bottom: 10%`**:
  el signo se centra en una caja recortada por abajo, así queda un poco por
  encima del centro exacto del botón sin reducir su zona táctil (el botón
  entero sigue midiendo lo mismo; solo cambia dónde se centra el signo
  dentro de él).
- **`.hub .pass` pasa a `border-radius: 0`**: con la barra ya ajustada al
  alto real del botón (ADR 0033/0034), cualquier redondeo en las esquinas
  del botón deja de tener sentido — ya no hay ningún sobrante de barra
  alrededor que disimular con una esquina suave, así que esa esquina solo
  resta espacio útil a los asientos de al lado.

## Alternativas consideradas

- **Mantener el maná/contadores arriba pero solo cuando hay muchos, y
  abajo si hay pocos.** Se descarta por complejidad: una regla que cambia
  de sitio según cuánto contenido haya es más difícil de predecir para
  quien juega que una posición fija, y el usuario ya dejó claro cuál
  prefería para cada caso.
- **Reducir el `border-radius` a un valor menor en vez de quitarlo del
  todo** (por ejemplo 6-8px, un redondeo sutil). Se descarta: el usuario
  pidió explícitamente "el rectángulo", sin matices — y con la barra ya del
  tamaño justo, cualquier redondeo por pequeño que sea sigue recortando
  esquina útil.

## Consecuencias

- Verificado con un navegador real en una mesa de 5 "Rodeando el móvil":
  para un asiento sin girar, jugadas rehechas y tiempo pasado aparecen
  juntas en la esquina superior izquierda de verdad; para un asiento
  girado 180°, la misma pareja aparece —correctamente, por la propia
  rotación del asiento— en la esquina inferior derecha vista en pantalla,
  sin salirse de su asiento ni solaparse con nada.
- Verificado que el botón del reloj, girado a 90°/270°, es ahora un
  rectángulo de esquinas rectas que ocupa su caja completa, sin ningún
  hueco muerto en las puntas.
- 1 prueba actualizada (el orden de contadores/esquinas fijas, invertido
  respecto a la ADR 0034) para no volver a mezclar cuál va arriba y cuál
  abajo.

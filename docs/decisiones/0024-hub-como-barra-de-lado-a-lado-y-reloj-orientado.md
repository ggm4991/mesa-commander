# 0024. El hub pasa de burbuja flotante a barra de lado a lado, y el reloj se orienta hacia quien tiene el turno

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

La ADR 0023 resolvió el solape del hub con los asientos subiendo el `gap` de
`.board` de 6 a 44px, dejándole un hueco donde flotar centrado como una
burbuja redondeada. Al probarlo, el usuario aclaró dos cosas que ese cambio
no recogía:

1. El hueco de 44px debía ser **solo vertical** (entre la fila de arriba y la
   de abajo): entre jugadores del mismo lado (columnas) no hacía falta
   ninguna separación extra, y la ADR 0023 la había añadido en las dos
   direcciones a la vez por aplicar un único valor de `gap`.
2. La burbuja centrada debía convertirse en una **barra que va de lado a
   lado**, ocupando todo el ancho del hueco vertical en vez de un grupo de
   botones flotando en el centro — y, dentro de esa barra, el reloj (nombre
   y tiempo de quien tiene el turno) debía **girar hacia esa persona**, igual
   que ya gira el contenido de su propio asiento, para que pueda leer su
   tiempo sin tener que ladear el móvil.

## Decisión

- **`.board` separa `gap` en `row-gap: 44px` y `column-gap: 6px`**: el hueco
  ancho para la barra queda solo entre filas; entre columnas se vuelve al
  valor mínimo de siempre.
- **`.hub` pasa de burbuja a barra**: en vez de `left: 50%` con
  `transform: translate(-50%, -50%)` (centrado en ambos ejes, ancho ajustado
  al contenido), pasa a `left: 0; right: 0` con `transform: translateY(-50%)`
  (ancho completo, solo centrado en vertical). El borde redondeado de pastilla
  (`border-radius: 99px`) se sustituye por un borde superior e inferior, ya
  que una barra que toca los dos bordes de la pantalla no necesita esquinas
  redondeadas.
- **El botón del reloj (`.pass`) gira según la rotación de quien tiene el
  turno**: `Hub` recibe una nueva prop `rotacionTurno` (el valor de
  `dispo.rot[juego.turno]`, calculado en `Tablero.tsx`), que se vuelca como
  `data-rot` en el propio botón — mismo mecanismo que ya usa
  `.seat[data-rot]` para orientar el contenido de cada asiento. Una única
  regla nueva, `.hub .pass[data-rot='180']{transform:rotate(180deg)}`, gira
  el bloque de nombre + tiempo cuando le toca a alguien sentado "boca abajo".
  El resto del hub (deshacer, pausa, menú) no gira: son iconos simétricos que
  no necesitan orientarse hacia nadie en particular.

## Alternativas consideradas

- **Girar el `.hub` entero en vez de solo el botón `.pass`.** Se descarta:
  los iconos de deshacer/pausa/menú son los mismos para cualquier jugador,
  y girarlos de más solo complicaría su lectura sin aportar nada — solo el
  texto del reloj depende de quién lo esté mirando.
- **Manejar también 90°/270°** (asientos a los lados). Se descarta por ahora:
  las disposiciones con asientos a los lados que no tienen ya una celda de
  reloj dedicada (`centro`, ver `disposiciones.ts`) son una única fila sin
  hueco vertical donde meter una barra, así que el caso no se da en la
  práctica; si en el futuro aparece una disposición así, `data-rot` ya deja
  sitio para añadir esas reglas sin tocar el componente.

## Consecuencias

- Verificado con un navegador real: mesa de 2 (el reloj gira 180° mientras
  le toca al de arriba, y vuelve a leerse recto al pasar el turno al de
  abajo) y mesa de 4 (los cuatro asientos se tocan sin hueco horizontal,
  la barra ocupa todo el ancho en el hueco vertical central).
- Si una disposición futura necesita una barra vertical en vez de horizontal
  (por ejemplo, dos columnas sin filas), este mecanismo no se traslada
  directamente y necesitaría su propia decisión.

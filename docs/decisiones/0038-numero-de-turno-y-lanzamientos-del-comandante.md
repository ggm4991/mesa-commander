# 0038. Número de turno visible, y lanzar el comandante a un toque

Fecha: 2026-09-07
Estado: Aceptada

## Contexto

Dos peticiones nuevas: poder ver en qué turno va la partida (hasta ahora
`Juego` solo sabe de quién es el turno, `turno`, no cuántos han pasado), y
facilitar apuntar cuántas veces se ha lanzado el comandante de cada
jugador — algo que hoy exige entrar al menú del asiento cada vez.

Para lo segundo, ya existía un contador que hace casi el mismo trabajo: el
"Impuesto de comandante" (`tax`), que sube de 2 en 2 porque la regla 903.9a
añade {2} al coste de lanzar un comandante por cada vez que ya se lanzó
antes desde la zona de mando esta partida. El número de lanzamientos es,
en la práctica, `tax / 2`.

## Decisión

- **`Juego.numeroTurno`**, un contador nuevo: 0 mientras `turno` es `null`
  (la partida no ha arrancado), 1 en cuanto alguien empieza
  (`empezarPartida` con sorteo, o `elegirInicio`), y sube en uno con cada
  `pasarTurno()`. Se muestra como una insignia pequeña en la esquina del
  botón del reloj (`.turno-num`), no como una cuarta línea de texto: así no
  compite por el poco alto que le queda al botón tras encogerlo (ADR 0037).
  Al ser `position: absolute` no cuenta en el alto que `medirHub` lee de
  `.pass` para dimensionar la barra.
- **Se reutiliza el impuesto de comandante en vez de crear un contador
  aparte**: un botón nuevo, siempre visible bajo la vida (junto al de daño
  de comandante, mismo estilo de píldora), que en cada toque llama a
  `contador(juego, i, 'tax', 2)` — exactamente lo mismo que ya hacía el
  botón "+" del impuesto dentro del menú del asiento, solo que a un toque
  en vez de dos. Muestra "Comandante ×N" con N = `tax / 2`. Como ahora tiene
  su propio sitio siempre visible, el impuesto deja de aparecer también
  como contador suelto en la fila de abajo del asiento (`seat-estados`):
  mostrarlo dos veces en el mismo asiento sería ruido, no ayuda.
- El menú del asiento no cambia: el impuesto sigue ahí, con sus botones
  +/-2, para corregir un error o ajustar el número directamente sin pasar
  por lanzamientos de uno en uno.
- `migrarJuego` rellena `numeroTurno` en partidas guardadas antes de este
  cambio: 1 si ya hay alguien jugando (`turno` no es `null`), 0 si no —
  la mejor suposición posible, ya que no hay forma de recuperar cuántos
  turnos llevaban de verdad.

## Alternativas consideradas

- **Un contador `lanzamientos` nuevo, independiente del impuesto.** Más
  correcto en el caso raro de un efecto que cambie el impuesto sin que
  cambie cuántas veces se lanzó (o viceversa), pero añade un campo, su
  migración y una fila más en el menú para un dato que en la inmensa
  mayoría de partidas es el mismo que ya existía. Descartado: no gana su
  sitio frente a reutilizar lo que ya hay.
- **Mostrar el número de turno como texto dentro del propio botón** (una
  cuarta línea, o como prefijo del nombre). Descartado: el botón del reloj
  ya se ha encogido dos veces esta sesión (ADR 0034, 0037) para ganar
  espacio a los asientos; una insignia en la esquina no le quita ese
  espacio ganado.

## Consecuencias

- Verificado con un navegador real: el número de turno sube de 1 a 2 al
  pasar turno, y el botón "Comandante ×N" sube de ×0 a ×1 a ×2 con cada
  toque, sin abrir ningún menú. Girado a 90°/270° (asiento lateral, ADR
  0033) la insignia sigue visible y no queda cortada, girando con el resto
  del botón igual que ya hacían el nombre y el reloj.
- 8 pruebas de motor y componentes actualizadas para el campo nuevo
  (`Juego.numeroTurno`), más pruebas nuevas para el badge, el botón y la
  migración.

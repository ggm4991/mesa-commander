# 0055. El cuadrado de daño se ordena por geometría real de la mesa, no por orden de turno

Fecha: 2026-10-29
Estado: Reemplazada por 0056

## Contexto

La ADR 0053 ordenó el cuadrado de daño empezando por el propio asiento y
dando la vuelta por índice de asiento, asumiendo que el índice ya está en
sentido horario de verdad (ADR 0031, pensada para pasar turno). El usuario
aclaró que no se refería al orden de turno, sino a la posición real: "si
soy el jugador de abajo a la derecha, debo ver los comandantes en el orden
que yo veo a los jugadores" — la disposición visual, no el turno.

En las disposiciones simétricas (como "Dos y dos") los dos órdenes
coinciden, porque el índice ya se asignó seguiendo la posición real. Pero
nada garantiza que siga coincidiendo en disposiciones menos regulares,
y además había un segundo problema, aparte del orden: con exactamente 4
jugadores el cuadrado es 2×2, y una rejilla CSS normal se rellena fila a
fila (arriba-izq., arriba-der., abajo-izq., abajo-der.) — ese último salto,
de arriba-derecha a abajo-**izquierda**, no es un giro horario real, corta
en diagonal en vez de seguir al asiento de al lado.

## Decisión

**El orden.** `ordenEspacialDesde(dispo, indiceVisor, n)` (nueva, en
`tablero/layouts.ts`) calcula el centro de cada asiento a partir de
`dispo.areas` (las mismas líneas de grid que ya tiene cada disposición) y
ordena a los demás por el ángulo real hacia cada uno desde el asiento de
quien mira — geometría de verdad, no el índice. Sin `areas` completas para
calcularlo (algunas disposiciones no las necesitan), cae al orden de
índice de siempre, igual que hacía la ADR 0053.

Un detalle no evidente: **el propio giro del visor no hace falta
aplicárselo al cálculo**, porque girar un punto de vista es una
transformación que conserva el orden cíclico de lo que lo rodea — cambia a
qué lado de la pantalla apunta cada uno, pero nunca en qué orden aparecen
(si tres cosas van en sentido horario, siguen en ese mismo orden las gires
como las gires). Se probó primero aplicando la rotación del visor al
ángulo — código de más sin ningún efecto en el resultado, retirado.

**El relleno del cuadrado.** Con exactamente 4 jugadores, `Asiento.tsx`
intercambia los dos últimos del orden ya calculado antes de pintarlos, para
que el relleno de la rejilla 2×2 sí sea un giro horario real
(arriba-izq. → arriba-der. → abajo-der. → abajo-izq.) en vez del salto en
diagonal que da el relleno normal de una rejilla CSS. Con otros números de
jugadores el cuadrado no tiene forma de brújula limpia (3, 5, 6 asientos no
encajan en un cuadrado), así que se deja en el orden de lectura normal —
ya correcto en secuencia, aunque no un mini-mapa geométrico exacto.

`Asiento` gana una prop `dispo` (antes no la necesitaba: solo conocía su
propia rotación y su propia área) para poder calcular esto.

## Alternativas consideradas

Ya quedaron registradas en la ADR 0053 (orden por índice de asiento, orden
calculado a partir de la posición real en vez de un índice fijo); esta la
reemplaza porque la geometría real es lo que de verdad se pidió.

## Consecuencias

- Verificado con un navegador real: desde el asiento abajo-derecha de "Dos
  y dos", el cuadrado queda uno mismo arriba-izquierda, el de al lado
  (abajo-izquierda real) arriba-derecha, y los otros dos completando el
  giro horario hasta volver a cerrar el cuadrado — confirmado leyendo tanto
  la posición en pantalla de cada celda como el nombre del comandante que
  contiene, no solo a ojo.
- Pruebas nuevas en `tests/tablero/layouts.test.ts` cubren disposiciones
  simétricas y asimétricas reales (`4a`, `4b`), el caso sin `areas`, y
  confirman explícitamente que girar al visor no cambia el orden.

# 0056. El cuadrado de daño es un mini-mapa de la mesa girado con el propio asiento, no una secuencia

Fecha: 2026-10-29
Estado: Reemplaza a la ADR 0055

## Contexto

La ADR 0055 ordenó el cuadrado de daño por el ángulo real hacia cada asiento
desde el punto de vista de quien mira, sin aplicarle el propio giro del
visor — razonando que girar un punto de vista conserva el orden cíclico de lo
que lo rodea. Verificado con un navegador real, el usuario señaló que seguía
sin ser lo que pedía: no se trataba de una secuencia que empiece por uno
mismo, sino de en qué celda concreta (arriba-izquierda, arriba-derecha,
abajo-izquierda, abajo-derecha) cae cada jugador.

Para destrabarlo, el usuario dio el caso completo de "Dos y dos" (4a: 1
arriba-izq., 2 arriba-der., 3 abajo-der., 4 abajo-izq.) celda a celda para
dos visores distintos:

- Visto por el jugador 3 (abajo-der., sin giro): yo=abajo-der., 4=abajo-izq.,
  2=arriba-der., 1=arriba-izq.
- Visto por el jugador 1 (arriba-izq., girado 180°): yo=abajo-der.,
  4=arriba-der., 2=abajo-izq., 3=arriba-izq.

Comprobado a mano: el primer caso es una copia exacta de las posiciones
reales de la mesa. El segundo es esa misma mesa girada 180° (arriba-izq. ↔
abajo-der., arriba-der. ↔ abajo-izq.) — exactamente el mismo ángulo que ya
gira el asiento 1 en la disposición "Dos y dos" (`rot: [180, 180, 0, 0]`).
Los 8 datos (4 por visor) cuadran con un único modelo: **el cuadrado no es una
lista de "los demás vistos desde mí", es un mini-mapa de la mesa entera,
girado el mismo ángulo que ya gira el resto del contenido de ese asiento**.
Que el jugador 1 acabe viéndose a sí mismo abajo-derecha es una coincidencia
geométrica de que su asiento gira justo 180° y su posición real es la
diagonalmente opuesta a esa celda — no una regla de "uno mismo siempre
ahí" (el jugador 3, con 0° de giro, se ve en su posición real sin más).

## Decisión

`ordenEspacialDesde(dispo, indiceVisor, n)` (en `tablero/layouts.ts`) cambia
de calcular una secuencia angular relativa al visor a esto:

1. Calcula el centro de cada asiento (`centrosDeAsientos`, sin cambios) y el
   centro de la mesa entera (la media de todos los asientos).
2. Gira la posición de cada asiento alrededor de ese centro el mismo ángulo
   que `dispo.rot[indiceVisor]` — una rotación 2D estándar, no distinta de la
   que ya aplica el CSS a todo el contenido de ese asiento.
3. Con exactamente 4 jugadores, reparte cada asiento ya girado a su celda del
   cuadrado 2×2 según el signo de su posición (arriba/abajo,
   izquierda/derecha), en el mismo orden [arriba-izq., arriba-der.,
   abajo-izq., abajo-der.] en que una rejilla CSS se rellena sola — ya no
   hace falta ningún intercambio posterior en `Asiento.tsx` como hacía la ADR
   0055, el propio `ordenEspacialDesde` devuelve el orden final de pintado.
4. Si el reparto por celda empata (dos asientos cayendo en la misma celda:
   pasa en disposiciones en cruz como "Uno en cada lado", 4b, donde el
   asiento de arriba y el de abajo quedan centrados en el eje vertical, no en
   una esquina) o si no hay exactamente 4 jugadores, cae a ordenar por el
   ángulo de la posición ya girada — sigue siendo el mismo mini-mapa
   girado, solo que leído en vuelta en vez de por celdas, porque 3, 5 y 6
   asientos no encajan en una rejilla de compás limpia.

Sin `areas` completas para calcular las posiciones (algunas disposiciones no
las necesitan), cae al orden de índice llano — no hay geometría que girar, no
hay mini-mapa que trazar.

## Alternativas consideradas

Ya registradas en las ADR 0053 (orden por índice de asiento) y 0055 (orden
por ángulo relativo al visor, sin aplicar su giro); esta las reemplaza
porque ninguna de las dos modela "en qué celda cae cada uno", solo "en qué
secuencia se leen".

## Consecuencias

- Verificado contra los 8 datos exactos que dio el usuario para "Dos y dos"
  (jugadores 1 y 3 como visor): las cuatro celdas coinciden en los dos casos.
- `Asiento.tsx` ya no necesita el intercambio de los dos últimos grupos para
  simular un giro horario (`gruposDanoVisual` se retira, se usa `gruposDano`
  directamente): con el nuevo cálculo, el orden que sale de
  `ordenEspacialDesde` ya es el de pintado final.
- `tests/tablero/layouts.test.ts` cubre "Dos y dos" desde dos visores
  distintos (0° y 180° de giro) con los valores exactos confirmados por el
  usuario, el caso de empate por forma en cruz de "Uno en cada lado" (4b,
  cae al orden por ángulo), y el caso sin `areas`.
- Queda sin verificar en un navegador real con los jugadores 2 y 4 de "Dos y
  dos" (el usuario se ofreció a darlos pero no hicieron falta: el modelo ya
  cuadraba con los 8 datos de 1 y 3); si al probarlo en el tablero real algo
  no coincidiera, revisar esos dos casos primero.

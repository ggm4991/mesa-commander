# 0053. El cuadrado de daño de comandante empieza por el propio asiento y sigue en sentido horario

Fecha: 2026-10-29
Estado: Reemplazada por 0055

## Contexto

Probado con gente real, el usuario señaló que en el cuadrado de daño de
comandante de cada jugador, los demás deberían salir ordenados como ese
jugador los ve sentados alrededor de la mesa, no en un orden fijo ajeno a
dónde está sentado cada uno. `comandantesAgrupadosPorJugador()` siempre
devolvía los grupos en el mismo orden de índice de asiento (0, 1, 2...)
para todo el mundo — el cuadrado de daño del asiento 2 y el del asiento 0
mostraban a los jugadores exactamente en el mismo orden, aunque cada uno
los vea en una disposición distinta alrededor suyo.

## Decisión

`comandantesAgrupadosPorJugador(juego, indiceVisor)` gana un segundo
parámetro: el índice de quien mira el cuadrado. Los grupos pasan a
devolverse empezando por ese asiento y dando la vuelta en el mismo sentido
horario que ya tienen los propios índices de asiento (regla 103.1, ver ADR
0031) — no hace falta ninguna geometría nueva: los índices de asiento ya
están en orden horario desde que se decidió así para pasar turno, así que
"empezar por mí y seguir horario" es sencillamente `(indiceVisor + paso) %
n`. `Asiento.tsx` pasa su propio `indice` al llamar.

## Alternativas consideradas

- **Calcular el orden a partir de la posición real en la rejilla**
  (`dispo.areas`, ángulos entre celdas). Se descarta: más complejo, y no
  hace falta — los índices de asiento ya codifican el orden horario real
  desde la ADR 0031, reutilizarlo es más simple y consistente con cómo ya
  se resolvió el mismo problema para pasar turno.

## Consecuencias

- Verificado con un navegador real, 4 jugadores: el cuadrado del asiento 2
  muestra el orden [2 (uno mismo), 3, 0, 1] — empezando por sí mismo y
  dando la vuelta.
- El reparto en la rejilla (columnas/filas por `sqrt`, ADR 0019) sigue
  llenándose en orden de lectura (izquierda a derecha, arriba a abajo): con
  pocos jugadores no traza una vuelta perfectamente circular dentro del
  cuadrado, pero el orden de los datos sí es el correcto — una mejora real
  sobre el orden fijo de antes, aunque no un mini-mapa geométrico exacto.
- `comandantesAgrupadosPorJugador()` sin segundo argumento sigue
  funcionando igual que antes (por defecto 0), para no romper a quien ya
  la llamaba así.

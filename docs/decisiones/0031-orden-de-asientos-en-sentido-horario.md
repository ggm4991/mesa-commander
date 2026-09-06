# 0031. El orden de los asientos sigue las agujas del reloj, no el de la rejilla

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

El usuario reportó que al pasar el turno, este no avanzaba "en el sentido de
las agujas del reloj, al jugador de mi izquierda". La regla 103.1 de las
Reglas Completas lo confirma: *"The game's default turn order begins with
the starting player and proceeds clockwise"* — el turno tiene que avanzar en
sentido horario visto desde arriba, salvo que la mesa acuerde otra cosa.

`pasarTurno()` (`motor/partida.ts`, y su equivalente en `app.html`) nunca ha
hecho nada más sofisticado que `(turno + 1) % número de jugadores` — pasa al
siguiente **índice**, sin ningún conocimiento de dónde se pinta ese asiento
en la mesa. Eso es correcto siempre que el índice de cada asiento se asigne
ya en sentido horario al construir la disposición — y no era el caso: las
`areas` de `disposiciones.ts` (y los `area` de emergencia de `layouts.ts`)
colocaban los índices en el orden en que resultaba más simple describir la
rejilla CSS, no en el orden en que un jugador real los recorrería alrededor
de la mesa.

Por ejemplo, en "Dos y dos" (4 jugadores, sin `areas`, rejilla 2×2 implícita)
el reparto por filas de toda rejilla CSS da índice0=arriba-izquierda,
índice1=arriba-derecha, índice2=abajo-**izquierda**, índice3=abajo-derecha.
`índice+1` iba entonces arriba-izq. → arriba-der. → abajo-**izq.** →
abajo-der. — de arriba-derecha saltaba en diagonal a abajo-izquierda en vez
de continuar al asiento de al lado (abajo-derecha), ni siquiera en sentido
antihorario consistente: un salto en diagonal cruzando la mesa entera.

## Decisión

Reordenar las `areas`/`rot` de cada disposición con geometría real (más de
2 asientos, con posiciones distintas alrededor de una mesa) para que el
**índice de cada asiento sea ya su posición en sentido horario**, visto en
planta desde arriba (que es exactamente cómo se lee la rejilla CSS: el
teléfono tumbado en el centro de la mesa, cada esquina de la pantalla es esa
esquina física de la mesa):

- `disposiciones.ts`: `3a`, `3b`, `4a`, `4b`, `5a`, `5b`, `6a`, `6b`.
- `layouts.ts` (el reparto de emergencia cuando la disposición guardada no es
  válida): `LAYOUTS[3]`, `LAYOUTS[4]`, `LAYOUTS[5]`, `LAYOUTS[6]`, añadiendo
  las entradas de `area` que faltaban para forzar el mismo orden.

**No se toca `pasarTurno()` en absoluto.** Con los índices ya en sentido
horario, `índice + 1` *es* "el siguiente en sentido horario" — la única
fuente de la verdad para el orden de turno es el índice del asiento, y
corregirlo ahí (una sola vez, al definir la disposición) evita duplicar la
lógica de "quién es el siguiente" en dos sitios.

Quedan **sin tocar** las disposiciones en columna (`3c`, `4c`) y "todos en la
misma dirección" (`5c`, `6c`): no representan una mesa real vista en planta
con gente alrededor —son un acomodo práctico (todos mirando el mismo lado,
o apilados en una lista) donde "sentido horario" no tiene un significado
físico claro, y el orden de lista de arriba a abajo ya es el más intuitivo
posible para ellas.

## Alternativas consideradas

- **Calcular el siguiente turno geométricamente en `pasarTurno()`** (a partir
  de `dispo.rot`/`areas`, buscando el asiento físicamente más próximo en
  sentido horario). Se descarta: mucho más código y complejidad para un
  problema que se resuelve por completo fijando el orden una sola vez, al
  definir la disposición — y `pasarTurno()` seguiría necesitando algo
  sensato para las disposiciones "en columna" sin geometría real, que aquí
  ya lo tienen gratis (el orden de la lista).
- **Dejar que el usuario reordene los asientos a mano.** Ya existe algo
  parecido (elegir “empiezo yo” y las rotaciones por asiento), pero no
  resuelve el problema de fondo: la disposición por defecto debe ser
  correcta sin que nadie tenga que corregirla partida a partida.

## Consecuencias

- Verificado con un navegador real en dos disposiciones de 4 jugadores
  ("Dos y dos" y "Uno en cada lado"): el orden de turno recorrido con
  "Pasar turno" va Ana → Beto → Cris → Dani → Ana siguiendo de verdad el
  sentido horario de sus posiciones en pantalla, y la rejilla se sigue
  viendo igual que antes (el cambio es solo qué índice cae en qué celda, no
  la forma de la mesa).
- 5 pruebas nuevas fijan el orden esperado de `areas`/`rot` para las
  disposiciones más representativas (`3a`, `4a`, `4b`, `6b` en
  `disposiciones.ts`; el reparto de emergencia de 3, 4 y 5 en
  `layouts.ts`), para que una futura reordenación accidental de la rejilla
  no vuelva a romper el sentido horario sin que ningún test lo note.
- Una partida guardada con una disposición ya elegida (`config.disposicion`)
  no necesita ninguna migración: `dispoActual()` sigue leyendo `id` y `rot`
  de lo guardado, pero las `areas`/`cols` siempre vienen de la definición
  actual de `DISPOS`, así que recogen el arreglo en cuanto se abre la app.

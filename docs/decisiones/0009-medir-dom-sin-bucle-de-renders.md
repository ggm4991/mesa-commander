# 0009. Medir el DOM en un hook exige comparar antes de actualizar el estado

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

`calcularBordes()`/`aplicarBordes()` en app.html median la posición de cada
asiento contra el centro del tablero y escribían el resultado directamente
como estilo en línea, cada vez que `pintarTablero()` volvía a dibujar todo —
sin coste, porque no era código reactivo: escribir en `el.style` no dispara
nada por sí solo.

Al portar esa medición a `useBordesAsientos` (un hook que mide con
`getBoundingClientRect` y guarda el resultado con `useState` para que
`Asiento` lo reciba como prop), la primera versión repetía la misma lógica:
recalcular en un `useLayoutEffect` sin lista de dependencias, para que
cualquier cambio de tamaño real se reflejara sin tener que enumerar cada
motivo posible. Eso reventó en la primera prueba que montó el tablero de
verdad: `setBordes` con un array *nuevo* (aunque con el mismo contenido) hace
que React vuelva a renderizar, lo que dispara otra vez el efecto, que vuelve
a crear un array nuevo... un bucle que agotó el límite de actualizaciones
anidadas de React.

## Decisión

`useBordesAsientos` sigue recalculando tras cada render (igual que el
original recalculaba en cada `pintarTablero()`), pero antes de llamar a
`setBordes` compara el resultado nuevo con el guardado, campo a campo, y solo
actualiza el estado si algo cambió de verdad. Cuando la geometría se
estabiliza, las llamadas siguientes no generan más renders.

## Alternativas consideradas

- **Añadir una lista de dependencias más ajustada al efecto** (por ejemplo,
  solo el número de jugadores y la disposición). Se descarta porque el
  tamaño real de un asiento puede cambiar por motivos que no están en esa
  lista — el contenido de la ficha, el propio layout del contenedor — y el
  original nunca se limitó a esos casos.
- **No usar `useState` para el resultado**, y aplicar los estilos
  directamente a los nodos del DOM vía refs, como hacía el original. Se
  descarta porque mezclaría mutación directa del DOM con el resto del
  componente, que ya describe el estilo declarativamente a partir de props —
  perdería la ventaja de que `Asiento` sea puramente función de sus props.

## Consecuencias

- Cualquier hook futuro que mida el DOM y guarde el resultado en estado de
  React tiene que comparar antes de actualizar, no dar por hecho que "total,
  solo se llama cuando hace falta" — un efecto sin lista de dependencias que
  siempre produce un valor nuevo es, en la práctica, siempre "hace falta".
- Queda como prueba de regresión (`tests/tablero/useBordesAsientos.test.tsx`)
  montando el hook de verdad en jsdom y comprobando que el número de renders
  se mantiene acotado.

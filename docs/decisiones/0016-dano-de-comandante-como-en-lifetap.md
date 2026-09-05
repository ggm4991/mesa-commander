# 0016. Daño de comandante con un icono tocable por fuente, sin panel intermedio

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

El daño de comandante se apuntaba abriendo `ModalPanelDano`: un botón con un
icono de espadas y un resumen de texto, que abría un modal con un contador
(stepper de −/valor/+) por cada comandante en la mesa. Correcto, pero con
fricción — abrir el panel, buscar la fila, tocar el `+`, cerrar. El usuario
pidió llevarlo a la forma en que lo hace **LifeTap**, un contador de vidas
de referencia para Commander: un icono/retrato tocable por cada rival, sin
menú intermedio — tocar suma, mantener pulsado (o deslizar) resta.

## Decisión

- **Un icono circular por cada comandante en la mesa** (`comandantesEnMesa()`,
  sin cambios en el motor — la fuente de la verdad ya estaba ahí desde antes
  de la Fase 3), con su ilustración de fondo si Scryfall la tiene
  (`useImagenComandante`, la misma caché que ya usan el editor de mazos y el
  fondo del asiento) o su identidad de color si no. El propio comandante de
  quien tiene el asiento también aparece — por si se lo roban, sigue
  contando (regla 903.10a) — igual que ya pasaba en el panel.
- **Un toque suma un punto; mantener pulsado (450ms) resta uno.** Nuevo hook
  `useTocarYMantener`, distinto de `useMantenerPulsado` (que repite la misma
  acción mientras se mantiene, para los botones de +/- vida): aquí las dos
  acciones son opuestas y cada una se dispara una sola vez por gesto, no en
  bucle — sumar de golpe muchos puntos de daño no es el caso común, y
  mantener pulsado para repetir habría hecho fácil pasarse sin darse cuenta.
- **El daño acumulado se ve como una insignia** sobre el icono, en vez de
  como texto en un botón; a partir del umbral letal (21) el icono se marca
  en rojo, igual que hacía el `.val.letal` del panel.
- **Se retira `ModalPanelDano`** en vez de dejarlo como alternativa: mantener
  las dos formas de apuntar el mismo dato habría sido codificar la misma
  regla dos veces, con el riesgo de que una de las dos se quedara desactualizada.

## Alternativas consideradas

- **Añadir los iconos manteniendo el modal como detalle/reserva.** Se
  descarta: el propio pedido era sustituir el flujo de "abrir un menú",
  y mantener las dos vías es la clase de código muerto/duplicado que este
  proyecto evita a propósito.
- **Que mantener pulsado repita la resta** (como `useMantenerPulsado`).
  Se descarta: para un dato que casi siempre sube y rara vez baja más de
  un punto de golpe, repetir habría sido fácil de disparar sin querer y
  difícil de frenar a tiempo.

## Consecuencias

- Verificado con un navegador real en una mesa de 4: los cuatro iconos (uno
  por comandante, incluido el propio) caben junto al contador de jugadas
  retiradas sin apretar la fila; un toque sube la insignia a 1, mantener
  pulsado la quita de nuevo — sin errores de consola.
- Queda como prueba de regresión (`useTocarYMantener.test` vía
  `IconoDanoComandante.test.tsx`) que un toque corto nunca resta y que
  mantener pulsado nunca suma, y que soltar fuera del icono antes de tiempo
  no dispara ninguna de las dos.

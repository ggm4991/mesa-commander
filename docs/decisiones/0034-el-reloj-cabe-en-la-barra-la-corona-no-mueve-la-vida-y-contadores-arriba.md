# 0034. El reloj cabe en su barra, la corona no mueve la vida, y los contadores suben arriba

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Nada más probar la ADR 0033 (reloj girado a 90°/270°), el usuario encontró
cuatro problemas más, ninguno relacionado entre sí salvo por tocar la misma
pantalla de juego:

1. **El reloj se salía de la barra central.** La ADR 0033 hizo que
   `Tablero` calculara un `row-gap` lo bastante alto para que el botón del
   reloj girado no invadiera los asientos de al lado, pero nunca aplicó esa
   misma medida al **fondo visual de la propia barra** (`.hub`): la barra
   seguía teniendo su alto de siempre (~69px) mientras el botón, girado a
   90°/270°, medía hasta 132px — así que el reloj asomaba por arriba y por
   abajo del fondo oscuro de la barra, aunque ya no tocara ningún asiento.
2. **Ser el monarca desplazaba la vida hasta solaparla con "Daño de
   comandante".** La corona vivía dentro del flujo normal de `.life-wrap`
   (por encima del número, con un hueco de por medio): al aparecer, hacía
   más alto ese bloque y el número de vida —centrado dentro— se corría hacia
   abajo, invadiendo el botón de debajo. El usuario pidió además subir un
   poco la corona, ahora que hay más hueco para hacerlo.
3. **La fila de maná y contadores sueltos se solapaba con las dos esquinas
   fijas de abajo** (jugadas rehechas y veces que se pasó de tiempo, ambas
   de la ADR 0026): en cuanto había varios contadores a la vez, esa fila
   creciente competía por el mismo espacio que esas dos esquinas, siempre
   ancladas ahí.
4. **El aviso de "se pasó de tiempo" hacía que el reloj "girase y se
   moviera".** La animación de latido (`@keyframes latido`, con
   `transform: scale(1.04)` en su punto medio) sustituye por completo el
   `transform` del botón mientras dura el pulso — incluida la rotación que
   aplican `.hub .pass[data-rot='...']` desde la ADR 0024/0033. El reloj
   volvía a 0° en cada pulso y volvía a girar al terminar, dando la
   sensación de que giraba solo.

## Decisión

- **`Hub` recibe `altoBarra` y lo fija como su propio `height`** (no solo
  como `row-gap` de `.board`): ahora el fondo de la barra crece exactamente
  lo mismo que el hueco que ya reservaba `Tablero`, así que el reloj girado
  siempre queda dentro de su propio fondo visual, nunca asomando por fuera.
- **`.corona` pasa a `position: absolute`**, igual que ya hace `.delta`
  (ADR 0026): ancla a `bottom: 100%` de `.life-wrap` con un margen pequeño
  (4px, más cerca que el de `.delta` para que quede claramente "encima" sin
  alejarse de más). Al salir del flujo, ganar o perder la corona ya no
  cambia el alto de `.life-wrap`, así que el número de vida no se mueve.
- **El maná y los contadores sueltos suben junto a `.seat-top`**, en una
  fila propia (`.seat-estados`, antes `.seat-bot`) alineada a la izquierda
  en vez de centrada — lejos de las dos esquinas fijas de abajo, que se
  quedan donde estaban.
- **La rotación del reloj pasa a una variable CSS (`--rot`)** en vez de
  fijarse directamente en `transform`, y el `@keyframes latido` combina esa
  variable con su propia escala (`transform: rotate(var(--rot)) scale(1.04)`)
  en vez de sustituir el `transform` entero. Verificado en aislado: la
  matriz de transformación durante los diez fotogramas de un ciclo entero
  de la animación siempre corresponde a una rotación de 90° escalada, nunca
  a la identidad.

## Alternativas consideradas

- **Fijar un `min-height` a mano en `.hub` para el caso girado**, en vez de
  aplicar la misma medida ya calculada por JS. Se descarta por la misma
  razón que ya dieron las ADR 0025 y 0026: un número fijo adivinado a mano
  vuelve a quedarse corto en cuanto cambia el contenido; ya existía la
  medida real calculada, solo hacía falta aplicarla también aquí.
- **Quitar del todo la animación de "se pasó de tiempo"** en vez de
  arreglar el conflicto con la rotación. Se descarta: el usuario pidió
  quitar el giro y el movimiento indebidos, no el aviso en sí, que sigue
  cumpliendo su función de alertar sin depender de mirar el número exacto.

## Consecuencias

- Verificado con un navegador real en una mesa de 5 "Rodeando el móvil":
  con el turno de alguien a un lado, el alto de la barra y el del botón del
  reloj coinciden exactamente (334–466px los dos), sin que el reloj asome.
- Verificado con un navegador real que la posición del número de vida
  (`getBoundingClientRect`) es idéntica antes y después de asignar la
  corona a ese jugador.
- Verificado con un navegador real en una mesa de 4 en una ventana pequeña
  (480×700): con varios contadores y maná activos a la vez, la fila de
  arriba a la izquierda y las dos esquinas de abajo no se solapan en
  ningún píxel.
- Verificado en una página aislada que la animación de latido, aplicada a
  un botón con `data-rot="90"`, mantiene la rotación en los diez
  fotogramas muestreados a lo largo de un ciclo completo.
- 4 pruebas nuevas (la corona vive dentro de `.life-wrap`, la fila de
  contadores aparece antes que la fila de vida, `Hub` aplica el alto que
  se le pasa).

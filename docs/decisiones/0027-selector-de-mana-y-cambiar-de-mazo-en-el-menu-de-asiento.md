# 0027. El menú de asiento cambia de mazo en vez de solo editar comandante, y el maná pasa a un selector

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Probando la app en un móvil real (no solo en el navegador de escritorio, que
es donde se habían verificado las rondas anteriores), el usuario encontró dos
problemas en `ModalMenuAsiento`, el menú que se abre desde el botón "···" de
cada asiento:

1. **La fila de maná se salía del propio popup del menú.** Mostraba seis
   botones (uno por color) más un botón "Vaciar", todos en la misma fila
   (`.stepper` con `gap:4`) — en una pantalla de escritorio ancha cabía, pero
   en un móvil de verdad (390px de ancho, frente a los 1000px con los que se
   había probado hasta ahora) esa fila era más ancha que el propio modal.
2. **El botón "Cambiar nombre o comandante" abría un formulario de texto
   libre** para escribir el comandante a mano — cuando la app ya tiene un
   sistema de perfiles con mazos guardados (nombre, comandantes, colores e
   imagen fija), pensado exactamente para no tener que volver a escribir eso
   cada vez.

## Decisión

- **El maná pasa de "seis botones + vaciar" a "un selector de color + un
  paso compartido"**: una fila de seis pastillas de color (reutilizando
  `.color-btn`, el mismo componente que ya usa la identidad de color del
  editor de mazo, aquí en modo selección única en vez de múltiple) elige qué
  color se está tocando; debajo, un `.stepper` normal (−, valor, +) igual que
  el resto de contadores del menú ajusta ese color con `onMana(color,
  delta)`. "Vaciar todo" queda como una fila aparte, ya no compite por
  espacio con los colores. `ajustarMana` ya aceptaba un `delta` (para el
  "tocar para gastar uno" del asiento, ver ADR 0022); `onMana` en
  `ModalMenuAsiento` pasa a aceptarlo también, en vez de asumir siempre +1.
- **"Cambiar nombre o comandante" pasa a "Cambiar de mazo"**: el paso interno
  (antes `EditarJugador`) pasa a `CambiarMazo`, que además del nombre
  muestra la misma lista de perfiles y sus mazos que ya usa
  `ModalElegirAsiento` en la pantalla previa (mismo componente
  `Desplegable`, mismo `mazoUltimo()`). Elegir un mazo guardado rellena de
  golpe comandante(s), colores e imagen fija; los campos de texto de
  comandante y la paleta de colores se quedan debajo, ahora explícitamente
  como alternativa ("O escribe un comandante para esta partida, sin
  guardarlo como mazo") para cuando el mazo no está guardado como perfil.
  `Tablero` pasa a leer `usePerfiles()` (ya existía, se usaba en la Previa)
  y se lo pasa a `ModalMenuAsiento`.
- **`CambiosJugador` (y `editarJugador`) ganan `imagenId`/`imagenId2`**: sin
  esto, cambiar de mazo actualizaría el nombre del comandante pero dejaría la
  edición de imagen fijada apuntando al comandante anterior — con
  `useImagenComandante` resolviendo por id antes que por nombre (ADR 0015),
  el asiento seguiría mostrando la ilustración del comandante viejo con el
  nombre del nuevo.

## Alternativas consideradas

- **Envolver los seis botones de maná en una fila que haga scroll
  horizontal** en vez de un selector. Se descarta: además de menos
  descubrible en un móvil (nada indica que hay más botones fuera de la
  vista), sigue sin resolver el problema de fondo, que es meter demasiados
  controles del mismo tipo en una sola fila.
- **Quitar del todo la opción de escribir un comandante a mano**, dejando
  solo elegir entre mazos guardados. Se descarta: obligaría a crear un
  perfil completo (Previa → gestionar perfiles) solo para cambiar el
  comandante de una partida ya empezada, una regresión de capacidad frente
  a lo que ya había.

## Consecuencias

- Verificado con un navegador real en un viewport de móvil de verdad
  (390×844, no el 1000×800 usado hasta ahora): ningún elemento del menú se
  sale del ancho de la pantalla, el selector de maná cambia de color
  correctamente y ajusta el valor de ese color, y "Cambiar de mazo" muestra
  el nombre y los campos manuales cuando no hay perfiles guardados.
- Elegir un mazo guardado y que rellene comandante/colores/imagen se
  verificó con pruebas automáticas (reutilizando exactamente el mismo
  componente de lista que ya se verificó a mano en la Fase 3 para la
  pantalla previa), no con captura de pantalla.
- Cualquier otra pantalla de esta app que meta varios botones del mismo tipo
  en una sola fila debería probarse también en un viewport de móvil real, no
  solo en uno de escritorio: este bug concreto no se había visto en las ocho
  rondas anteriores de verificación porque todas usaron una ventana ancha.

# 0018. Imagen y daño propios para el compañero, cuadrado más grande, sectores que se abren

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Tras probar la ADR 0017, el usuario encontró que un mazo con compañero no
dejaba elegir la ilustración del segundo comandante, ni parecía dejar
apuntarle daño por separado — y pidió además que el cuadrado de sectores
fuera más grande, y que mantener pulsado un sector no restara a ciegas,
sino que lo abriera en dos mitades (sumar/restar) que se cerraran solas al
tocar fuera o pasado un rato.

Revisando el código: `comandantesEnMesa()` ya incluía al compañero como una
fuente de daño independiente (clave `"k:1"`), así que el daño en sí ya se
podía apuntar — el problema real era que **todos los sectores de un mismo
jugador buscaban la imagen por nombre exacto sin distinguir cuál de sus dos
comandantes era cada uno**, y `EditorMazo` solo ofrecía el selector de
imagen para el principal. Con las dos ilustraciones por defecto siendo a
veces parecidas o ambas sin arte, resultaba fácil no notar que el segundo
sector SÍ funcionaba, y concluir que faltaba.

## Decisión

- **`Mazo`, `Asiento` y `Jugador` llevan ahora dos campos de edición
  fijada** (`imagenId` para el comandante principal, `imagenId2` para el
  compañero), en vez de uno solo. `ComandanteEnMesa` (en
  `comandantesEnMesa()`) lleva su propio `imagenId` ya resuelto —
  `x.imagenId` para el hueco 0, `x.imagenId2` para el 1 — así que
  `IconoDanoComandante` pide siempre la imagen correcta para esa carta en
  concreto, principal o compañero.
- **`EditorMazo` muestra un `SelectorImagenComandante` por cada comandante
  con nombre**, no solo para el principal. Cambiar el nombre de cualquiera
  de los dos limpia solo su propia edición fijada (la del otro no se toca).
- **El cuadrado de daño crece** de 76px/56px a 108px/76px (ver ADR 0017
  para el porqué de calcular las columnas con `ceil(sqrt(n))`; el tamaño en
  sí no tenía ninguna razón especial, solo se ajustó al ojo la primera vez).
- **Mantener pulsado un sector ya no resta directamente**: lo abre en dos
  mitades — una roja para restar, una verde para sumar — igual de grandes
  que el propio sector, así que el punto de apuntar mal no era ambiguo qué
  mitad hace qué. Se cierra solo (vuelve a mostrar la insignia normal) al
  tocar en cualquier otro sitio de la pantalla, o a los 3 segundos sin
  tocarlo. La lógica de toque-corto-suma no cambia.

## Alternativas consideradas

- **Un único campo `imagenId` compartido entre las dos cartas.** Es lo que
  había, y es exactamente lo que no dejaba distinguir la imagen de cada
  comandante — se descarta por ser la causa del problema, no una solución.
- **Que mantener pulsado siga restando directamente, y resolver la
  confusión solo con mejor texto de ayuda.** Se descarta: el pedido
  explícito era una confirmación visual antes de restar, no solo una
  etiqueta más clara sobre un gesto que ya era fácil de disparar sin querer.
- **Cerrar el sector abierto solo con un botón explícito de "cancelar".**
  Se descarta a favor de cerrar solo al tocar fuera o pasado un tiempo,
  que es más rápido de usar durante una partida y no añade un tercer botón
  a un espacio ya pequeño.

## Consecuencias

- Verificado con un navegador real: un mazo de "Thrasios, Triton Hero" +
  "Tymna the Weaver" muestra dos botones "Cambiar imagen" independientes;
  sentado en la mesa, tocar el sector de Tymna dos veces sube su daño a 2
  sin tocar el de Thrasios; mantener pulsado ese mismo sector lo abre en
  sus dos mitades roja/verde — sin errores de consola.
- Cualquier lugar futuro que muestre la imagen de un comandante por
  separado del principal (una ficha de mazo, por ejemplo) tiene que
  recordar que hay dos campos de edición fijada, no uno.

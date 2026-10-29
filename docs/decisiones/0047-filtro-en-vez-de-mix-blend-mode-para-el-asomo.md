# 0047. `mix-blend-mode` no pintaba nada en un móvil real: se cambia a `filter`

Fecha: 2026-10-21
Estado: Aceptada

## Contexto

La ADR 0046 pasó `.pbg-comandante` de `opacity` normal a `mix-blend-mode:
screen` para que el arte oscuro de algunos comandantes (Yuriko, the Tiger's
Shadow; Edgar Markov) se notara. Funcionaba verificado con un navegador de
escritorio (Chromium vía Playwright) — pero en el móvil real del usuario no
se veía absolutamente nada, ni siquiera en una pestaña de incógnito recién
abierta (descartando caché del todo, incluida la del *service worker*,
verificado que no se registra en modo desarrollo — ADR 0028).

El diagnóstico que de verdad acotó el problema: pedirle al usuario que
mirara el **tablero de verdad** (no la vista previa) con el mismo
comandante sentado. Ahí la imagen se veía perfectamente — mismo
`useImagenComandante`, misma imagen de Scryfall, pero sin `mix-blend-mode`
(`fondoAsiento` la usa a opacidad completa, sin mezcla). Eso aisló el fallo
a la combinación concreta de `mix-blend-mode` con el resto del CSS de
`.pseat` (posición absoluta, `z-index` negativo, `container-type: size`
para las *container queries*) — una combinación con la que distintos
navegadores tienen fama de comportarse de forma inconsistente.

## Decisión

`.pbg-comandante` cambia de `mix-blend-mode: screen` a `filter:
brightness(1.7) saturate(1.15)` (con `opacity: 0.55`). La diferencia de
fondo: `mix-blend-mode` depende de cómo el navegador compone esta capa con
lo que tiene detrás (justo lo que parece haber fallado); `filter` solo
transforma los píxeles de la imagen en sí, antes de mezclarla por
`opacity` normal — no depende de ninguna composición con el fondo, así que
no hereda ese mismo riesgo.

## Alternativas consideradas

- **Seguir con `mix-blend-mode` y buscar qué lo rompía** (quitar
  `container-type`, cambiar el `z-index`...). Se descarta: sin acceso al
  dispositivo que falla, ir probando variantes a ciegas development-side
  solo para mantener una técnica con fama de inconsistente no es buen uso
  del tiempo frente a cambiar a una que no tiene ese problema conocido.
- **Volver a `opacity` normal sin más** (la ADR 0045 original). Se
  descarta: ya se comprobó que no basta para el arte oscuro, es el problema
  que la ADR 0046 estaba resolviendo.

## Consecuencias

- Verificado con un navegador de escritorio (los mismos tres comandantes
  de las ADR anteriores: Yuriko, Edgar Markov, Atraxa) — pendiente de
  confirmación del usuario en su móvil real, que es donde `mix-blend-mode`
  falló y donde `filter` todavía no se ha probado. Si tampoco se viera ahí,
  el problema no sería ya la técnica de aclarado sino algo más de fondo en
  cómo ese dispositivo pinta `.pseat` — tocaría revisar con herramientas de
  desarrollador remotas (si el dispositivo lo permite) en vez de seguir
  cambiando CSS a ciegas.
- Esta es la tercera ADR seguida ajustando el mismo detalle (0045, 0046,
  0047): tiene sentido, porque cada una se apoyó en información nueva que
  no estaba disponible al escribir la anterior (el dispositivo real del
  usuario, y el descarte del tablero de verdad como punto de comparación),
  no en adivinar valores a ojo.

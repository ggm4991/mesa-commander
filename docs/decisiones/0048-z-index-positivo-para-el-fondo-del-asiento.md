# 0048. `.pbg`/`.pbg-comandante`/`.pinner` se apilan con `z-index` positivo, ninguno negativo

Fecha: 2026-10-21
Estado: Aceptada

## Contexto

Ni `mix-blend-mode` (ADR 0046) ni `filter` (ADR 0047) resolvieron que el
asomo de comandante se viera en el móvil del usuario — con `filter` puesto,
siguió sin verse nada, y el propio usuario, mirando el inspector de
elementos, señaló el `z-index` como sospechoso. Tenía razón en apuntar
ahí: lo que las dos ADR anteriores cambiaron (la mezcla) nunca era el
problema de fondo; lo que no había cambiado en ninguna de las dos —y lo
único que seguía sin funcionar en su dispositivo— era la pila de `z-index`
**negativos** (`.pbg` a `-2`, `.pbg-comandante` a `-1`, `.pinner` implícito
por delante de cualquier negativo).

Un `z-index` negativo en un elemento `position:absolute` dentro de un
contenedor con `container-type` (las *container queries* que ya usa
`.pseat` para su contenido) es justo la clase de combinación con la que
distintos navegadores —y dentro del mismo navegador, distintas rutas de
composición por GPU— tienen fama de no comportarse igual. Ya había costado
una ADR entera (0041) descubrir que ni siquiera *empatar* dos `z-index`
negativos se comportaba como cabría esperar (ganaba la base del archivo
CSS, no el orden del DOM). Visto en retrospectiva, seguir con negativos y
solo cambiar la mezcla (0046, 0047) estaba corrigiendo el síntoma
equivocado dos veces seguidas.

## Decisión

Los tres pasan a `z-index` positivo y explícito, sin ninguno negativo:
`.pbg` en `1`, `.pbg-comandante` en `2`, `.pinner` en `3` (que hasta ahora
no tenía `z-index` propio — se le añade `position: relative` para que el
valor tenga efecto, sin que eso cambie nada de su propio diseño interno,
ya que `position:relative` sin desplazamientos no mueve nada). El orden
visual es el mismo de siempre (color, imagen encima, contenido encima de
las dos); lo único que cambia es dejar de depender de la zona de
comportamiento menos consistente entre navegadores.

## Alternativas consideradas

- **Seguir ajustando la técnica de aclarado** (otro `filter`, otra
  combinación). Se descarta: ya se comprobó en la ADR 0047 que el fallo no
  estaba ahí — cambiar la mezcla sin tocar el `z-index` negativo no iba a
  arreglar nada, visto que `filter` tampoco funcionó.
- **Depurar exactamente qué parte del `z-index` negativo falla** en el
  dispositivo del usuario (¿el valor en sí? ¿la combinación con
  `container-type`? ¿algo de `filter` creando su propio contexto de
  apilamiento?). Se descarta: sin acceso directo al dispositivo, ir
  probando variantes de algo ya señalado como poco fiable cuesta más que
  cambiar a una alternativa (positivos) que no tiene ese historial.

## Consecuencias

- Verificado de nuevo en escritorio: se sigue viendo bien. Pendiente de
  que el usuario lo confirme en el dispositivo donde de verdad fallaba —
  si tampoco se viera con `z-index` positivo, el problema ya no sería de
  apilamiento en absoluto y tocaría mirar otra cosa (la propia imagen, el
  `filter`, o algo específico de ese navegador con `container-type`).
- Esta es la cuarta ADR seguida sobre el mismo detalle visual (0045-0048).
  Vale la pena anotarlo como aviso para la próxima vez que se toque
  `.pseat`: este archivo de CSS ya tiene constancia de que `z-index`
  negativo + `container-type` no es de fiar — no hace falta volver a
  descubrirlo.

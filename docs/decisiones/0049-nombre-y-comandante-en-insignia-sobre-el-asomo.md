# 0049. Nombre del jugador y comandante en insignia, ahora que hay imagen detrás

Fecha: 2026-10-21
Estado: Aceptada

## Contexto

Con el asomo de comandante ya funcionando de verdad (ADR 0045-0048), el
usuario señaló que el nombre del jugador y la línea de comandante, que
antes solo tenían que leerse sobre un degradado de color liso, ahora
cuesta un poco más leerlos sobre la ilustración. Propuso dos opciones:
letra más grande, o una insignia con fondo negro semitransparente ajustada
al texto.

## Decisión

Las dos cosas, pero la insignia es la que de verdad resuelve el problema:
agrandar la letra no garantiza contraste si lo que falla es que el fondo
tiene zonas claras, la insignia sí, pase lo que pase detrás. `.pinner b`
(el nombre) y `.pinner .det` (comandante + pips) pasan a llevar el mismo
tratamiento que ya usa `.badge` y el resto de avisos fijos de la app
(fondo `rgba(0,0,0,.45)`, borde sutil, muy redondeado) — no una técnica
nueva, la misma que ya existía en otro sitio. De paso, la letra sube un
poco (nombre de 14.5px a 16px, comandante de 11.5px a 12.5px).

## Alternativas consideradas

- **Solo agrandar la letra**, como pedía la primera opción del usuario. Se
  descarta como única medida: no arregla el caso de que la imagen tenga una
  zona clara justo donde cae el texto, que es precisamente lo que motivó
  la pregunta.

## Consecuencias

- Verificado con un navegador real, con los mismos comandantes de las ADR
  anteriores (arte oscuro y claro): el nombre y el comandante se leen bien
  en los dos casos, sin tapar la ilustración de más de lo que ya hacía el
  degradado.
- Los asientos libres (que no tienen imagen detrás, solo el degradado) se
  ven con la misma insignia — no hacía falta separar los dos casos, y
  mantiene un aspecto uniforme en toda la vista previa.

# 0010. Una vista que apunta a un jugador borrado se corrige durante el render

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

`pintarRegistro()` en app.html comprobaba, antes de pintar nada, si la ficha
abierta (`vistaReg.tipo === "jugador"`) seguía correspondiendo a un jugador con
partidas; si no, volvía a la clasificación. Eso puede pasar al borrar la única
partida de alguien, o al renombrarlo desde donde ya no queda memoria del
nombre anterior.

Portar esa comprobación a `Registro.tsx` con un `useEffect` (como se había
hecho para leer las partidas al montar) generaba un aviso propio de `oxlint`:
`react(set-state-in-effect)`. El aviso tiene razón — un efecto que llama a
`setState` sin sincronizar con nada externo (red, DOM, temporizador) solo
añade un render de más de retraso entre "los datos cambiaron" y "la vista se
corrige", con la posibilidad real de que se llegue a pintar un instante con la
ficha de un jugador que ya no existe.

## Decisión

La comprobación se hace en el cuerpo del componente, no en un efecto: si
`vista` apunta a un nombre que ya no está en `nombresJugadores(partidas)`, se
llama a `setVista({tipo:'ranking'})` directamente durante el render, siguiendo
el patrón que la propia documentación de React llama "ajustar el estado
durante el render" (distinto de un efecto: no sincroniza con nada externo,
solo corrige el estado de este componente a partir de sus propias props/
estado). React repite el render antes de pintar nada, así que no hay
parpadeo ni instante con datos inconsistentes.

## Alternativas consideradas

- **Un `useEffect` con `[partidas, vista]` como dependencias.** Es lo que se
  probó primero; funciona, pero es exactamente el patrón que la regla de
  `oxlint` desaconseja, y aquí no hace falta: no hay nada externo que
  sincronizar, solo estado derivado de las propias partidas.
- **Calcular la vista efectiva sin tocar el estado** (una variable local
  `vistaEfectiva` usada solo para pintar, dejando `vista` desactualizado).
  Se descarta porque el estado quedaría mintiendo — por ejemplo, `busqueda`
  seguiría asociada a un jugador que ya no existe si el usuario reabre otra
  ficha antes de que el estado se corrija.

## Consecuencias

- El patrón queda disponible para pantallas futuras: si una vista puede
  quedar apuntando a algo que ya no existe, la corrección va en el cuerpo del
  componente (con una condición que dejé de cumplirse tras corregir, para no
  entrar en bucle), no en un efecto.

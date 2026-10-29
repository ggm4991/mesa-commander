# 0043. Ajuste fino tras subir los botones de comandante: vida en píxeles fijos, y el impuesto muestra su número al tocar

Fecha: 2026-10-20
Estado: Aceptada

## Contexto

Probando en el móvil la ADR 0042 (daño/impuesto de comandante arriba, solo
icono), el usuario reportó dos cosas más:

1. Los botones de +/- vida ya no quedaban alineados con el número de vida.
2. Al quitarle el texto al botón de impuesto, su número (`Comandante ×N`)
   dejó de verse del todo — pedía que al menos se viera al tocarlo.

## Decisión

**Alineación de +/- vida.** Causa real: `.tap` (el botón de +/- vida) ya
tenía un ajuste fino para subir el signo un poco del centro exacto del
botón y que quedara a la altura del número de vida (`padding-bottom`,
pensado para compensar que el botón ocupa el alto entero de `.life-row`
mientras que el número de vida es mucho más bajo). Ese ajuste estaba en
**porcentaje del alto del propio botón** — y la ADR 0042 acababa de
añadirle una fila nueva encima (`.acciones-arriba`), que le quita alto a
`.life-row` (reparten el mismo alto fijo del asiento entre más filas). El
número de píxeles que compensaba antes el porcentaje ya no era el mismo.
Pasa a un valor fijo en píxeles, que no depende de cuánto mida `.life-row`
en cada momento — el número de vida no se mueve por los cambios de layout
de alrededor, así que el ajuste que lo compensa tampoco debería.

**Número de impuesto al tocar.** El botón de impuesto ya no muestra
`Comandante ×N` todo el rato (ADR 0042), así que no hay forma de ver el
valor actual de un vistazo. En vez de volver a mostrarlo siempre (perdiendo
lo que se ganó al simplificar el botón), se toma el mismo patrón que ya
usa la app para los cambios de vida: `deltasVisibles` en `Tablero.tsx`
hace aparecer un "+N"/"-N" dorado sobre el número de vida un momento y
luego se apaga solo. Aquí, local a `Asiento.tsx` (no hace falta coordinarlo
con nada más, a diferencia del delta de vida, que también dispara un
apunte en el registro): al tocar el botón de impuesto aparece "×N" encima,
con el mismo estilo visual que `.delta`, y se apaga a los 1.5s.

## Alternativas consideradas

- **Mostrar el número siempre, como una insignia pequeña en una esquina del
  botón** (al estilo de `.retirada-esquina`). Se descarta: el usuario pidió
  explícitamente "cuando se haga clic..., debe mostrar el número", que
  apunta a una revelación al tocar, no a un dato permanente — y además
  habría que volver a dejarle sitio de ancho al botón, parte de lo que se
  quiso quitar en la ADR 0042.
- **Recalcular el porcentaje de `padding-bottom`** en vez de pasar a
  píxeles fijos. Se descarta: arreglaría el síntoma de hoy, pero el mismo
  problema volvería a aparecer la próxima vez que cambie cuánto ocupan las
  filas de encima de `.life-row` — ya ha pasado una vez en esta misma
  sesión.

## Consecuencias

- Verificado con un navegador real: los centros de `.tap` y `.life` ya
  coincidían exactamente como cajas (la diferencia siempre fue de qué tan
  centrado queda el signo dentro de su caja, no de la caja en sí); con el
  valor en píxeles fijos el signo queda visualmente a la altura del número
  en la captura, igual que antes de la ADR 0042.
- Verificado también que al tocar el botón de impuesto aparece "×N" (el
  valor correcto, recién actualizado) y desaparece solo pasado 1.5s.
- Si en el futuro vuelve a cambiar cuánto ocupan las filas de arriba del
  asiento, conviene revisar a ojo si 32px de `padding-bottom` en `.tap`
  sigue pareciendo bien alineado — ya no se desajusta solo, pero tampoco se
  recalcula solo.

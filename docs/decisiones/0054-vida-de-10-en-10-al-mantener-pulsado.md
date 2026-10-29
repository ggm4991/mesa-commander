# 0054. Mantener pulsado +/- vida un segundo pasa a saltos de 10

Fecha: 2026-10-29
Estado: Aceptada

## Contexto

Probado con gente real, el usuario pidió que mantener pulsado los botones
de +/- vida, pasado un segundo, subiera o bajara la vida de 10 en 10 en
vez de seguir de 1 en 1 — un patrón habitual en este tipo de apps (entre
ellas LifeTap) para cambios grandes de vida sin tener que tocar decenas de
veces.

## Decisión

`useMantenerPulsado` (hasta ahora genérico, pero solo lo usan los botones
de vida) pasa su callback de `() => void` a `(acelerado: boolean) => void`:
la primera pulsación y las repeticiones de antes de un segundo llegan con
`false`; pasado `UMBRAL_ACELERAR_MS` (1000ms) manteniendo pulsado, con
`true`. `Asiento.tsx` decide qué significa eso — `onCambiarVida(acelerado
? ±10 : ±1)` — el hook en sí no sabe nada de vida, solo de tiempo.

El ritmo de repetición también cambia una vez acelerado: de los 95ms de
siempre (pensados para pasos de 1) a 180ms — repetir saltos de 10 al mismo
ritmo que saltos de 1 sería devorar la vida sin control alguno.

## Alternativas consideradas

- **Un segundo hook específico para vida**, dejando `useMantenerPulsado`
  intacto. Se descarta: al día de hoy solo lo usan estos dos botones, así
  que ampliar el hook existente no duplica nada ni le añade una
  responsabilidad que no fuera a usar nadie más.

## Consecuencias

- Verificado con un navegador real: mantener pulsado "+" 1.6 segundos subió
  la vida de 40 a 77, confirmando que las últimas repeticiones ya saltan de
  10 en 10 y no de 1 en 1.
- Si en el futuro otro botón reutiliza `useMantenerPulsado` sin necesitar
  esta aceleración, puede ignorar el argumento `acelerado` sin problema —
  la firma solo añade información, no obliga a usarla.

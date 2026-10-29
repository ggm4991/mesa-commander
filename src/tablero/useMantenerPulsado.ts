import { useEffect, useRef } from 'react'

const RETRASO_MS = 450
const REPETIR_MS = 95
/** Pasado este tiempo manteniendo pulsado, cada repetición pasa a ser "acelerada"
 * (quien llama decide qué significa eso — en los botones de vida, ±10 en vez de
 * ±1, ver ADR 0054). Más lenta que `REPETIR_MS`: saltar de 10 en 10 al mismo
 * ritmo que antes de 1 en 1 sería devorar la vida sin control. */
const REPETIR_ACELERADO_MS = 180
const UMBRAL_ACELERAR_MS = 1000

/**
 * Mantener pulsado repite la acción, igual que los botones de +/- vida en
 * app.html (`hold1`/`hold2`). A diferencia del original, que solo podía seguir
 * una pulsación a la vez (una única pareja de temporizadores global), aquí cada
 * botón lleva los suyos — no hay diferencia práctica (solo se pulsa un botón a
 * la vez con el dedo o el ratón), pero evita una variable compartida entre todos
 * los asientos.
 *
 * `alPulsar` recibe si esta repetición ya es "acelerada" (se lleva
 * `UMBRAL_ACELERAR_MS` o más manteniendo pulsado) — la primera llamada y las de
 * antes de llegar a ese umbral siempre son `false`.
 */
export function useMantenerPulsado(alPulsar: (acelerado: boolean) => void) {
  const timers = useRef<{ inicial?: ReturnType<typeof setTimeout>; repetir?: ReturnType<typeof setTimeout> }>({})
  const desdeRef = useRef(0)
  const alPulsarRef = useRef(alPulsar)
  useEffect(() => {
    alPulsarRef.current = alPulsar
  }, [alPulsar])

  const soltar = () => {
    clearTimeout(timers.current.inicial)
    clearTimeout(timers.current.repetir)
    timers.current = {}
  }

  useEffect(() => soltar, [])

  const empezar = (e: React.PointerEvent) => {
    e.preventDefault()
    desdeRef.current = Date.now()
    alPulsarRef.current(false)
    timers.current.inicial = setTimeout(function repetir() {
      const acelerado = Date.now() - desdeRef.current >= UMBRAL_ACELERAR_MS
      alPulsarRef.current(acelerado)
      timers.current.repetir = setTimeout(repetir, acelerado ? REPETIR_ACELERADO_MS : REPETIR_MS)
    }, RETRASO_MS)
  }

  return {
    onPointerDown: empezar,
    onPointerUp: soltar,
    onPointerLeave: soltar,
    onPointerCancel: soltar,
  }
}

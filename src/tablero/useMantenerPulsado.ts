import { useEffect, useRef } from 'react'

const RETRASO_MS = 450
const REPETIR_MS = 95

/**
 * Mantener pulsado repite la acción, igual que los botones de +/- vida en
 * app.html (`hold1`/`hold2`). A diferencia del original, que solo podía seguir
 * una pulsación a la vez (una única pareja de temporizadores global), aquí cada
 * botón lleva los suyos — no hay diferencia práctica (solo se pulsa un botón a
 * la vez con el dedo o el ratón), pero evita una variable compartida entre todos
 * los asientos.
 */
export function useMantenerPulsado(alPulsar: () => void) {
  const timers = useRef<{ inicial?: ReturnType<typeof setTimeout>; repetir?: ReturnType<typeof setInterval> }>({})
  const alPulsarRef = useRef(alPulsar)
  useEffect(() => {
    alPulsarRef.current = alPulsar
  }, [alPulsar])

  const soltar = () => {
    clearTimeout(timers.current.inicial)
    clearInterval(timers.current.repetir)
    timers.current = {}
  }

  useEffect(() => soltar, [])

  const empezar = (e: React.PointerEvent) => {
    e.preventDefault()
    alPulsarRef.current()
    timers.current.inicial = setTimeout(() => {
      timers.current.repetir = setInterval(() => alPulsarRef.current(), REPETIR_MS)
    }, RETRASO_MS)
  }

  return {
    onPointerDown: empezar,
    onPointerUp: soltar,
    onPointerLeave: soltar,
    onPointerCancel: soltar,
  }
}

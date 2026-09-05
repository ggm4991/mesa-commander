import { useEffect, useRef } from 'react'

const RETRASO_MS = 450

/**
 * Un toque corto hace una cosa, mantener pulsado hace la contraria — para el daño
 * de comandante (ver `IconoDanoComandante`), donde un mismo icono suma con un toque
 * y resta si se mantiene pulsado, en vez de abrir un panel aparte. A diferencia de
 * `useMantenerPulsado` (que repite la misma acción mientras se mantiene, como los
 * botones de +/- vida), aquí las dos acciones son distintas y cada una se dispara
 * una sola vez por gesto.
 */
export function useTocarYMantener(alTocar: () => void, alMantener: () => void, ms: number = RETRASO_MS) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const disparado = useRef(false)
  const alTocarRef = useRef(alTocar)
  const alMantenerRef = useRef(alMantener)
  useEffect(() => {
    alTocarRef.current = alTocar
  }, [alTocar])
  useEffect(() => {
    alMantenerRef.current = alMantener
  }, [alMantener])

  const cancelar = () => clearTimeout(timer.current)
  useEffect(() => cancelar, [])

  const empezar = (e: React.PointerEvent) => {
    e.preventDefault()
    disparado.current = false
    timer.current = setTimeout(() => {
      disparado.current = true
      alMantenerRef.current()
    }, ms)
  }

  const terminar = () => {
    cancelar()
    if (!disparado.current) alTocarRef.current()
  }

  return {
    onPointerDown: empezar,
    onPointerUp: terminar,
    onPointerLeave: cancelar,
    onPointerCancel: cancelar,
  }
}

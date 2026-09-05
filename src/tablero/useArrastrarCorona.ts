import { useEffect, useRef, useState } from 'react'

export interface ArrastreCorona {
  desde: number
  x: number
  y: number
  destino: number | null
}

function asientoBajo(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y)
  const asiento = el?.closest<HTMLElement>('[data-asiento]')
  if (!asiento) return null
  const indice = Number(asiento.dataset.asiento)
  return Number.isNaN(indice) ? null : indice
}

/**
 * La corona se arrastra de un jugador a otro: se coge, se sigue con el dedo (o el
 * ratón) y se suelta sobre el asiento que pasa a ser monarca. Portado de
 * `coronaMover()`/`coronaSoltar()` en app.html, pero con el estado del arrastre
 * en React en vez de mutar el DOM a mano (la posición del fantasma y qué asiento
 * está marcado como destino salen de renderizar `arrastre`, no de tocar `style`).
 */
export function useArrastrarCorona(alSoltar: (desde: number, destino: number) => void) {
  const [arrastre, setArrastre] = useState<ArrastreCorona | null>(null)
  const arrastreRef = useRef<ArrastreCorona | null>(null)
  const alSoltarRef = useRef(alSoltar)
  useEffect(() => {
    alSoltarRef.current = alSoltar
  }, [alSoltar])

  useEffect(() => {
    const mover = (e: PointerEvent) => {
      if (!arrastreRef.current) return
      const destino = asientoBajo(e.clientX, e.clientY)
      const siguiente = { ...arrastreRef.current, x: e.clientX, y: e.clientY, destino }
      arrastreRef.current = siguiente
      setArrastre(siguiente)
    }
    const soltar = () => {
      const actual = arrastreRef.current
      if (!actual) return
      arrastreRef.current = null
      setArrastre(null)
      if (actual.destino != null && actual.destino !== actual.desde) alSoltarRef.current(actual.desde, actual.destino)
    }
    addEventListener('pointermove', mover)
    addEventListener('pointerup', soltar)
    addEventListener('pointercancel', soltar)
    return () => {
      removeEventListener('pointermove', mover)
      removeEventListener('pointerup', soltar)
      removeEventListener('pointercancel', soltar)
    }
  }, [])

  const empezar = (desde: number, e: React.PointerEvent) => {
    e.preventDefault()
    const inicial = { desde, x: e.clientX, y: e.clientY, destino: null }
    arrastreRef.current = inicial
    setArrastre(inicial)
  }

  return { arrastre, empezar }
}

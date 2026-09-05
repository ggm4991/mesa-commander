import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { type BordeAsiento, calcularBordeAsiento } from './bordes'

function mismoBorde(a: BordeAsiento | null, b: BordeAsiento | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return a.arriba === b.arriba && a.abajo === b.abajo && a.hueco === b.hueco
}

function mismosBordes(a: (BordeAsiento | null)[], b: (BordeAsiento | null)[]): boolean {
  return a.length === b.length && a.every((x, i) => mismoBorde(x, b[i]))
}

/**
 * Mide el tablero y cada asiento en el DOM real y aplica la geometría pura de
 * `calcularBordeAsiento` a cada uno. Cuando la disposición ya reserva una celda
 * para el reloj (`centro`), no hay nada que esquivar — igual que el original.
 *
 * Se recalcula tras cada render (el tamaño de los asientos puede cambiar por
 * motivos ajenos a las props de este hook, igual que el original recalculaba en
 * cada `pintarTablero()`), pero solo actualiza el estado si el resultado
 * realmente cambió — sin eso, cada `setBordes` dispara otro render que vuelve a
 * medir lo mismo, en un bucle sin fin.
 */
export function useBordesAsientos(
  tableroRef: RefObject<HTMLDivElement | null>,
  asientoRefs: RefObject<(HTMLDivElement | null)[]>,
  rotaciones: number[],
  hayCentro: boolean,
): (BordeAsiento | null)[] {
  const [bordes, setBordes] = useState<(BordeAsiento | null)[]>(() => rotaciones.map(() => null))
  const bordesRef = useRef(bordes)

  const recalcular = useCallback(() => {
    let siguiente: (BordeAsiento | null)[]
    if (hayCentro || !tableroRef.current) {
      siguiente = rotaciones.map(() => null)
    } else {
      const b = tableroRef.current.getBoundingClientRect()
      const centro = { x: b.left + b.width / 2, y: b.top + b.height / 2 }
      siguiente = rotaciones.map((rot, i) => {
        const el = asientoRefs.current[i]
        return el ? calcularBordeAsiento(centro, el.getBoundingClientRect(), rot) : null
      })
    }
    if (!mismosBordes(bordesRef.current, siguiente)) {
      bordesRef.current = siguiente
      setBordes(siguiente)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hayCentro, rotaciones.join(',')])

  useLayoutEffect(() => {
    recalcular()
  })

  useLayoutEffect(() => {
    addEventListener('resize', recalcular)
    return () => removeEventListener('resize', recalcular)
  }, [recalcular])

  return bordes
}

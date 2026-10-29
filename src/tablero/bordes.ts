// El reloj central flota sobre la esquina interior de cada asiento. Para cada uno
// medimos hacia dónde le queda el centro del tablero y empujamos su fila de
// controles hacia el borde de fuera, teniendo en cuenta su giro. Portado de
// `calcularBordes()`/`aplicarBordes()` en app.html — aquí solo la geometría pura
// (sin tocar el DOM), para poder probarla sin un navegador de verdad.
import type { CSSProperties } from 'react'

export type Lado = 'ini' | 'fin' | null

export interface BordeAsiento {
  arriba: Lado
  abajo: Lado
  hueco: string
}

export interface RectanguloSimple {
  left: number
  top: number
  width: number
  height: number
}

const VECT: Record<number, { arriba: [number, number]; abajo: [number, number]; fin: [number, number] }> = {
  0: { arriba: [0, -1], abajo: [0, 1], fin: [1, 0] },
  180: { arriba: [0, 1], abajo: [0, -1], fin: [-1, 0] },
  90: { arriba: [-1, 0], abajo: [1, 0], fin: [0, 1] },
  270: { arriba: [1, 0], abajo: [-1, 0], fin: [0, -1] },
}

/** null si el asiento no tiene tamaño todavía (primer render, antes de medir). */
export function calcularBordeAsiento(
  centroTablero: { x: number; y: number },
  rectAsiento: RectanguloSimple,
  rotacion: number,
): BordeAsiento | null {
  if (!rectAsiento.width || !rectAsiento.height) return null
  const dx = centroTablero.x - (rectAsiento.left + rectAsiento.width / 2)
  const dy = centroTablero.y - (rectAsiento.top + rectAsiento.height / 2)
  const hx = Math.abs(dx) < 8 ? 0 : Math.sign(dx)
  const hy = Math.abs(dy) < 8 ? 0 : Math.sign(dy)
  const v = VECT[rotacion] || VECT[0]
  const mira = ([ex, ey]: [number, number]) => ex * hx + ey * hy > 0
  const finDentro = mira(v.fin)
  const lado: Lado = finDentro ? 'ini' : 'fin'
  const hueco = Math.min(112, Math.max(60, Math.min(rectAsiento.width, rectAsiento.height) * 0.42))
  return {
    arriba: mira(v.arriba) ? lado : null,
    abajo: mira(v.abajo) ? lado : null,
    hueco: `${Math.round(hueco)}px`,
  }
}

/** Estilo de una fila de controles (`.seat-top`/`.seat-estados`) que se aparta hacia
 * `lado`, o `undefined` si no hay nada que esquivar en esta fila. */
export function estiloFila(lado: Lado, hueco: string): CSSProperties | undefined {
  if (!lado) return undefined
  return {
    justifyContent: lado === 'ini' ? 'flex-start' : 'flex-end',
    paddingInlineEnd: lado === 'ini' ? hueco : undefined,
    paddingInlineStart: lado === 'fin' ? hueco : undefined,
  }
}

/** El botón de menú de esa fila se adelanta al principio cuando los controles se
 * apartan hacia el lado "ini"; sin nada que esquivar no hace falta mover nada —
 * `.seat-top` ya agrupa su contenido al lado de fin por defecto (ver abajo). */
export function estiloBotonEnFila(lado: Lado): CSSProperties {
  if (!lado) return {}
  return { marginLeft: 0, order: lado === 'ini' ? -1 : undefined }
}

/** `.esquinas-fijas` vive en posición absoluta, ajena a `estiloFila`/
 * `estiloBotonEnFila` — por defecto a la izquierda, igual que siempre.
 * `.seat-top` agrupa su contenido (insignias de iniciativa/fuera incluidas)
 * al lado de fin por defecto, dejando libre la izquierda donde vive
 * `.esquinas-fijas` — salvo cuando `lado === 'ini'`, que manda a `.seat-top`
 * entero (insignias incluidas) justo al lado contrario, donde chocaban con
 * las esquinas fijas sin que ninguna de las dos supiera de la otra —
 * verificado con un asiento real. Solo en ese caso cruzan a la derecha; con
 * `lado === 'fin'` o sin nada que esquivar, `.seat-top` ya cae al lado
 * contrario de forma natural y no hace falta mover nada (ver ADR 0042). */
export function estiloEsquinas(lado: Lado): CSSProperties | undefined {
  if (lado !== 'ini') return undefined
  return { left: 'auto', right: 8 }
}

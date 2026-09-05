// Reparto genérico de emergencia cuando la partida no trae una disposición válida
// de la pantalla previa (JUEGO.cfg.dispo) — por ejemplo, una partida guardada por
// una versión antigua de la app. Portado de LAYOUTS en app.html (sección 7).
export interface LayoutGenerico {
  c: number
  r: number
  rot: number[]
  area?: Record<number, string>
}

export const LAYOUTS: Record<number, LayoutGenerico> = {
  1: { c: 1, r: 1, rot: [] },
  2: { c: 1, r: 2, rot: [0] },
  3: { c: 2, r: 2, rot: [0], area: { 0: '1 / 1 / 2 / 3' } },
  4: { c: 2, r: 2, rot: [0, 1] },
  5: { c: 2, r: 3, rot: [0, 1], area: { 4: '3 / 1 / 4 / 3' } },
  6: { c: 2, r: 3, rot: [0, 1] },
}

export interface DispoTablero {
  cols: string
  rows: string
  areas: (string | null)[]
  rot: number[]
  centro?: string
}

interface DispoGuardada {
  cols?: string
  rows?: string
  areas?: (string | null)[]
  rot?: number[]
  centro?: string
}

/** La disposición elegida en la pantalla previa si sigue teniendo forma válida
 * (mismas comprobaciones que el original: `rot` es un array y hay `cols`), o el
 * reparto genérico de `LAYOUTS` en su defecto. */
export function dispoTablero(numJugadores: number, guardada: unknown): DispoTablero {
  const d = guardada as DispoGuardada | null | undefined
  if (d && Array.isArray(d.rot) && d.cols) {
    return { cols: d.cols, rows: d.rows ?? '1fr', areas: d.areas ?? [], rot: d.rot, centro: d.centro }
  }
  const L = LAYOUTS[numJugadores] ?? LAYOUTS[1]
  return {
    cols: `repeat(${L.c},1fr)`,
    rows: `repeat(${L.r},1fr)`,
    areas: Array.from({ length: numJugadores }, (_, i) => L.area?.[i] ?? null),
    rot: Array.from({ length: numJugadores }, (_, i) => (L.rot.includes(i) ? 180 : 0)),
  }
}

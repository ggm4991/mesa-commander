// Reparto genérico de emergencia cuando la partida no trae una disposición válida
// de la pantalla previa (JUEGO.cfg.dispo) — por ejemplo, una partida guardada por
// una versión antigua de la app. Portado de LAYOUTS en app.html (sección 7).
export interface LayoutGenerico {
  c: number
  r: number
  rot: number[]
  area?: Record<number, string>
  centro?: string
  /** Igual que `Dispo.filaHub` en `disposiciones.ts`: sin ella, el hub flota
   * centrado sobre el hueco entre filas, que con 3 o más filas de asientos cae
   * sobre la fila del medio en vez de un hueco de verdad (ver ADR 0039). */
  filaHub?: number
}

// Los `area` de más de un asiento (a partir de 3 jugadores) están para que el
// orden de los índices siga las agujas del reloj vistas desde arriba (regla
// 103.1), no el orden en que los coloca la rejilla por defecto — mismo motivo
// que las `areas` de `disposiciones.ts` (ver ADR 0031).
export const LAYOUTS: Record<number, LayoutGenerico> = {
  1: { c: 1, r: 1, rot: [] },
  2: { c: 1, r: 2, rot: [0] },
  3: { c: 2, r: 2, rot: [0], area: { 0: '1 / 1 / 2 / 3', 1: '2 / 2 / 3 / 3', 2: '2 / 1 / 3 / 2' } },
  4: { c: 2, r: 2, rot: [0, 1], area: { 2: '2 / 2 / 3 / 3', 3: '2 / 1 / 3 / 2' } },
  5: {
    c: 2,
    r: 3,
    rot: [0, 1],
    area: { 0: '1 / 1 / 2 / 2', 1: '1 / 2 / 2 / 3', 2: '3 / 2 / 4 / 3', 3: '4 / 1 / 5 / 3', 4: '3 / 1 / 4 / 2' },
    centro: '2 / 1 / 3 / 3',
    filaHub: 1,
  },
  6: {
    c: 2,
    r: 3,
    rot: [0, 1],
    area: {
      0: '1 / 1 / 2 / 2',
      1: '1 / 2 / 2 / 3',
      2: '3 / 2 / 4 / 3',
      3: '4 / 2 / 5 / 3',
      4: '4 / 1 / 5 / 2',
      5: '3 / 1 / 4 / 2',
    },
    centro: '2 / 1 / 3 / 3',
    filaHub: 1,
  },
}

export interface DispoTablero {
  cols: string
  rows: string
  areas: (string | null)[]
  rot: number[]
  centro?: string
  filaHub?: number
}

interface DispoGuardada {
  cols?: string
  rows?: string
  areas?: (string | null)[]
  rot?: number[]
  centro?: string
  filaHub?: number
}

/** La disposición elegida en la pantalla previa si sigue teniendo forma válida
 * (mismas comprobaciones que el original: `rot` es un array y hay `cols`), o el
 * reparto genérico de `LAYOUTS` en su defecto. */
export function dispoTablero(numJugadores: number, guardada: unknown): DispoTablero {
  const d = guardada as DispoGuardada | null | undefined
  if (d && Array.isArray(d.rot) && d.cols) {
    return {
      cols: d.cols,
      rows: d.rows ?? '1fr',
      areas: d.areas ?? [],
      rot: d.rot,
      centro: d.centro,
      filaHub: d.filaHub,
    }
  }
  const L = LAYOUTS[numJugadores] ?? LAYOUTS[1]
  return {
    cols: `repeat(${L.c},1fr)`,
    rows: Array.from({ length: L.r }, () => '1fr').join(' '),
    areas: Array.from({ length: numJugadores }, (_, i) => L.area?.[i] ?? null),
    rot: Array.from({ length: numJugadores }, (_, i) => (L.rot.includes(i) ? 180 : 0)),
    centro: L.centro,
    filaHub: L.filaHub,
  }
}

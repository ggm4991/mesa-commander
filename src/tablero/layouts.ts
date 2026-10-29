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

interface Centro {
  fila: number
  col: number
}

/** Centro (en líneas de grid, no en píxeles — basta para comparar posiciones
 * relativas) de cada `areas[i]`, o `null` si a alguno le falta (algunas
 * disposiciones, como las de una sola columna, no necesitan `areas` porque el
 * propio orden del DOM ya coloca cada asiento donde toca). */
function centrosDeAsientos(areas: (string | null)[], n: number): Centro[] | null {
  if (areas.length < n) return null
  const centros: Centro[] = []
  for (let i = 0; i < n; i++) {
    const area = areas[i]
    if (!area) return null
    const [filaIni, colIni, filaFin, colFin] = area.split('/').map((x) => Number(x.trim()))
    if ([filaIni, colIni, filaFin, colFin].some(Number.isNaN)) return null
    centros.push({ fila: (filaIni + filaFin) / 2, col: (colIni + colFin) / 2 })
  }
  return centros
}

/**
 * Orden en el que `indiceVisor` ve a los demás asientos en su cuadrado de
 * daño: no una secuencia relativa a quien mira, sino un mini-mapa de la mesa
 * entera (posiciones reales de `dispo.areas`) girado el mismo ángulo que ya
 * gira el propio asiento del visor (`dispo.rot[indiceVisor]`) — el cuadrado
 * gira con todo lo demás de ese asiento, así que lo que se ve dentro tiene
 * que girar con él (ver ADR 0056, que sustituye a la 0055: la 0055 ordenaba
 * por ángulo relativo al visor sin aplicar su giro, razonando que girar un
 * punto de vista no cambia el orden cíclico — cierto para una secuencia, pero
 * la pieza real que se pedía era una posición de rejilla, no una secuencia).
 *
 * Verificado con el usuario celda a celda sobre "Dos y dos" (4a): el visor 3
 * (abajo-der., sin girar) ve una copia exacta de la mesa real; el visor 1
 * (arriba-izq., girado 180°) ve la mesa real girada 180° — con 1 arriba-izq.
 * acabando abajo-der., es decir en su propio hueco, por simple coincidencia
 * geométrica de esa disposición, no por ninguna regla de "uno mismo siempre
 * ahí".
 *
 * Sin `areas` completas para calcularlo, cae al orden de índice llano (sin
 * geometría que girar, no hay mini-mapa que trazar).
 */
export function ordenEspacialDesde(dispo: DispoTablero, indiceVisor: number, n: number): number[] {
  const centros = centrosDeAsientos(dispo.areas, n)
  if (!centros) return Array.from({ length: n }, (_, i) => i)

  const centroMesa = {
    col: centros.reduce((s, c) => s + c.col, 0) / n,
    fila: centros.reduce((s, c) => s + c.fila, 0) / n,
  }
  const rad = ((dispo.rot[indiceVisor] ?? 0) * Math.PI) / 180
  const coseno = Math.cos(rad)
  const seno = Math.sin(rad)

  const girado = (k: number): Centro => {
    const dCol = centros[k].col - centroMesa.col
    const dFila = centros[k].fila - centroMesa.fila
    return { col: dCol * coseno - dFila * seno, fila: dCol * seno + dFila * coseno }
  }

  const indices = Array.from({ length: n }, (_, k) => k)
  const posiciones = indices.map(girado)

  const angulo = (p: Centro): number => {
    const a = Math.atan2(p.fila, p.col)
    return a < 0 ? a + 2 * Math.PI : a
  }
  const porAngulo = () => [...indices].sort((a, b) => angulo(posiciones[a]) - angulo(posiciones[b]))

  if (n === 4) {
    // Con exactamente 4, el cuadrado es 2×2 de verdad: cada asiento va a la
    // celda que le toca (arriba/abajo, izquierda/derecha) según el signo de
    // su posición ya girada — en el mismo orden [arriba-izq., arriba-der.,
    // abajo-izq., abajo-der.] con el que una rejilla CSS se rellena sola. Solo
    // vale cuando los 4 asientos están de verdad en las 4 esquinas: en una
    // disposición en cruz (como "Uno en cada lado", 4b) dos de ellos quedan
    // justo en el centro de un eje y empatan a la misma celda — ahí se cae al
    // orden por ángulo, igual que con el resto de números de jugadores.
    const celda = (p: Centro) => (p.fila < 0 ? 0 : 2) + (p.col < 0 ? 0 : 1)
    const celdas = posiciones.map(celda)
    if (new Set(celdas).size === 4) {
      const orden = [0, 0, 0, 0]
      indices.forEach((k) => {
        orden[celdas[k]] = k
      })
      return orden
    }
  }

  // Con otros números de jugadores (o un 4 sin forma de esquinas limpia) el
  // cuadrado no tiene forma de brújula, así que se ordena por el ángulo de la
  // posición ya girada — sigue siendo el mini-mapa real, solo que leído en
  // vuelta en vez de por celdas.
  return porAngulo()
}

import { dosComandantes } from '../motor/utilidades'
import type { Partida } from '../motor/tipos'

export interface JugadorRegistro {
  nombre: string
  pj: number
  v: number
  e: number
  d: number
  rehacer: number
  tiempo: number
  turnoMax: number
  turnosLargos: number
  /** Comandante más jugado por este jugador, con su identidad de color. */
  principal: string
  principalId: string
  pts: number
  wr: number
}

/** Quien tuvo el turno más largo de la partida, gane o no. */
export function ganadorTurno(p: Partida): string {
  return p.seats.reduce((a, b) => (b.turno > a.turno ? b : a)).j
}

export function nombresJugadores(partidas: Partida[]): string[] {
  return [...new Set(partidas.flatMap((p) => p.seats.map((s) => s.j)))].sort()
}

export function nombresComandantes(partidas: Partida[]): string[] {
  return [...new Set(partidas.flatMap((p) => p.seats.flatMap((s) => [s.c, s.c2])))]
    .filter((x): x is string => Boolean(x && x.trim()))
    .sort()
}

interface Acumulado {
  nombre: string
  pj: number
  v: number
  e: number
  d: number
  rehacer: number
  tiempo: number
  turnoMax: number
  turnosLargos: number
  comandantes: Map<string, number>
}

/** Portado de `calcularJugadores()`: el registro nunca guarda la clasificación, la
 * recalcula siempre desde `Partida[]` — es la fuente de la verdad (ver CLAUDE.md). */
export function calcularJugadores(partidas: Partida[]): JugadorRegistro[] {
  const map = new Map<string, Acumulado>()
  for (const p of partidas) {
    const largo = ganadorTurno(p)
    for (const s of p.seats) {
      if (!map.has(s.j)) {
        map.set(s.j, {
          nombre: s.j,
          pj: 0,
          v: 0,
          e: 0,
          d: 0,
          rehacer: 0,
          tiempo: 0,
          turnoMax: 0,
          turnosLargos: 0,
          comandantes: new Map(),
        })
      }
      const x = map.get(s.j)!
      x.pj++
      if (s.r === 'V') x.v++
      else if (s.r === 'E') x.e++
      else x.d++
      x.rehacer += s.rehacer
      x.tiempo += s.tiempo
      x.turnoMax = Math.max(x.turnoMax, s.turno)
      if (largo === s.j) x.turnosLargos++
      const clave = `${dosComandantes(s.c, s.c2)}|${s.id || ''}`
      x.comandantes.set(clave, (x.comandantes.get(clave) || 0) + 1)
    }
  }
  return [...map.values()].map((x) => {
    const [principal, principalId] = [...x.comandantes.entries()].sort((a, b) => b[1] - a[1])[0][0].split('|')
    const { comandantes: _comandantes, ...resto } = x
    return { ...resto, principal, principalId, pts: x.v * 3 + x.e, wr: x.v / x.pj }
  })
}

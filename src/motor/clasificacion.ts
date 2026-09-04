import { dosComandantes } from './utilidades'
import type { Partida } from './tipos'

export interface Clasificado {
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
  principal: string
  principalId: string
  pts: number
  wr: number
}

const ganadorTurno = (p: Partida): string => p.seats.reduce((a, b) => (b.turno > a.turno ? b : a)).j

/**
 * El registro es la fuente de la verdad: la clasificación no se guarda en ningún
 * sitio, se recalcula siempre desde `partidas`. No añadir contadores acumulados en
 * paralelo — si hace falta un dato nuevo, se deriva aquí, no se guarda aparte.
 */
export function calcularJugadores(partidas: Partida[]): Clasificado[] {
  type Acumulado = Omit<Clasificado, 'principal' | 'principalId' | 'pts' | 'wr'>
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
      x.rehacer += +s.rehacer
      x.tiempo += +s.tiempo
      x.turnoMax = Math.max(x.turnoMax, s.turno)
      if (largo === s.j) x.turnosLargos++
      const clave = dosComandantes(s.c, s.c2) + '|' + (s.id || '')
      x.comandantes.set(clave, (x.comandantes.get(clave) || 0) + 1)
    }
  }

  return [...map.values()].map((x) => {
    const top = [...x.comandantes.entries()].sort((a, b) => b[1] - a[1])[0][0].split('|')
    return { ...x, principal: top[0], principalId: top[1], pts: x.v * 3 + x.e, wr: x.v / x.pj }
  })
}

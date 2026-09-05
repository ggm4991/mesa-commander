import { fechaLarga } from '../motor/utilidades'
import { RES } from './constantes'
import type { Partida } from '../motor/tipos'

export function partidasDeJugador(partidas: Partida[], nombre: string): Partida[] {
  return partidas.filter((g) => g.seats.some((s) => s.j === nombre))
}

/** Portado de la búsqueda de `listarPartidas()`: compara contra la fecha (en los
 * dos formatos, para poder buscar por año-mes como "2026-07"), el resultado propio
 * y "jugador comandante" de cada asiento. */
export function filtrarPartidas(partidas: Partida[], nombre: string, busqueda: string): Partida[] {
  const f = busqueda.trim().toLowerCase()
  if (!f) return partidas
  return partidas.filter((g) => {
    const yo = g.seats.find((s) => s.j === nombre)
    if (!yo) return false
    return [fechaLarga(g.fecha), g.fecha, RES[yo.r].t, ...g.seats.map((s) => `${s.j} ${s.c}`)]
      .join(' ')
      .toLowerCase()
      .includes(f)
  })
}

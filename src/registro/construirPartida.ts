import { transcurrido } from '../motor/partida'
import { uid } from '../motor/utilidades'
import type { Juego, Partida, Resultado } from '../motor/tipos'

/** Sustituye a la construcción del registro dentro de `guardarComoPartida()` en
 * app.html: vuelca lo que ha contado el motor a la forma que espera el registro.
 * `totalMinutos` viene ya calculado de la pantalla de terminar partida, para no
 * recalcularlo con un `Date.now()` distinto. */
export function construirPartida(juego: Juego, ganador: number, totalMinutos: number, ahora: number = Date.now()): Partida {
  const dur = transcurrido(juego, ahora)
  const seats = juego.j.map((x, k) => {
    const esElActivo = juego.turno === k
    const tMax = esElActivo && dur > x.tMax ? dur : x.tMax
    const r: Resultado = ganador < 0 ? 'E' : k === ganador ? 'V' : 'D'
    return {
      j: x.n,
      c: x.c || 'Sin comandante',
      c2: x.c2 || '',
      id: x.col,
      r,
      rehacer: x.rehacer,
      tiempo: x.fuera,
      turno: Math.round(tMax),
      vidaFinal: x.vida,
    }
  })
  return {
    id: uid(),
    fecha: juego.inicio.slice(0, 10),
    duracion: totalMinutos,
    seats,
  }
}

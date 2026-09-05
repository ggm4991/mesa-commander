import { transcurrido } from '../motor/partida'
import { reloj } from '../motor/utilidades'
import type { Juego } from '../motor/tipos'

export interface EstadoReloj {
  quien: string
  crono: string
  estado: string
  pasado: boolean
  cerca: boolean
  pausado: boolean
}

/** Sustituye a la parte de cálculo de `pintarCrono()` en app.html (la que decide
 * qué texto y qué estado mostrar); pintar esos valores es cosa de `Hub`. */
export function estadoReloj(juego: Juego, ahora: number): EstadoReloj {
  if (juego.turno == null) {
    return { quien: '¿Quién empieza?', crono: '', estado: 'toca tu asiento', pasado: false, cerca: false, pausado: false }
  }
  const j = juego.j[juego.turno]
  const dur = transcurrido(juego, ahora)
  const lim = juego.cfg.limite || 0
  const queda = lim ? lim - dur : Infinity
  const umbral = lim ? Math.min(60, Math.max(15, lim / 3)) : 0
  const pasado = !juego.pausado && lim > 0 && dur > lim
  const cerca = !juego.pausado && lim > 0 && !pasado && queda <= umbral

  const estado = juego.pausado
    ? 'en pausa'
    : pasado
      ? `se pasó ${reloj(dur - lim)}`
      : cerca
        ? `quedan ${reloj(queda)}`
        : lim
          ? `de ${reloj(lim)}`
          : ''

  return {
    quien: j.n.length > 13 ? `${j.n.slice(0, 12)}…` : j.n,
    crono: reloj(dur),
    estado,
    pasado,
    cerca,
    pausado: juego.pausado,
  }
}

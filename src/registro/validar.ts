import type { Partida } from '../motor/tipos'

/** Comprueba que una partida (recién jugada o dada de alta a mano) tiene forma
 * válida antes de entrar al registro. Portado de `validar()` en app.html; se usa
 * tanto al terminar una partida en el tablero como en el alta manual del registro. */
export function validar(g: Partida): string[] {
  const errores: string[] = []
  if (!/^\d{4}-\d{2}-\d{2}$/.test(g.fecha || '')) errores.push('Falta la fecha de la partida.')
  if (!(g.duracion > 0)) errores.push('La duración tiene que ser mayor que cero.')
  if (!g.seats || g.seats.length < 2) errores.push('Una partida necesita al menos dos jugadores.')
  ;(g.seats || []).forEach((s, i) => {
    if (!String(s.j || '').trim()) errores.push(`El asiento ${i + 1} no tiene nombre de jugador.`)
    if (!String(s.c || '').trim()) errores.push(`El asiento ${i + 1} no tiene comandante.`)
    if (!(s.turno >= 0)) errores.push(`El turno más largo del asiento ${i + 1} no es válido. Escríbelo como 4:30.`)
  })
  const nombres = (g.seats || []).map((s) => String(s.j || '').trim().toLowerCase())
  if (new Set(nombres).size !== nombres.length) errores.push('Hay un jugador repetido en la misma mesa.')
  const v = (g.seats || []).filter((s) => s.r === 'V').length
  const empate = (g.seats || []).filter((s) => s.r === 'E').length
  if (empate && empate !== (g.seats || []).length) {
    errores.push('Si la partida es un empate, todos tienen que estar marcados como empate.')
  } else if (!empate && v !== 1) {
    errores.push('Marca exactamente un ganador, o pon a todos en empate.')
  }
  return errores
}

import type { Asiento, Jugador } from './tipos'

export function nuevoJugador(asiento: Asiento, vida: number): Jugador {
  return {
    n: asiento.nombre,
    c: asiento.comandante || '',
    c2: asiento.comandante2 || '',
    col: asiento.colores || '',
    vida,
    dmg: {},
    ven: 0,
    exp: 0,
    ene: 0,
    tax: 0,
    tes: 0,
    tor: 0,
    mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    bendicion: false,
    rehacer: 0,
    fuera: 0,
    tTotal: 0,
    tMax: 0,
    out: false,
  }
}

import { describe, expect, it } from 'vitest'
import { nuevoJugador } from '../../src/motor/jugador'
import { alternarPausa, pasarTurno, transcurrido } from '../../src/motor/partida'
import type { Juego } from '../../src/motor/tipos'

describe('pausar no cierra el turno', () => {
  it('3s + pausa + 60s ignorados + 4s da un turno de 7s', () => {
    let t = Date.now()
    const j = [nuevoJugador({ nombre: 'A' }, 40), nuevoJugador({ nombre: 'B' }, 40)]
    let juego: Juego = {
      id: 'x',
      inicio: new Date(t).toISOString(),
      cfg: { vida: 40, limite: 300, dispo: null },
      j,
      turno: 0,
      tIni: t,
      acum: 0,
      pausado: false,
      monarca: null,
      iniciativa: null,
      dia: null,
      log: [],
      fin: false,
      undo: [],
    }

    t += 3000
    juego = alternarPausa(juego, t)
    expect(juego.pausado).toBe(true)
    expect(transcurrido(juego, t)).toBeCloseTo(3, 1)

    t += 60000 // charla que no debe contar
    expect(transcurrido(juego, t)).toBeCloseTo(3, 1)

    juego = alternarPausa(juego, t) // reanuda
    t += 4000
    juego = pasarTurno(juego, t)

    const a = juego.j[0]
    expect(a.tMax).toBeCloseTo(7, 1)
    expect(a.tTotal).toBeCloseTo(7, 1)
    expect(juego.turno).toBe(1)
    expect(juego.acum).toBe(0)
  })
})

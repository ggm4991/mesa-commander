import { describe, expect, it } from 'vitest'
import { calcularJugadores } from '../../src/motor/clasificacion'
import type { Partida } from '../../src/motor/tipos'

const partida = (fecha: string, seats: Partida['seats']): Partida => ({ id: `g-${fecha}`, fecha, duracion: 100, seats })

describe('calcularJugadores', () => {
  it('deriva puntos, victorias y comandante principal solo de las partidas', () => {
    const partidas: Partida[] = [
      partida('2026-08-01', [
        { j: 'Ana', c: 'Edgar Markov', c2: '', id: 'WBR', r: 'V', rehacer: 0, tiempo: 0, turno: 120 },
        { j: 'Beto', c: 'Krenko, Mob Boss', c2: '', id: 'R', r: 'D', rehacer: 1, tiempo: 0, turno: 90 },
      ]),
      partida('2026-08-08', [
        { j: 'Ana', c: 'Edgar Markov', c2: '', id: 'WBR', r: 'E', rehacer: 0, tiempo: 0, turno: 60 },
        { j: 'Beto', c: 'Krenko, Mob Boss', c2: '', id: 'R', r: 'E', rehacer: 0, tiempo: 0, turno: 200 },
      ]),
    ]
    const clasificacion = calcularJugadores(partidas)
    const ana = clasificacion.find((x) => x.nombre === 'Ana')!
    expect(ana.pj).toBe(2)
    expect(ana.v).toBe(1)
    expect(ana.e).toBe(1)
    expect(ana.pts).toBe(4) // 1 victoria * 3 + 1 empate
    expect(ana.principal).toBe('Edgar Markov')
  })

  it('nunca lee un total guardado: recalcula si cambian las partidas de entrada', () => {
    const unaPartida = [
      partida('2026-08-01', [{ j: 'Ana', c: 'X', c2: '', id: 'R', r: 'V', rehacer: 0, tiempo: 0, turno: 60 }]),
    ]
    const dosPartidas = [
      ...unaPartida,
      partida('2026-08-08', [{ j: 'Ana', c: 'X', c2: '', id: 'R', r: 'D', rehacer: 0, tiempo: 0, turno: 60 }]),
    ]
    expect(calcularJugadores(unaPartida)[0].pj).toBe(1)
    expect(calcularJugadores(dosPartidas)[0].pj).toBe(2)
  })
})

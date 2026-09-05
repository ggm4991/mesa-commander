import { describe, expect, it } from 'vitest'
import { construirPartida } from '../../src/registro/construirPartida'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego } from '../../src/motor/tipos'

function juegoDePrueba(): Juego {
  const ana = { ...nuevoJugador({ nombre: 'Ana', comandante: 'Edgar Markov', colores: 'WBR' }, 40), rehacer: 1, fuera: 2, tMax: 120, vida: 30 }
  const beto = { ...nuevoJugador({ nombre: 'Beto' }, 40), tMax: 90, vida: 0 }
  return {
    id: 'x',
    inicio: '2026-08-01T10:00:00.000Z',
    cfg: { vida: 40, limite: 0, dispo: null },
    j: [ana, beto],
    turno: 0,
    tIni: new Date('2026-08-01T10:00:00.000Z').getTime(),
    acum: 0,
    pausado: false,
    monarca: null,
    iniciativa: null,
    dia: null,
    log: [],
    fin: false,
    undo: [],
  }
}

describe('construirPartida', () => {
  it('marca al ganador con V y al resto con D', () => {
    const p = construirPartida(juegoDePrueba(), 0, 45, new Date('2026-08-01T10:45:00.000Z').getTime())
    expect(p.seats[0]).toMatchObject({ j: 'Ana', c: 'Edgar Markov', id: 'WBR', r: 'V', rehacer: 1, tiempo: 2, vidaFinal: 30 })
    expect(p.seats[1]).toMatchObject({ j: 'Beto', r: 'D' })
    expect(p.fecha).toBe('2026-08-01')
    expect(p.duracion).toBe(45)
  })

  it('un ganador negativo marca empate para todos', () => {
    const p = construirPartida(juegoDePrueba(), -1, 30)
    expect(p.seats.every((s) => s.r === 'E')).toBe(true)
  })

  it('sin comandante, queda anotado como "Sin comandante"', () => {
    const p = construirPartida(juegoDePrueba(), 0, 30)
    expect(p.seats[1].c).toBe('Sin comandante')
  })

  it('el turno en curso se actualiza a su duración real si supera el máximo guardado', () => {
    const juego = juegoDePrueba() // Ana lleva el turno (turno:0), tMax guardado en 120s
    const ahora = juego.tIni + 200 * 1000 // lleva 200s de turno activo
    const p = construirPartida(juego, 0, 30, ahora)
    expect(p.seats[0].turno).toBe(200)
    expect(p.seats[1].turno).toBe(90) // Beto no está en su turno, se queda con su tMax
  })
})

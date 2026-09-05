import { describe, expect, it } from 'vitest'
import { filtrarPartidas, partidasDeJugador } from '../../src/registro/filtrarPartidas'
import type { Partida } from '../../src/motor/tipos'

const asiento = (over: Partial<Partida['seats'][number]> = {}) => ({
  j: 'Ana', c: 'Edgar Markov', c2: '', id: 'WBR', r: 'V' as const, rehacer: 0, tiempo: 0, turno: 60, ...over,
})

const partidas: Partida[] = [
  { id: 'g1', fecha: '2026-08-01', duracion: 100, seats: [asiento({ j: 'Ana', r: 'V' }), asiento({ j: 'Beto', r: 'D', c: 'Krenko, Mob Boss' })] },
  { id: 'g2', fecha: '2026-07-10', duracion: 90, seats: [asiento({ j: 'Ana', r: 'D' }), asiento({ j: 'Cris', r: 'V', c: 'Muldrotha, the Gravetide' })] },
  { id: 'g3', fecha: '2026-06-05', duracion: 80, seats: [asiento({ j: 'Beto', r: 'V' })] },
]

describe('partidasDeJugador', () => {
  it('solo devuelve partidas donde ese nombre está sentado', () => {
    expect(partidasDeJugador(partidas, 'Ana').map((p) => p.id)).toEqual(['g1', 'g2'])
  })
})

describe('filtrarPartidas', () => {
  it('sin texto de búsqueda, devuelve todas', () => {
    expect(filtrarPartidas(partidas, 'Ana', '')).toHaveLength(3)
  })

  it('busca por año-mes de la fecha', () => {
    expect(filtrarPartidas(partidas, 'Ana', '2026-07').map((p) => p.id)).toEqual(['g2'])
  })

  it('busca por el resultado propio', () => {
    expect(filtrarPartidas(partidas, 'Ana', 'victoria').map((p) => p.id)).toEqual(['g1'])
  })

  it('busca por el nombre o comandante de un rival', () => {
    expect(filtrarPartidas(partidas, 'Ana', 'krenko').map((p) => p.id)).toEqual(['g1'])
  })

  it('descarta partidas donde ese jugador no está, aunque coincidan otros datos', () => {
    expect(filtrarPartidas(partidas, 'Ana', '2026-06')).toEqual([])
  })
})

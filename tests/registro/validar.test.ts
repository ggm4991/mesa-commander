import { describe, expect, it } from 'vitest'
import { validar } from '../../src/registro/validar'
import type { Partida } from '../../src/motor/tipos'

const base = (seats: Partida['seats']): Partida => ({ id: 'g1', fecha: '2026-08-01', duracion: 100, seats })

const asiento = (over: Partial<Partida['seats'][number]> = {}) => ({
  j: 'Ana',
  c: 'Edgar Markov',
  c2: '',
  id: 'WBR',
  r: 'V' as const,
  rehacer: 0,
  tiempo: 0,
  turno: 60,
  ...over,
})

describe('validar', () => {
  it('una partida bien formada no tiene errores', () => {
    const g = base([asiento({ j: 'Ana', r: 'V' }), asiento({ j: 'Beto', r: 'D' })])
    expect(validar(g)).toEqual([])
  })

  it('exige la fecha en formato AAAA-MM-DD', () => {
    expect(validar({ ...base([]), fecha: '' })).toContain('Falta la fecha de la partida.')
    expect(validar({ ...base([]), fecha: '1/1/2026' })).toContain('Falta la fecha de la partida.')
  })

  it('exige duración mayor que cero', () => {
    expect(validar({ ...base([]), duracion: 0 })).toContain('La duración tiene que ser mayor que cero.')
  })

  it('exige al menos dos jugadores', () => {
    expect(validar(base([asiento()]))).toContain('Una partida necesita al menos dos jugadores.')
  })

  it('cada asiento necesita nombre, comandante y un turno válido', () => {
    const errores = validar(base([asiento({ j: '', c: '', turno: -1 }), asiento({ j: 'Beto', r: 'D' })]))
    expect(errores).toContain('El asiento 1 no tiene nombre de jugador.')
    expect(errores).toContain('El asiento 1 no tiene comandante.')
    expect(errores).toContain('El turno más largo del asiento 1 no es válido. Escríbelo como 4:30.')
  })

  it('no admite dos jugadores con el mismo nombre (sin distinguir mayúsculas)', () => {
    const g = base([asiento({ j: 'Ana', r: 'V' }), asiento({ j: 'ana', r: 'D' })])
    expect(validar(g)).toContain('Hay un jugador repetido en la misma mesa.')
  })

  it('en empate, todos tienen que estar marcados como empate', () => {
    const g = base([asiento({ r: 'E' }), asiento({ j: 'Beto', r: 'D' })])
    expect(validar(g)).toContain('Si la partida es un empate, todos tienen que estar marcados como empate.')
  })

  it('sin empate, hace falta exactamente un ganador', () => {
    const sinGanador = base([asiento({ r: 'D' }), asiento({ j: 'Beto', r: 'D' })])
    expect(validar(sinGanador)).toContain('Marca exactamente un ganador, o pon a todos en empate.')

    const dosGanadores = base([asiento({ r: 'V' }), asiento({ j: 'Beto', r: 'V' })])
    expect(validar(dosGanadores)).toContain('Marca exactamente un ganador, o pon a todos en empate.')
  })

  it('un empate de todos los asientos sí es válido', () => {
    const g = base([asiento({ r: 'E' }), asiento({ j: 'Beto', r: 'E' })])
    expect(validar(g)).toEqual([])
  })
})

import { describe, expect, it } from 'vitest'
import { calcularJugadores, ganadorTurno, nombresComandantes, nombresJugadores } from '../../src/registro/calcularJugadores'
import type { Partida } from '../../src/motor/tipos'

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

const partida = (over: Partial<Partida> = {}): Partida => ({
  id: 'g1',
  fecha: '2026-08-01',
  duracion: 100,
  seats: [asiento({ j: 'Ana', r: 'V' }), asiento({ j: 'Beto', r: 'D', c: 'Krenko, Mob Boss', id: 'R', turno: 30 })],
  ...over,
})

describe('ganadorTurno', () => {
  it('devuelve el nombre de quien tuvo el turno más largo, gane o no', () => {
    const p = partida({ seats: [asiento({ j: 'Ana', r: 'D', turno: 30 }), asiento({ j: 'Beto', r: 'V', turno: 90 })] })
    expect(ganadorTurno(p)).toBe('Beto')
  })
})

describe('nombresJugadores', () => {
  it('devuelve los nombres únicos y ordenados de todas las partidas', () => {
    const partidas = [partida(), partida({ id: 'g2', seats: [asiento({ j: 'Cris' }), asiento({ j: 'Ana', r: 'D' })] })]
    expect(nombresJugadores(partidas)).toEqual(['Ana', 'Beto', 'Cris'])
  })
})

describe('nombresComandantes', () => {
  it('incluye compañeros y descarta comandantes vacíos, sin repetir', () => {
    const partidas = [
      partida({
        seats: [
          asiento({ j: 'Ana', c: 'Edgar Markov', c2: 'Sin comandante' }),
          asiento({ j: 'Beto', c: 'Edgar Markov', c2: '' }),
        ],
      }),
    ]
    expect(nombresComandantes(partidas)).toEqual(['Edgar Markov', 'Sin comandante'])
  })
})

describe('calcularJugadores', () => {
  it('cuenta partidas jugadas, victorias, derrotas, puntos y % de victorias', () => {
    const partidas = [partida(), partida({ id: 'g2', seats: [asiento({ j: 'Ana', r: 'D' }), asiento({ j: 'Beto', r: 'V', c: 'Krenko, Mob Boss', id: 'R' })] })]
    const jug = calcularJugadores(partidas)
    const ana = jug.find((x) => x.nombre === 'Ana')!
    expect(ana).toMatchObject({ pj: 2, v: 1, d: 1, e: 0, pts: 3, wr: 0.5 })
  })

  it('un empate suma puntos pero no victorias ni derrotas', () => {
    const partidas = [partida({ seats: [asiento({ j: 'Ana', r: 'E' }), asiento({ j: 'Beto', r: 'E' })] })]
    const ana = calcularJugadores(partidas).find((x) => x.nombre === 'Ana')!
    expect(ana).toMatchObject({ v: 0, e: 1, d: 0, pts: 1 })
  })

  it('el comandante principal es el más repetido, con su identidad de color', () => {
    const partidas = [
      partida({ seats: [asiento({ j: 'Ana', c: 'Edgar Markov', id: 'WBR' }), asiento({ j: 'Beto', r: 'D' })] }),
      partida({
        id: 'g2',
        seats: [asiento({ j: 'Ana', c: 'Edgar Markov', id: 'WBR', r: 'D' }), asiento({ j: 'Beto', r: 'V' })],
      }),
      partida({
        id: 'g3',
        seats: [asiento({ j: 'Ana', c: 'Lathril, Blade of the Elves', id: 'BG', r: 'D' }), asiento({ j: 'Beto', r: 'V' })],
      }),
    ]
    const ana = calcularJugadores(partidas).find((x) => x.nombre === 'Ana')!
    expect(ana.principal).toBe('Edgar Markov')
    expect(ana.principalId).toBe('WBR')
  })

  it('acumula jugadas retiradas, pasadas de tiempo y el turno más largo propio y de la mesa', () => {
    const partidas = [
      partida({ seats: [asiento({ j: 'Ana', rehacer: 2, tiempo: 1, turno: 300 }), asiento({ j: 'Beto', r: 'D', turno: 30 })] }),
      partida({ id: 'g2', seats: [asiento({ j: 'Ana', rehacer: 1, tiempo: 0, turno: 50 }), asiento({ j: 'Beto', r: 'D', turno: 40 })] }),
    ]
    const ana = calcularJugadores(partidas).find((x) => x.nombre === 'Ana')!
    expect(ana).toMatchObject({ rehacer: 3, tiempo: 1, turnoMax: 300, turnosLargos: 2 })
  })
})

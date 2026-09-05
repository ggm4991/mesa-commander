import { describe, expect, it } from 'vitest'
import { nuevoJugador } from '../../src/motor/jugador'
import { cambiarDiaNoche, cambiarIniciativa, cambiarMonarca, cambiarMonarcaPorArrastre } from '../../src/motor/partida'
import type { Juego } from '../../src/motor/tipos'

function partidaDePrueba(): Juego {
  return {
    id: 'x',
    inicio: new Date().toISOString(),
    cfg: { vida: 40, limite: 0, dispo: null },
    j: [nuevoJugador({ nombre: 'Ana' }, 40), nuevoJugador({ nombre: 'Beto' }, 40)],
    turno: 0,
    tIni: Date.now(),
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

describe('cambiarMonarcaPorArrastre', () => {
  it('anota el paso de la corona con el texto del arrastre', () => {
    const juego = cambiarMonarcaPorArrastre(partidaDePrueba(), 0, 1)
    expect(juego.monarca).toBe(1)
    expect(juego.log[0].txt).toBe('La corona pasa de Ana a Beto')
  })
})

describe('cambiarMonarca (menú de partida)', () => {
  it('con un jugador, usa un texto distinto al del arrastre', () => {
    const juego = cambiarMonarca(partidaDePrueba(), 1)
    expect(juego.monarca).toBe(1)
    expect(juego.log[0].txt).toBe('Beto es el monarca')
  })

  it('con null, quita la corona a todos', () => {
    const juego = cambiarMonarca(partidaDePrueba(), null)
    expect(juego.monarca).toBeNull()
    expect(juego.log[0].txt).toBe('Nadie tiene la corona')
  })
})

describe('cambiarIniciativa', () => {
  it('la da y la quita', () => {
    let juego = cambiarIniciativa(partidaDePrueba(), 0)
    expect(juego.log[0].txt).toBe('Ana toma la iniciativa')
    juego = cambiarIniciativa(juego, null)
    expect(juego.log[0].txt).toBe('Nadie tiene la iniciativa')
  })
})

describe('cambiarDiaNoche', () => {
  it('cicla null -> día -> noche -> null', () => {
    let juego = partidaDePrueba()
    juego = cambiarDiaNoche(juego)
    expect(juego.dia).toBe('dia')
    expect(juego.log[0].txt).toBe('Se hace de día')
    juego = cambiarDiaNoche(juego)
    expect(juego.dia).toBe('noche')
    expect(juego.log[0].txt).toBe('Se hace de noche')
    juego = cambiarDiaNoche(juego)
    expect(juego.dia).toBeNull()
    expect(juego.log[0].txt).toBe('Ni día ni noche')
  })
})

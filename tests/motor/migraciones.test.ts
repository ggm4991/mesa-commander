import { describe, expect, it } from 'vitest'
import { migrarJuego, migrarPerfiles } from '../../src/motor/migraciones'

describe('migrarJuego', () => {
  it('el daño de comandante por asiento (formato antiguo) pasa a ser por comandante', () => {
    const migrado = migrarJuego({ j: [{ n: 'Z', c: 'X', dmg: { '1': 7 } }] })
    expect(migrado.j[0].dmg).toEqual({ '1:0': 7 })
    expect(migrado.j[0].c2).toBe('')
  })

  it('una partida guardada sin número de turno (anterior a este contador) se asume en el turno 1 si ya hay alguien jugando', () => {
    const migrado = migrarJuego({ j: [], turno: 0 })
    expect(migrado.numeroTurno).toBe(1)
  })

  it('sin nadie jugando todavía, se asume que no ha empezado ningún turno', () => {
    const migrado = migrarJuego({ j: [], turno: null })
    expect(migrado.numeroTurno).toBe(0)
  })

  it('un número de turno ya guardado se conserva tal cual', () => {
    const migrado = migrarJuego({ j: [], turno: 0, numeroTurno: 12 })
    expect(migrado.numeroTurno).toBe(12)
  })
})

describe('migrarPerfiles', () => {
  it('un perfil de un solo comandante (versión anterior) pasa a tener un mazo', () => {
    const [p] = migrarPerfiles([
      { id: 'p1', nombre: 'Gonzalo', comandante: 'Edgar Markov', comandante2: '', colores: 'WBR' },
    ])
    expect(p.mazos).toHaveLength(1)
    expect(p.mazos[0].c).toBe('Edgar Markov')
    expect(p.ultimo).toBe(p.mazos[0].id)
  })

  it('un perfil ya con varios mazos se conserva, con el último usado', () => {
    const [p] = migrarPerfiles([
      {
        id: 'p2',
        nombre: 'Marta',
        ultimo: 'm2',
        mazos: [
          { id: 'm1', c: 'Muldrotha, the Gravetide', col: 'UBG' },
          { id: 'm2', c: 'Thrasios, Triton Hero', c2: 'Kydele, Chosen of Kruphix', col: 'GU', imagenId: 'edicion-1' },
        ],
      },
    ])
    expect(p.mazos).toHaveLength(2)
    expect(p.ultimo).toBe('m2')
  })

  it('un mazo sin edición fijada (formato anterior a la Fase 4) se rellena con una vacía', () => {
    const [p] = migrarPerfiles([
      { id: 'p1', nombre: 'Gonzalo', mazos: [{ id: 'm1', c: 'Edgar Markov', col: 'WBR' }] },
    ])
    expect(p.mazos[0].imagenId).toBe('')
  })

  it('un mazo con edición fijada la conserva', () => {
    const [p] = migrarPerfiles([
      { id: 'p1', nombre: 'Gonzalo', mazos: [{ id: 'm1', c: 'Edgar Markov', col: 'WBR', imagenId: 'edicion-1' }] },
    ])
    expect(p.mazos[0].imagenId).toBe('edicion-1')
  })
})

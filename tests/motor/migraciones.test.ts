import { describe, expect, it } from 'vitest'
import { migrarJuego, migrarPerfiles } from '../../src/motor/migraciones'

describe('migrarJuego', () => {
  it('el daño de comandante por asiento (formato antiguo) pasa a ser por comandante', () => {
    const migrado = migrarJuego({ j: [{ n: 'Z', c: 'X', dmg: { '1': 7 } }] })
    expect(migrado.j[0].dmg).toEqual({ '1:0': 7 })
    expect(migrado.j[0].c2).toBe('')
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
          { id: 'm2', c: 'Thrasios, Triton Hero', c2: 'Kydele, Chosen of Kruphix', col: 'GU' },
        ],
      },
    ])
    expect(p.mazos).toHaveLength(2)
    expect(p.ultimo).toBe('m2')
  })
})

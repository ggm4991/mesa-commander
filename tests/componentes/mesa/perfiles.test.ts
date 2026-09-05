import { describe, expect, it } from 'vitest'
import { asientoDesde, mazoUltimo } from '../../../src/componentes/mesa/perfiles'
import type { Perfil } from '../../../src/motor/tipos'

const perfil: Perfil = {
  id: 'p1',
  nombre: 'Marta',
  ultimo: 'm2',
  mazos: [
    { id: 'm1', c: 'Muldrotha, the Gravetide', c2: '', col: 'UBG', imagenId: '' },
    { id: 'm2', c: 'Thrasios, Triton Hero', c2: 'Kydele, Chosen of Kruphix', col: 'GU', imagenId: 'edicion-1' },
  ],
}

describe('asientoDesde', () => {
  it('arrastra los dos comandantes, los colores y la edición fijada del mazo', () => {
    const asiento = asientoDesde(perfil, perfil.mazos[1])
    expect(asiento).toEqual({
      nombre: 'Marta',
      comandante: 'Thrasios, Triton Hero',
      comandante2: 'Kydele, Chosen of Kruphix',
      colores: 'GU',
      imagenId: 'edicion-1',
    })
  })

  it('sin mazo, deja el nombre solo', () => {
    expect(asientoDesde(perfil, null)).toEqual({ nombre: 'Marta', comandante: '', comandante2: '', colores: '', imagenId: '' })
  })
})

describe('mazoUltimo', () => {
  it('devuelve el mazo marcado como último', () => {
    expect(mazoUltimo(perfil)?.id).toBe('m2')
  })

  it('sin `ultimo`, cae al primer mazo', () => {
    expect(mazoUltimo({ ...perfil, ultimo: null })?.id).toBe('m1')
  })

  it('sin mazos, devuelve null', () => {
    expect(mazoUltimo({ ...perfil, mazos: [], ultimo: null })).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { validar } from '../../src/registro/validar'
import { partidasDemo, perfilesDemo } from '../../src/registro/datosDemo'

describe('partidasDemo', () => {
  it('devuelve doce partidas válidas, cada una con un id propio', () => {
    const partidas = partidasDemo()
    expect(partidas).toHaveLength(12)
    partidas.forEach((p) => expect(validar(p)).toEqual([]))
    expect(new Set(partidas.map((p) => p.id)).size).toBe(12)
  })

  it('genera ids nuevos cada vez que se restauran', () => {
    const primera = partidasDemo()
    const segunda = partidasDemo()
    expect(primera[0].id).not.toBe(segunda[0].id)
  })
})

describe('perfilesDemo', () => {
  it('devuelve seis perfiles con sus mazos y un "último mazo" válido', () => {
    const perfiles = perfilesDemo()
    expect(perfiles).toHaveLength(6)
    perfiles.forEach((p) => {
      expect(p.mazos.length).toBeGreaterThan(0)
      expect(p.mazos.some((m) => m.id === p.ultimo)).toBe(true)
    })
  })

  it('no comparte referencias entre llamadas: modificar una no afecta a la siguiente', () => {
    const primera = perfilesDemo()
    primera[0].nombre = 'Cambiado'
    const segunda = perfilesDemo()
    expect(segunda[0].nombre).not.toBe('Cambiado')
  })
})

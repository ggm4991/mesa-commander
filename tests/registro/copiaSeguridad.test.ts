import { describe, expect, it } from 'vitest'
import { huellaMazo, huellaPartida, paqueteCompleto, revisarPaquete } from '../../src/registro/copiaSeguridad'
import { CONFIG_POR_DEFECTO } from '../../src/almacenamiento/tipos'
import type { Partida, Perfil } from '../../src/motor/tipos'

const partida = (over: Partial<Partida> = {}): Partida => ({
  id: 'g1',
  fecha: '2026-08-01',
  duracion: 100,
  seats: [
    { j: 'Ana', c: 'Edgar Markov', c2: '', id: 'WBR', r: 'V', rehacer: 0, tiempo: 0, turno: 60 },
    { j: 'Beto', c: 'Krenko, Mob Boss', c2: '', id: 'R', r: 'D', rehacer: 0, tiempo: 0, turno: 30 },
  ],
  ...over,
})

const perfil: Perfil = { id: 'p1', nombre: 'Ana', ultimo: null, mazos: [] }

describe('paqueteCompleto', () => {
  it('junta partidas, perfiles y config con el nombre y formato de la app', () => {
    const paquete = paqueteCompleto([partida()], [perfil], CONFIG_POR_DEFECTO)
    expect(paquete.app).toBe('mesa-commander')
    expect(paquete.formato).toBe(2)
    expect(paquete.partidas).toHaveLength(1)
    expect(paquete.perfiles).toEqual([perfil])
    expect(paquete.config).toEqual(CONFIG_POR_DEFECTO)
  })
})

describe('revisarPaquete', () => {
  it('acepta una copia completa y normaliza sus partidas y perfiles', () => {
    const paquete = paqueteCompleto([partida()], [perfil], CONFIG_POR_DEFECTO)
    const d = revisarPaquete(JSON.stringify(paquete))
    expect(d.partidas).toHaveLength(1)
    expect(d.perfiles).toHaveLength(1)
    expect(d.config).toEqual(CONFIG_POR_DEFECTO)
  })

  it('también acepta una lista suelta de partidas, sin perfiles ni config', () => {
    const d = revisarPaquete(JSON.stringify([partida()]))
    expect(d.partidas).toHaveLength(1)
    expect(d.perfiles).toEqual([])
    expect(d.config).toBeNull()
  })

  it('rechaza un texto que no es JSON de la app', () => {
    expect(() => revisarPaquete('null')).toThrow('El archivo no contiene datos de la app.')
  })

  it('rechaza un paquete sin partidas ni perfiles', () => {
    expect(() => revisarPaquete(JSON.stringify({ partidas: [], perfiles: [] }))).toThrow(
      'No hay ni partidas ni perfiles que cargar.',
    )
  })

  it('rechaza partidas inválidas señalando en cuál está el error', () => {
    const invalida = partida({ duracion: 0 })
    expect(() => revisarPaquete(JSON.stringify([invalida]))).toThrow(/Partida 1: La duración/)
  })
})

describe('huellaPartida', () => {
  it('identifica una partida por su fecha y el conjunto de jugadores, sin importar el orden', () => {
    const a = partida({ seats: [{ ...partida().seats[0] }, { ...partida().seats[1] }] })
    const b = partida({ seats: [{ ...partida().seats[1] }, { ...partida().seats[0] }] })
    expect(huellaPartida(a)).toBe(huellaPartida(b))
  })
})

describe('huellaMazo', () => {
  it('identifica un mazo por sus comandantes y su identidad, sin distinguir mayúsculas', () => {
    expect(huellaMazo({ c: 'Edgar Markov', c2: '', col: 'WBR' })).toBe(huellaMazo({ c: 'edgar markov', c2: '', col: 'WBR' }))
    expect(huellaMazo({ c: 'Edgar Markov', col: 'WBR' })).not.toBe(huellaMazo({ c: 'Krenko, Mob Boss', col: 'R' }))
  })
})

import { describe, expect, it } from 'vitest'
import { DISPOS, conDisposicionGuardada, dispoActual } from '../../../src/componentes/mesa/disposiciones'

describe('dispoActual', () => {
  it('sin nada guardado, usa la primera disposición para ese número de jugadores', () => {
    const d = dispoActual(4, {})
    expect(d.id).toBe(DISPOS[4][0].id)
    expect(d.rot).toEqual(DISPOS[4][0].rot)
  })

  it('respeta la disposición guardada si sigue siendo válida', () => {
    const guardada = { 4: { id: '4b', rot: [90, 90, 90, 90] } }
    const d = dispoActual(4, guardada)
    expect(d.id).toBe('4b')
    expect(d.rot).toEqual([90, 90, 90, 90])
  })

  it('ignora una rotación guardada con un número de asientos distinto', () => {
    const guardada = { 4: { id: '4a', rot: [90, 90] } } // guardado para otro número de jugadores
    const d = dispoActual(4, guardada)
    expect(d.rot).toEqual(DISPOS[4].find((x) => x.id === '4a')!.rot)
  })

  it('ignora un id de disposición que ya no existe para ese número de jugadores', () => {
    const guardada = { 3: { id: 'no-existe', rot: [0, 0, 0] } }
    const d = dispoActual(3, guardada)
    expect(d.id).toBe(DISPOS[3][0].id)
  })
})

describe('conDisposicionGuardada', () => {
  it('guarda la disposición para ese número de jugadores sin tocar las demás', () => {
    const original = { 2: { id: '2a', rot: [180, 0] } }
    const actualizada = conDisposicionGuardada(original, 4, { id: '4b', rot: [90, 90, 90, 90] })
    expect(actualizada[2]).toEqual({ id: '2a', rot: [180, 0] })
    expect(actualizada[4]).toEqual({ id: '4b', rot: [90, 90, 90, 90] })
  })
})

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

describe('orden de los asientos: sentido horario (regla 103.1)', () => {
  // `pasarTurno` (motor/partida.ts) solo hace índice+1: para que eso sea de
  // verdad "pasar al de la izquierda", el índice de cada asiento tiene que
  // seguir el sentido de las agujas del reloj visto desde arriba, no el
  // orden en que la rejilla coloca las celdas (ver ADR 0031).
  it('"Dos y dos" (4a): arriba-izq., arriba-der., abajo-der., abajo-izq.', () => {
    const d = DISPOS[4].find((x) => x.id === '4a')!
    expect(d.areas).toEqual(['1/1/2/2', '1/2/2/3', '2/2/3/3', '2/1/3/2'])
  })

  it('"Uno enfrente" (3a): arriba, abajo-der., abajo-izq.', () => {
    const d = DISPOS[3].find((x) => x.id === '3a')!
    expect(d.areas).toEqual(['1/1/2/3', '2/2/3/3', '2/1/3/2'])
  })

  it('"Uno en cada lado" (4b): norte, este, sur, oeste', () => {
    const d = DISPOS[4].find((x) => x.id === '4b')!
    expect(d.rot).toEqual([180, 270, 0, 90])
  })

  it('"Rodeando el móvil" de 6 (6b): norte-izq., norte-der., este, sureste, suroeste, oeste', () => {
    const d = DISPOS[6].find((x) => x.id === '6b')!
    expect(d.rot).toEqual([180, 180, 270, 0, 0, 90])
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

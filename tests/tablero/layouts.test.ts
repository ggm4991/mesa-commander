import { describe, expect, it } from 'vitest'
import { dispoTablero } from '../../src/tablero/layouts'

describe('dispoTablero', () => {
  it('usa la disposición de la pantalla previa si tiene forma válida', () => {
    const guardada = { id: '4b', n: 'x', cols: '1fr 1.1fr 1fr', rows: '1fr 1.3fr 1fr', rot: [180, 90, 270, 0], centro: '2/2/3/3' }
    expect(dispoTablero(4, guardada)).toEqual({
      cols: '1fr 1.1fr 1fr',
      rows: '1fr 1.3fr 1fr',
      areas: [],
      rot: [180, 90, 270, 0],
      centro: '2/2/3/3',
    })
  })

  it('sin disposición (o con forma inválida), cae al reparto genérico', () => {
    const d = dispoTablero(4, null)
    expect(d.cols).toBe('repeat(2,1fr)')
    expect(d.rows).toBe('repeat(2,1fr)')
    // LAYOUTS[4].rot = [0,1]: los asientos 0 y 1 quedan a 180°, el resto a 0°
    expect(d.rot).toEqual([180, 180, 0, 0])
  })

  it('rechaza una disposición sin `cols` o con `rot` que no es un array', () => {
    expect(dispoTablero(2, { rot: [0] }).cols).toBe('repeat(1,1fr)') // sin cols
    expect(dispoTablero(2, { cols: '1fr', rot: 'no-es-array' }).cols).toBe('repeat(1,1fr)')
  })

  it('para 3 y 5 jugadores, aplica el área especial del asiento central', () => {
    expect(dispoTablero(3, null).areas).toEqual(['1 / 1 / 2 / 3', null, null])
    expect(dispoTablero(5, null).areas).toEqual([null, null, null, null, '3 / 1 / 4 / 3'])
  })
})

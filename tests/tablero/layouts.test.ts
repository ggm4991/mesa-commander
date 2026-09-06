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
    expect(dispoTablero(3, null).areas).toEqual(['1 / 1 / 2 / 3', '2 / 2 / 3 / 3', '2 / 1 / 3 / 2'])
    expect(dispoTablero(5, null).areas).toEqual([null, null, '2 / 2 / 3 / 3', '3 / 1 / 4 / 3', '2 / 1 / 3 / 2'])
  })

  it('el orden de los asientos va en el sentido de las agujas del reloj (regla 103.1), no el de la rejilla', () => {
    // 4 jugadores: 0 arriba-izq., 1 arriba-der., 2 abajo-der., 3 abajo-izq. —
    // pasar turno (que solo hace índice+1) va así en sentido horario de verdad
    expect(dispoTablero(4, null).areas).toEqual([null, null, '2 / 2 / 3 / 3', '2 / 1 / 3 / 2'])
  })
})

import { describe, expect, it } from 'vitest'
import { dispoTablero, ordenEspacialDesde } from '../../src/tablero/layouts'
import type { DispoTablero } from '../../src/tablero/layouts'

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
    expect(d.rows).toBe('1fr 1fr')
    // LAYOUTS[4].rot = [0,1]: los asientos 0 y 1 quedan a 180°, el resto a 0°
    expect(d.rot).toEqual([180, 180, 0, 0])
  })

  it('con 5 o 6 jugadores, reserva una fila propia para el hub en vez de duplicar su alto en cada hueco', () => {
    // Con 3 filas de asientos, centrar el hub por `row-gap` (como hacen 1-4
    // jugadores) cae sobre la fila del medio en vez de un hueco de verdad —
    // de ahí que el reparto genérico de 5 y 6 también necesite `filaHub`
    // (ver ADR 0039), igual que ya tenían 3 y 4 con `centro`.
    expect(dispoTablero(5, null).filaHub).toBe(1)
    expect(dispoTablero(5, null).centro).toBe('2 / 1 / 3 / 3')
    expect(dispoTablero(6, null).filaHub).toBe(1)
    expect(dispoTablero(6, null).centro).toBe('2 / 1 / 3 / 3')
  })

  it('rechaza una disposición sin `cols` o con `rot` que no es un array', () => {
    expect(dispoTablero(2, { rot: [0] }).cols).toBe('repeat(1,1fr)') // sin cols
    expect(dispoTablero(2, { cols: '1fr', rot: 'no-es-array' }).cols).toBe('repeat(1,1fr)')
  })

  it('para 3 y 5 jugadores, aplica el área especial del asiento central', () => {
    expect(dispoTablero(3, null).areas).toEqual(['1 / 1 / 2 / 3', '2 / 2 / 3 / 3', '2 / 1 / 3 / 2'])
    expect(dispoTablero(5, null).areas).toEqual([
      '1 / 1 / 2 / 2',
      '1 / 2 / 2 / 3',
      '3 / 2 / 4 / 3',
      '4 / 1 / 5 / 3',
      '3 / 1 / 4 / 2',
    ])
  })

  it('el orden de los asientos va en el sentido de las agujas del reloj (regla 103.1), no el de la rejilla', () => {
    // 4 jugadores: 0 arriba-izq., 1 arriba-der., 2 abajo-der., 3 abajo-izq. —
    // pasar turno (que solo hace índice+1) va así en sentido horario de verdad
    expect(dispoTablero(4, null).areas).toEqual([null, null, '2 / 2 / 3 / 3', '2 / 1 / 3 / 2'])
  })
})

describe('ordenEspacialDesde', () => {
  // "Dos y dos" (4a): 0 arriba-izq., 1 arriba-der., 2 abajo-der., 3
  // abajo-izq. — la misma disposición real de disposiciones.ts, no una de
  // prueba inventada. El resultado es [arriba-izq., arriba-der., abajo-izq.,
  // abajo-der.], el orden en que una rejilla 2×2 se rellena sola.
  const dosYDos: DispoTablero = {
    cols: '1fr 1fr',
    rows: '1fr 1fr',
    areas: ['1/1/2/2', '1/2/2/3', '2/2/3/3', '2/1/3/2'],
    rot: [180, 180, 0, 0],
  }

  it('sin girar (asiento 2, abajo-der.), el cuadrado es una copia exacta de la mesa real', () => {
    // Confirmado por el usuario celda a celda: visto desde el jugador 3
    // (abajo-der., sin giro), el cuadrado muestra arriba-izq.=0, arriba-der.=1,
    // abajo-izq.=3, abajo-der.=2 (uno mismo) — exactamente sus posiciones
    // reales en la mesa, sin ningún giro.
    expect(ordenEspacialDesde(dosYDos, 2, 4)).toEqual([0, 1, 3, 2])
  })

  it('girado 180° (asiento 0, arriba-izq.), el cuadrado es la mesa real girada 180°', () => {
    // Confirmado por el usuario celda a celda: visto desde el jugador 1
    // (arriba-izq., girado 180°), el cuadrado muestra arriba-izq.=2,
    // arriba-der.=3, abajo-izq.=1, abajo-der.=0 (uno mismo) — la mesa real
    // vista boca abajo, no una secuencia que empiece por uno mismo.
    expect(ordenEspacialDesde(dosYDos, 0, 4)).toEqual([2, 3, 1, 0])
  })

  it('"Uno en cada lado" (4b): en cruz, no en esquinas, así que cae al orden por ángulo en vez de por celda', () => {
    // La disposición real de disposiciones.ts: arriba y abajo a lo ancho,
    // dos asientos a los lados — ninguno está realmente en una esquina (el de
    // arriba y el de abajo quedan centrados en el eje vertical), así que la
    // repartición por celda 2×2 empataría y se cae al orden por ángulo
    // (sentido horario desde quien mira), como con cualquier número de
    // jugadores sin forma de brújula limpia.
    const unoEnCadaLado: DispoTablero = {
      cols: '1fr 1fr',
      rows: '1fr 1fr 1fr',
      areas: ['1/1/2/3', '2/2/3/3', '4/1/5/3', '2/1/3/2'],
      rot: [180, 270, 0, 90],
      centro: '3/1/4/3',
      filaHub: 2,
    }
    // Desde el asiento de abajo (2, sin girar): empieza por sí mismo y sigue
    // en sentido horario por el de la izquierda (3), el de arriba (0) y por
    // último el de la derecha (1).
    expect(ordenEspacialDesde(unoEnCadaLado, 2, 4)).toEqual([2, 3, 0, 1])
  })

  it('sin `areas` completas para calcularlo, cae al orden de índice llano', () => {
    const sinAreas: DispoTablero = { cols: '1fr', rows: '1fr 1fr 1fr', areas: [], rot: [0, 0, 0] }
    expect(ordenEspacialDesde(sinAreas, 1, 3)).toEqual([0, 1, 2])
  })
})

import { describe, expect, it } from 'vitest'
import { calcularBordeAsiento } from '../../src/tablero/bordes'

describe('calcularBordeAsiento', () => {
  it('sin tamaño todavía (primer render), no hay nada que calcular', () => {
    expect(calcularBordeAsiento({ x: 0, y: 0 }, { left: 0, top: 0, width: 0, height: 0 }, 0)).toBeNull()
  })

  // Mesa 2x2 de 1091x864, cuatro asientos en las esquinas — el mismo escenario que
  // pruebas/bordes-asientos.test.js. En cada uno, los controles deben apartarse
  // hacia el borde de la pantalla más alejado del centro de la mesa.
  it('en una mesa 2x2, cada esquina aparta sus controles del centro', () => {
    const centro = { x: 1091 / 2, y: 864 / 2 }

    const arribaIzq = calcularBordeAsiento(centro, { left: 0, top: 0, width: 540, height: 432 }, 180)
    expect(arribaIzq).toEqual({ arriba: 'fin', abajo: null, hueco: '112px' })

    const arribaDer = calcularBordeAsiento(centro, { left: 551, top: 0, width: 540, height: 432 }, 180)
    expect(arribaDer).toEqual({ arriba: 'ini', abajo: null, hueco: '112px' })

    const abajoIzq = calcularBordeAsiento(centro, { left: 0, top: 440, width: 540, height: 424 }, 0)
    expect(abajoIzq).toEqual({ arriba: 'ini', abajo: null, hueco: '112px' })

    const abajoDer = calcularBordeAsiento(centro, { left: 551, top: 440, width: 540, height: 424 }, 0)
    expect(abajoDer).toEqual({ arriba: 'fin', abajo: null, hueco: '112px' })
  })

  it('un asiento centrado (sin dirección clara) no aparta nada', () => {
    // El propio asiento coincide con el centro de la mesa: dx y dy caen dentro
    // del margen de 8px que el original trata como "sin dirección".
    const b = calcularBordeAsiento({ x: 100, y: 100 }, { left: 96, top: 96, width: 8, height: 8 }, 0)
    expect(b).toEqual({ arriba: null, abajo: null, hueco: '60px' })
  })

  it('el hueco no baja de 60px ni sube de 112px', () => {
    const pequeno = calcularBordeAsiento({ x: 1000, y: 1000 }, { left: 0, top: 0, width: 40, height: 40 }, 0)
    expect(pequeno?.hueco).toBe('60px') // 40*.42=16.8, por debajo del mínimo
    const grande = calcularBordeAsiento({ x: 1000, y: 1000 }, { left: 0, top: 0, width: 500, height: 500 }, 0)
    expect(grande?.hueco).toBe('112px') // 500*.42=210, por encima del máximo
  })
})

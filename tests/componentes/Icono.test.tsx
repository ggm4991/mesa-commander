// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icono } from '../../src/componentes/icono/Icono'
import { ICONOS } from '../../src/componentes/icono/mapaIconos'

describe('Icono', () => {
  it('pinta el path del icono pedido', () => {
    const { container } = render(<Icono nombre="corona" />)
    expect(container.querySelector('path')).toHaveAttribute('d', ICONOS.corona)
  })

  it('usa 20 de tamaño por defecto, y el que se le pida', () => {
    const { container: c1 } = render(<Icono nombre="salir" />)
    expect(c1.querySelector('svg')).toHaveAttribute('width', '20')

    const { container: c2 } = render(<Icono nombre="salir" tamano={16} />)
    expect(c2.querySelector('svg')).toHaveAttribute('width', '16')
  })

  it('pinta los 36 iconos del mapa sin reventar', () => {
    const nombres = Object.keys(ICONOS) as (keyof typeof ICONOS)[]
    expect(nombres).toHaveLength(36)
    for (const nombre of nombres) {
      const { container } = render(<Icono nombre={nombre} />)
      expect(container.querySelector('path')?.getAttribute('d')).toBeTruthy()
    }
  })
})

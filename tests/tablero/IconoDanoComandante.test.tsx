// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { IconoDanoComandante } from '../../src/tablero/IconoDanoComandante'
import type { ComandanteEnMesa } from '../../src/motor/vida'
import { ProveedorQueryDePrueba } from '../ayudantes/queryDePrueba'

const servidor = setupServer(http.get('https://api.scryfall.com/cards/named', () => new HttpResponse(null, { status: 404 })))
beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => servidor.resetHandlers())
afterAll(() => servidor.close())

const fuente: ComandanteEnMesa = { clave: '1:0', nombre: 'Krenko, Mob Boss', dueno: 'Beto', k: 1, col: 'R' }

function renderIcono(props: Partial<Parameters<typeof IconoDanoComandante>[0]> = {}) {
  const onSumar = vi.fn()
  const onRestar = vi.fn()
  const { container } = render(
    <ProveedorQueryDePrueba>
      <IconoDanoComandante fuente={fuente} esPropio={false} valor={0} onSumar={onSumar} onRestar={onRestar} {...props} />
    </ProveedorQueryDePrueba>,
  )
  return { boton: container.querySelector('.dano-cmd') as HTMLElement, onSumar, onRestar }
}

describe('IconoDanoComandante', () => {
  it('sin daño acumulado, no muestra ninguna insignia', () => {
    const { boton } = renderIcono({ valor: 0 })
    expect(boton.querySelector('.dano-valor')).toBeNull()
  })

  it('con daño acumulado, muestra el valor en la insignia', () => {
    const { boton } = renderIcono({ valor: 5 })
    expect(boton.querySelector('.dano-valor')).toHaveTextContent('5')
  })

  it('a partir del daño letal, se marca como letal', () => {
    const { boton } = renderIcono({ valor: 21 })
    expect(boton).toHaveClass('letal')
  })

  it('un toque corto suma; no resta', () => {
    const { boton, onSumar, onRestar } = renderIcono()
    fireEvent.pointerDown(boton)
    fireEvent.pointerUp(boton)
    expect(onSumar).toHaveBeenCalledOnce()
    expect(onRestar).not.toHaveBeenCalled()
  })

  it('mantener pulsado resta; no suma', () => {
    vi.useFakeTimers()
    const { boton, onSumar, onRestar } = renderIcono()
    fireEvent.pointerDown(boton)
    vi.advanceTimersByTime(500)
    fireEvent.pointerUp(boton)
    expect(onRestar).toHaveBeenCalledOnce()
    expect(onSumar).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('soltar antes de tiempo fuera del botón no dispara ninguna de las dos', () => {
    vi.useFakeTimers()
    const { boton, onSumar, onRestar } = renderIcono()
    fireEvent.pointerDown(boton)
    fireEvent.pointerLeave(boton)
    vi.advanceTimersByTime(500)
    expect(onSumar).not.toHaveBeenCalled()
    expect(onRestar).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('la etiqueta accesible distingue el propio comandante del de un rival', () => {
    const { boton: propio } = renderIcono({ esPropio: true })
    expect(propio).toHaveAccessibleName(expect.stringContaining('tu propio comandante'))
    const { boton: ajeno } = renderIcono({ esPropio: false })
    expect(ajeno).toHaveAccessibleName(expect.stringContaining('de Beto'))
  })
})

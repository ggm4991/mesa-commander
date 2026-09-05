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
afterEach(() => {
  servidor.resetHandlers()
  vi.useRealTimers()
})
afterAll(() => servidor.close())

const fuente: ComandanteEnMesa = { clave: '1:0', nombre: 'Krenko, Mob Boss', dueno: 'Beto', k: 1, col: 'R', imagenId: '' }

function renderIcono(props: Partial<Parameters<typeof IconoDanoComandante>[0]> = {}) {
  const onSumar = vi.fn()
  const onAbrir = vi.fn()
  const { container } = render(
    <ProveedorQueryDePrueba>
      <IconoDanoComandante fuente={fuente} esPropio={false} valor={0} onSumar={onSumar} onAbrir={onAbrir} {...props} />
    </ProveedorQueryDePrueba>,
  )
  const sector = container.querySelector('.dano-cmd') as HTMLElement
  return { sector, toque: sector.querySelector('.dano-toque') as HTMLElement, onSumar, onAbrir }
}

describe('IconoDanoComandante', () => {
  it('sin daño acumulado, no muestra ninguna insignia', () => {
    const { toque } = renderIcono({ valor: 0 })
    expect(toque.querySelector('.dano-valor')).toBeNull()
  })

  it('con daño acumulado, muestra el valor en la insignia', () => {
    const { toque } = renderIcono({ valor: 5 })
    expect(toque.querySelector('.dano-valor')).toHaveTextContent('5')
  })

  it('a partir del daño letal, se marca como letal', () => {
    const { sector } = renderIcono({ valor: 21 })
    expect(sector).toHaveClass('letal')
  })

  it('un toque corto suma; no pide abrir el cuadrado', () => {
    const { toque, onSumar, onAbrir } = renderIcono()
    fireEvent.pointerDown(toque)
    fireEvent.pointerUp(toque)
    expect(onSumar).toHaveBeenCalledOnce()
    expect(onAbrir).not.toHaveBeenCalled()
  })

  it('mantener pulsado pide abrir el cuadrado entero; no suma directamente', () => {
    vi.useFakeTimers()
    const { toque, onSumar, onAbrir } = renderIcono()
    fireEvent.pointerDown(toque)
    vi.advanceTimersByTime(500)
    expect(onAbrir).toHaveBeenCalledOnce()
    expect(onSumar).not.toHaveBeenCalled()
  })

  it('soltar antes de tiempo no dispara ninguna de las dos', () => {
    vi.useFakeTimers()
    const { toque, onSumar, onAbrir } = renderIcono()
    fireEvent.pointerDown(toque)
    fireEvent.pointerLeave(toque)
    vi.advanceTimersByTime(500)
    expect(onSumar).not.toHaveBeenCalled()
    expect(onAbrir).not.toHaveBeenCalled()
  })

  it('la etiqueta accesible distingue el propio comandante del de un rival', () => {
    const { toque: propio } = renderIcono({ esPropio: true })
    expect(propio).toHaveAccessibleName(expect.stringContaining('tu propio comandante'))
    const { toque: ajeno } = renderIcono({ esPropio: false })
    expect(ajeno).toHaveAccessibleName(expect.stringContaining('de Beto'))
  })
})

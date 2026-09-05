// @vitest-environment jsdom
import { act, fireEvent, render } from '@testing-library/react'
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
  const onRestar = vi.fn()
  const { container } = render(
    <ProveedorQueryDePrueba>
      <div>
        <IconoDanoComandante fuente={fuente} esPropio={false} valor={0} onSumar={onSumar} onRestar={onRestar} {...props} />
        <button type="button" className="fuera-de-prueba">
          fuera del sector
        </button>
      </div>
    </ProveedorQueryDePrueba>,
  )
  const sector = container.querySelector('.dano-cmd') as HTMLElement
  return {
    sector,
    toque: () => sector.querySelector('.dano-toque') as HTMLElement,
    fuera: container.querySelector('.fuera-de-prueba') as HTMLElement,
    onSumar,
    onRestar,
  }
}

describe('IconoDanoComandante', () => {
  it('sin daño acumulado, no muestra ninguna insignia', () => {
    const { toque } = renderIcono({ valor: 0 })
    expect(toque().querySelector('.dano-valor')).toBeNull()
  })

  it('con daño acumulado, muestra el valor en la insignia', () => {
    const { toque } = renderIcono({ valor: 5 })
    expect(toque().querySelector('.dano-valor')).toHaveTextContent('5')
  })

  it('a partir del daño letal, se marca como letal', () => {
    const { sector } = renderIcono({ valor: 21 })
    expect(sector).toHaveClass('letal')
  })

  it('un toque corto suma directamente', () => {
    const { toque, onSumar, onRestar } = renderIcono()
    fireEvent.pointerDown(toque())
    fireEvent.pointerUp(toque())
    expect(onSumar).toHaveBeenCalledOnce()
    expect(onRestar).not.toHaveBeenCalled()
  })

  it('mantener pulsado abre el sector en dos mitades, sin sumar ni restar todavía', () => {
    // sin fireEvent.pointerUp tras el temporizador: el propio toque desaparece del
    // DOM al abrirse (lo sustituyen las dos mitades), igual que en un navegador de
    // verdad soltar el dedo sobre un elemento que ya no existe.
    vi.useFakeTimers()
    const { sector, toque, onSumar, onRestar } = renderIcono()
    fireEvent.pointerDown(toque())
    act(() => vi.advanceTimersByTime(500))
    expect(sector).toHaveClass('abierto')
    expect(sector.querySelector('.dano-sumar')).not.toBeNull()
    expect(sector.querySelector('.dano-restar')).not.toBeNull()
    expect(onSumar).not.toHaveBeenCalled()
    expect(onRestar).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('con el sector abierto, tocar la mitad de restar resta y lo vuelve a cerrar', () => {
    vi.useFakeTimers()
    const { sector, toque, onRestar } = renderIcono()
    fireEvent.pointerDown(toque())
    act(() => vi.advanceTimersByTime(500))
    fireEvent.click(sector.querySelector('.dano-restar') as Element)
    expect(onRestar).toHaveBeenCalledOnce()
    expect(sector).not.toHaveClass('abierto')
    vi.useRealTimers()
  })

  it('con el sector abierto, tocar fuera lo cierra sin sumar ni restar', () => {
    vi.useFakeTimers()
    const { sector, toque, fuera, onSumar, onRestar } = renderIcono()
    fireEvent.pointerDown(toque())
    act(() => vi.advanceTimersByTime(500))
    fireEvent.pointerDown(fuera)
    expect(sector).not.toHaveClass('abierto')
    expect(onSumar).not.toHaveBeenCalled()
    expect(onRestar).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('pasados unos segundos sin tocarlo, el sector abierto se cierra solo', () => {
    vi.useFakeTimers()
    const { sector, toque } = renderIcono()
    fireEvent.pointerDown(toque())
    act(() => vi.advanceTimersByTime(500))
    expect(sector).toHaveClass('abierto')
    act(() => vi.advanceTimersByTime(3000))
    expect(sector).not.toHaveClass('abierto')
    vi.useRealTimers()
  })

  it('soltar antes de tiempo fuera del botón no dispara ninguna de las dos', () => {
    vi.useFakeTimers()
    const { toque, onSumar, onRestar } = renderIcono()
    fireEvent.pointerDown(toque())
    fireEvent.pointerLeave(toque())
    act(() => vi.advanceTimersByTime(500))
    expect(onSumar).not.toHaveBeenCalled()
    expect(onRestar).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('la etiqueta accesible distingue el propio comandante del de un rival', () => {
    const { toque: propio } = renderIcono({ esPropio: true })
    expect(propio()).toHaveAccessibleName(expect.stringContaining('tu propio comandante'))
    const { toque: ajeno } = renderIcono({ esPropio: false })
    expect(ajeno()).toHaveAccessibleName(expect.stringContaining('de Beto'))
  })
})

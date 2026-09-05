// @vitest-environment jsdom
import { act, fireEvent, render } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { PanelDanoExpandido } from '../../src/tablero/PanelDanoExpandido'
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

function renderPanel(props: Partial<Parameters<typeof PanelDanoExpandido>[0]> = {}) {
  const onSumar = vi.fn()
  const onRestar = vi.fn()
  const onCerrar = vi.fn()
  const { container } = render(
    <ProveedorQueryDePrueba>
      <div>
        <PanelDanoExpandido fuente={fuente} esPropio={false} valor={0} onSumar={onSumar} onRestar={onRestar} onCerrar={onCerrar} {...props} />
        <button type="button" className="fuera-de-prueba">
          fuera
        </button>
      </div>
    </ProveedorQueryDePrueba>,
  )
  const panel = container.querySelector('.dano-expandido') as HTMLElement
  return {
    panel,
    fuera: container.querySelector('.fuera-de-prueba') as HTMLElement,
    onSumar,
    onRestar,
    onCerrar,
  }
}

describe('PanelDanoExpandido', () => {
  it('muestra las dos mitades grandes de sumar y restar', () => {
    const { panel } = renderPanel()
    expect(panel.querySelector('.dano-sumar')).not.toBeNull()
    expect(panel.querySelector('.dano-restar')).not.toBeNull()
  })

  it('tocar sumar llama a onSumar y cierra el panel', () => {
    const { panel, onSumar, onCerrar } = renderPanel()
    fireEvent.click(panel.querySelector('.dano-sumar') as Element)
    expect(onSumar).toHaveBeenCalledOnce()
    expect(onCerrar).not.toHaveBeenCalled() // cerrar es cosa del padre al reaccionar a onSumar, no del propio panel
  })

  it('tocar restar llama a onRestar', () => {
    const { panel, onRestar } = renderPanel()
    fireEvent.click(panel.querySelector('.dano-restar') as Element)
    expect(onRestar).toHaveBeenCalledOnce()
  })

  it('tocar fuera del panel llama a onCerrar', () => {
    const { fuera, onCerrar } = renderPanel()
    fireEvent.pointerDown(fuera)
    expect(onCerrar).toHaveBeenCalledOnce()
  })

  it('pasados unos segundos sin tocarlo, se cierra solo', () => {
    vi.useFakeTimers()
    const { onCerrar } = renderPanel()
    act(() => vi.advanceTimersByTime(3000))
    expect(onCerrar).toHaveBeenCalledOnce()
  })

  it('a partir del daño letal, se marca como letal', () => {
    const { panel } = renderPanel({ valor: 21 })
    expect(panel).toHaveClass('letal')
  })
})

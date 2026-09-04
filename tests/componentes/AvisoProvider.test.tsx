// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AvisoProvider } from '../../src/componentes/comunes/AvisoProvider'
import { useAviso } from '../../src/componentes/comunes/contextoAviso'

function Disparador({ texto }: { texto: string }) {
  const mostrar = useAviso()
  return (
    <button type="button" onClick={() => mostrar(texto)}>
      disparar
    </button>
  )
}

describe('AvisoProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el aviso al llamar a useAviso() y lo borra a los 2600ms', () => {
    render(
      <AvisoProvider>
        <Disparador texto="Guardado" />
      </AvisoProvider>,
    )
    expect(screen.queryByText('Guardado')).toBeNull()

    fireEvent.click(screen.getByText('disparar'))
    expect(screen.getByText('Guardado')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2600)
    })
    expect(screen.queryByText('Guardado')).toBeNull()
  })

  it('un aviso nuevo reinicia el temporizador del anterior', () => {
    render(
      <AvisoProvider>
        <Disparador texto="Primero" />
      </AvisoProvider>,
    )
    fireEvent.click(screen.getByText('disparar'))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    fireEvent.click(screen.getByText('disparar')) // se repite antes de los 2600ms

    act(() => {
      vi.advanceTimersByTime(2000)
    }) // 4000ms desde el primero, pero solo 2000 desde este segundo disparo
    expect(screen.getByText('Primero')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(screen.queryByText('Primero')).toBeNull()
  })
})

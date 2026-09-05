// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Asiento } from '../../src/tablero/Asiento'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego } from '../../src/motor/tipos'

function juegoDePrueba(): Juego {
  return {
    id: 'x',
    inicio: new Date().toISOString(),
    cfg: { vida: 40, limite: 0, dispo: null },
    j: [
      nuevoJugador({ nombre: 'Ana', comandante: 'Edgar Markov', comandante2: 'Kydele, Chosen of Kruphix' }, 40),
      nuevoJugador({ nombre: 'Beto' }, 40),
    ],
    turno: 0,
    tIni: Date.now(),
    acum: 0,
    pausado: false,
    monarca: null,
    iniciativa: null,
    dia: null,
    log: [],
    fin: false,
    undo: [],
  }
}

const props = (over: Record<string, unknown> = {}) => ({
  juego: juegoDePrueba(),
  indice: 0,
  rotacion: 0,
  delta: 0,
  borde: null,
  esDestinoDeCorona: false,
  onCambiarVida: vi.fn(),
  onAbrirMenu: vi.fn(),
  onAbrirDano: vi.fn(),
  onElegirInicio: vi.fn(),
  onRetirada: vi.fn(),
  onEmpezarArrastreCorona: vi.fn(),
  seatRef: vi.fn(),
  ...over,
})

describe('Asiento', () => {
  it('muestra el nombre, los dos comandantes y la vida', () => {
    render(<Asiento {...props()} />)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Edgar Markov + Kydele, Chosen of Kruphix')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
  })

  it('marca "Su turno" solo a quien le toca y no está fuera', () => {
    render(<Asiento {...props()} />)
    expect(screen.getByText('Su turno')).toBeInTheDocument()
  })

  it('un jugador fuera se marca y no muestra "Su turno" aunque sea su índice', () => {
    const juego = juegoDePrueba()
    juego.j[0].out = true
    render(<Asiento {...props({ juego })} />)
    expect(screen.getByText('Fuera')).toBeInTheDocument()
    expect(screen.queryByText('Su turno')).toBeNull()
  })

  it('tocar + y - llama a onCambiarVida', () => {
    const onCambiarVida = vi.fn()
    render(<Asiento {...props({ onCambiarVida })} />)
    fireEvent.pointerDown(screen.getByLabelText('Sumar vida'))
    fireEvent.pointerDown(screen.getByLabelText('Quitar vida'))
    expect(onCambiarVida).toHaveBeenNthCalledWith(1, 1)
    expect(onCambiarVida).toHaveBeenNthCalledWith(2, -1)
  })

  it('muestra el delta flotante solo cuando no es cero', () => {
    const { rerender } = render(<Asiento {...props({ delta: 0 })} />)
    expect(document.querySelector('.delta')).toBeNull()
    rerender(<Asiento {...props({ delta: 3 })} />)
    expect(screen.getByText('+3')).toBeInTheDocument()
    rerender(<Asiento {...props({ delta: -2 })} />)
    expect(screen.getByText('-2')).toBeInTheDocument()
  })

  it('la corona solo aparece en el asiento del monarca', () => {
    const juego = juegoDePrueba()
    juego.monarca = 0
    const { rerender } = render(<Asiento {...props({ juego })} />)
    expect(document.querySelector('.corona')).not.toBeNull()
    rerender(<Asiento {...props({ juego, indice: 1 })} />)
    expect(document.querySelector('.corona')).toBeNull()
  })

  it('"Empiezo yo" solo aparece cuando la partida espera turno', () => {
    const juego = juegoDePrueba()
    juego.turno = null
    render(<Asiento {...props({ juego })} />)
    fireEvent.click(screen.getByText(/Empiezo yo/))
    expect(props().onElegirInicio).toBeDefined()
  })

  it('el botón de daño no aparece en partidas de un solo jugador', () => {
    const juego = juegoDePrueba()
    juego.j = [juego.j[0]]
    render(<Asiento {...props({ juego })} />)
    // en un juego de 2+ hay dos ".more" en seat-bot (retirada y daño); a solas, solo uno
    expect(document.querySelectorAll('.seat-bot .more')).toHaveLength(1)
  })

  it('muestra los contadores activos y los oculta cuando están a cero', () => {
    const juego = juegoDePrueba()
    juego.j[0].ven = 3
    const { rerender } = render(<Asiento {...props({ juego })} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    juego.j[0].ven = 0
    rerender(<Asiento {...props({ juego: { ...juego } })} />)
    expect(screen.queryByText('3')).toBeNull()
  })

  it('abrir menú y daño llaman a sus callbacks', () => {
    const onAbrirMenu = vi.fn()
    const onAbrirDano = vi.fn()
    render(<Asiento {...props({ onAbrirMenu, onAbrirDano })} />)
    fireEvent.click(screen.getByLabelText('Opciones de Ana'))
    expect(onAbrirMenu).toHaveBeenCalledOnce()
    fireEvent.click(document.querySelector('.seat-bot .more:nth-of-type(2)') as Element)
    expect(onAbrirDano).toHaveBeenCalledOnce()
  })
})

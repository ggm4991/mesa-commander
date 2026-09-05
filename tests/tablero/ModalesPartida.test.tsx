// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  ModalElegirJugador,
  ModalMenuPartida,
  ModalTerminarPartida,
  ModalVerLog,
} from '../../src/tablero/ModalesPartida'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego } from '../../src/motor/tipos'

function juegoDePrueba(): Juego {
  return {
    id: 'x',
    inicio: new Date(Date.now() - 5 * 60_000).toISOString(),
    cfg: { vida: 40, limite: 0, dispo: null },
    j: [nuevoJugador({ nombre: 'Ana' }, 40), nuevoJugador({ nombre: 'Beto' }, 40)],
    turno: null,
    tIni: Date.now(),
    acum: 0,
    pausado: false,
    monarca: null,
    iniciativa: null,
    dia: null,
    log: [{ t: 5, txt: 'Empieza la partida' }],
    fin: false,
    undo: [],
  }
}

describe('ModalMenuPartida', () => {
  const handlers = () => ({
    onCambiarMonarca: vi.fn(),
    onCambiarIniciativa: vi.fn(),
    onCambiarDia: vi.fn(),
    onTogglePausa: vi.fn(),
    onToggleSonido: vi.fn(),
    onSortear: vi.fn(),
    onDado: vi.fn(),
    onVerLog: vi.fn(),
    onSalir: vi.fn(),
    onTerminar: vi.fn(),
    onCerrar: vi.fn(),
  })

  it('sin turno en marcha, ofrece sortear quién empieza', () => {
    render(<ModalMenuPartida juego={juegoDePrueba()} sonidoActivado onCambiarMonarca={() => {}} onCambiarIniciativa={() => {}} onCambiarDia={() => {}} onTogglePausa={() => {}} onToggleSonido={() => {}} onSortear={() => {}} onDado={() => {}} onVerLog={() => {}} onSalir={() => {}} onTerminar={() => {}} onCerrar={() => {}} />)
    expect(screen.getByText('¿Quién empieza?')).toBeInTheDocument()
  })

  it('cada acción llama a su callback', () => {
    const h = handlers()
    render(<ModalMenuPartida juego={juegoDePrueba()} sonidoActivado {...h} />)
    fireEvent.click(screen.getAllByText('Cambiar')[0])
    fireEvent.click(screen.getByText('Sortear'))
    fireEvent.click(screen.getByText('Tirar'))
    fireEvent.click(screen.getByText('Ver'))
    fireEvent.click(screen.getByText(/Salir sin terminar/))
    fireEvent.click(screen.getByText(/Terminar y registrar/))
    expect(h.onCambiarMonarca).toHaveBeenCalledOnce()
    expect(h.onSortear).toHaveBeenCalledOnce()
    expect(h.onDado).toHaveBeenCalledOnce()
    expect(h.onVerLog).toHaveBeenCalledOnce()
    expect(h.onSalir).toHaveBeenCalledOnce()
    expect(h.onTerminar).toHaveBeenCalledOnce()
  })

  it('la alarma muestra "Silenciar" cuando está activa, "Activar" si no', () => {
    const { rerender } = render(<ModalMenuPartida juego={juegoDePrueba()} sonidoActivado {...handlers()} />)
    expect(screen.getByText('Silenciar')).toBeInTheDocument()
    rerender(<ModalMenuPartida juego={juegoDePrueba()} sonidoActivado={false} {...handlers()} />)
    expect(screen.getByText('Activar')).toBeInTheDocument()
  })
})

describe('ModalElegirJugador', () => {
  it('lista a los jugadores y siempre añade la opción "Nadie"', () => {
    const onElegir = vi.fn()
    render(<ModalElegirJugador titulo="¿Quién es el monarca?" juego={juegoDePrueba()} onElegir={onElegir} onCerrar={() => {}} />)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Nadie')).toBeInTheDocument()
    fireEvent.click(screen.getAllByText('Elegir')[0])
    expect(onElegir).toHaveBeenCalledWith(0)
    fireEvent.click(screen.getAllByText('Elegir').at(-1) as Element)
    expect(onElegir).toHaveBeenCalledWith(null)
  })
})

describe('ModalVerLog', () => {
  it('muestra las líneas del historial', () => {
    render(<ModalVerLog juego={juegoDePrueba()} onCerrar={() => {}} />)
    expect(screen.getByText('Empieza la partida')).toBeInTheDocument()
  })

  it('sin nada que mostrar, avisa de que no ha pasado nada', () => {
    render(<ModalVerLog juego={{ ...juegoDePrueba(), log: [] }} onCerrar={() => {}} />)
    expect(screen.getByText('Todavía no ha pasado nada.')).toBeInTheDocument()
  })
})

describe('ModalTerminarPartida', () => {
  it('una partida en solitario solo se puede cerrar, no registrar', () => {
    const juego = { ...juegoDePrueba(), j: [juegoDePrueba().j[0]] }
    render(<ModalTerminarPartida juego={juego} onGanador={() => {}} onEmpate={() => {}} onSinRegistrar={() => {}} onSeguirJugando={() => {}} />)
    expect(screen.queryByText('Ganó')).toBeNull()
    expect(screen.getByText(/no entra en la clasificación/)).toBeInTheDocument()
  })

  it('elegir un ganador o un empate pasa la duración calculada', () => {
    const onGanador = vi.fn()
    const onEmpate = vi.fn()
    render(<ModalTerminarPartida juego={juegoDePrueba()} onGanador={onGanador} onEmpate={onEmpate} onSinRegistrar={() => {}} onSeguirJugando={() => {}} />)
    fireEvent.click(screen.getAllByText('Ganó')[0])
    expect(onGanador).toHaveBeenCalledWith(0, expect.any(Number))
    fireEvent.click(screen.getByText('Empate'))
    expect(onEmpate).toHaveBeenCalledWith(expect.any(Number))
  })

  it('el ganador sugerido se resalta como primario', () => {
    render(<ModalTerminarPartida juego={juegoDePrueba()} sugerido={1} onGanador={() => {}} onEmpate={() => {}} onSinRegistrar={() => {}} onSeguirJugando={() => {}} />)
    const botones = screen.getAllByText('Ganó')
    expect(botones[0]).not.toHaveClass('primary')
    expect(botones[1]).toHaveClass('primary')
  })

  it('terminar sin registrar y seguir jugando llaman a sus callbacks', () => {
    const onSinRegistrar = vi.fn()
    const onSeguirJugando = vi.fn()
    render(<ModalTerminarPartida juego={juegoDePrueba()} onGanador={() => {}} onEmpate={() => {}} onSinRegistrar={onSinRegistrar} onSeguirJugando={onSeguirJugando} />)
    fireEvent.click(screen.getByText('Terminar sin registrar'))
    fireEvent.click(screen.getByText('Seguir jugando'))
    expect(onSinRegistrar).toHaveBeenCalledOnce()
    expect(onSeguirJugando).toHaveBeenCalledOnce()
  })
})

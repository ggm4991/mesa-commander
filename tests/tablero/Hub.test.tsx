// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Hub } from '../../src/tablero/Hub'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego } from '../../src/motor/tipos'

function juegoDePrueba(): Juego {
  const t = 1_000_000_000
  return {
    id: 'x',
    inicio: new Date(t).toISOString(),
    cfg: { vida: 40, limite: 300, dispo: null },
    j: [nuevoJugador({ nombre: 'Ana' }, 40)],
    turno: 0,
    tIni: t,
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

describe('Hub', () => {
  it('pinta quién juega y el reloj', () => {
    const juego = juegoDePrueba()
    render(<Hub juego={juego} ahora={juego.tIni + 5000} onDeshacer={() => {}} onPausa={() => {}} onPasar={() => {}} onMenu={() => {}} />)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('0:05')).toBeInTheDocument()
  })

  it('deshacer, pausa, pasar y menú llaman a sus callbacks', () => {
    const juego = juegoDePrueba()
    const onDeshacer = vi.fn()
    const onPausa = vi.fn()
    const onPasar = vi.fn()
    const onMenu = vi.fn()
    render(<Hub juego={juego} ahora={juego.tIni} onDeshacer={onDeshacer} onPausa={onPausa} onPasar={onPasar} onMenu={onMenu} />)
    fireEvent.click(screen.getByLabelText('Deshacer lo último apuntado'))
    fireEvent.click(screen.getByLabelText('Parar o reanudar el tiempo'))
    fireEvent.click(screen.getByLabelText('Pasar turno'))
    fireEvent.click(screen.getByLabelText('Menú de la partida'))
    expect(onDeshacer).toHaveBeenCalledOnce()
    expect(onPausa).toHaveBeenCalledOnce()
    expect(onPasar).toHaveBeenCalledOnce()
    expect(onMenu).toHaveBeenCalledOnce()
  })

  it('en pausa, el botón de pausa cambia a "reanudar"', () => {
    const juego = { ...juegoDePrueba(), pausado: true }
    render(<Hub juego={juego} ahora={juego.tIni} onDeshacer={() => {}} onPausa={() => {}} onPasar={() => {}} onMenu={() => {}} />)
    expect(screen.getByLabelText('Parar o reanudar el tiempo')).toHaveAttribute('title', 'Reanudar el tiempo')
  })

  it('pasado el límite, el botón de pasar turno se marca como "over"', () => {
    const juego = juegoDePrueba()
    render(<Hub juego={juego} ahora={juego.tIni + 320_000} onDeshacer={() => {}} onPausa={() => {}} onPasar={() => {}} onMenu={() => {}} />)
    expect(screen.getByLabelText('Pasar turno')).toHaveClass('over')
  })

  it('el reloj gira según la rotación de quien tiene el turno, para que lo pueda leer sin girar el móvil', () => {
    const juego = juegoDePrueba()
    render(
      <Hub juego={juego} ahora={juego.tIni} rotacionTurno={180} onDeshacer={() => {}} onPausa={() => {}} onPasar={() => {}} onMenu={() => {}} />,
    )
    expect(screen.getByLabelText('Pasar turno')).toHaveAttribute('data-rot', '180')
  })

  it('sin rotación indicada, el reloj se queda como está', () => {
    const juego = juegoDePrueba()
    render(<Hub juego={juego} ahora={juego.tIni} onDeshacer={() => {}} onPausa={() => {}} onPasar={() => {}} onMenu={() => {}} />)
    expect(screen.getByLabelText('Pasar turno')).toHaveAttribute('data-rot', '0')
  })
})

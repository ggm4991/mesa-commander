// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModalPanelDano } from '../../src/tablero/ModalPanelDano'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego } from '../../src/motor/tipos'

function juegoDePrueba(): Juego {
  const ana = nuevoJugador({ nombre: 'Ana', comandante: 'Thrasios, Triton Hero', comandante2: 'Kydele, Chosen of Kruphix' }, 40)
  const beto = nuevoJugador({ nombre: 'Beto', comandante: 'Krenko, Mob Boss' }, 40)
  beto.dmg = { '0:0': 21, '1:0': 3 }
  return {
    id: 'x',
    inicio: new Date().toISOString(),
    cfg: { vida: 40, limite: 0, dispo: null },
    j: [ana, beto],
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

describe('ModalPanelDano', () => {
  it('separa los comandantes ajenos de "su propio comandante"', () => {
    render(<ModalPanelDano juego={juegoDePrueba()} indice={1} onCambiar={() => {}} onCerrar={() => {}} />)
    expect(screen.getByText('Su propio comandante')).toBeInTheDocument()
    expect(screen.getByText('Krenko, Mob Boss')).toBeInTheDocument()
  })

  it('marca como letal el daño que llega a 21', () => {
    render(<ModalPanelDano juego={juegoDePrueba()} indice={1} onCambiar={() => {}} onCerrar={() => {}} />)
    expect(screen.getByText('21')).toHaveClass('letal')
    expect(screen.getByText('3')).not.toHaveClass('letal')
  })

  it('los botones +/- llaman a onCambiar con la clave del comandante', () => {
    const onCambiar = vi.fn()
    render(<ModalPanelDano juego={juegoDePrueba()} indice={1} onCambiar={onCambiar} onCerrar={() => {}} />)
    fireEvent.click(screen.getAllByText('+')[0])
    expect(onCambiar).toHaveBeenCalledWith('0:0', 1)
  })
})

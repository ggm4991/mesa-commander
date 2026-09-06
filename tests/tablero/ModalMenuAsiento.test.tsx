// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModalMenuAsiento } from '../../src/tablero/ModalMenuAsiento'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego, Perfil } from '../../src/motor/tipos'

function juegoDePrueba(): Juego {
  return {
    id: 'x',
    inicio: new Date().toISOString(),
    cfg: { vida: 40, limite: 0, dispo: null },
    j: [nuevoJugador({ nombre: 'Ana', comandante: 'X', colores: 'R' }, 40)],
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

const handlers = () => ({
  onContador: vi.fn(),
  onMana: vi.fn(),
  onRehacer: vi.fn(),
  onFuera: vi.fn(),
  onBendicion: vi.fn(),
  onMarcarFuera: vi.fn(),
  onEditar: vi.fn(),
  onCerrar: vi.fn(),
})

function perfilDePrueba(): Perfil {
  return {
    id: 'p1',
    nombre: 'Ana',
    ultimo: 'm1',
    mazos: [{ id: 'm1', c: 'Krenko, Mob Boss', c2: '', col: 'R', imagenId: 'krenko-id', imagenId2: '' }],
  }
}

describe('ModalMenuAsiento', () => {
  it('el título es el nombre del jugador', () => {
    render(<ModalMenuAsiento juego={juegoDePrueba()} indice={0} perfiles={[]} {...handlers()} />)
    expect(screen.getByRole('dialog', { name: 'Ana' })).toBeInTheDocument()
  })

  it('los pasos de un contador llaman a onContador con su clave y su paso', () => {
    const h = handlers()
    render(<ModalMenuAsiento juego={juegoDePrueba()} indice={0} perfiles={[]} {...h} />)
    // Impuesto de comandante tiene paso 2
    const fila = screen.getByText('Impuesto de comandante').closest('.line') as HTMLElement
    fireEvent.click(fila.querySelector('.stepper button:last-child') as Element)
    expect(h.onContador).toHaveBeenCalledWith('tax', 2)
  })

  it('el maná se ajusta eligiendo un color y usando +/-, y "Vaciar todo" limpia todos los colores', () => {
    const h = handlers()
    render(<ModalMenuAsiento juego={juegoDePrueba()} indice={0} perfiles={[]} {...h} />)
    // U por defecto está sin elegir: el selector empieza en W
    fireEvent.click(screen.getByTitle('Maná U'))
    const fila = screen.getByText('Maná U').closest('.line') as HTMLElement
    fireEvent.click(fila.querySelector('.stepper button:last-child') as Element)
    expect(h.onMana).toHaveBeenCalledWith('U', 1)
    fireEvent.click(fila.querySelector('.stepper button:first-child') as Element)
    expect(h.onMana).toHaveBeenCalledWith('U', -1)

    fireEvent.click(screen.getByText('Vaciar todo'))
    expect(h.onMana).toHaveBeenCalledWith(null)
  })

  it('dar/quitar la bendición cambia el texto del botón según el estado', () => {
    const h = handlers()
    const { rerender } = render(<ModalMenuAsiento juego={juegoDePrueba()} indice={0} perfiles={[]} {...h} />)
    fireEvent.click(screen.getByText('Dar'))
    expect(h.onBendicion).toHaveBeenCalledOnce()

    const juegoConBendicion = { ...juegoDePrueba(), j: [{ ...juegoDePrueba().j[0], bendicion: true }] }
    rerender(<ModalMenuAsiento juego={juegoConBendicion} indice={0} perfiles={[]} {...h} />)
    expect(screen.getByText('Quitar')).toBeInTheDocument()
  })

  it('marcar como fuera cierra el modal', () => {
    const h = handlers()
    render(<ModalMenuAsiento juego={juegoDePrueba()} indice={0} perfiles={[]} {...h} />)
    fireEvent.click(screen.getByText('Marcar como fuera'))
    expect(h.onMarcarFuera).toHaveBeenCalledOnce()
  })

  it('cambiar de mazo abre un paso interno con los datos actuales, y guardar los envía', () => {
    const h = handlers()
    render(<ModalMenuAsiento juego={juegoDePrueba()} indice={0} perfiles={[]} {...h} />)
    fireEvent.click(screen.getByText('Cambiar de mazo'))
    expect(screen.getByRole('dialog', { name: 'Cambiar de mazo' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')

    fireEvent.change(screen.getByLabelText('Comandante'), { target: { value: 'Y' } })
    fireEvent.click(screen.getByText('Guardar'))
    expect(h.onEditar).toHaveBeenCalledWith({ n: 'Ana', c: 'Y', c2: '', col: 'R', imagenId: '', imagenId2: '' })
  })

  it('elegir uno de los mazos guardados del perfil rellena comandante, colores e imagen', () => {
    const h = handlers()
    render(<ModalMenuAsiento juego={juegoDePrueba()} indice={0} perfiles={[perfilDePrueba()]} {...h} />)
    fireEvent.click(screen.getByText('Cambiar de mazo'))

    fireEvent.click(screen.getByText('Usar'))
    fireEvent.click(screen.getByText('Guardar'))
    expect(h.onEditar).toHaveBeenCalledWith({
      n: 'Ana',
      c: 'Krenko, Mob Boss',
      c2: '',
      col: 'R',
      imagenId: 'krenko-id',
      imagenId2: '',
    })
  })
})

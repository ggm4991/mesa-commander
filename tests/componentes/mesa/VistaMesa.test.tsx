// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { VistaMesa } from '../../../src/componentes/mesa/VistaMesa'
import type { Dispo } from '../../../src/componentes/mesa/disposiciones'
import type { Asiento } from '../../../src/motor/tipos'

const dispo: Dispo = { id: '2a', n: 'Cara a cara', cols: '1fr', rows: '1fr 1fr', rot: [180, 0] }

describe('VistaMesa', () => {
  it('pinta un asiento libre y uno ocupado', () => {
    const mesa: (Asiento | null)[] = [null, { nombre: 'Ana', comandante: 'X', comandante2: '', colores: 'R' }]
    render(<VistaMesa mesa={mesa} dispo={dispo} inicia={null} onElegirAsiento={() => {}} onGirarAsiento={() => {}} />)
    expect(screen.getByText('Asiento libre')).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
  })

  it('marca con la insignia de "Empieza" solo al asiento sorteado', () => {
    const mesa: (Asiento | null)[] = [
      { nombre: 'Ana', comandante: '', comandante2: '', colores: '' },
      { nombre: 'Beto', comandante: '', comandante2: '', colores: '' },
    ]
    render(<VistaMesa mesa={mesa} dispo={dispo} inicia={1} onElegirAsiento={() => {}} onGirarAsiento={() => {}} />)
    expect(screen.getAllByText('Empieza')).toHaveLength(1)
  })

  it('tocar un asiento llama a onElegirAsiento con su índice', () => {
    const onElegirAsiento = vi.fn()
    render(
      <VistaMesa mesa={[null, null]} dispo={dispo} inicia={null} onElegirAsiento={onElegirAsiento} onGirarAsiento={() => {}} />,
    )
    fireEvent.click(screen.getAllByRole('button', { name: /Asiento/ })[1])
    expect(onElegirAsiento).toHaveBeenCalledWith(1)
  })

  it('girar un asiento no elige el asiento a la vez (stopPropagation)', () => {
    const onElegirAsiento = vi.fn()
    const onGirarAsiento = vi.fn()
    render(
      <VistaMesa mesa={[null]} dispo={{ ...dispo, rot: [0] }} inicia={null} onElegirAsiento={onElegirAsiento} onGirarAsiento={onGirarAsiento} />,
    )
    fireEvent.click(screen.getByTitle('Girar este asiento'))
    expect(onGirarAsiento).toHaveBeenCalledWith(0)
    expect(onElegirAsiento).not.toHaveBeenCalled()
  })

  it('Enter y espacio también eligen el asiento (es un div[role=button], no un <button>)', () => {
    const onElegirAsiento = vi.fn()
    render(
      <VistaMesa mesa={[null]} dispo={{ ...dispo, rot: [0] }} inicia={null} onElegirAsiento={onElegirAsiento} onGirarAsiento={() => {}} />,
    )
    const asiento = screen.getByRole('button', { name: /Asiento 1/ })
    fireEvent.keyDown(asiento, { key: 'Enter' })
    fireEvent.keyDown(asiento, { key: ' ' })
    expect(onElegirAsiento).toHaveBeenCalledTimes(2)
  })

  it('el centro del móvil solo aparece si la disposición lo define', () => {
    const conCentro: Dispo = { ...dispo, centro: '2/2/3/3' }
    render(<VistaMesa mesa={[null, null]} dispo={conCentro} inicia={null} onElegirAsiento={() => {}} onGirarAsiento={() => {}} />)
    expect(screen.getByText('El móvil va aquí')).toBeInTheDocument()
  })
})

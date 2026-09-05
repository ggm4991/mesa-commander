// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModalElegirAsiento } from '../../../src/componentes/mesa/ModalElegirAsiento'
import type { Perfil } from '../../../src/motor/tipos'

const perfil: Perfil = {
  id: 'p1',
  nombre: 'Iván',
  ultimo: 'm1',
  mazos: [
    { id: 'm1', c: 'Krenko, Mob Boss', c2: '', col: 'R' },
    { id: 'm2', c: 'Meren of Clan Nel Toth', c2: '', col: 'BG' },
  ],
}

function montar(props: Partial<Parameters<typeof ModalElegirAsiento>[0]> = {}) {
  const handlers = {
    onSentarConPerfil: vi.fn(),
    onVaciar: vi.fn(),
    onCrearPerfil: vi.fn(),
    onUsarNombre: vi.fn(),
    avisoSinNombre: vi.fn(),
    onCerrar: vi.fn(),
  }
  render(
    <ModalElegirAsiento
      indice={0}
      perfiles={[perfil]}
      ocupado={false}
      {...handlers}
      {...props}
    />,
  )
  return handlers
}

describe('ModalElegirAsiento', () => {
  it('sentar con "Sentar" usa el último mazo del perfil', () => {
    const { onSentarConPerfil } = montar()
    fireEvent.click(screen.getByText('Sentar'))
    expect(onSentarConPerfil).toHaveBeenCalledWith(perfil, perfil.mazos[0])
  })

  it('con más de un mazo, ofrece el desplegable para elegir otro', () => {
    const { onSentarConPerfil } = montar()
    fireEvent.click(screen.getByText('Elegir otro de sus 2 mazos'))
    fireEvent.click(screen.getByText('Meren of Clan Nel Toth'))
    expect(onSentarConPerfil).toHaveBeenCalledWith(perfil, perfil.mazos[1])
  })

  it('"Dejar libre" solo aparece si el asiento está ocupado', () => {
    montar({ ocupado: false })
    expect(screen.queryByText('Dejar libre')).toBeNull()
  })

  it('"Dejar libre" aparece y funciona si el asiento está ocupado', () => {
    const { onVaciar } = montar({ ocupado: true })
    fireEvent.click(screen.getByText('Dejar libre'))
    expect(onVaciar).toHaveBeenCalledOnce()
  })

  it('un nombre vacío avisa en vez de sentar a nadie', () => {
    const { onUsarNombre, avisoSinNombre } = montar()
    fireEvent.click(screen.getByText('Usar este nombre'))
    expect(avisoSinNombre).toHaveBeenCalledOnce()
    expect(onUsarNombre).not.toHaveBeenCalled()
  })

  it('escribiendo un nombre y confirmando, lo usa', () => {
    const { onUsarNombre } = montar()
    fireEvent.change(screen.getByPlaceholderText('Invitado'), { target: { value: 'Invitado 1' } })
    fireEvent.click(screen.getByText('Usar este nombre'))
    expect(onUsarNombre).toHaveBeenCalledWith('Invitado 1')
  })
})

// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModalGestionarPerfiles } from '../../../src/componentes/mesa/ModalGestionarPerfiles'
import type { Perfil } from '../../../src/motor/tipos'

describe('ModalGestionarPerfiles', () => {
  it('sin perfiles, invita a crear el primero', () => {
    render(<ModalGestionarPerfiles perfiles={[]} onEditar={() => {}} onCrear={() => {}} onCerrar={() => {}} />)
    expect(screen.getByText(/Aún no hay perfiles/)).toBeInTheDocument()
  })

  it('lista cada perfil con su número de mazos', () => {
    const perfiles: Perfil[] = [
      { id: 'p1', nombre: 'Gonzalo', ultimo: 'm1', mazos: [{ id: 'm1', c: 'Edgar Markov', c2: '', col: 'WBR' }] },
      { id: 'p2', nombre: 'Marta', ultimo: null, mazos: [] },
    ]
    render(<ModalGestionarPerfiles perfiles={perfiles} onEditar={() => {}} onCrear={() => {}} onCerrar={() => {}} />)
    expect(screen.getByText('Gonzalo')).toBeInTheDocument()
    expect(screen.getByText(/1 mazo · Edgar Markov/)).toBeInTheDocument()
    expect(screen.getByText('Marta')).toBeInTheDocument()
    expect(screen.getByText('Sin mazos')).toBeInTheDocument()
  })

  it('editar llama a onEditar con el id del perfil', () => {
    const onEditar = vi.fn()
    const perfiles: Perfil[] = [{ id: 'p1', nombre: 'Gonzalo', ultimo: null, mazos: [] }]
    render(<ModalGestionarPerfiles perfiles={perfiles} onEditar={onEditar} onCrear={() => {}} onCerrar={() => {}} />)
    fireEvent.click(screen.getByText('Editar'))
    expect(onEditar).toHaveBeenCalledWith('p1')
  })
})

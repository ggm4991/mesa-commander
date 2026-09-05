// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EditorPerfil } from '../../../src/componentes/mesa/EditorPerfil'
import type { Perfil } from '../../../src/motor/tipos'

describe('EditorPerfil', () => {
  it('exige un nombre', () => {
    const onGuardar = vi.fn()
    render(<EditorPerfil perfil={null} onGuardar={onGuardar} onCerrar={() => {}} />)
    fireEvent.click(screen.getByText('Guardar perfil'))
    expect(screen.getByText('El perfil necesita un nombre.')).toBeInTheDocument()
    expect(onGuardar).not.toHaveBeenCalled()
  })

  it('un perfil nuevo sin mazos avisa de que no tiene ninguno', () => {
    render(<EditorPerfil perfil={null} onGuardar={() => {}} onCerrar={() => {}} />)
    expect(screen.getByText('Sin mazos todavía. Añade el primero y quedará guardado.')).toBeInTheDocument()
  })

  it('añadir un mazo lo deja marcado como el último usado', () => {
    const onGuardar = vi.fn()
    render(<EditorPerfil perfil={null} onGuardar={onGuardar} onCerrar={() => {}} />)
    fireEvent.change(screen.getByLabelText('Nombre del jugador'), { target: { value: 'Gonzalo' } })
    fireEvent.click(screen.getByText('Añadir mazo'))
    fireEvent.change(screen.getByLabelText('Comandante'), { target: { value: 'Edgar Markov' } })
    fireEvent.click(screen.getByText('Guardar mazo'))

    expect(screen.getByText('Edgar Markov')).toBeInTheDocument()
    expect(screen.getByText('El último que usó')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Guardar perfil'))
    expect(onGuardar).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Gonzalo', mazos: [expect.objectContaining({ c: 'Edgar Markov' })] }),
    )
  })

  it('editar un perfil existente ofrece eliminarlo, y no lo hace un perfil nuevo', () => {
    const perfil: Perfil = { id: 'p1', nombre: 'Ana', ultimo: null, mazos: [] }
    const onEliminar = vi.fn()
    const { rerender } = render(
      <EditorPerfil perfil={perfil} onGuardar={() => {}} onEliminar={onEliminar} onCerrar={() => {}} />,
    )
    fireEvent.click(screen.getByText('Eliminar perfil'))
    expect(onEliminar).toHaveBeenCalledOnce()

    rerender(<EditorPerfil perfil={null} onGuardar={() => {}} onCerrar={() => {}} />)
    expect(screen.queryByText('Eliminar perfil')).toBeNull()
  })

  it('borrar un mazo lo quita de la lista', () => {
    const perfil: Perfil = {
      id: 'p1',
      nombre: 'Ana',
      ultimo: 'm1',
      mazos: [{ id: 'm1', c: 'Krenko, Mob Boss', c2: '', col: 'R' }],
    }
    const onGuardar = vi.fn()
    render(<EditorPerfil perfil={perfil} onGuardar={onGuardar} onCerrar={() => {}} />)
    // el primer botón "small danger" es el de borrar el mazo (el de editar es "small" sin danger)
    fireEvent.click(document.querySelector('.btn.small.danger') as Element)
    fireEvent.click(screen.getByText('Guardar perfil'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ mazos: [] }))
  })
})

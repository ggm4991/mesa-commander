// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EditorMazo } from '../../../src/componentes/mesa/EditorMazo'

describe('EditorMazo', () => {
  it('exige al menos el comandante principal', () => {
    const onGuardar = vi.fn()
    render(<EditorMazo mazo={null} onGuardar={onGuardar} onCancelar={() => {}} />)
    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(screen.getByText('Escribe al menos el comandante principal.')).toBeInTheDocument()
    expect(onGuardar).not.toHaveBeenCalled()
  })

  it('guarda comandante, compañero y colores, recortando espacios', () => {
    const onGuardar = vi.fn()
    render(<EditorMazo mazo={null} onGuardar={onGuardar} onCancelar={() => {}} />)
    fireEvent.change(screen.getByLabelText('Comandante'), { target: { value: '  Edgar Markov  ' } })
    fireEvent.click(screen.getByLabelText('Color W'))
    fireEvent.click(screen.getByLabelText('Color B'))
    fireEvent.click(screen.getByLabelText('Color R'))
    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ c: 'Edgar Markov', c2: '', col: 'WBR' }))
  })

  it('un color se puede quitar volviendo a pulsarlo', () => {
    const onGuardar = vi.fn()
    render(<EditorMazo mazo={null} onGuardar={onGuardar} onCancelar={() => {}} />)
    fireEvent.change(screen.getByLabelText('Comandante'), { target: { value: 'X' } })
    fireEvent.click(screen.getByLabelText('Color U'))
    fireEvent.click(screen.getByLabelText('Color U'))
    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ col: '' }))
  })

  it('editar un mazo existente parte de sus valores', () => {
    render(
      <EditorMazo
        mazo={{ id: 'm1', c: 'Krenko, Mob Boss', c2: '', col: 'R' }}
        onGuardar={() => {}}
        onCancelar={() => {}}
      />,
    )
    expect(screen.getByLabelText('Comandante')).toHaveValue('Krenko, Mob Boss')
    expect(screen.getByLabelText('Color R')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Editar mazo')).toBeInTheDocument()
  })

  it('cancelar no guarda nada', () => {
    const onCancelar = vi.fn()
    render(<EditorMazo mazo={null} onGuardar={() => {}} onCancelar={onCancelar} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancelar).toHaveBeenCalledOnce()
  })
})

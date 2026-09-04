// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from '../../src/componentes/comunes/Modal'

describe('Modal', () => {
  it('muestra el título y el contenido', () => {
    render(
      <Modal titulo="Editar perfil" onCerrar={() => {}}>
        Cuerpo
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Editar perfil' })).toBeInTheDocument()
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
  })

  it('cierra al pulsar la X', () => {
    const onCerrar = vi.fn()
    render(
      <Modal titulo="X" onCerrar={onCerrar}>
        x
      </Modal>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onCerrar).toHaveBeenCalledOnce()
  })

  it('cierra con Escape', () => {
    const onCerrar = vi.fn()
    render(
      <Modal titulo="X" onCerrar={onCerrar}>
        x
      </Modal>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCerrar).toHaveBeenCalledOnce()
  })

  it('cierra al pulsar fuera del cuadro, no al pulsar dentro', () => {
    const onCerrar = vi.fn()
    render(
      <Modal titulo="X" onCerrar={onCerrar}>
        Contenido
      </Modal>,
    )
    fireEvent.mouseDown(screen.getByText('Contenido'))
    expect(onCerrar).not.toHaveBeenCalled()

    fireEvent.mouseDown(screen.getByRole('dialog').parentElement as Element)
    expect(onCerrar).toHaveBeenCalledOnce()
  })

  it('el pie solo aparece si se pasa', () => {
    const { rerender } = render(
      <Modal titulo="X" onCerrar={() => {}}>
        x
      </Modal>,
    )
    expect(document.querySelector('.modal-foot')).toBeNull()

    rerender(
      <Modal titulo="X" onCerrar={() => {}} pie={<button type="button">Guardar</button>}>
        x
      </Modal>,
    )
    expect(document.querySelector('.modal-foot')).not.toBeNull()
  })
})

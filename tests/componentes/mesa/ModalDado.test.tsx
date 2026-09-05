// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModalDado } from '../../../src/componentes/mesa/ModalDado'

describe('ModalDado', () => {
  it('arranca sin tirar', () => {
    render(<ModalDado onCerrar={() => {}} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('un d6 da un número del 1 al 6', () => {
    render(<ModalDado onCerrar={() => {}} />)
    fireEvent.click(screen.getByText('d6'))
    const valor = Number(screen.getByText(/^\d+$/).textContent)
    expect(valor).toBeGreaterThanOrEqual(1)
    expect(valor).toBeLessThanOrEqual(6)
  })

  it('una moneda da Cara o Cruz', () => {
    render(<ModalDado onCerrar={() => {}} />)
    fireEvent.click(screen.getByText('Moneda'))
    expect(['Cara', 'Cruz']).toContain(screen.getByText(/^(Cara|Cruz)$/).textContent)
  })

  it('cerrar llama a onCerrar', () => {
    const onCerrar = vi.fn()
    render(<ModalDado onCerrar={onCerrar} />)
    fireEvent.click(screen.getByText('Cerrar'))
    expect(onCerrar).toHaveBeenCalledOnce()
  })
})

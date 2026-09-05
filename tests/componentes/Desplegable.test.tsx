// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Desplegable } from '../../src/componentes/comunes/Desplegable'

const opciones = [
  { valor: 'p1::m1', titulo: 'Krenko, Mob Boss', buscar: 'Krenko, Mob Boss Iván', marca: 'último' },
  { valor: 'p1::m2', titulo: 'Meren of Clan Nel Toth', buscar: 'Meren of Clan Nel Toth Iván' },
  { valor: 'p1::m3', titulo: 'Thrasios + Kydele', buscar: 'Thrasios Kydele Iván' },
]

describe('Desplegable', () => {
  it('arranca plegado', () => {
    render(<Desplegable titulo="Elegir otro de sus 3 mazos" marcador="Buscar" opciones={opciones} onElegir={() => {}} />)
    expect(screen.queryByPlaceholderText('Buscar')).toBeNull()
  })

  it('al abrirlo, muestra las 3 opciones y marca la última usada', () => {
    render(<Desplegable titulo="Elegir otro de sus 3 mazos" marcador="Buscar" opciones={opciones} onElegir={() => {}} />)
    fireEvent.click(screen.getByText('Elegir otro de sus 3 mazos'))
    expect(document.querySelectorAll('.dd-op')).toHaveLength(3)
    expect(screen.getByText('último')).toBeInTheDocument()
  })

  it('el buscador filtra por el texto de búsqueda de cada opción', () => {
    render(<Desplegable titulo="Elegir mazo" marcador="Buscar mazo" opciones={opciones} onElegir={() => {}} />)
    fireEvent.click(screen.getByText('Elegir mazo'))
    fireEvent.change(screen.getByPlaceholderText('Buscar mazo'), { target: { value: 'meren' } })
    expect(document.querySelectorAll('.dd-op')).toHaveLength(1)
    expect(screen.getByText('Meren of Clan Nel Toth')).toBeInTheDocument()
  })

  it('sin coincidencias, avisa de que no hay nada', () => {
    render(<Desplegable titulo="Elegir mazo" marcador="Buscar mazo" opciones={opciones} onElegir={() => {}} />)
    fireEvent.click(screen.getByText('Elegir mazo'))
    fireEvent.change(screen.getByPlaceholderText('Buscar mazo'), { target: { value: 'nada-coincide' } })
    expect(screen.getByText('Nada coincide con la búsqueda.')).toBeInTheDocument()
  })

  it('elegir una opción llama a onElegir con su valor', () => {
    const onElegir = vi.fn()
    render(<Desplegable titulo="Elegir mazo" marcador="Buscar mazo" opciones={opciones} onElegir={onElegir} />)
    fireEvent.click(screen.getByText('Elegir mazo'))
    fireEvent.click(screen.getByText('Meren of Clan Nel Toth'))
    expect(onElegir).toHaveBeenCalledWith('p1::m2')
  })
})

// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { crearAlmacenMemoria } from '../../src/almacenamiento/adaptadorMemoria'
import { AlmacenContexto } from '../../src/contextos/AlmacenContexto'
import { AvisoProvider } from '../../src/componentes/comunes/AvisoProvider'
import { Previa } from '../../src/paginas/Previa'
import type { Juego } from '../../src/motor/tipos'

function renderPrevia(onIrAlTablero = vi.fn()) {
  const almacen = crearAlmacenMemoria()
  render(
    <AlmacenContexto.Provider value={almacen}>
      <AvisoProvider>
        <Previa onIrAlTablero={onIrAlTablero} />
      </AvisoProvider>
    </AlmacenContexto.Provider>,
  )
  return { almacen, onIrAlTablero }
}

async function esperarCarga() {
  // deja que se resuelvan los `leer*` async del montaje inicial (perfiles, config,
  // juego) y el efecto de siembra que depende de ellos; un macrotask basta porque
  // vacía toda la cola de microtasks pendientes antes de seguir.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

describe('Previa', () => {
  it('arranca con 4 asientos vacíos', async () => {
    renderPrevia()
    await esperarCarga()
    expect(screen.getAllByText('Asiento libre')).toHaveLength(4)
  })

  it('cambiar el número de jugadores cambia el número de asientos', async () => {
    renderPrevia()
    await esperarCarga()
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getAllByText('Asiento libre')).toHaveLength(2)
  })

  it('con todos los asientos vacíos, avisa de que hace falta sentar a alguien', async () => {
    const { onIrAlTablero } = renderPrevia()
    await esperarCarga()
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByText('Empezar partida'))
    expect(await screen.findByText('Sienta al menos a un jugador')).toBeInTheDocument()
    expect(onIrAlTablero).not.toHaveBeenCalled()
  })

  it('con algún asiento libre y otro ocupado, avisa en vez de arrancar', async () => {
    const { onIrAlTablero } = renderPrevia()
    await esperarCarga()
    fireEvent.click(screen.getByRole('button', { name: '2' }))

    fireEvent.click(screen.getAllByText('Asiento libre')[0])
    fireEvent.change(screen.getByPlaceholderText('Invitado'), { target: { value: 'Gonzalo' } })
    fireEvent.click(screen.getByText('Usar este nombre'))

    fireEvent.click(screen.getByText('Empezar partida'))
    expect(await screen.findByText('Hay asientos libres. Quítalos o siéntate a alguien.')).toBeInTheDocument()
    expect(onIrAlTablero).not.toHaveBeenCalled()
  })

  it('sentando a alguien con un nombre suelto y empezando, arranca la partida', async () => {
    const { onIrAlTablero } = renderPrevia()
    await esperarCarga()
    fireEvent.click(screen.getByRole('button', { name: '1' }))

    fireEvent.click(screen.getByText('Asiento libre'))
    fireEvent.change(screen.getByPlaceholderText('Invitado'), { target: { value: 'Gonzalo' } })
    fireEvent.click(screen.getByText('Usar este nombre'))

    fireEvent.click(screen.getByText('Empezar partida'))
    await esperarCarga() // "Empezar partida" guarda la partida antes de avisar al padre

    expect(onIrAlTablero).toHaveBeenCalledOnce()
    const juego = onIrAlTablero.mock.calls[0][0] as Juego
    expect(juego.j).toHaveLength(1)
    expect(juego.j[0].n).toBe('Gonzalo')
    expect(juego.cfg.vida).toBe(40)
  })

  it('elegir otra vida inicial la marca como activa', async () => {
    renderPrevia()
    await esperarCarga()
    fireEvent.click(screen.getByRole('button', { name: '20' }))
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByRole('button', { name: '20' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '40' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('barajar reinicia quién empieza', async () => {
    renderPrevia()
    await esperarCarga()
    fireEvent.click(screen.getByText(/Barajar los asientos/))
    expect(await screen.findByText('Asientos barajados')).toBeInTheDocument()
  })

  it('sortear quién empieza, sin nadie sentado, avisa en vez de sortear', async () => {
    renderPrevia()
    await esperarCarga()
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByText(/Sortear quién empieza/))
    expect(await screen.findByText('Primero coloca a alguien en la mesa')).toBeInTheDocument()
  })

  it('crear un perfil desde "Perfiles" lo añade a la lista', async () => {
    renderPrevia()
    await esperarCarga()
    fireEvent.click(screen.getByText(/Perfiles \(0\)/))
    fireEvent.click(screen.getByText('Crear perfil'))
    fireEvent.change(screen.getByLabelText('Nombre del jugador'), { target: { value: 'Lucía' } })
    fireEvent.click(screen.getByText('Guardar perfil'))

    expect(await screen.findByText('Perfil guardado')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Perfiles \(1\)/))
    expect(screen.getByText('Lucía')).toBeInTheDocument()
  })
})

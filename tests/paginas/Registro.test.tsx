// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { crearAlmacenMemoria } from '../../src/almacenamiento/adaptadorMemoria'
import { guardarPartidas } from '../../src/almacenamiento/repositorio'
import { AlmacenContexto } from '../../src/contextos/AlmacenContexto'
import { AvisoProvider } from '../../src/componentes/comunes/AvisoProvider'
import { Registro } from '../../src/paginas/Registro'
import type { Partida } from '../../src/motor/tipos'

function partidaDePrueba(over: Partial<Partida> = {}): Partida {
  return {
    id: 'g1',
    fecha: '2026-08-01',
    duracion: 100,
    seats: [
      { j: 'Ana', c: 'Edgar Markov', c2: '', id: 'WBR', r: 'V', rehacer: 1, tiempo: 0, turno: 245 },
      { j: 'Beto', c: 'Krenko, Mob Boss', c2: '', id: 'R', r: 'D', rehacer: 0, tiempo: 1, turno: 120 },
    ],
    ...over,
  }
}

async function renderRegistro(partidas: Partida[] = []) {
  const almacen = crearAlmacenMemoria()
  if (partidas.length) await guardarPartidas(almacen, partidas)
  render(
    <AlmacenContexto.Provider value={almacen}>
      <AvisoProvider>
        <Registro />
      </AvisoProvider>
    </AlmacenContexto.Provider>,
  )
  await esperarCarga()
  return { almacen }
}

async function esperarCarga() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

describe('Registro — clasificación', () => {
  it('sin partidas, muestra el mensaje de clasificación vacía', async () => {
    await renderRegistro()
    expect(screen.getByText('Aún no hay partidas')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay ninguna partida registrada.')).toBeInTheDocument()
  })

  it('con partidas, calcula puntos y balance por jugador', async () => {
    await renderRegistro([partidaDePrueba()])
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Beto')).toBeInTheDocument()
    const fila = screen.getByText('Ana').closest('tr') as HTMLElement
    expect(within(fila).getByText('3')).toBeInTheDocument() // 3 puntos por la victoria
  })

  it('pulsar un jugador abre su ficha con sus partidas', async () => {
    await renderRegistro([partidaDePrueba()])
    fireEvent.click(screen.getByText('Ana'))
    expect(screen.getByRole('heading', { name: 'Ana' })).toBeInTheDocument()
    expect(screen.getByText(/1 de 1 partidas/)).toBeInTheDocument()
  })
})

describe('Registro — alta manual', () => {
  it('añadir una partida a mano la registra y aparece en la clasificación', async () => {
    await renderRegistro()
    fireEvent.click(screen.getByText('Añadir partida a mano'))

    // el formulario arranca con 4 asientos; se quitan dos para dejar la mínima mesa
    fireEvent.click(screen.getAllByText('Quitar de la mesa')[0])
    fireEvent.click(screen.getAllByText('Quitar de la mesa')[0])

    const jugadores = screen.getAllByPlaceholderText('Nombre')
    const comandantes = screen.getAllByPlaceholderText('Nombre en inglés')
    fireEvent.change(jugadores[0], { target: { value: 'Ana' } })
    fireEvent.change(comandantes[0], { target: { value: 'Edgar Markov' } })
    fireEvent.change(jugadores[1], { target: { value: 'Beto' } })
    fireEvent.change(comandantes[1], { target: { value: 'Krenko, Mob Boss' } })
    fireEvent.change(document.querySelectorAll('select')[0], { target: { value: 'V' } })

    fireEvent.click(screen.getByText('Registrar partida'))

    expect(await screen.findByText('Partida registrada')).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('1 partida registrada', { exact: false })).toBeInTheDocument()
  })

  it('una partida sin ganador ni empate no se puede guardar', async () => {
    await renderRegistro()
    fireEvent.click(screen.getByText('Añadir partida a mano'))
    fireEvent.click(screen.getAllByText('Quitar de la mesa')[0])
    fireEvent.click(screen.getAllByText('Quitar de la mesa')[0])
    const jugadores = screen.getAllByPlaceholderText('Nombre')
    const comandantes = screen.getAllByPlaceholderText('Nombre en inglés')
    fireEvent.change(jugadores[0], { target: { value: 'Ana' } })
    fireEvent.change(comandantes[0], { target: { value: 'Edgar Markov' } })
    fireEvent.change(jugadores[1], { target: { value: 'Beto' } })
    fireEvent.change(comandantes[1], { target: { value: 'Krenko, Mob Boss' } })

    fireEvent.click(screen.getByText('Registrar partida'))
    expect(screen.getByText('Marca exactamente un ganador, o pon a todos en empate.')).toBeInTheDocument()
  })
})

describe('Registro — edición y borrado', () => {
  it('editar una partida desde la ficha actualiza sus datos', async () => {
    await renderRegistro([partidaDePrueba()])
    fireEvent.click(screen.getByText('Ana'))
    fireEvent.click(screen.getByLabelText('Editar la partida'))
    fireEvent.change(screen.getByLabelText('Duración en minutos'), { target: { value: '61' } })
    fireEvent.click(screen.getByText('Guardar cambios'))
    expect(await screen.findByText('Partida actualizada')).toBeInTheDocument()
    expect(screen.getByText(/1 h 1 min/)).toBeInTheDocument()
  })

  it('eliminar una partida la borra tras confirmar', async () => {
    await renderRegistro([partidaDePrueba()])
    fireEvent.click(screen.getByText('Ana'))
    fireEvent.click(screen.getByLabelText('Eliminar la partida'))
    fireEvent.click(screen.getByText('Eliminar partida', { selector: 'button.danger' }))
    expect(await screen.findByText('Partida eliminada')).toBeInTheDocument()
    // sin partidas, la ficha ya no tiene sentido: vuelve sola a la clasificación
    expect(screen.getByText('Todavía no hay ninguna partida registrada.')).toBeInTheDocument()
  })
})

describe('Registro — renombrar jugador', () => {
  it('cambia el nombre en todas sus partidas y se queda en su ficha', async () => {
    await renderRegistro([partidaDePrueba()])
    fireEvent.click(screen.getByText('Ana'))
    fireEvent.click(screen.getByText('Cambiar el nombre'))
    const input = screen.getByLabelText('Nombre nuevo')
    fireEvent.change(input, { target: { value: 'Ana María' } })
    fireEvent.click(screen.getByText('Cambiar el nombre', { selector: 'button.primary' }))
    expect(await screen.findByText('Nombre actualizado')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ana María' })).toBeInTheDocument()
  })
})

describe('Registro — copia de seguridad', () => {
  it('restaurar el ejemplo repuebla la clasificación con las doce partidas de muestra', async () => {
    await renderRegistro()
    fireEvent.click(screen.getByText('Copia de seguridad'))
    fireEvent.click(screen.getByText('Restaurar ejemplo'))
    expect(await screen.findByText('Datos de ejemplo restaurados')).toBeInTheDocument()
    expect(screen.getByText('12 partidas registradas', { exact: false })).toBeInTheDocument()
  })

  it('reemplazar todo con un JSON pegado a mano sustituye las partidas', async () => {
    const { almacen } = await renderRegistro([partidaDePrueba()])
    fireEvent.click(screen.getByText('Copia de seguridad'))
    const paquete = {
      app: 'mesa-commander',
      formato: 2,
      partidas: [partidaDePrueba({ id: 'g2', fecha: '2026-01-01', seats: [
        { j: 'Cris', c: 'Muldrotha, the Gravetide', c2: '', id: 'UBG', r: 'V', rehacer: 0, tiempo: 0, turno: 200 },
        { j: 'Dani', c: 'Talrand, Sky Summoner', c2: '', id: 'U', r: 'D', rehacer: 0, tiempo: 0, turno: 100 },
      ] })],
      perfiles: [],
    }
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: JSON.stringify(paquete) } })
    fireEvent.click(screen.getByText('Reemplazar todo'))
    expect(await screen.findByText('Datos reemplazados')).toBeInTheDocument()
    expect(screen.getByText('Cris')).toBeInTheDocument()
    expect(screen.queryByText('Ana')).toBeNull()
    const guardadas = JSON.parse((await almacen.get('mesa:partidas')).value as string) as Partida[]
    expect(guardadas.map((p: Partida) => p.id)).toEqual(['g2'])
  })
})

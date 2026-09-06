// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AvisoProvider } from '../../src/componentes/comunes/AvisoProvider'
import { crearAlmacenMemoria } from '../../src/almacenamiento/adaptadorMemoria'
import { leerPartidas } from '../../src/almacenamiento/repositorio'
import { AlmacenContexto } from '../../src/contextos/AlmacenContexto'
import { empezarPartida } from '../../src/motor/partida'
import { Tablero } from '../../src/paginas/Tablero'
import { ProveedorQueryDePrueba } from '../ayudantes/queryDePrueba'

// Ninguna de estas pruebas es sobre la imagen del comandante (ver tests/tablero/
// Asiento.test.tsx): un 404 por defecto evita que cada asiento dispare una
// petición real a Scryfall con el nombre de prueba "X".
const servidor = setupServer(http.get('https://api.scryfall.com/cards/named', () => new HttpResponse(null, { status: 404 })))
beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => servidor.resetHandlers())
afterAll(() => servidor.close())

function juegoDePrueba(numJugadores = 2) {
  const nombres = ['Ana', 'Beto', 'Cris'].slice(0, numJugadores)
  return empezarPartida({
    asientos: nombres.map((nombre) => ({ nombre, comandante: 'X', colores: 'R' })),
    vidaInicial: 40,
    limiteTurno: 0,
    dispo: null,
    turnoInicial: 0,
  })
}

function renderTablero(juegoInicial = juegoDePrueba(), onSalir = vi.fn(), onPartidaRegistrada = vi.fn()) {
  const almacen = crearAlmacenMemoria()
  render(
    <ProveedorQueryDePrueba>
      <AlmacenContexto.Provider value={almacen}>
        <AvisoProvider>
          <Tablero juegoInicial={juegoInicial} onSalir={onSalir} onPartidaRegistrada={onPartidaRegistrada} />
        </AvisoProvider>
      </AlmacenContexto.Provider>
    </ProveedorQueryDePrueba>,
  )
  return { almacen, onSalir, onPartidaRegistrada }
}

describe('Tablero', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('pinta un asiento por jugador con su vida inicial', () => {
    renderTablero()
    expect(screen.getAllByText('40')).toHaveLength(2)
    // el nombre ya no se muestra en el asiento (solo en el reloj y como accesibilidad)
    expect(screen.getAllByText('Ana')).toHaveLength(1)
    expect(screen.getByLabelText('Opciones de Ana')).toBeInTheDocument()
  })

  it('sumar y quitar vida actualiza el número al momento', () => {
    renderTablero()
    fireEvent.pointerDown(screen.getAllByLabelText('Sumar vida')[0])
    expect(screen.getByText('41')).toBeInTheDocument()
    fireEvent.pointerDown(screen.getAllByLabelText('Quitar vida')[0])
    fireEvent.pointerDown(screen.getAllByLabelText('Quitar vida')[0])
    expect(screen.getByText('39')).toBeInTheDocument()
  })

  it('deshacer restaura la vida anterior', () => {
    renderTablero()
    fireEvent.pointerDown(screen.getAllByLabelText('Sumar vida')[0])
    expect(screen.getByText('41')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Deshacer lo último apuntado'))
    expect(screen.queryByText('41')).toBeNull()
    expect(screen.getAllByText('40')).toHaveLength(2) // los dos jugadores vuelven a 40
  })

  it('reclamar el primer turno no se puede deshacer, igual que en el original', () => {
    // empezarPartida(turnoInicial: null) dejaría el tablero mostrando "Empiezo yo" en
    // vez de un asiento activo; se reclama a mano para reproducir ese arranque.
    const juego = empezarPartida({
      asientos: [{ nombre: 'Ana' }, { nombre: 'Beto' }],
      vidaInicial: 40,
      limiteTurno: 0,
      dispo: null,
      turnoInicial: null,
    })
    renderTablero(juego)
    fireEvent.click(screen.getAllByText(/Empiezo yo/)[0])
    expect(screen.getByLabelText('Pasar turno')).not.toHaveTextContent('¿Quién empieza?')

    fireEvent.click(screen.getByLabelText('Deshacer lo último apuntado'))
    // sin nada más que deshacer, reclamar el turno no se revierte
    expect(screen.getByLabelText('Pasar turno')).not.toHaveTextContent('¿Quién empieza?')
  })

  it('el reloj no muestra una duración negativa justo al reclamar el turno', () => {
    // Con timers reales: si `ahora` (React) y `tIni` (motor) leen Date.now() en
    // instantes reales ligeramente distintos, sin el refresco inmediato de
    // `ahora` al cambiar `juego` el reloj restaría en negativo un instante.
    // Con timers simulados todo `Date.now()` cae en el mismo instante congelado
    // y el bug no se manifestaría, así que aquí hacen falta timers reales.
    vi.useRealTimers()
    const juego = empezarPartida({
      asientos: [{ nombre: 'Ana' }, { nombre: 'Beto' }],
      vidaInicial: 40,
      limiteTurno: 0,
      dispo: null,
      turnoInicial: null,
    })
    renderTablero(juego)
    fireEvent.click(screen.getAllByText(/Empiezo yo/)[0])
    expect(screen.getByLabelText('Pasar turno').textContent).not.toContain('-')
  })

  it('pasar turno cambia quién juega en el reloj', () => {
    renderTablero()
    expect(screen.getByLabelText('Pasar turno')).toHaveTextContent('Ana')
    fireEvent.click(screen.getByLabelText('Pasar turno'))
    expect(screen.getByLabelText('Pasar turno')).toHaveTextContent('Beto')
  })

  it('el reloj gira con la rotación de quien tiene el turno', () => {
    // con 2 jugadores y sin disposición guardada, la de emergencia (LAYOUTS)
    // rota al primer asiento (Ana) 180° y deja el segundo (Beto) sin girar
    renderTablero()
    expect(screen.getByLabelText('Pasar turno')).toHaveAttribute('data-rot', '180')
    fireEvent.click(screen.getByLabelText('Pasar turno'))
    expect(screen.getByLabelText('Pasar turno')).toHaveAttribute('data-rot', '0')
  })

  it('el menú de asiento sube un contador visible en la ficha', () => {
    renderTablero()
    fireEvent.click(screen.getAllByLabelText(/Opciones de/)[0])
    const fila = screen.getByText('Experiencia').closest('.line') as HTMLElement
    fireEvent.click(fila.querySelector('.stepper button:last-child') as Element)
    fireEvent.click(screen.getByText('Listo'))
    expect(screen.getByTitle('Experiencia')).toHaveTextContent('1')
  })

  it('el daño de comandante resta vida y queda fuera a partir de 21', () => {
    // con 3 jugadores: si solo hubiera 2, eliminar a Ana terminaría la partida
    // sola (comprobarFinal) y el hub pasaría a ofrecer terminar la partida.
    renderTablero(juegoDePrueba(3))
    // dentro del primer asiento (Ana), el segundo sector de daño es el de Beto
    // (el primero es el suyo propio, por si se lo roban)
    const primerAsiento = document.querySelectorAll('.seat')[0]
    fireEvent.click(primerAsiento.querySelector('.dano-boton') as HTMLElement)
    const toqueDeBeto = primerAsiento.querySelectorAll('.dano-cmd')[1].querySelector('.dano-toque') as HTMLElement
    for (let i = 0; i < 21; i++) {
      fireEvent.pointerDown(toqueDeBeto)
      fireEvent.pointerUp(toqueDeBeto)
    }
    expect(screen.getByText('Fuera')).toBeInTheDocument()
    expect(screen.getByText('19')).toBeInTheDocument() // 40 de vida - 21 de daño
  })

  it('mantener pulsado un sector de daño cubre el cuadrado entero; restar lo quita', () => {
    renderTablero(juegoDePrueba(3))
    const primerAsiento = document.querySelectorAll('.seat')[0]
    fireEvent.click(primerAsiento.querySelector('.dano-boton') as HTMLElement)
    const cuadrado = primerAsiento.querySelector('.dano-cuadrado') as HTMLElement
    const sectorDeBeto = cuadrado.querySelectorAll('.dano-cmd')[1] as HTMLElement
    const toque = sectorDeBeto.querySelector('.dano-toque') as HTMLElement

    fireEvent.pointerDown(toque)
    fireEvent.pointerUp(toque)
    expect(sectorDeBeto.querySelector('.dano-valor')).toHaveTextContent('1')

    fireEvent.pointerDown(toque)
    act(() => vi.advanceTimersByTime(500))
    expect(cuadrado.querySelector('.dano-expandido')).not.toBeNull()

    fireEvent.click(cuadrado.querySelector('.dano-restar') as Element)
    expect(sectorDeBeto.querySelector('.dano-valor')).toBeNull()
    expect(cuadrado.querySelector('.dano-expandido')).not.toBeNull() // restar ya no cierra el panel

    fireEvent.pointerDown(document.body)
    // el popup entero se cierra (no solo el panel expandido de dentro), así que
    // hay que mirar en el documento vivo: `cuadrado` queda como una referencia
    // a un nodo ya desmontado, que conserva su contenido aunque ya no esté
    expect(primerAsiento.querySelector('.dano-popup')).toBeNull()
  })

  it('salir sin terminar no borra la partida guardada', async () => {
    const { almacen, onSalir } = renderTablero()
    fireEvent.click(screen.getByLabelText('Menú de la partida'))
    fireEvent.click(screen.getByText(/Salir sin terminar/))
    expect(onSalir).toHaveBeenCalledOnce()
    const partidas = await leerPartidas(almacen)
    expect(partidas).toEqual([]) // no se registró nada, pero tampoco se pide borrar la partida en curso
  })

  it('terminar y elegir un ganador registra la partida', async () => {
    const { almacen, onPartidaRegistrada } = renderTablero()
    fireEvent.click(screen.getByLabelText('Menú de la partida'))
    fireEvent.click(screen.getByText(/Terminar y registrar/))
    fireEvent.click(screen.getAllByText('Ganó')[0])

    await act(async () => {
      await Promise.resolve()
    })

    expect(onPartidaRegistrada).toHaveBeenCalledOnce()
    const partidas = await leerPartidas(almacen)
    expect(partidas).toHaveLength(1)
    expect(partidas[0].seats.find((s) => s.j === 'Ana')?.r).toBe('V')
    expect(partidas[0].seats.find((s) => s.j === 'Beto')?.r).toBe('D')
  })

  it('una partida en solitario solo se puede cerrar, sin registrar', () => {
    renderTablero(juegoDePrueba(1))
    fireEvent.click(screen.getByLabelText('Menú de la partida'))
    fireEvent.click(screen.getByText(/Terminar y registrar/))
    expect(screen.queryByText('Ganó')).toBeNull()
  })
})

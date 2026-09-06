// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { Asiento } from '../../src/tablero/Asiento'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego } from '../../src/motor/tipos'
import { ProveedorQueryDePrueba } from '../ayudantes/queryDePrueba'

// Sin comandante en Scryfall por defecto en cada prueba: así el fondo del asiento
// se queda en el degradado de color de siempre y estas pruebas, que no van de la
// imagen, no dependen de qué responda la red.
const servidor = setupServer(http.get('https://api.scryfall.com/cards/named', () => new HttpResponse(null, { status: 404 })))
beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  servidor.resetHandlers()
  vi.useRealTimers()
})
afterAll(() => servidor.close())

function juegoDePrueba(): Juego {
  return {
    id: 'x',
    inicio: new Date().toISOString(),
    cfg: { vida: 40, limite: 0, dispo: null },
    j: [
      nuevoJugador({ nombre: 'Ana', comandante: 'Edgar Markov', comandante2: 'Kydele, Chosen of Kruphix' }, 40),
      nuevoJugador({ nombre: 'Beto' }, 40),
    ],
    turno: 0,
    tIni: Date.now(),
    acum: 0,
    pausado: false,
    monarca: null,
    iniciativa: null,
    dia: null,
    log: [],
    fin: false,
    undo: [],
  }
}

const props = (over: Record<string, unknown> = {}) => ({
  juego: juegoDePrueba(),
  indice: 0,
  rotacion: 0,
  delta: 0,
  borde: null,
  esDestinoDeCorona: false,
  onCambiarVida: vi.fn(),
  onAbrirMenu: vi.fn(),
  onCambiarDano: vi.fn(),
  onAjustarMana: vi.fn(),
  onElegirInicio: vi.fn(),
  onRetirada: vi.fn(),
  onEmpezarArrastreCorona: vi.fn(),
  seatRef: vi.fn(),
  ...over,
})

function renderAsiento(p: ReturnType<typeof props>) {
  const utilidades = render(
    <ProveedorQueryDePrueba>
      <Asiento {...p} />
    </ProveedorQueryDePrueba>,
  )
  return {
    ...utilidades,
    rerender: (siguientes: ReturnType<typeof props>) =>
      utilidades.rerender(
        <ProveedorQueryDePrueba>
          <Asiento {...siguientes} />
        </ProveedorQueryDePrueba>,
      ),
  }
}

describe('Asiento', () => {
  it('muestra la vida, sin el nombre ni el comandante en pantalla (solo como accesibilidad)', () => {
    renderAsiento(props())
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(screen.queryByText('Ana')).toBeNull()
    expect(screen.queryByText('Edgar Markov + Kydele, Chosen of Kruphix')).toBeNull()
    // el nombre sigue disponible para quien usa un lector de pantalla
    expect(screen.getByLabelText('Opciones de Ana')).toBeInTheDocument()
  })

  it('marca "Su turno" solo a quien le toca y no está fuera', () => {
    renderAsiento(props())
    expect(screen.getByText('Su turno')).toBeInTheDocument()
  })

  it('un jugador fuera se marca y no muestra "Su turno" aunque sea su índice', () => {
    const juego = juegoDePrueba()
    juego.j[0].out = true
    renderAsiento(props({ juego }))
    expect(screen.getByText('Fuera')).toBeInTheDocument()
    expect(screen.queryByText('Su turno')).toBeNull()
  })

  it('el aviso de pasarse de tiempo vive siempre en su propia esquina, como el de jugadas rehechas', () => {
    const juego = juegoDePrueba()
    renderAsiento(props({ juego }))
    // visible aunque esté a 0, igual que el contador de jugadas rehechas
    const esquina = document.querySelector('.tiempo-esquina') as Element
    expect(esquina).not.toBeNull()
    expect(esquina).not.toHaveClass('warn')

    juego.j[0].fuera = 2
    renderAsiento(props({ juego }))
    const esquinas = document.querySelectorAll('.tiempo-esquina')
    expect(esquinas[esquinas.length - 1]).toHaveClass('warn')
  })

  it('tocar + y - llama a onCambiarVida', () => {
    const onCambiarVida = vi.fn()
    renderAsiento(props({ onCambiarVida }))
    fireEvent.pointerDown(screen.getByLabelText('Sumar vida'))
    fireEvent.pointerDown(screen.getByLabelText('Quitar vida'))
    expect(onCambiarVida).toHaveBeenNthCalledWith(1, 1)
    expect(onCambiarVida).toHaveBeenNthCalledWith(2, -1)
  })

  it('muestra el delta flotante solo cuando no es cero', () => {
    const { rerender } = renderAsiento(props({ delta: 0 }))
    expect(document.querySelector('.delta')).toBeNull()
    rerender(props({ delta: 3 }))
    expect(screen.getByText('+3')).toBeInTheDocument()
    rerender(props({ delta: -2 }))
    expect(screen.getByText('-2')).toBeInTheDocument()
  })

  it('el delta flotante vive dentro de .life-wrap, para que gire con el asiento y quede separado de la vida', () => {
    renderAsiento(props({ delta: 3 }))
    const wrap = document.querySelector('.life-wrap') as Element
    expect(wrap.querySelector('.delta')).not.toBeNull()
  })

  it('la corona solo aparece en el asiento del monarca', () => {
    const juego = juegoDePrueba()
    juego.monarca = 0
    const { rerender } = renderAsiento(props({ juego }))
    expect(document.querySelector('.corona')).not.toBeNull()
    rerender(props({ juego, indice: 1 }))
    expect(document.querySelector('.corona')).toBeNull()
  })

  it('la corona vive dentro de .life-wrap, fuera del flujo, para no desplazar el número de vida', () => {
    const juego = juegoDePrueba()
    juego.monarca = 0
    renderAsiento(props({ juego }))
    const wrap = document.querySelector('.life-wrap') as Element
    expect(wrap.querySelector('.corona')).not.toBeNull()
  })

  it('los contadores y el maná viven arriba, antes de la fila de vida, no abajo con las esquinas fijas', () => {
    const juego = juegoDePrueba()
    juego.j[0].ven = 1
    renderAsiento(props({ juego }))
    const inner = document.querySelector('.inner') as Element
    const hijos = Array.from(inner.children).map((n) => n.className)
    expect(hijos.indexOf('seat-estados')).toBeGreaterThan(-1)
    expect(hijos.indexOf('seat-estados')).toBeLessThan(hijos.indexOf('life-row'))
  })

  it('"Empiezo yo" solo aparece cuando la partida espera turno', () => {
    const juego = juegoDePrueba()
    juego.turno = null
    renderAsiento(props({ juego }))
    fireEvent.click(screen.getByText(/Empiezo yo/))
    expect(props().onElegirInicio).toBeDefined()
  })

  it('no hay iconos de daño de comandante en partidas de un solo jugador', () => {
    const juego = juegoDePrueba()
    juego.j = [juego.j[0]]
    renderAsiento(props({ juego }))
    expect(screen.queryByText('Daño de comandante')).toBeNull()
    expect(document.querySelectorAll('.dano-cmd')).toHaveLength(0)
  })

  it('muestra los contadores activos y los oculta cuando están a cero', () => {
    const juego = juegoDePrueba()
    juego.j[0].ven = 3
    const { rerender } = renderAsiento(props({ juego }))
    expect(screen.getByText('3')).toBeInTheDocument()
    juego.j[0].ven = 0
    rerender(props({ juego: { ...juego } }))
    expect(screen.queryByText('3')).toBeNull()
  })

  it('tocar una ficha de maná gasta uno', () => {
    const juego = juegoDePrueba()
    juego.j[0].mana = { ...juego.j[0].mana, U: 2 }
    const onAjustarMana = vi.fn()
    renderAsiento(props({ juego, onAjustarMana }))
    fireEvent.click(screen.getByTitle('Maná U: toca para gastar uno'))
    expect(onAjustarMana).toHaveBeenCalledWith('U', -1)
  })

  it('con muchos contadores sueltos a la vez, se agrupan en un botón de resumen', () => {
    const juego = juegoDePrueba()
    // más de UMBRAL_CONTADORES_SUELTOS (2) contadores sueltos activos a la vez
    Object.assign(juego.j[0], { ven: 1, exp: 1, ene: 1 })
    const onAbrirMenu = vi.fn()
    renderAsiento(props({ juego, onAbrirMenu }))
    expect(screen.getByText('3 más')).toBeInTheDocument()
    expect(screen.queryByTitle('Experiencia')).toBeNull()
    fireEvent.click(screen.getByText('3 más'))
    expect(onAbrirMenu).toHaveBeenCalledOnce()
  })

  it('con pocos contadores sueltos, se ven todos sin agrupar', () => {
    const juego = juegoDePrueba()
    juego.j[0].ven = 1
    renderAsiento(props({ juego }))
    expect(screen.queryByText(/más$/)).toBeNull()
    expect(screen.getByTitle('Infectar')).toBeInTheDocument()
  })

  it('abrir menú llama a su callback', () => {
    const onAbrirMenu = vi.fn()
    renderAsiento(props({ onAbrirMenu }))
    fireEvent.click(screen.getByLabelText('Opciones de Ana'))
    expect(onAbrirMenu).toHaveBeenCalledOnce()
  })

  it('el botón de debajo de la vida abre el cuadrado de daño como un popup, que se cierra al tocar fuera', () => {
    renderAsiento(props())
    expect(document.querySelector('.dano-popup')).toBeNull()

    fireEvent.click(screen.getByText('Daño de comandante'))
    expect(document.querySelector('.dano-popup')).not.toBeNull()

    fireEvent.pointerDown(document.body)
    expect(document.querySelector('.dano-popup')).toBeNull()
  })

  it('tocar el fondo del popup (fuera del cuadrado, pero dentro del asiento) también lo cierra', () => {
    // el fondo semitransparente (.dano-popup) cubre el asiento entero: si "fuera"
    // se midiera contra él en vez de contra el propio .dano-cuadrado, tocar ese
    // fondo se tomaría como un toque "dentro" y el popup no se cerraría nunca
    renderAsiento(props())
    fireEvent.click(screen.getByText('Daño de comandante'))
    const fondo = document.querySelector('.dano-popup') as Element

    fireEvent.pointerDown(fondo)
    expect(document.querySelector('.dano-popup')).toBeNull()
  })

  it('tocar dentro del cuadrado de daño no cierra el popup', () => {
    renderAsiento(props())
    fireEvent.click(screen.getByText('Daño de comandante'))
    const cuadrado = document.querySelector('.dano-cuadrado') as Element

    fireEvent.pointerDown(cuadrado)
    expect(document.querySelector('.dano-popup')).not.toBeNull()
  })

  it('tocar el sector de un comandante suma daño directamente', () => {
    const onCambiarDano = vi.fn()
    renderAsiento(props({ onCambiarDano }))
    fireEvent.click(screen.getByText('Daño de comandante'))
    const toque = document.querySelector('.dano-cmd .dano-toque') as Element

    fireEvent.pointerDown(toque)
    fireEvent.pointerUp(toque)
    expect(onCambiarDano).toHaveBeenCalledWith('0:0', 1)
  })

  it('mantener pulsado un sector cubre el cuadrado entero; restar no lo cierra, se puede seguir usando', () => {
    vi.useFakeTimers()
    const onCambiarDano = vi.fn()
    renderAsiento(props({ onCambiarDano }))
    fireEvent.click(screen.getByText('Daño de comandante'))
    const cuadrado = document.querySelector('.dano-cuadrado') as Element
    const toque = cuadrado.querySelector('.dano-cmd .dano-toque') as Element

    fireEvent.pointerDown(toque)
    act(() => vi.advanceTimersByTime(500))
    expect(onCambiarDano).not.toHaveBeenCalled()
    expect(cuadrado.querySelector('.dano-expandido')).not.toBeNull()

    fireEvent.click(cuadrado.querySelector('.dano-restar') as Element)
    expect(onCambiarDano).toHaveBeenCalledWith('0:0', -1)
    expect(cuadrado.querySelector('.dano-expandido')).not.toBeNull() // sigue abierto

    fireEvent.click(cuadrado.querySelector('.dano-restar') as Element)
    expect(onCambiarDano).toHaveBeenCalledTimes(2)
  })

  it('el cuadrado expandido se cierra solo pasados unos segundos sin tocarlo', () => {
    vi.useFakeTimers()
    renderAsiento(props())
    fireEvent.click(screen.getByText('Daño de comandante'))
    const cuadrado = document.querySelector('.dano-cuadrado') as Element
    const toque = cuadrado.querySelector('.dano-cmd .dano-toque') as Element

    fireEvent.pointerDown(toque)
    act(() => vi.advanceTimersByTime(500))
    expect(cuadrado.querySelector('.dano-expandido')).not.toBeNull()

    act(() => vi.advanceTimersByTime(3000))
    expect(cuadrado.querySelector('.dano-expandido')).toBeNull()
  })

  it('hay un icono por cada comandante en la mesa, propio incluido por si se lo roban', () => {
    renderAsiento(props())
    fireEvent.click(screen.getByText('Daño de comandante'))
    // Ana (2 comandantes) + Beto (1, sin nombre) = 3 fuentes de daño posibles
    expect(document.querySelectorAll('.dano-cmd')).toHaveLength(3)
  })

  it('el cuadrado tiene un hueco general por jugador, no por comandante: un compañero no añade uno nuevo', () => {
    renderAsiento(props())
    fireEvent.click(screen.getByText('Daño de comandante'))
    // 2 jugadores (Ana y Beto) = 2 huecos generales, aunque Ana lleve 2 comandantes
    const grupos = document.querySelectorAll('.dano-grupo')
    expect(grupos).toHaveLength(2)
    expect(grupos[0].querySelectorAll('.dano-cmd')).toHaveLength(2) // el hueco de Ana se parte en dos
    expect(grupos[1].querySelectorAll('.dano-cmd')).toHaveLength(1) // el de Beto se queda entero
  })

  it('sin comandante en Scryfall (o sin red), el fondo se queda en el degradado de color', async () => {
    renderAsiento(props())
    await new Promise((resolve) => setTimeout(resolve, 0))
    const estilo = document.querySelector('.bg')?.getAttribute('style') ?? ''
    expect(estilo).toContain('linear-gradient')
    expect(estilo).not.toContain('url(')
  })

  it('con el comandante en Scryfall, el fondo pasa a ser su ilustración', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/named', () =>
        HttpResponse.json({
          name: 'Edgar Markov',
          color_identity: ['W', 'B', 'R'],
          image_uris: { art_crop: 'https://cards.scryfall.io/art_crop/edgar-markov.jpg' },
        }),
      ),
    )
    renderAsiento(props())
    await screen.findByText('40')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.querySelector('.bg')?.getAttribute('style')).toContain(
      'url("https://cards.scryfall.io/art_crop/edgar-markov.jpg")',
    )
  })
})

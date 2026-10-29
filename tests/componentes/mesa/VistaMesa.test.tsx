// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { VistaMesa } from '../../../src/componentes/mesa/VistaMesa'
import type { Dispo } from '../../../src/componentes/mesa/disposiciones'
import type { Asiento } from '../../../src/motor/tipos'
import { ProveedorQueryDePrueba } from '../../ayudantes/queryDePrueba'

// Sin comandante en Scryfall por defecto: así el fondo se queda en el degradado
// de color de siempre y estas pruebas, que no van de la imagen, no dependen de
// qué responda la red (mismo planteamiento que tests/tablero/Asiento.test.tsx).
const servidor = setupServer(http.get('https://api.scryfall.com/cards/named', () => new HttpResponse(null, { status: 404 })))
beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => servidor.resetHandlers())
afterAll(() => servidor.close())

const dispo: Dispo = { id: '2a', n: 'Cara a cara', cols: '1fr', rows: '1fr 1fr', rot: [180, 0] }

function renderVistaMesa(props: React.ComponentProps<typeof VistaMesa>) {
  return render(
    <ProveedorQueryDePrueba>
      <VistaMesa {...props} />
    </ProveedorQueryDePrueba>,
  )
}

describe('VistaMesa', () => {
  it('pinta un asiento libre y uno ocupado', () => {
    const mesa: (Asiento | null)[] = [null, { nombre: 'Ana', comandante: 'X', comandante2: '', colores: 'R' }]
    renderVistaMesa({ mesa, dispo, inicia: null, onElegirAsiento: () => {}, onGirarAsiento: () => {} })
    expect(screen.getByText('Asiento libre')).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
  })

  it('marca con la insignia de "Empieza" solo al asiento sorteado', () => {
    const mesa: (Asiento | null)[] = [
      { nombre: 'Ana', comandante: '', comandante2: '', colores: '' },
      { nombre: 'Beto', comandante: '', comandante2: '', colores: '' },
    ]
    renderVistaMesa({ mesa, dispo, inicia: 1, onElegirAsiento: () => {}, onGirarAsiento: () => {} })
    expect(screen.getAllByText('Empieza')).toHaveLength(1)
  })

  it('tocar un asiento llama a onElegirAsiento con su índice', () => {
    const onElegirAsiento = vi.fn()
    renderVistaMesa({ mesa: [null, null], dispo, inicia: null, onElegirAsiento, onGirarAsiento: () => {} })
    fireEvent.click(screen.getAllByRole('button', { name: /Asiento/ })[1])
    expect(onElegirAsiento).toHaveBeenCalledWith(1)
  })

  it('girar un asiento no elige el asiento a la vez (stopPropagation)', () => {
    const onElegirAsiento = vi.fn()
    const onGirarAsiento = vi.fn()
    renderVistaMesa({ mesa: [null], dispo: { ...dispo, rot: [0] }, inicia: null, onElegirAsiento, onGirarAsiento })
    fireEvent.click(screen.getByTitle('Girar este asiento'))
    expect(onGirarAsiento).toHaveBeenCalledWith(0)
    expect(onElegirAsiento).not.toHaveBeenCalled()
  })

  it('Enter y espacio también eligen el asiento (es un div[role=button], no un <button>)', () => {
    const onElegirAsiento = vi.fn()
    renderVistaMesa({ mesa: [null], dispo: { ...dispo, rot: [0] }, inicia: null, onElegirAsiento, onGirarAsiento: () => {} })
    const asiento = screen.getByRole('button', { name: /Asiento 1/ })
    fireEvent.keyDown(asiento, { key: 'Enter' })
    fireEvent.keyDown(asiento, { key: ' ' })
    expect(onElegirAsiento).toHaveBeenCalledTimes(2)
  })

  it('el centro del móvil solo aparece si la disposición lo define', () => {
    const conCentro: Dispo = { ...dispo, centro: '2/2/3/3' }
    renderVistaMesa({ mesa: [null, null], dispo: conCentro, inicia: null, onElegirAsiento: () => {}, onGirarAsiento: () => {} })
    expect(screen.getByText('El móvil va aquí')).toBeInTheDocument()
  })

  it('sin comandante en Scryfall, no aparece ningún asomo de imagen', async () => {
    const mesa: (Asiento | null)[] = [{ nombre: 'Ana', comandante: 'Nadie Así', comandante2: '', colores: 'R' }]
    renderVistaMesa({ mesa, dispo: { ...dispo, rot: [0] }, inicia: null, onElegirAsiento: () => {}, onGirarAsiento: () => {} })
    await screen.findByText('Ana')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.querySelector('.pbg-comandante')).toBeNull()
  })

  it('con el comandante en Scryfall, se ve un asomo de su ilustración detrás del asiento', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/named', () =>
        HttpResponse.json({
          name: 'Edgar Markov',
          color_identity: ['W', 'B', 'R'],
          image_uris: { art_crop: 'https://cards.scryfall.io/art_crop/edgar-markov.jpg' },
        }),
      ),
    )
    const mesa: (Asiento | null)[] = [{ nombre: 'Ana', comandante: 'Edgar Markov', comandante2: '', colores: 'WBR' }]
    renderVistaMesa({ mesa, dispo: { ...dispo, rot: [0] }, inicia: null, onElegirAsiento: () => {}, onGirarAsiento: () => {} })
    await waitFor(() => {
      expect(document.querySelector('.pbg-comandante')?.getAttribute('style')).toContain(
        'url("https://cards.scryfall.io/art_crop/edgar-markov.jpg")',
      )
    })
  })
})

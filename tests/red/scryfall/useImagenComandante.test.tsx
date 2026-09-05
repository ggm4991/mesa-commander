// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useImagenComandante } from '../../../src/red/scryfall/useImagenComandante'
import { ProveedorQueryDePrueba } from '../../ayudantes/queryDePrueba'

const servidor = setupServer()
beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => servidor.resetHandlers())
afterAll(() => servidor.close())

function montar(nombre: string | undefined, imagenId?: string) {
  return renderHook(({ n, id }) => useImagenComandante(n, id), {
    initialProps: { n: nombre, id: imagenId },
    wrapper: ProveedorQueryDePrueba,
  })
}

describe('useImagenComandante', () => {
  it('sin nombre ni edición fijada, no consulta a Scryfall y devuelve null', async () => {
    const { result } = montar(undefined)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(result.current).toBeNull()
  })

  it('con nombre, busca la edición de referencia por nombre exacto', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/named', ({ request }) => {
        expect(new URL(request.url).searchParams.get('exact')).toBe('Edgar Markov')
        return HttpResponse.json({ name: 'Edgar Markov', color_identity: ['W'], image_uris: { art_crop: 'https://cards.scryfall.io/art_crop/ref.jpg' } })
      }),
    )
    const { result } = montar('Edgar Markov')
    await waitFor(() => expect(result.current).toBe('https://cards.scryfall.io/art_crop/ref.jpg'))
  })

  it('con una edición fijada, busca esa carta por id en vez de por nombre', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/named', () => {
        throw new Error('no debería consultar por nombre habiendo una edición fijada')
      }),
      http.get('https://api.scryfall.com/cards/:id', ({ params }) => {
        expect(params.id).toBe('edicion-2')
        return HttpResponse.json({ name: 'Edgar Markov', color_identity: ['W'], image_uris: { art_crop: 'https://cards.scryfall.io/art_crop/edicion-2.jpg' } })
      }),
    )
    const { result } = montar('Edgar Markov', 'edicion-2')
    await waitFor(() => expect(result.current).toBe('https://cards.scryfall.io/art_crop/edicion-2.jpg'))
  })

  it('sin coincidencia o sin red, devuelve null sin lanzar', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/named', () => new HttpResponse(null, { status: 404 })))
    const { result } = montar('Carta Inventada')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(result.current).toBeNull()
  })
})

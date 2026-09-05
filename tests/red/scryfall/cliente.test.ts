import { HttpResponse, http, delay } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { buscarNombres, buscarPorNombreExacto } from '../../../src/red/scryfall/cliente'

const servidor = setupServer()

beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => servidor.resetHandlers())
afterAll(() => servidor.close())

describe('buscarNombres', () => {
  it('con menos de dos letras, no llama a Scryfall y devuelve una lista vacía', async () => {
    // sin handlers registrados: si llamara a fetch, onUnhandledRequest:'error' lo delataría
    expect(await buscarNombres('e')).toEqual([])
  })

  it('devuelve las sugerencias que manda Scryfall', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/autocomplete', ({ request }) => {
        expect(new URL(request.url).searchParams.get('q')).toBe('edgar mark')
        return HttpResponse.json({ data: ['Edgar Markov', 'Edgar, Charmed Groom'] })
      }),
    )
    expect(await buscarNombres('edgar mark')).toEqual(['Edgar Markov', 'Edgar, Charmed Groom'])
  })

  it('un error de servidor se propaga como excepción', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/autocomplete', () => new HttpResponse(null, { status: 500 })))
    await expect(buscarNombres('edgar')).rejects.toThrow('500')
  })

  it('sin red, se propaga como excepción (no como lista vacía)', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/autocomplete', () => HttpResponse.error()))
    await expect(buscarNombres('edgar')).rejects.toThrow()
  })

  it('una respuesta lenta se puede cancelar con AbortSignal, como haría un debounce', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/autocomplete', async () => {
        await delay(200)
        return HttpResponse.json({ data: ['Edgar Markov'] })
      }),
    )
    const control = new AbortController()
    const promesa = buscarNombres('edgar', control.signal)
    control.abort()
    await expect(promesa).rejects.toThrow()
  })
})

describe('buscarPorNombreExacto', () => {
  it('devuelve la identidad de color en orden WUBRG y la imagen normal', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/named', ({ request }) => {
        expect(new URL(request.url).searchParams.get('exact')).toBe('Edgar Markov')
        return HttpResponse.json({
          name: 'Edgar Markov',
          color_identity: ['R', 'W', 'B'],
          image_uris: { normal: 'https://cards.scryfall.io/normal/edgar-markov.jpg' },
        })
      }),
    )
    expect(await buscarPorNombreExacto('Edgar Markov')).toEqual({
      nombre: 'Edgar Markov',
      identidad: 'WBR',
      imagen: 'https://cards.scryfall.io/normal/edgar-markov.jpg',
    })
  })

  it('una carta de dos caras toma la imagen de la primera cara', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/named', () =>
        HttpResponse.json({
          name: 'Comandante Transformable',
          color_identity: ['U'],
          card_faces: [{ image_uris: { normal: 'https://cards.scryfall.io/normal/cara-1.jpg' } }, { image_uris: {} }],
        }),
      ),
    )
    const info = await buscarPorNombreExacto('Comandante Transformable')
    expect(info?.imagen).toBe('https://cards.scryfall.io/normal/cara-1.jpg')
  })

  it('un nombre que no existe devuelve null, no un error', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/named', () => new HttpResponse(null, { status: 404 })))
    expect(await buscarPorNombreExacto('Carta Que No Existe')).toBeNull()
  })

  it('un error de servidor se propaga como excepción', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/named', () => new HttpResponse(null, { status: 500 })))
    await expect(buscarPorNombreExacto('Edgar Markov')).rejects.toThrow('500')
  })

  it('sin red, se propaga como excepción', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/named', () => HttpResponse.error()))
    await expect(buscarPorNombreExacto('Edgar Markov')).rejects.toThrow()
  })
})

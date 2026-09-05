import { HttpResponse, http, delay } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { buscarImpresiones, buscarNombres, buscarPorId, buscarPorNombreExacto } from '../../../src/red/scryfall/cliente'

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
  it('devuelve la identidad de color en orden WUBRG y solo la ilustración (art_crop)', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/named', ({ request }) => {
        expect(new URL(request.url).searchParams.get('exact')).toBe('Edgar Markov')
        return HttpResponse.json({
          name: 'Edgar Markov',
          color_identity: ['R', 'W', 'B'],
          image_uris: { normal: 'https://cards.scryfall.io/normal/edgar-markov.jpg', art_crop: 'https://cards.scryfall.io/art_crop/edgar-markov.jpg' },
        })
      }),
    )
    expect(await buscarPorNombreExacto('Edgar Markov')).toEqual({
      nombre: 'Edgar Markov',
      identidad: 'WBR',
      imagen: 'https://cards.scryfall.io/art_crop/edgar-markov.jpg',
    })
  })

  it('una carta de dos caras toma la ilustración de la primera cara', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/named', () =>
        HttpResponse.json({
          name: 'Comandante Transformable',
          color_identity: ['U'],
          card_faces: [{ image_uris: { art_crop: 'https://cards.scryfall.io/art_crop/cara-1.jpg' } }, { image_uris: {} }],
        }),
      ),
    )
    const info = await buscarPorNombreExacto('Comandante Transformable')
    expect(info?.imagen).toBe('https://cards.scryfall.io/art_crop/cara-1.jpg')
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

describe('buscarPorId', () => {
  it('devuelve la identidad e ilustración de esa edición concreta', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/:id', ({ params }) => {
        expect(params.id).toBe('abc-123')
        return HttpResponse.json({
          name: 'Edgar Markov',
          color_identity: ['R', 'W', 'B'],
          image_uris: { art_crop: 'https://cards.scryfall.io/art_crop/edicion-especial.jpg' },
        })
      }),
    )
    expect(await buscarPorId('abc-123')).toEqual({
      nombre: 'Edgar Markov',
      identidad: 'WBR',
      imagen: 'https://cards.scryfall.io/art_crop/edicion-especial.jpg',
    })
  })

  it('un id que no existe devuelve null', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/:id', () => new HttpResponse(null, { status: 404 })))
    expect(await buscarPorId('no-existe')).toBeNull()
  })

  it('un error de servidor se propaga como excepción', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/:id', () => new HttpResponse(null, { status: 500 })))
    await expect(buscarPorId('abc-123')).rejects.toThrow('500')
  })
})

describe('buscarImpresiones', () => {
  it('devuelve una edición por carta, con su miniatura e ilustración', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/search', ({ request }) => {
        const q = new URL(request.url).searchParams.get('q')
        expect(q).toBe('!"Edgar Markov"')
        return HttpResponse.json({
          data: [
            {
              id: 'edicion-1',
              set_name: 'Commander 2017',
              image_uris: { art_crop: 'https://cards.scryfall.io/art_crop/c17.jpg', small: 'https://cards.scryfall.io/small/c17.jpg' },
            },
            {
              id: 'edicion-2',
              set_name: 'Secret Lair Drop',
              image_uris: { art_crop: 'https://cards.scryfall.io/art_crop/sld.jpg', small: 'https://cards.scryfall.io/small/sld.jpg' },
            },
          ],
        })
      }),
    )
    expect(await buscarImpresiones('Edgar Markov')).toEqual([
      { id: 'edicion-1', edicion: 'Commander 2017', imagen: 'https://cards.scryfall.io/art_crop/c17.jpg', miniatura: 'https://cards.scryfall.io/small/c17.jpg' },
      { id: 'edicion-2', edicion: 'Secret Lair Drop', imagen: 'https://cards.scryfall.io/art_crop/sld.jpg', miniatura: 'https://cards.scryfall.io/small/sld.jpg' },
    ])
  })

  it('sin ninguna impresión, devuelve una lista vacía', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/search', () => new HttpResponse(null, { status: 404 })))
    expect(await buscarImpresiones('Carta Que No Existe')).toEqual([])
  })

  it('un error de servidor se propaga como excepción', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/search', () => new HttpResponse(null, { status: 500 })))
    await expect(buscarImpresiones('Edgar Markov')).rejects.toThrow('500')
  })
})

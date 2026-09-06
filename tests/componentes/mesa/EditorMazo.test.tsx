// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { EditorMazo } from '../../../src/componentes/mesa/EditorMazo'
import { AvisoProvider } from '../../../src/componentes/comunes/AvisoProvider'
import { ProveedorQueryDePrueba } from '../../ayudantes/queryDePrueba'

// Sin imagen por defecto: la miniatura de `SelectorImagenComandante` pide la
// carta (por nombre o, si el mazo ya trae una edición fijada, por id) en cuanto
// hay un nombre, y la mayoría de estas pruebas no son sobre eso.
const servidor = setupServer(
  http.get('https://api.scryfall.com/cards/named', () => new HttpResponse(null, { status: 404 })),
  http.get('https://api.scryfall.com/cards/:id', () => new HttpResponse(null, { status: 404 })),
)
beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => servidor.resetHandlers())
afterAll(() => servidor.close())

function renderEditorMazo(props: Parameters<typeof EditorMazo>[0]) {
  return render(
    <ProveedorQueryDePrueba>
      <AvisoProvider>
        <EditorMazo {...props} />
      </AvisoProvider>
    </ProveedorQueryDePrueba>,
  )
}

describe('EditorMazo', () => {
  it('exige al menos el comandante principal', () => {
    const onGuardar = vi.fn()
    renderEditorMazo({ mazo: null, onGuardar, onCancelar: () => {} })
    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(screen.getByText('Escribe al menos el comandante principal.')).toBeInTheDocument()
    expect(onGuardar).not.toHaveBeenCalled()
  })

  it('guarda comandante, compañero y colores, recortando espacios', () => {
    const onGuardar = vi.fn()
    renderEditorMazo({ mazo: null, onGuardar, onCancelar: () => {} })
    fireEvent.change(screen.getByLabelText('Comandante'), { target: { value: '  Edgar Markov  ' } })
    fireEvent.click(screen.getByLabelText('Color W'))
    fireEvent.click(screen.getByLabelText('Color B'))
    fireEvent.click(screen.getByLabelText('Color R'))
    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ c: 'Edgar Markov', c2: '', col: 'WBR' }))
  })

  it('un color se puede quitar volviendo a pulsarlo', () => {
    const onGuardar = vi.fn()
    renderEditorMazo({ mazo: null, onGuardar, onCancelar: () => {} })
    fireEvent.change(screen.getByLabelText('Comandante'), { target: { value: 'X' } })
    fireEvent.click(screen.getByLabelText('Color U'))
    fireEvent.click(screen.getByLabelText('Color U'))
    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ col: '' }))
  })

  it('editar un mazo existente parte de sus valores', () => {
    renderEditorMazo({
      mazo: { id: 'm1', c: 'Krenko, Mob Boss', c2: '', col: 'R' },
      onGuardar: () => {},
      onCancelar: () => {},
    })
    expect(screen.getByLabelText('Comandante')).toHaveValue('Krenko, Mob Boss')
    expect(screen.getByLabelText('Color R')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Editar mazo')).toBeInTheDocument()
  })

  it('cancelar no guarda nada', () => {
    const onCancelar = vi.fn()
    renderEditorMazo({ mazo: null, onGuardar: () => {}, onCancelar })
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancelar).toHaveBeenCalledOnce()
  })

  it('escribir sin enfocar (o sin elegir ninguna sugerencia) nunca llama a Scryfall', () => {
    // sin ningún handler registrado: onUnhandledRequest:'error' delataría una llamada real
    const onGuardar = vi.fn()
    renderEditorMazo({ mazo: null, onGuardar, onCancelar: () => {} })
    fireEvent.change(screen.getByLabelText('Comandante'), { target: { value: 'Edgar Markov' } })
    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ c: 'Edgar Markov', col: '' }))
  })

  it('al enfocar y escribir aparecen sugerencias de Scryfall', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/search', () =>
        HttpResponse.json({ data: [{ name: 'Edgar Markov' }, { name: 'Edgar, Charmed Groom' }] }),
      ),
    )
    renderEditorMazo({ mazo: null, onGuardar: () => {}, onCancelar: () => {} })
    const campo = screen.getByLabelText('Comandante')
    fireEvent.focus(campo)
    fireEvent.change(campo, { target: { value: 'edgar' } })

    expect(await screen.findByText('Edgar, Charmed Groom')).toBeInTheDocument()
  })

  it('elegir una sugerencia rellena el nombre y enciende su identidad de color sola', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/search', () => HttpResponse.json({ data: [{ name: 'Edgar Markov' }] })),
      http.get('https://api.scryfall.com/cards/named', () =>
        HttpResponse.json({ name: 'Edgar Markov', color_identity: ['R', 'W', 'B'] }),
      ),
    )
    const onGuardar = vi.fn()
    renderEditorMazo({ mazo: null, onGuardar, onCancelar: () => {} })
    const campo = screen.getByLabelText('Comandante')
    fireEvent.focus(campo)
    fireEvent.change(campo, { target: { value: 'edgar' } })

    fireEvent.click(await screen.findByText('Edgar Markov'))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(screen.getByLabelText('Color W')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Color B')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Color R')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Color U')).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ c: 'Edgar Markov', col: 'WBR' }))
  })

  it('un compañero elegido de Scryfall añade su color sin apagar el del principal', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/search', () => HttpResponse.json({ data: [{ name: 'Silas Renn, Seeker Adept' }] })),
      http.get('https://api.scryfall.com/cards/named', () =>
        HttpResponse.json({ name: 'Silas Renn, Seeker Adept', color_identity: ['U', 'B'] }),
      ),
    )
    renderEditorMazo({ mazo: { id: 'm1', c: 'Ishai, Ojutai Dragonspeaker', c2: '', col: 'WU' }, onGuardar: () => {}, onCancelar: () => {} })
    const campo = screen.getByLabelText('Compañero (opcional)')
    fireEvent.focus(campo)
    fireEvent.change(campo, { target: { value: 'silas' } })

    fireEvent.click(await screen.findByText('Silas Renn, Seeker Adept'))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // WU (de antes) + UB (del compañero) = WUB, sin perder el W del principal
    expect(screen.getByLabelText('Color W')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Color U')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Color B')).toHaveAttribute('aria-pressed', 'true')
  })

  it('si Scryfall falla al elegir una sugerencia, avisa pero deja el nombre puesto', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/search', () => HttpResponse.json({ data: [{ name: 'Edgar Markov' }] })),
      http.get('https://api.scryfall.com/cards/named', () => HttpResponse.error()),
    )
    renderEditorMazo({ mazo: null, onGuardar: () => {}, onCancelar: () => {} })
    const campo = screen.getByLabelText('Comandante')
    fireEvent.focus(campo)
    fireEvent.change(campo, { target: { value: 'edgar' } })

    fireEvent.click(await screen.findByText('Edgar Markov'))

    expect(await screen.findByText('No se pudo consultar Scryfall: rellena la identidad de color a mano')).toBeInTheDocument()
    expect(screen.getByLabelText('Comandante')).toHaveValue('Edgar Markov')
    expect(screen.getByLabelText('Color W')).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('EditorMazo — imagen del comandante', () => {
  it('sin comandante todavía, no muestra el selector de imagen', () => {
    renderEditorMazo({ mazo: null, onGuardar: () => {}, onCancelar: () => {} })
    expect(screen.queryByText('Cambiar imagen')).toBeNull()
  })

  it('con un comandante reconocido, muestra su miniatura', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/named', () =>
        HttpResponse.json({ name: 'Edgar Markov', color_identity: ['W', 'B', 'R'], image_uris: { art_crop: 'https://cards.scryfall.io/art_crop/edgar.jpg' } }),
      ),
    )
    renderEditorMazo({ mazo: { id: 'm1', c: 'Edgar Markov', c2: '', col: 'WBR', imagenId: '' }, onGuardar: () => {}, onCancelar: () => {} })
    const miniatura = await screen.findByAltText('Edgar Markov')
    expect(miniatura).toHaveAttribute('src', 'https://cards.scryfall.io/art_crop/edgar.jpg')
  })

  it('cambiar imagen lista las ediciones y elegir una la fija en el mazo', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/search', ({ request }) => {
        expect(new URL(request.url).searchParams.get('q')).toBe('!"Edgar Markov"')
        return HttpResponse.json({
          data: [
            { id: 'edicion-1', set_name: 'Commander 2017', image_uris: { small: 'https://cards.scryfall.io/small/c17.jpg' } },
            { id: 'edicion-2', set_name: 'Secret Lair Drop', image_uris: { small: 'https://cards.scryfall.io/small/sld.jpg' } },
          ],
        })
      }),
    )
    const onGuardar = vi.fn()
    renderEditorMazo({ mazo: { id: 'm1', c: 'Edgar Markov', c2: '', col: 'WBR', imagenId: '' }, onGuardar, onCancelar: () => {} })
    fireEvent.click(await screen.findByText('Cambiar imagen'))
    fireEvent.click(await screen.findByText('Secret Lair Drop'))
    expect(screen.queryByText('Elegir imagen de Edgar Markov')).toBeNull()

    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ imagenId: 'edicion-2' }))
  })

  it('"Usar la edición de referencia" limpia la fijación', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/search', () => HttpResponse.json({ data: [] })))
    const onGuardar = vi.fn()
    renderEditorMazo({ mazo: { id: 'm1', c: 'Edgar Markov', c2: '', col: 'WBR', imagenId: 'edicion-2' }, onGuardar, onCancelar: () => {} })
    fireEvent.click(await screen.findByText('Cambiar imagen'))
    fireEvent.click(await screen.findByText('Usar la edición de referencia'))

    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ imagenId: '' }))
  })

  it('cambiar el nombre del comandante limpia la edición fijada anteriormente', async () => {
    const onGuardar = vi.fn()
    renderEditorMazo({ mazo: { id: 'm1', c: 'Edgar Markov', c2: '', col: 'WBR', imagenId: 'edicion-2' }, onGuardar, onCancelar: () => {} })
    fireEvent.change(screen.getByLabelText('Comandante'), { target: { value: 'Krenko, Mob Boss' } })
    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ c: 'Krenko, Mob Boss', imagenId: '' }))
  })

  it('con un mazo de dos comandantes, el compañero también tiene su propio selector de imagen', async () => {
    servidor.use(
      http.get('https://api.scryfall.com/cards/search', ({ request }) => {
        const q = new URL(request.url).searchParams.get('q')
        return HttpResponse.json({
          data:
            q === '!"Silas Renn, Seeker Adept"'
              ? [{ id: 'edicion-silas', set_name: 'Commander 2018', image_uris: { small: 'https://cards.scryfall.io/small/silas.jpg' } }]
              : [{ id: 'edicion-ishai', set_name: 'Commander 2018', image_uris: { small: 'https://cards.scryfall.io/small/ishai.jpg' } }],
        })
      }),
    )
    const onGuardar = vi.fn()
    renderEditorMazo({
      mazo: { id: 'm1', c: 'Ishai, Ojutai Dragonspeaker', c2: 'Silas Renn, Seeker Adept', col: 'WU', imagenId: '', imagenId2: '' },
      onGuardar,
      onCancelar: () => {},
    })

    const botones = screen.getAllByText('Cambiar imagen')
    expect(botones).toHaveLength(2)

    // el segundo "Cambiar imagen" es el del compañero
    fireEvent.click(botones[1])
    fireEvent.click(await screen.findByText('Commander 2018'))
    fireEvent.click(screen.getByText('Guardar mazo'))

    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ imagenId: '', imagenId2: 'edicion-silas' }))
  })

  it('cambiar el nombre del compañero limpia la edición fijada del compañero, no la del principal', () => {
    const onGuardar = vi.fn()
    renderEditorMazo({
      mazo: {
        id: 'm1',
        c: 'Ishai, Ojutai Dragonspeaker',
        c2: 'Silas Renn, Seeker Adept',
        col: 'WU',
        imagenId: 'edicion-ishai',
        imagenId2: 'edicion-silas',
      },
      onGuardar,
      onCancelar: () => {},
    })
    fireEvent.change(screen.getByLabelText('Compañero (opcional)'), { target: { value: 'Otro comandante' } })
    fireEvent.click(screen.getByText('Guardar mazo'))
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ imagenId: 'edicion-ishai', imagenId2: '' }))
  })
})

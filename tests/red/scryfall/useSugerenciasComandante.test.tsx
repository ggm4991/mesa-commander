// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useSugerenciasComandante } from '../../../src/red/scryfall/useSugerenciasComandante'
import { ProveedorQueryDePrueba } from '../../ayudantes/queryDePrueba'

const servidor = setupServer()
beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => servidor.resetHandlers())
afterAll(() => servidor.close())

function montar(consulta: string) {
  return renderHook(({ q }) => useSugerenciasComandante(q), {
    initialProps: { q: consulta },
    wrapper: ProveedorQueryDePrueba,
  })
}

describe('useSugerenciasComandante', () => {
  it('con menos de dos letras no consulta a Scryfall', async () => {
    const { result } = montar('e')
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250))
    })
    expect(result.current).toEqual({ sugerencias: [], cargando: false })
  })

  it('espera a que el texto se asiente antes de consultar (debounce)', async () => {
    let peticiones = 0
    servidor.use(
      http.get('https://api.scryfall.com/cards/search', () => {
        peticiones++
        return HttpResponse.json({ data: [{ name: 'Edgar Markov' }] })
      }),
    )
    const { result, rerender } = montar('ed')
    rerender({ q: 'edg' })
    rerender({ q: 'edga' })
    rerender({ q: 'edgar' })

    await waitFor(() => expect(result.current.sugerencias).toEqual(['Edgar Markov']))
    expect(peticiones).toBe(1)
  })

  it('un fallo de red no se propaga: se queda sin sugerencias', async () => {
    servidor.use(http.get('https://api.scryfall.com/cards/search', () => HttpResponse.error()))
    const { result } = montar('edgar')
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
    })
    expect(result.current.sugerencias).toEqual([])
  })
})

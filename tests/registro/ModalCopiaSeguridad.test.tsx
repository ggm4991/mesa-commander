// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ModalCopiaSeguridad } from '../../src/registro/ModalCopiaSeguridad'
import { CONFIG_POR_DEFECTO } from '../../src/almacenamiento/tipos'

const escribirArchivo = vi.fn().mockResolvedValue({ uri: 'file:///cache/mesa-commander.json' })
const compartir = vi.fn().mockResolvedValue(undefined)
let esNativo = false

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => esNativo },
}))
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { writeFile: (...args: unknown[]) => escribirArchivo(...args) },
  Directory: { Cache: 'CACHE' },
  Encoding: { UTF8: 'utf8' },
}))
vi.mock('@capacitor/share', () => ({
  Share: { share: (...args: unknown[]) => compartir(...args) },
}))

function props(over: Partial<Parameters<typeof ModalCopiaSeguridad>[0]> = {}) {
  return {
    partidas: [],
    perfiles: [],
    config: CONFIG_POR_DEFECTO,
    onReemplazarTodo: vi.fn(),
    onCombinar: vi.fn(),
    onRestaurarEjemplo: vi.fn(),
    onCerrar: vi.fn(),
    ...over,
  }
}

describe('ModalCopiaSeguridad — descargar', () => {
  beforeEach(() => {
    esNativo = false
    escribirArchivo.mockClear()
    compartir.mockClear()
  })

  // jsdom no implementa Blob URLs: sin esto, la rama de navegador caería
  // siempre en su mensaje de error, sin relación con lo que se está probando.
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('en la app nativa, escribe el archivo con Filesystem y lo pasa al selector de compartir', async () => {
    esNativo = true
    render(<ModalCopiaSeguridad {...props()} />)
    fireEvent.click(screen.getByText('Descargar archivo'))

    await screen.findByText('Elige dónde guardar el archivo.')
    expect(escribirArchivo).toHaveBeenCalledOnce()
    expect(compartir).toHaveBeenCalledWith(expect.objectContaining({ url: 'file:///cache/mesa-commander.json' }))
  })

  it('en el navegador, descarga con un enlace normal, sin tocar Filesystem ni Share', async () => {
    render(<ModalCopiaSeguridad {...props()} />)
    fireEvent.click(screen.getByText('Descargar archivo'))

    await screen.findByText(/Archivo generado/)
    expect(escribirArchivo).not.toHaveBeenCalled()
    expect(compartir).not.toHaveBeenCalled()
  })
})

import { createContext, useContext } from 'react'

export type MostrarAviso = (texto: string) => void

export const ContextoAviso = createContext<MostrarAviso>(() => {})

/** Reemplaza a `aviso()` de app.html (un toast global). Cualquier componente bajo
 * `<AvisoProvider>` puede llamar a esto para mostrar un mensaje. */
export function useAviso(): MostrarAviso {
  return useContext(ContextoAviso)
}

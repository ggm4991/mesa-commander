import { useEffect, useState } from 'react'

/** Retrasa un valor que cambia rápido (cada pulsación de tecla) para no lanzar una
 * petición a Scryfall por cada letra escrita. */
export function useDebounce<T>(valor: T, ms: number): T {
  const [retrasado, setRetrasado] = useState(valor)
  useEffect(() => {
    const id = setTimeout(() => setRetrasado(valor), ms)
    return () => clearTimeout(id)
  }, [valor, ms])
  return retrasado
}

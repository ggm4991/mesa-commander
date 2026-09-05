import { useQuery } from '@tanstack/react-query'
import { buscarNombres } from './cliente'
import { useDebounce } from './useDebounce'

const MS_DEBOUNCE = 200
const MIN_LETRAS = 2

export interface SugerenciasComandante {
  sugerencias: string[]
  cargando: boolean
}

/**
 * Nombres de comandante que sugiere Scryfall mientras se escribe. Se activa (y
 * cachea por texto) solo mientras el campo está enfocado — quien llama pasa `''`
 * cuando no lo está — así una prueba que solo cambia el valor del campo sin
 * enfocarlo nunca dispara una petición real. Un fallo de red no se propaga: sin
 * sugerencias, el campo se sigue pudiendo rellenar a mano como siempre.
 */
export function useSugerenciasComandante(consulta: string): SugerenciasComandante {
  const retrasada = useDebounce(consulta.trim(), MS_DEBOUNCE)
  const activa = retrasada.length >= MIN_LETRAS
  const { data, isFetching } = useQuery({
    queryKey: ['scryfall', 'autocomplete', retrasada.toLowerCase()],
    queryFn: () => buscarNombres(retrasada),
    enabled: activa,
  })
  return { sugerencias: activa ? (data ?? []) : [], cargando: activa && isFetching }
}

import { useQuery } from '@tanstack/react-query'
import { buscarPorNombreExacto } from './cliente'

/**
 * Imagen del comandante de un asiento, para su fondo en el tablero. Usa la misma
 * clave de caché que `CampoComandante` (`['scryfall','named',nombre]`): si el mazo
 * se creó eligiendo una sugerencia, la imagen ya está en caché y aparece al
 * instante, incluso sin red. Sin nombre, sin coincidencia en Scryfall, o con la red
 * caída, no hay imagen — nunca lanza ni avisa, es responsabilidad de quien llama
 * (ver `fondoAsiento`) seguir mostrando el fondo de color de siempre (ADR 0014).
 */
export function useImagenComandante(nombre: string | undefined): string | null {
  const limpio = (nombre || '').trim()
  const { data } = useQuery({
    queryKey: ['scryfall', 'named', limpio.toLowerCase()],
    queryFn: ({ signal }) => buscarPorNombreExacto(limpio, signal),
    enabled: limpio.length > 0,
  })
  return data?.imagen ?? null
}

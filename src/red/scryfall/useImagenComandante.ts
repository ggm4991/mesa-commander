import { useQuery } from '@tanstack/react-query'
import { buscarPorId, buscarPorNombreExacto } from './cliente'

/**
 * Imagen del comandante de un asiento, para su fondo en el tablero. Con `imagenId`
 * (una edición fijada a mano, ver `buscarImpresiones`) consulta esa carta exacta;
 * sin él, la edición de referencia del nombre. Comparte caché con `CampoComandante`
 * y `SelectorImagenComandante` (misma clave `['scryfall', ...]`): si el mazo se creó
 * eligiendo una sugerencia o una edición concreta, la imagen ya está en caché y
 * aparece al instante, incluso sin red. Sin nombre, sin coincidencia en Scryfall, o
 * con la red caída, no hay imagen — nunca lanza ni avisa, es responsabilidad de
 * quien llama (ver `fondoAsiento`) seguir mostrando el fondo de color de siempre
 * (ADR 0014).
 */
export function useImagenComandante(nombre: string | undefined, imagenId?: string): string | null {
  const limpio = (nombre || '').trim()
  const fijada = (imagenId || '').trim()
  const { data } = useQuery({
    queryKey: fijada ? ['scryfall', 'id', fijada] : ['scryfall', 'named', limpio.toLowerCase()],
    queryFn: ({ signal }) => (fijada ? buscarPorId(fijada, signal) : buscarPorNombreExacto(limpio, signal)),
    enabled: fijada.length > 0 || limpio.length > 0,
  })
  return data?.imagen ?? null
}

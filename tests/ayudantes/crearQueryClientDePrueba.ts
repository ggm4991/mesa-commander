import { QueryClient } from '@tanstack/react-query'

/** Sin reintentos: en los tests, un error de red tiene que fallar (o degradar) al
 * primer intento, no reintentar varias veces alargando el test. */
export function crearQueryClientDePrueba(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

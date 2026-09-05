import { QueryClient } from '@tanstack/react-query'

/**
 * Un único `QueryClient` para toda la app. La identidad de color y la imagen de un
 * comandante no cambian nunca (una carta ya impresa no se retoca), así que la caché
 * puede ser muy larga: no tiene sentido volver a pedirle a Scryfall algo que ya
 * contestó, ni siquiera al volver a abrir la app — solo un `retry` corto, para no
 * dejar el formulario esperando una red que no va a responder.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

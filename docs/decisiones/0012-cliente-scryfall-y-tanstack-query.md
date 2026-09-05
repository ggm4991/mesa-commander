# 0012. Cliente de Scryfall puro, sin caché propia, y una frontera de imports

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

La Fase 4 añade autocompletado de comandantes y su identidad de color contra
la API pública de Scryfall (sin credenciales), que ya estaba en el apartado
"Pendiente" del `CLAUDE.md` original. El plan de migración fijaba de
antemano el resto del stack para esto — TanStack Query para caché y
comportamiento offline, y una regla de que **nada bajo `src/motor/` ni
`src/almacenamiento/` puede importar de `src/red/`** — pero quedaban por
decidir la forma exacta del cliente y cómo probarlo sin llamar a la red de
verdad en cada `npm run test:vitest`.

## Decisión

- **`src/red/scryfall/cliente.ts` son dos funciones `fetch` puras**,
  `buscarNombres` (autocompletar) y `buscarPorNombreExacto` (identidad de
  color + imagen), sin caché ni estado propios — la caché es responsabilidad
  de TanStack Query, una capa por encima, para no duplicar esa lógica.
- **Un nombre que no existe en Scryfall devuelve `null`; un fallo de verdad
  (servidor caído, sin red, error 5xx) lanza una excepción.** Son dos
  situaciones distintas para quien llame: "este comandante no está en
  Scryfall" es una respuesta válida y esperable (nombre mal escrito, o un
  comandante que Scryfall no indexa), mientras que un fallo de red es lo que
  activa la degradación no bloqueante que pide el plan (Fase 4, siguiente
  commit).
- **La identidad de color que devuelve Scryfall se reordena a WUBRG** con el
  mismo orden que ya usa `componentes/mesa/colores.ts`, para que se pueda
  comparar o mostrar igual que una identidad escrita a mano.
- **`src/red/queryClient.ts` fija un `staleTime` de un día y un `retry` de
  solo 1**: la identidad de color de una carta ya impresa no cambia nunca,
  así que cachear mucho tiempo no arriesga nada; y un `retry` corto evita
  dejar un formulario esperando una red que no va a responder.
- **La frontera de imports se hace cumplir con `oxlint`**, no a mano:
  `.oxlintrc.json` tiene un `overrides` para `src/motor/**` y
  `src/almacenamiento/**` con `no-restricted-imports` contra cualquier ruta
  que contenga `red/`. Se comprobó a propósito con un import temporal antes
  de retirarlo: `oxlint` lo señala como error.
- **Los tests usan `msw`** (`setupServer`, con `onUnhandledRequest:'error'`
  para detectar cualquier llamada no esperada) en vez de mockear `fetch` a
  mano: simula la URL, el método y el cuerpo de verdad, y cubre los cuatro
  casos que pedía el plan — éxito, 404 (sin ser un error), 500, y sin red
  (`HttpResponse.error()`), más cancelación con `AbortSignal` para cuando el
  autocompletado tenga que descartar una búsqueda a medias.

## Alternativas consideradas

- **Que `buscarPorNombreExacto` también lance en un 404.** Se descarta
  porque mezclaría "no se encontró" con "algo falló" en el mismo tipo de
  error, obligando a quien llama a inspeccionar el mensaje para distinguirlos
  en vez de comprobar `=== null`.
- **Cachear las respuestas a mano dentro del cliente** (un `Map` de nombre a
  resultado). Se descarta porque es exactamente lo que ya hace TanStack
  Query con `staleTime`/`gcTime`, con invalidación e integración en React
  incluidas — duplicarlo aquí solo daría dos cachés desincronizadas.
- **Mockear `global.fetch` con `vi.fn()`.** Más simple de escribir, pero no
  comprueba la URL ni el método real, y no distingue "faltan credenciales"
  de "la URL está mal construida": un cambio accidental en la ruta seguiría
  pasando los tests.

## Consecuencias

- Los hooks que consuman este cliente desde componentes de mesa (siguiente
  commit de la Fase 4) no necesitan su propio manejo de caché ni de
  reintentos: los heredan de `queryClient`.
- Cualquier función nueva en `src/motor/` o `src/almacenamiento/` que
  necesite datos de Scryfall está mal ubicada — la regla de `oxlint` lo
  impedirá antes de que llegue a revisión.

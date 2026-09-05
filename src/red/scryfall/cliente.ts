const BASE = 'https://api.scryfall.com'

/** Mismo orden WUBRG que usa el resto de la app (ver `componentes/mesa/colores.ts`),
 * para que una identidad venida de Scryfall se pueda comparar con una escrita a mano. */
const ORDEN_COLORES = ['W', 'U', 'B', 'R', 'G'] as const

function ordenarIdentidad(colores: string[]): string {
  return ORDEN_COLORES.filter((c) => colores.includes(c)).join('')
}

export interface InfoComandante {
  nombre: string
  identidad: string
  /** Solo la ilustración (recorte `art_crop` de Scryfall), sin marco ni texto. */
  imagen: string | null
}

/** Una edición concreta de un comandante, para elegir qué ilustración usar cuando
 * la carta se ha reimprimido con arte distinto (ver `buscarImpresiones`). */
export interface Impresion {
  id: string
  edicion: string
  imagen: string | null
  miniatura: string | null
}

interface ImagenesScryfall {
  art_crop?: string
  small?: string
}

interface CartaScryfall {
  id: string
  name: string
  set_name: string
  color_identity?: string[]
  image_uris?: ImagenesScryfall
  /** Las cartas de dos caras (transformar, modales...) llevan la imagen aquí en vez de en la raíz. */
  card_faces?: { image_uris?: ImagenesScryfall }[]
}

function imagenDe(carta: CartaScryfall, tamano: keyof ImagenesScryfall): string | null {
  return carta.image_uris?.[tamano] ?? carta.card_faces?.[0]?.image_uris?.[tamano] ?? null
}

function aInfoComandante(carta: CartaScryfall): InfoComandante {
  return { nombre: carta.name, identidad: ordenarIdentidad(carta.color_identity ?? []), imagen: imagenDe(carta, 'art_crop') }
}

/**
 * Sugerencias de nombre mientras se escribe, para el autocompletado de comandantes.
 * Por debajo de 2 letras Scryfall no devuelve nada útil, así que se corta antes de
 * llamar. Lanza si Scryfall responde con un error de servidor o si no hay red — la
 * degradación (seguir permitiendo escribir el nombre a mano) es cosa de quien llama,
 * nunca de este cliente.
 */
export async function buscarNombres(consulta: string, señal?: AbortSignal): Promise<string[]> {
  const q = consulta.trim()
  if (q.length < 2) return []
  const resp = await fetch(`${BASE}/cards/autocomplete?q=${encodeURIComponent(q)}`, { signal: señal })
  if (!resp.ok) throw new Error(`Scryfall respondió ${resp.status} al autocompletar`)
  const datos = (await resp.json()) as { data?: string[] }
  return datos.data ?? []
}

/**
 * Identidad de color e imagen de un comandante por su nombre exacto en inglés (que es
 * como se guardan en la app — ver convención de nombres en CLAUDE.md). Trae siempre la
 * edición que Scryfall considera la impresión "de referencia" de esa carta. Un nombre
 * que no existe en Scryfall devuelve `null`, no un error: no encontrar la carta es un
 * resultado normal (nombre mal escrito, o un comandante de un set no soportado), no
 * un fallo de red.
 */
export async function buscarPorNombreExacto(nombre: string, señal?: AbortSignal): Promise<InfoComandante | null> {
  const resp = await fetch(`${BASE}/cards/named?exact=${encodeURIComponent(nombre)}`, { signal: señal })
  if (resp.status === 404) return null
  if (!resp.ok) throw new Error(`Scryfall respondió ${resp.status} al buscar "${nombre}"`)
  return aInfoComandante((await resp.json()) as CartaScryfall)
}

/** Igual que `buscarPorNombreExacto`, pero para una edición concreta ya elegida a
 * mano (ver `buscarImpresiones`) en vez de la de referencia del nombre. */
export async function buscarPorId(id: string, señal?: AbortSignal): Promise<InfoComandante | null> {
  const resp = await fetch(`${BASE}/cards/${encodeURIComponent(id)}`, { signal: señal })
  if (resp.status === 404) return null
  if (!resp.ok) throw new Error(`Scryfall respondió ${resp.status} al buscar la carta ${id}`)
  return aInfoComandante((await resp.json()) as CartaScryfall)
}

/**
 * Todas las ediciones impresas de un comandante por su nombre exacto, más recientes
 * primero — para poder elegir con qué ilustración concreta se representa en la mesa,
 * ya que una misma carta puede tener arte distinto en cada reimpresión. Un nombre sin
 * ninguna impresión devuelve una lista vacía, no un error.
 */
export async function buscarImpresiones(nombre: string, señal?: AbortSignal): Promise<Impresion[]> {
  const q = `!"${nombre}"`
  const resp = await fetch(`${BASE}/cards/search?q=${encodeURIComponent(q)}&unique=prints&order=released`, { signal: señal })
  if (resp.status === 404) return []
  if (!resp.ok) throw new Error(`Scryfall respondió ${resp.status} al buscar impresiones de "${nombre}"`)
  const datos = (await resp.json()) as { data?: CartaScryfall[] }
  return (datos.data ?? []).map((carta) => ({
    id: carta.id,
    edicion: carta.set_name,
    imagen: imagenDe(carta, 'art_crop'),
    miniatura: imagenDe(carta, 'small'),
  }))
}

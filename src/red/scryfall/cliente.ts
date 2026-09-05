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

interface CartaScryfall {
  name: string
  color_identity?: string[]
  /** `art_crop`: solo la ilustración, sin marco ni texto — pensada para fondos, a
   * diferencia de `normal` (la carta entera, ilegible en el hueco de un asiento). */
  image_uris?: { art_crop?: string }
  /** Las cartas de dos caras (transformar, modales...) llevan la imagen aquí en vez de en la raíz. */
  card_faces?: { image_uris?: { art_crop?: string } }[]
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
 * como se guardan en la app — ver convención de nombres en CLAUDE.md). Un nombre que
 * no existe en Scryfall devuelve `null`, no un error: no encontrar la carta es un
 * resultado normal (nombre mal escrito, o un comandante de un set no soportado), no
 * un fallo de red.
 */
export async function buscarPorNombreExacto(nombre: string, señal?: AbortSignal): Promise<InfoComandante | null> {
  const resp = await fetch(`${BASE}/cards/named?exact=${encodeURIComponent(nombre)}`, { signal: señal })
  if (resp.status === 404) return null
  if (!resp.ok) throw new Error(`Scryfall respondió ${resp.status} al buscar "${nombre}"`)
  const carta = (await resp.json()) as CartaScryfall
  const imagen = carta.image_uris?.art_crop ?? carta.card_faces?.[0]?.image_uris?.art_crop ?? null
  return { nombre: carta.name, identidad: ordenarIdentidad(carta.color_identity ?? []), imagen }
}

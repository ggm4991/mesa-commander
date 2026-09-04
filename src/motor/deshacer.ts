import { registrar } from './partida'
import type { Juego } from './tipos'

const TOPE_SNAPSHOTS = 40
const AGRUPAR_MS = 1500

export interface ResultadoFoto {
  juego: Juego
  /** Pasar de vuelta como `ultimaFoto` en la siguiente llamada con `agrupar: true`. */
  ultimaFoto: number
}

export interface OpcionesFoto {
  /** Agrupa fotos repetidas en menos de 1500ms (pulsaciones largas) en un solo snapshot. */
  agrupar?: boolean
  ultimaFoto?: number
  ahora?: number
}

/**
 * Snapshot de `juego` para poder deshacer luego. El original guardaba el instante de
 * la última foto (`ultimaFoto`) en una variable de módulo; aquí es responsabilidad de
 * quien llama (el store de la Fase 3) llevarlo de una llamada a la siguiente, para que
 * esta función siga siendo pura.
 */
export function foto(juego: Juego, opciones: OpcionesFoto = {}): ResultadoFoto {
  const ahora = opciones.ahora ?? Date.now()
  const ultimaFotoPrevia = opciones.ultimaFoto ?? 0
  if (opciones.agrupar && ahora - ultimaFotoPrevia < AGRUPAR_MS) {
    return { juego, ultimaFoto: ultimaFotoPrevia }
  }
  const { undo, log: _log, ...resto } = juego
  const nuevoUndo = [...undo, JSON.stringify(resto)]
  if (nuevoUndo.length > TOPE_SNAPSHOTS) nuevoUndo.shift()
  return { juego: { ...juego, undo: nuevoUndo }, ultimaFoto: ahora }
}

/** Sin snapshots que deshacer, devuelve `juego` tal cual (el original mostraba un aviso). */
export function deshacer(juego: Juego, ahora: number = Date.now()): Juego {
  if (!juego.undo.length) return juego
  const undoRestante = juego.undo.slice(0, -1)
  const previo = JSON.parse(juego.undo[juego.undo.length - 1]) as Omit<Juego, 'undo' | 'log'>
  const restaurado: Juego = { ...previo, undo: undoRestante, log: juego.log }
  return registrar(restaurado, 'Se deshizo la última acción', ahora)
}

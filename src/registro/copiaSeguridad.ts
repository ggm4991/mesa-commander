import { normalizarPartidas } from '../almacenamiento/repositorio'
import type { Config } from '../almacenamiento/tipos'
import { migrarPerfiles } from '../motor/migraciones'
import type { Partida, Perfil } from '../motor/tipos'
import { validar } from './validar'

const FORMATO = 2

export interface PaqueteCompleto {
  app: 'mesa-commander'
  formato: number
  exportado: string
  partidas: Partida[]
  perfiles: Perfil[]
  config: Config
}

export function paqueteCompleto(partidas: Partida[], perfiles: Perfil[], config: Config): PaqueteCompleto {
  return { app: 'mesa-commander', formato: FORMATO, exportado: new Date().toISOString(), partidas, perfiles, config }
}

export interface PaqueteRevisado {
  partidas: Partida[]
  perfiles: Perfil[]
  config: Partial<Config> | null
}

/** Portado de `revisarPaquete()`: admite tanto la copia completa como una lista
 * suelta de partidas, y valida cada partida (con el mismo `validar()` del alta a
 * mano) antes de aceptar el archivo, para no dejar entrar datos que luego no se
 * puedan ni mostrar en el registro. */
export function revisarPaquete(txt: string): PaqueteRevisado {
  const datos = JSON.parse(txt)
  if (!datos || typeof datos !== 'object') throw new Error('El archivo no contiene datos de la app.')
  const p = Array.isArray(datos) ? { partidas: datos } : datos
  const partidas: Partida[] = Array.isArray(p.partidas) ? p.partidas : []
  const perfiles: Record<string, unknown>[] = Array.isArray(p.perfiles) ? p.perfiles : []
  if (!partidas.length && !perfiles.length) throw new Error('No hay ni partidas ni perfiles que cargar.')
  const fallos = partidas.flatMap((g, i) => validar(g).map((e) => `Partida ${i + 1}: ${e}`))
  if (fallos.length) throw new Error(fallos.slice(0, 4).join(' '))
  return {
    partidas: normalizarPartidas(partidas),
    perfiles: migrarPerfiles(perfiles),
    config: p.config && typeof p.config === 'object' ? (p.config as Partial<Config>) : null,
  }
}

export const huellaPartida = (g: Partida): string => `${g.fecha}|${g.seats.map((x) => x.j).sort().join(',')}`

export const huellaMazo = (m: { c?: string; c2?: string; col?: string }): string =>
  `${(m.c || '').toLowerCase()}|${(m.c2 || '').toLowerCase()}|${m.col || ''}`

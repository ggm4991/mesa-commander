import { migrarJuego, migrarPerfiles } from '../motor/migraciones'
import type { Juego, Partida, Perfil } from '../motor/tipos'
import { uid } from '../motor/utilidades'
import { CLAVES } from './claves'
import { CONFIG_POR_DEFECTO } from './tipos'
import type { AlmacenPersistente, Config } from './tipos'

async function leer<T>(almacen: AlmacenPersistente, clave: string): Promise<T | null> {
  try {
    const r = await almacen.get(clave)
    return r && r.value ? (JSON.parse(r.value) as T) : null
  } catch {
    return null
  }
}

/** true si se pudo escribir; false si el almacén falló (el llamador decide qué avisar). */
async function escribir(almacen: AlmacenPersistente, clave: string, valor: unknown): Promise<boolean> {
  try {
    await almacen.set(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

export function normalizarPartidas(lista: Partida[]): Partida[] {
  return lista.map((p) => ({ ...p, id: p.id || uid() })).sort((a, b) => b.fecha.localeCompare(a.fecha))
}

/** Sin partidas guardadas todavía, devuelve `[]`: sembrar los datos de ejemplo (DEMO)
 * en el primer arranque es decisión de la app (Fase 3), no de este repositorio. */
export async function leerPartidas(almacen: AlmacenPersistente): Promise<Partida[]> {
  return (await leer<Partida[]>(almacen, CLAVES.partidas)) ?? []
}

/** Guarda tal cual se recibe — llamar a `normalizarPartidas` antes si hace falta
 * asegurar ids y el orden por fecha, igual que hacía `guardarPartidas()` en el original. */
export async function guardarPartidas(almacen: AlmacenPersistente, partidas: Partida[]): Promise<boolean> {
  return escribir(almacen, CLAVES.partidas, partidas)
}

export async function leerPerfiles(almacen: AlmacenPersistente): Promise<Perfil[]> {
  const datos = await leer<Record<string, unknown>[]>(almacen, CLAVES.perfiles)
  return migrarPerfiles(datos ?? [])
}

export async function guardarPerfiles(almacen: AlmacenPersistente, perfiles: Perfil[]): Promise<boolean> {
  return escribir(almacen, CLAVES.perfiles, perfiles)
}

export async function leerConfig(almacen: AlmacenPersistente): Promise<Config> {
  const datos = await leer<Partial<Config>>(almacen, CLAVES.config)
  return { ...CONFIG_POR_DEFECTO, ...(datos ?? {}) }
}

export async function guardarConfig(almacen: AlmacenPersistente, config: Config): Promise<boolean> {
  return escribir(almacen, CLAVES.config, config)
}

/** Reinicia `undo` (nunca se persiste) y `tIni` (para que el tiempo transcurrido no
 * salte por el rato que la app estuvo cerrada) al recuperar una partida en curso. */
export async function leerJuego(almacen: AlmacenPersistente, ahora: number = Date.now()): Promise<Juego | null> {
  const datos = await leer<Record<string, unknown>>(almacen, CLAVES.juego)
  if (!datos || !datos.j) return null
  const juego = migrarJuego({ ...datos, undo: [] })
  return { ...juego, tIni: ahora }
}

export async function guardarJuego(almacen: AlmacenPersistente, juego: Juego | null): Promise<boolean> {
  if (!juego) return escribir(almacen, CLAVES.juego, null)
  const { undo: _undo, ...limpio } = juego
  return escribir(almacen, CLAVES.juego, limpio)
}

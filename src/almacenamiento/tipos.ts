export interface ValorAlmacen {
  /** null si la clave nunca se guardó o se borró — igual que `@capacitor/preferences`. */
  value: string | null
}

/**
 * Mismo contrato que ya cumplía `window.storage` en app.html: get/set async por
 * clave, con el valor siempre como texto (JSON serializado por quien llama). Tanto
 * el adaptador de Capacitor como el de memoria para tests, y más adelante el que
 * hable con Supabase, implementan esta única interfaz.
 */
export interface AlmacenPersistente {
  get(clave: string): Promise<ValorAlmacen>
  set(clave: string, valor: string): Promise<void>
}

export interface Config {
  vidaInicial: number
  limiteTurno: number
  /** Disposición de mesa por número de jugadores; su forma concreta la define la Fase 3. */
  disposicion: Record<string, unknown>
  sonido: boolean
}

export const CONFIG_POR_DEFECTO: Config = {
  vidaInicial: 40,
  limiteTurno: 0,
  disposicion: {},
  sonido: true,
}

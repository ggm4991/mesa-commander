// Formas de datos del motor de partida, portadas de app.html (secciones 2, 7 y 10).
// `dispo` queda sin tipar todavía: la disposición de mesa (DISPOS/LAYOUTS) es una
// mecánica de la pantalla previa que se porta en la Fase 3 (UI); el motor solo la
// transporta dentro de `cfg`, nunca la interpreta.

export type Identidad = { W: number; U: number; B: number; R: number; G: number; C: number }

export interface Asiento {
  nombre: string
  comandante?: string
  comandante2?: string
  colores?: string
  /** Edición de Scryfall fijada a mano para la ilustración del comandante (ver
   * `red/scryfall/buscarImpresiones`); sin ella, se usa la de referencia del nombre. */
  imagenId?: string
}

export type ContadorClave = 'ven' | 'exp' | 'ene' | 'tax' | 'tes' | 'tor'

export interface Jugador {
  n: string
  c: string
  c2: string
  col: string
  /** Igual que `Asiento.imagenId`: '' si no se fijó ninguna a mano. */
  imagenId: string
  vida: number
  /** Daño de comandante por comandante, no por jugador (regla 903.10a). Clave "asiento:hueco". */
  dmg: Record<string, number>
  ven: number
  exp: number
  ene: number
  tax: number
  tes: number
  tor: number
  mana: Identidad
  bendicion: boolean
  rehacer: number
  fuera: number
  tTotal: number
  tMax: number
  out: boolean
}

export interface EntradaLog {
  t: number
  txt: string
}

export interface ConfigPartida {
  vida: number
  limite: number
  dispo: unknown
}

export interface Juego {
  id: string
  inicio: string
  cfg: ConfigPartida
  j: Jugador[]
  /** null = la partida espera a que alguien toque su asiento para arrancar. */
  turno: number | null
  tIni: number
  /** Segundos de turno acumulados a través de las pausas; pausar no cierra el turno. */
  acum: number
  pausado: boolean
  monarca: number | null
  iniciativa: number | null
  dia: 'dia' | 'noche' | null
  log: EntradaLog[]
  fin: boolean
  /** Snapshots JSON para deshacer(); nunca se persiste (ver almacenamiento/guardarJuego en Fase 2). */
  undo: string[]
}

export interface Mazo {
  id: string
  c: string
  c2: string
  col: string
  /** Igual que `Asiento.imagenId`: '' si no se fijó ninguna a mano. */
  imagenId: string
}

export interface Perfil {
  id: string
  nombre: string
  ultimo: string | null
  mazos: Mazo[]
}

export type Resultado = 'V' | 'D' | 'E'

export interface AsientoPartida {
  j: string
  c: string
  c2?: string
  id: string
  r: Resultado
  rehacer: number
  tiempo: number
  turno: number
  vidaFinal?: number
}

export interface Partida {
  id: string
  fecha: string
  duracion: number
  seats: AsientoPartida[]
}

import { nuevoJugador } from './jugador'
import type { Asiento, ConfigPartida, Juego } from './tipos'
import { reloj, uid } from './utilidades'

/**
 * Añade una línea al historial de la partida. Es la única forma en que el motor
 * escribe en `log`: cada mutador de más abajo pasa por aquí, igual que el
 * `registrar()` original.
 */
export function registrar(juego: Juego, texto: string, ahora: number = Date.now()): Juego {
  const t = Math.round((ahora - new Date(juego.inicio).getTime()) / 1000)
  const log = [{ t, txt: texto }, ...juego.log].slice(0, 400)
  return { ...juego, log }
}

export interface OpcionesEmpezarPartida {
  asientos: Asiento[]
  vidaInicial: number
  limiteTurno: number
  /** Disposición de mesa elegida en la pantalla previa (Fase 3); el motor no la interpreta. */
  dispo: unknown
  /** Asiento sorteado antes de empezar, o null/undefined para esperar el primer toque. */
  turnoInicial?: number | null
  ahora?: number
}

export function empezarPartida(opciones: OpcionesEmpezarPartida): Juego {
  const ahora = opciones.ahora ?? Date.now()
  const j = opciones.asientos.map((a) => nuevoJugador(a, opciones.vidaInicial))
  const turnoInicial = opciones.turnoInicial
  const turno = turnoInicial != null && opciones.asientos[turnoInicial] ? turnoInicial : null
  const cfg: ConfigPartida = { vida: opciones.vidaInicial, limite: opciones.limiteTurno, dispo: opciones.dispo }

  let juego: Juego = {
    id: uid(),
    inicio: new Date(ahora).toISOString(),
    cfg,
    j,
    turno,
    tIni: ahora,
    acum: 0,
    pausado: false,
    monarca: null,
    iniciativa: null,
    dia: null,
    log: [],
    fin: false,
    undo: [],
  }

  juego = registrar(juego, `Empieza la partida con ${juego.j.length} jugadores a ${juego.cfg.vida} vidas`, ahora)
  if (juego.turno != null) juego = registrar(juego, `Empieza ${juego.j[juego.turno].n}`, ahora)
  return juego
}

/** Segundos que lleva el turno actual, sumando los tramos anteriores a las pausas. */
export function transcurrido(juego: Juego, ahora: number = Date.now()): number {
  if (juego.turno == null) return 0
  return (juego.acum || 0) + (juego.pausado ? 0 : (ahora - juego.tIni) / 1000)
}

export function alternarPausa(juego: Juego, ahora: number = Date.now()): Juego {
  if (juego.turno == null) return juego
  const j = juego.j[juego.turno]
  if (juego.pausado) {
    return registrar({ ...juego, tIni: ahora, pausado: false }, `Se reanuda el turno de ${j.n}`, ahora)
  }
  const acum = transcurrido(juego, ahora)
  return registrar(
    { ...juego, acum, pausado: true },
    `Tiempo en pausa en el turno de ${j.n} a los ${reloj(acum)}`,
    ahora,
  )
}

/** Sin sorteo previo, la partida espera a que alguien toque su asiento. */
export function elegirInicio(juego: Juego, i: number, ahora: number = Date.now()): Juego {
  if (juego.turno != null) return juego
  const siguiente = { ...juego, turno: i, tIni: ahora, acum: 0, pausado: false }
  return registrar(siguiente, `Empieza ${siguiente.j[i].n}`, ahora)
}

export function pasarTurno(juego: Juego, ahora: number = Date.now()): Juego {
  if (juego.turno == null) return juego
  const dur = transcurrido(juego, ahora)
  const actual = juego.j[juego.turno]
  const pasado = juego.cfg.limite > 0 && dur > juego.cfg.limite
  const actualActualizado = {
    ...actual,
    tTotal: actual.tTotal + dur,
    tMax: Math.max(actual.tMax, dur),
    fuera: pasado ? actual.fuera + 1 : actual.fuera,
  }
  const jugadores = juego.j.map((x, idx) => (idx === juego.turno ? actualActualizado : x))
  let siguiente = registrar(
    { ...juego, j: jugadores },
    `Turno de ${actualActualizado.n}: ${reloj(dur)}${pasado ? ' — se pasó del límite' : ''}`,
    ahora,
  )

  let n = juego.turno
  for (let k = 0; k < siguiente.j.length; k++) {
    n = (n + 1) % siguiente.j.length
    if (!siguiente.j[n].out) break
  }
  return { ...siguiente, turno: n, tIni: ahora, acum: 0, pausado: false }
}

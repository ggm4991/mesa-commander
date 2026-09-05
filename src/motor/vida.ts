import { registrar } from './partida'
import type { ContadorClave, Identidad, Juego } from './tipos'

/** Regla 903.10a: cada comandante lleva su propia cuenta de daño, rastreada por
 * comandante y por jugador, sin importar quién lo controle. Por eso las claves son
 * "asiento:hueco" y el propio comandante de uno también aparece en su lista: si le
 * roban su comandante, puede morir por su propio daño. */
export const DANO_COMANDANTE_LETAL = 21
export const VENENO_LETAL = 10

export interface ComandanteEnMesa {
  clave: string
  nombre: string
  dueno: string
  k: number
  col: string
  /** La edición fijada a mano para *esta* carta en concreto — `x.imagenId` para el
   * hueco 0 (principal), `x.imagenId2` para el 1 (compañero). */
  imagenId: string
}

export function comandantesEnMesa(juego: Juego): ComandanteEnMesa[] {
  const lista: ComandanteEnMesa[] = []
  juego.j.forEach((x, k) => {
    lista.push({ clave: `${k}:0`, nombre: x.c || 'Comandante sin nombre', dueno: x.n, k, col: x.col, imagenId: x.imagenId })
    if (x.c2) lista.push({ clave: `${k}:1`, nombre: x.c2, dueno: x.n, k, col: x.col, imagenId: x.imagenId2 })
  })
  return lista
}

export function nombreComandante(juego: Juego, clave: string): string {
  const c = comandantesEnMesa(juego).find((x) => x.clave === clave)
  return c ? c.nombre : 'Comandante'
}

/**
 * Las fuentes de daño agrupadas por jugador (un grupo por asiento, nunca vacío: al
 * menos su propio comandante) en vez de una lista plana. El cuadrado de daño del
 * tablero reparte el espacio general según el número de *jugadores*, no de
 * comandantes — así un compañero no descuadra la rejilla general, solo parte en dos
 * el hueco de quien lo lleva (ver ADR 0019).
 */
export function comandantesAgrupadosPorJugador(juego: Juego): ComandanteEnMesa[][] {
  const plana = comandantesEnMesa(juego)
  return juego.j.map((_, k) => plana.filter((c) => c.k === k))
}

export function revisar(juego: Juego, i: number, ahora: number = Date.now()): Juego {
  const j = juego.j[i]
  const letalCmd = Object.values(j.dmg).some((v) => v >= DANO_COMANDANTE_LETAL)
  const fuera = j.vida <= 0 || j.ven >= VENENO_LETAL || letalCmd
  if (!fuera || j.out) return juego
  const jActualizado = { ...j, out: true }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  return registrar({ ...juego, j: jugadores }, `${jActualizado.n} queda fuera de la partida`, ahora)
}

/** Índice del único jugador que queda si la partida debe terminar, o null si sigue. */
export function comprobarFinal(juego: Juego): number | null {
  if (juego.fin) return null
  const vivos = juego.j.filter((x) => !x.out)
  if (juego.j.length > 1 && vivos.length === 1) return juego.j.indexOf(vivos[0])
  return null
}

/**
 * Cambia la vida de un jugador. A diferencia del `cambiarVida` original, no escribe
 * en el historial: en app.html eso se hacía con un `setTimeout` de 2s para agrupar
 * pulsaciones repetidas en una sola línea, que es una optimización de UI (evitar
 * spam en el registro y en el guardado), no una regla del juego. Esa agrupación se
 * porta en la Fase 3, en el store que envuelve a este motor.
 */
export function cambiarVida(juego: Juego, i: number, delta: number, ahora: number = Date.now()): Juego {
  const jugadores = juego.j.map((x, idx) => (idx === i ? { ...x, vida: x.vida + delta } : x))
  return revisar({ ...juego, j: jugadores }, i, ahora)
}

export function danoComandante(
  juego: Juego,
  i: number,
  clave: string,
  delta: number,
  ahora: number = Date.now(),
): Juego {
  const j = juego.j[i]
  const antes = j.dmg[clave] || 0
  const nuevoValor = Math.max(0, antes + delta)
  const jActualizado = { ...j, dmg: { ...j.dmg, [clave]: nuevoValor }, vida: j.vida - (nuevoValor - antes) }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  const siguiente = registrar(
    { ...juego, j: jugadores },
    `${nombreComandante(juego, clave)} deja a ${jActualizado.n} en ${nuevoValor} de daño de comandante`,
    ahora,
  )
  return revisar(siguiente, i, ahora)
}

export const CONTADORES: { clave: ContadorClave; nombre: string; letal?: number; paso?: number }[] = [
  { clave: 'ven', nombre: 'Infectar', letal: VENENO_LETAL },
  { clave: 'exp', nombre: 'Experiencia' },
  { clave: 'ene', nombre: 'Energía' },
  { clave: 'tax', nombre: 'Impuesto de comandante', paso: 2 },
  { clave: 'tes', nombre: 'Tesoros' },
  { clave: 'tor', nombre: 'Tormenta' },
]

export function contador(
  juego: Juego,
  i: number,
  clave: ContadorClave,
  delta: number,
  ahora: number = Date.now(),
): Juego {
  const j = juego.j[i]
  const valor = Math.max(0, j[clave] + delta)
  const jActualizado = { ...j, [clave]: valor }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  let siguiente: Juego = { ...juego, j: jugadores }
  if (delta) {
    const meta = CONTADORES.find((c) => c.clave === clave)!
    siguiente = registrar(siguiente, `${jActualizado.n}: ${meta.nombre} a ${valor}`, ahora)
  }
  return revisar(siguiente, i, ahora)
}

/** Una jugada retirada: bajó la tierra, se arrepintió y jugó otra. No tiene nada que
 * ver con el botón de deshacer, que solo corrige lo apuntado en la app. */
export function retirada(juego: Juego, i: number, delta: number, ahora: number = Date.now()): Juego {
  const j = juego.j[i]
  const valor = Math.max(0, j.rehacer + delta)
  const jActualizado = { ...j, rehacer: valor }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  const siguiente: Juego = { ...juego, j: jugadores }
  if (delta > 0) {
    return registrar(siguiente, `${jActualizado.n} retira una jugada y la rehace (van ${valor})`, ahora)
  }
  return siguiente
}

/** El menú de asiento también deja ajustar `rehacer` libremente (a diferencia de
 * `retirada()`, en cualquier dirección) y siempre lo anota, aunque baje. */
export function ajustarRehacer(juego: Juego, i: number, delta: number, ahora: number = Date.now()): Juego {
  const j = juego.j[i]
  const valor = Math.max(0, j.rehacer + delta)
  const jActualizado = { ...j, rehacer: valor }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  return registrar({ ...juego, j: jugadores }, `${jActualizado.n}: jugadas retiradas a ${valor}`, ahora)
}

export function ajustarFuera(juego: Juego, i: number, delta: number, ahora: number = Date.now()): Juego {
  const j = juego.j[i]
  const valor = Math.max(0, j.fuera + delta)
  const jActualizado = { ...j, fuera: valor }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  return registrar({ ...juego, j: jugadores }, `${jActualizado.n}: pasadas de tiempo a ${valor}`, ahora)
}

export function alternarBendicion(juego: Juego, i: number, ahora: number = Date.now()): Juego {
  const j = juego.j[i]
  const jActualizado = { ...j, bendicion: !j.bendicion }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  return registrar(
    { ...juego, j: jugadores },
    `${jActualizado.n} ${jActualizado.bendicion ? 'tiene' : 'pierde'} la bendición de la ciudad`,
    ahora,
  )
}

/** Marcar/desmarcar a mano como fuera de la partida, desde el menú de asiento —
 * distinto de la eliminación automática de `revisar()`, con su propio texto de
 * registro ("queda fuera", no "queda fuera de la partida"). */
export function alternarFueraDeJuego(juego: Juego, i: number, ahora: number = Date.now()): Juego {
  const j = juego.j[i]
  const jActualizado = { ...j, out: !j.out }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  return registrar(
    { ...juego, j: jugadores },
    `${jActualizado.n} ${jActualizado.out ? 'queda fuera' : 'vuelve al juego'}`,
    ahora,
  )
}

/**
 * El maná disponible se toca demasiadas veces por turno como para que cada toque
 * cuente como una acción que se pueda deshacer o que sature el historial: el
 * original tampoco llama a `foto()` ni a `registrar()` aquí, así que esta función
 * se aplica con `mutarSinFoto` en el tablero, no con el `mutar` normal. Con
 * `color: null` vacía todo el maná (el botón de "vaciar" del menú de asiento);
 * con un color, `delta` deja subir (+1, desde el menú) o bajar (-1, tocando
 * directamente la ficha de maná del asiento — regla 500.4, no se conserva entre
 * pasos, así que restarlo a mano es tan legítimo como sumarlo).
 */
export function ajustarMana(juego: Juego, i: number, color: keyof Identidad | null, delta: number = 1): Juego {
  const j = juego.j[i]
  const mana: Identidad =
    color === null ? { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } : { ...j.mana, [color]: Math.max(0, j.mana[color] + delta) }
  const jActualizado = { ...j, mana }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  return { ...juego, j: jugadores }
}

export interface CambiosJugador {
  n?: string
  c?: string
  c2?: string
  col?: string
}

/** Cambiar nombre/comandante/colores a media partida tampoco pasa por `foto()` ni
 * por el registro en el original — se aplica con `mutarSinFoto`. */
export function editarJugador(juego: Juego, i: number, cambios: CambiosJugador): Juego {
  const j = juego.j[i]
  const jActualizado = {
    ...j,
    n: cambios.n?.trim() || j.n,
    c: cambios.c !== undefined ? cambios.c.trim() : j.c,
    c2: cambios.c2 !== undefined ? cambios.c2.trim() : j.c2,
    col: cambios.col ?? j.col,
  }
  const jugadores = juego.j.map((x, idx) => (idx === i ? jActualizado : x))
  return { ...juego, j: jugadores }
}

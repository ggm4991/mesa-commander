import { registrar } from './partida'
import type { ContadorClave, Juego } from './tipos'

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
}

export function comandantesEnMesa(juego: Juego): ComandanteEnMesa[] {
  const lista: ComandanteEnMesa[] = []
  juego.j.forEach((x, k) => {
    lista.push({ clave: `${k}:0`, nombre: x.c || 'Comandante sin nombre', dueno: x.n, k, col: x.col })
    if (x.c2) lista.push({ clave: `${k}:1`, nombre: x.c2, dueno: x.n, k, col: x.col })
  })
  return lista
}

export function nombreComandante(juego: Juego, clave: string): string {
  const c = comandantesEnMesa(juego).find((x) => x.clave === clave)
  return c ? c.nombre : 'Comandante'
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

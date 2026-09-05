import type { Resultado } from '../motor/tipos'

/** Texto y clase CSS de cada resultado posible de un asiento, portado de `RES` en
 * app.html. La clase decide el color del chip ("v"/"e"/"d" en index.css). */
export const RES: Record<Resultado, { t: string; c: string }> = {
  V: { t: 'Victoria', c: 'v' },
  D: { t: 'Derrota', c: 'd' },
  E: { t: 'Empate', c: 'e' },
}

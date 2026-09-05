import type { NombreIcono } from '../componentes/icono/mapaIconos'
import type { ContadorClave } from '../motor/tipos'

/** Icono de cada contador (el motor solo conoce el nombre y el límite letal, no
 * cómo se dibuja). Portado del campo `i` de `CONTADORES` en app.html. */
export const ICONO_CONTADOR: Record<ContadorClave, NombreIcono> = {
  ven: 'veneno',
  exp: 'estrella',
  ene: 'rayo',
  tax: 'monedas',
  tes: 'gema',
  tor: 'tormenta',
}

/** Los cinco colores más el incoloro, para el maná disponible de un jugador. */
export const MANA = ['W', 'U', 'B', 'R', 'G', 'C'] as const

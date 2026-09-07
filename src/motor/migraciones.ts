import { uid } from './utilidades'
import type { Juego, Mazo, Perfil } from './tipos'

/**
 * Los datos guardados se migran, nunca se descartan. La entrada es de formato
 * desconocido (puede venir de una versión antigua de la app guardada en el
 * dispositivo), por eso se recibe sin tipar y se normaliza a `Juego`.
 */
export function migrarJuego(g: Record<string, unknown>): Juego {
  const jugadores = ((g.j as Record<string, unknown>[] | undefined) || []).map((p) => {
    const c2 = p.c2 === undefined ? '' : (p.c2 as string)
    const mana = (p.mana as Juego['j'][number]['mana']) || { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }
    const dmg: Record<string, number> = {}
    for (const [k, v] of Object.entries((p.dmg as Record<string, number>) || {})) {
      dmg[String(k).includes(':') ? k : `${k}:0`] = v
    }
    const imagenId = (p.imagenId as string) || ''
    const imagenId2 = (p.imagenId2 as string) || ''
    return { ...p, c2, mana, dmg, imagenId, imagenId2 }
  })
  // Partidas guardadas antes de que existiera este contador: no hay forma de
  // saber cuántos turnos llevaban de verdad, así que se asume que van por el
  // primero si ya hay alguien jugando, o que aún no ha arrancado si no.
  const numeroTurno = typeof g.numeroTurno === 'number' ? g.numeroTurno : g.turno == null ? 0 : 1
  return { ...g, j: jugadores, numeroTurno } as Juego
}

/** Perfiles de versiones anteriores: tenían un solo comandante suelto en vez de `mazos`. */
export function migrarPerfiles(lista: Record<string, unknown>[] | undefined): Perfil[] {
  return (lista || []).map((p) => {
    if (Array.isArray(p.mazos)) {
      return {
        id: (p.id as string) || uid(),
        nombre: (p.nombre as string) || 'Sin nombre',
        ultimo: (p.ultimo as string) || null,
        mazos: (p.mazos as Record<string, unknown>[]).map(
          (m): Mazo => ({
            id: (m.id as string) || uid(),
            c: (m.c as string) || '',
            c2: (m.c2 as string) || '',
            col: (m.col as string) || '',
            imagenId: (m.imagenId as string) || '',
            imagenId2: (m.imagenId2 as string) || '',
          }),
        ),
      }
    }
    const m: Mazo = {
      id: uid(),
      c: (p.comandante as string) || '',
      c2: (p.comandante2 as string) || '',
      col: (p.colores as string) || '',
      imagenId: '',
      imagenId2: '',
    }
    const tiene = m.c || m.col
    return {
      id: (p.id as string) || uid(),
      nombre: (p.nombre as string) || 'Sin nombre',
      mazos: tiene ? [m] : [],
      ultimo: tiene ? m.id : null,
    }
  })
}

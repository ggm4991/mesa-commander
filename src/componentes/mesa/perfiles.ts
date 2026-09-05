import type { Asiento, Mazo, Perfil } from '../../motor/tipos'

/** Deja al jugador listo para sentarse con un mazo concreto. */
export function asientoDesde(perfil: Perfil, mazo: Mazo | null): Asiento {
  return {
    nombre: perfil.nombre,
    comandante: mazo ? mazo.c : '',
    comandante2: mazo ? mazo.c2 : '',
    colores: mazo ? mazo.col : '',
    imagenId: mazo ? mazo.imagenId : '',
    imagenId2: mazo ? mazo.imagenId2 : '',
  }
}

export function mazoUltimo(perfil: Perfil): Mazo | null {
  return perfil.mazos.find((m) => m.id === perfil.ultimo) ?? perfil.mazos[0] ?? null
}

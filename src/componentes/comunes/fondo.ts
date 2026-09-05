const HEX: Record<string, string> = {
  W: '#F2E4C3',
  U: '#5B9BD8',
  B: '#6E5F82',
  R: '#CF5B44',
  G: '#57A46B',
  C: '#8C8395',
}

const VELO = 'linear-gradient(rgba(14,10,19,.58), rgba(14,10,19,.74))'

/** Fondo degradado de un asiento a partir de su identidad de color, portado de
 * `fondo(col)` en app.html. */
export function fondoIdentidad(identidad?: string): string {
  const colores = (identidad || 'C').split('').map((c) => HEX[c] || HEX.C)
  const gradiente = colores.length === 1 ? `${colores[0]}, ${colores[0]}` : colores.join(', ')
  return `${VELO}, linear-gradient(135deg, ${gradiente})`
}

/** Fondo de un asiento del tablero: la ilustración del comandante si Scryfall la
 * ha traído (ver `useImagenComandante`), o si no el degradado de identidad de
 * siempre — nunca un hueco en blanco mientras se resuelve o si falla. */
export function fondoAsiento(identidad: string | undefined, imagenUrl: string | null): string {
  return imagenUrl ? `${VELO}, url("${imagenUrl}")` : fondoIdentidad(identidad)
}

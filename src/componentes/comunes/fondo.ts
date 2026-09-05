const HEX: Record<string, string> = {
  W: '#F2E4C3',
  U: '#5B9BD8',
  B: '#6E5F82',
  R: '#CF5B44',
  G: '#57A46B',
  C: '#8C8395',
}

/** Fondo degradado de un asiento a partir de su identidad de color, portado de
 * `fondo(col)` en app.html. */
export function fondoIdentidad(identidad?: string): string {
  const colores = (identidad || 'C').split('').map((c) => HEX[c] || HEX.C)
  const gradiente = colores.length === 1 ? `${colores[0]}, ${colores[0]}` : colores.join(', ')
  return `linear-gradient(rgba(14,10,19,.58), rgba(14,10,19,.74)), linear-gradient(135deg, ${gradiente})`
}

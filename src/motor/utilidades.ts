// Utilidades sin estado, portadas de app.html (sección 1). Se dejan fuera del motor
// las que son puramente de presentación (esc, pips, fondo, iconos): esas se portan
// en la Fase 3 junto al resto de la UI.

export const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export const reloj = (s: number): string => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0')

export const duracion = (m: number): string =>
  Math.floor(m / 60) ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`

export const hoy = (): string => new Date().toISOString().slice(0, 10)

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function fechaLarga(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  return `${d} de ${MESES[m - 1]} de ${a}`
}

export function segundos(txt: string | number): number {
  const t = String(txt).trim()
  if (/^\d+$/.test(t)) return +t
  const m = t.match(/^(\d+)\s*[:'m]\s*(\d{1,2})/)
  return m ? +m[1] * 60 + +m[2] : NaN
}

/** Un mazo con compañero tiene dos comandantes: se muestran juntos. */
export const dosComandantes = (a?: string, b?: string): string =>
  [a, b].filter((x) => x && String(x).trim()).join(' + ') || 'Sin comandante'

import { ICONOS, type NombreIcono } from './mapaIconos'

interface Props {
  nombre: NombreIcono
  tamano?: number
  className?: string
}

/** Sustituye a `ic()` de app.html: mismo SVG en línea, ahora como componente. */
export function Icono({ nombre, tamano = 20, className }: Props) {
  return (
    <svg
      className={className ? `ic ${className}` : 'ic'}
      viewBox="0 0 24 24"
      width={tamano}
      height={tamano}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONOS[nombre]} />
    </svg>
  )
}

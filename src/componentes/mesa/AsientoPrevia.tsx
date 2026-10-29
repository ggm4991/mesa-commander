import { Icono } from '../icono/Icono'
import { Pips } from '../comunes/Pips'
import { fondoIdentidad } from '../comunes/fondo'
import { dosComandantes } from '../../motor/utilidades'
import { useImagenComandante } from '../../red/scryfall/useImagenComandante'
import type { Asiento } from '../../motor/tipos'

interface Props {
  asiento: Asiento | null
  indice: number
  rotacion: number
  areaGrid?: string | null
  esInicia: boolean
  onElegir: () => void
  onGirar: () => void
}

/** Un hueco de la vista previa de mesa (`VistaMesa`). Separado en su propio
 * componente porque necesita `useImagenComandante`, un hook — no se puede llamar
 * dentro del `.map()` de `VistaMesa` sin romper las reglas de hooks (un número de
 * llamadas que cambia según cuántos asientos haya). Es un `div[role=button]` en
 * vez de un `<button>` para poder anidar el botón de girar dentro — dos
 * `<button>` anidados no es HTML válido. */
export function AsientoPrevia({ asiento: s, indice, rotacion, areaGrid, esInicia, onElegir, onGirar }: Props) {
  const imagenComandante = useImagenComandante(s?.comandante, s?.imagenId)

  const alPulsarTecla = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onElegir()
    }
  }

  return (
    <div
      className={`pseat${s ? '' : ' vacio'}`}
      tabIndex={0}
      role="button"
      data-rot={rotacion}
      style={areaGrid ? { gridArea: areaGrid } : undefined}
      aria-label={`Asiento ${indice + 1}${s ? `, ${s.nombre}` : ', libre'}`}
      onClick={onElegir}
      onKeyDown={alPulsarTecla}
    >
      <div className="pbg" style={{ background: s ? fondoIdentidad(s.colores) : '#231B2D' }} />
      {/* Solo un asomo del comandante, no el fondo entero como en el tablero
       * (ver `fondoAsiento`): aquí lo que importa de un vistazo es la identidad
       * de color de `.pbg`, la ilustración es solo un adelanto. */}
      {imagenComandante && <div className="pbg-comandante" style={{ backgroundImage: `url("${imagenComandante}")` }} />}
      <div className="pinner">
        {esInicia && s && (
          <span className="empieza-badge">
            <Icono nombre="bandera" tamano={13} /> Empieza
          </span>
        )}
        <b>{s ? s.nombre : 'Asiento libre'}</b>
        <span className="det">
          {s ? (
            <>
              <Pips identidad={s.colores} /> {dosComandantes(s.comandante, s.comandante2)}
            </>
          ) : (
            'Toca para sentar a alguien'
          )}
        </span>
        <button
          className="rot"
          title="Girar este asiento"
          onClick={(e) => {
            e.stopPropagation()
            onGirar()
          }}
        >
          <Icono nombre="girar" tamano={16} /> {rotacion}°
        </button>
      </div>
    </div>
  )
}

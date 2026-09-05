import { Icono } from '../icono/Icono'
import { Pips } from '../comunes/Pips'
import { fondoIdentidad } from '../comunes/fondo'
import { dosComandantes } from '../../motor/utilidades'
import type { Asiento } from '../../motor/tipos'
import type { Dispo } from './disposiciones'

interface Props {
  mesa: (Asiento | null)[]
  dispo: Dispo
  inicia: number | null
  onElegirAsiento: (indice: number) => void
  onGirarAsiento: (indice: number) => void
}

/** Sustituye a `vistaMesa()` en app.html: la vista cenital de la mesa en la
 * pantalla previa, con un asiento por hueco que se puede tocar para sentar a
 * alguien o girar hacia su sitio real. El asiento es un `div[role=button]` en vez
 * de un `<button>` para poder anidar el botón de girar dentro, igual que el
 * original — dos `<button>` anidados no es HTML válido. */
export function VistaMesa({ mesa, dispo, inicia, onElegirAsiento, onGirarAsiento }: Props) {
  const alPulsarTecla = (indice: number) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onElegirAsiento(indice)
    }
  }

  return (
    <div className="mesa-prev" style={{ gridTemplateColumns: dispo.cols, gridTemplateRows: dispo.rows }}>
      {mesa.map((s, i) => (
        <div
          key={i}
          className={`pseat${s ? '' : ' vacio'}`}
          tabIndex={0}
          role="button"
          data-rot={dispo.rot[i] || 0}
          style={dispo.areas?.[i] ? { gridArea: dispo.areas[i] as string } : undefined}
          aria-label={`Asiento ${i + 1}${s ? `, ${s.nombre}` : ', libre'}`}
          onClick={() => onElegirAsiento(i)}
          onKeyDown={alPulsarTecla(i)}
        >
          <div className="pbg" style={{ background: s ? fondoIdentidad(s.colores) : '#231B2D' }} />
          <div className="pinner">
            {inicia === i && s && (
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
                onGirarAsiento(i)
              }}
            >
              <Icono nombre="girar" tamano={16} /> {dispo.rot[i] || 0}°
            </button>
          </div>
        </div>
      ))}
      {dispo.centro && (
        <div className="centro" style={{ gridArea: dispo.centro }}>
          El móvil va aquí
        </div>
      )}
    </div>
  )
}

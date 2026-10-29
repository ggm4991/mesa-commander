import type { Asiento } from '../../motor/tipos'
import { AsientoPrevia } from './AsientoPrevia'
import { conFilaHub, type Dispo } from './disposiciones'

interface Props {
  mesa: (Asiento | null)[]
  dispo: Dispo
  inicia: number | null
  onElegirAsiento: (indice: number) => void
  onGirarAsiento: (indice: number) => void
}

/** Sustituye a `vistaMesa()` en app.html: la vista cenital de la mesa en la
 * pantalla previa, con un asiento por hueco que se puede tocar para sentar a
 * alguien o girar hacia su sitio real. */
export function VistaMesa({ mesa, dispo, inicia, onElegirAsiento, onGirarAsiento }: Props) {
  return (
    <div
      className="mesa-prev"
      style={{ gridTemplateColumns: dispo.cols, gridTemplateRows: conFilaHub(dispo.rows, dispo.filaHub, '36px') }}
    >
      {mesa.map((s, i) => (
        <AsientoPrevia
          key={i}
          asiento={s}
          indice={i}
          rotacion={dispo.rot[i] || 0}
          areaGrid={dispo.areas?.[i]}
          esInicia={inicia === i}
          onElegir={() => onElegirAsiento(i)}
          onGirar={() => onGirarAsiento(i)}
        />
      ))}
      {dispo.centro && (
        <div className="centro" style={{ gridArea: dispo.centro }}>
          El móvil va aquí
        </div>
      )}
    </div>
  )
}

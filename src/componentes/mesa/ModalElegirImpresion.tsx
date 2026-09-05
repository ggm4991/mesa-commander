import { useQuery } from '@tanstack/react-query'
import { Modal } from '../comunes/Modal'
import { buscarImpresiones } from '../../red/scryfall/cliente'

interface Props {
  nombre: string
  imagenIdActual: string
  onElegir: (imagenId: string) => void
  onCerrar: () => void
}

/** Sustituye la ilustración "de referencia" del comandante por la de una edición
 * concreta: una misma carta puede tener arte distinto en cada reimpresión, y no
 * siempre la más reciente es la que se quiere en la mesa. */
export function ModalElegirImpresion({ nombre, imagenIdActual, onElegir, onCerrar }: Props) {
  const { data: impresiones, isPending, isError } = useQuery({
    queryKey: ['scryfall', 'impresiones', nombre.toLowerCase()],
    queryFn: ({ signal }) => buscarImpresiones(nombre, signal),
  })

  return (
    <Modal titulo={`Elegir imagen de ${nombre}`} onCerrar={onCerrar} pie={<button className="btn" onClick={onCerrar}>Cerrar</button>}>
      {imagenIdActual && (
        <button className="btn small" style={{ marginBottom: 14 }} onClick={() => onElegir('')}>
          Usar la edición de referencia
        </button>
      )}
      {isPending && <p className="hint">Buscando ediciones en Scryfall…</p>}
      {isError && <p className="hint">No se ha podido consultar Scryfall. La imagen actual no cambia.</p>}
      {impresiones && impresiones.length === 0 && <p className="hint">No se ha encontrado ninguna edición.</p>}
      {impresiones && impresiones.length > 0 && (
        <div className="rejilla-impresiones">
          {impresiones.map((imp) => (
            <button
              key={imp.id}
              type="button"
              className={`impresion${imp.id === imagenIdActual ? ' activa' : ''}`}
              onClick={() => onElegir(imp.id)}
            >
              {imp.miniatura ? <img src={imp.miniatura} alt={imp.edicion} /> : <span className="sin-imagen" />}
              <span className="edicion">{imp.edicion}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}

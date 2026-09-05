import { useState } from 'react'
import { useImagenComandante } from '../../red/scryfall/useImagenComandante'
import { ModalElegirImpresion } from './ModalElegirImpresion'

interface Props {
  nombre: string
  imagenId: string
  onElegirImagen: (imagenId: string) => void
}

/** Miniatura de la ilustración que se usará en la mesa, con un botón para elegir
 * otra edición cuando la carta tiene arte distinto según la reimpresión (ver ADR
 * de la Fase 4 sobre `art_crop`). Sin un nombre de comandante todavía, no muestra
 * nada — no hay qué previsualizar. */
export function SelectorImagenComandante({ nombre, imagenId, onElegirImagen }: Props) {
  const [abierto, setAbierto] = useState(false)
  const limpio = nombre.trim()
  const imagenUrl = useImagenComandante(limpio, imagenId)

  if (!limpio) return null

  return (
    <div className="field selector-imagen">
      <label>Imagen en la mesa</label>
      <div className="miniatura-comandante">
        {imagenUrl ? <img src={imagenUrl} alt={limpio} /> : <span className="sin-imagen" />}
      </div>
      <button type="button" className="btn small" onClick={() => setAbierto(true)}>
        Cambiar imagen
      </button>
      {abierto && (
        <ModalElegirImpresion
          nombre={limpio}
          imagenIdActual={imagenId}
          onElegir={(id) => {
            onElegirImagen(id)
            setAbierto(false)
          }}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import { Modal } from '../comunes/Modal'
import type { Mazo } from '../../motor/tipos'
import { uid } from '../../motor/utilidades'
import { CampoComandante } from './CampoComandante'
import { SelectorImagenComandante } from './SelectorImagenComandante'
import { COLORES } from './colores'

interface Props {
  /** null = mazo nuevo. */
  mazo: Mazo | null
  onGuardar: (mazo: Mazo) => void
  onCancelar: () => void
}

/** Un mazo con compañero saca su identidad de la unión de las dos cartas: elegir un
 * comandante de Scryfall enciende sus colores sin apagar los que ya puso el otro. */
function mezclarIdentidad(actual: string, nueva: string): string {
  const set = new Set([...actual.split(''), ...nueva.split('')])
  return COLORES.filter((c) => set.has(c)).join('')
}

/** Sustituye a `editorMazo()` en app.html: comandante, compañero opcional e
 * identidad de color de un mazo concreto dentro de un perfil. */
export function EditorMazo({ mazo, onGuardar, onCancelar }: Props) {
  const [borrador, setBorrador] = useState<Mazo>(() => mazo ?? { id: uid(), c: '', c2: '', col: '', imagenId: '', imagenId2: '' })
  const [error, setError] = useState<string | null>(null)

  const alternarColor = (color: string) => {
    setBorrador((m) => {
      const set = new Set(m.col.split(''))
      if (set.has(color)) set.delete(color)
      else set.add(color)
      return { ...m, col: COLORES.filter((c) => set.has(c)).join('') }
    })
  }

  const guardar = () => {
    const c = borrador.c.trim()
    if (!c) {
      setError('Escribe al menos el comandante principal.')
      return
    }
    onGuardar({ ...borrador, c, c2: borrador.c2.trim() })
  }

  return (
    <Modal
      titulo={mazo ? 'Editar mazo' : 'Nuevo mazo'}
      onCerrar={onCancelar}
      pie={
        <>
          <button className="btn" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn primary" onClick={guardar}>
            Guardar mazo
          </button>
        </>
      }
    >
      <CampoComandante
        id="m-c"
        etiqueta="Comandante"
        valor={borrador.c}
        placeholder="Nombre en inglés"
        onCambiar={(c) => setBorrador((m) => ({ ...m, c, imagenId: '' }))}
        onElegirSugerencia={(c, identidad) =>
          setBorrador((m) => ({ ...m, c, imagenId: '', col: identidad ? mezclarIdentidad(m.col, identidad) : m.col }))
        }
      />
      <SelectorImagenComandante
        nombre={borrador.c}
        imagenId={borrador.imagenId}
        onElegirImagen={(imagenId) => setBorrador((m) => ({ ...m, imagenId }))}
      />
      <CampoComandante
        id="m-c2"
        etiqueta="Compañero (opcional)"
        valor={borrador.c2}
        placeholder="Solo si el mazo lleva dos comandantes"
        onCambiar={(c2) => setBorrador((m) => ({ ...m, c2, imagenId2: '' }))}
        onElegirSugerencia={(c2, identidad) =>
          setBorrador((m) => ({ ...m, c2, imagenId2: '', col: identidad ? mezclarIdentidad(m.col, identidad) : m.col }))
        }
      />
      {borrador.c2.trim() && (
        <SelectorImagenComandante
          nombre={borrador.c2}
          imagenId={borrador.imagenId2}
          onElegirImagen={(imagenId2) => setBorrador((m) => ({ ...m, imagenId2 }))}
        />
      )}
      <div className="field" style={{ margin: 0 }}>
        <label>Identidad de color</label>
        <div className="colors">
          {COLORES.map((c) => (
            <button
              key={c}
              type="button"
              className="color-btn"
              aria-pressed={borrador.col.includes(c)}
              aria-label={`Color ${c}`}
              onClick={() => alternarColor(c)}
            >
              <i className={`pip ${c}`} />
            </button>
          ))}
        </div>
      </div>
      {error && <div className="errors" style={{ margin: '14px 0 0' }}>{error}</div>}
    </Modal>
  )
}

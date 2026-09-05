import { useState } from 'react'
import { Modal } from '../comunes/Modal'
import type { Mazo } from '../../motor/tipos'
import { uid } from '../../motor/utilidades'
import { COLORES } from './colores'

interface Props {
  /** null = mazo nuevo. */
  mazo: Mazo | null
  onGuardar: (mazo: Mazo) => void
  onCancelar: () => void
}

/** Sustituye a `editorMazo()` en app.html: comandante, compañero opcional e
 * identidad de color de un mazo concreto dentro de un perfil. */
export function EditorMazo({ mazo, onGuardar, onCancelar }: Props) {
  const [borrador, setBorrador] = useState<Mazo>(() => mazo ?? { id: uid(), c: '', c2: '', col: '' })
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
      <div className="field">
        <label htmlFor="m-c">Comandante</label>
        <input
          id="m-c"
          type="text"
          value={borrador.c}
          placeholder="Nombre en inglés"
          onChange={(e) => setBorrador((m) => ({ ...m, c: e.target.value }))}
        />
      </div>
      <div className="field">
        <label htmlFor="m-c2">Compañero (opcional)</label>
        <input
          id="m-c2"
          type="text"
          value={borrador.c2}
          placeholder="Solo si el mazo lleva dos comandantes"
          onChange={(e) => setBorrador((m) => ({ ...m, c2: e.target.value }))}
        />
      </div>
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

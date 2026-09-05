import { useState } from 'react'
import { Icono } from '../icono/Icono'
import { Modal } from '../comunes/Modal'
import { Pips } from '../comunes/Pips'
import { dosComandantes, uid } from '../../motor/utilidades'
import type { Perfil } from '../../motor/tipos'
import { EditorMazo } from './EditorMazo'

interface Props {
  /** null = perfil nuevo. */
  perfil: Perfil | null
  onGuardar: (perfil: Perfil) => void
  onEliminar?: () => void
  onCerrar: () => void
}

type Vista = { paso: 'perfil' } | { paso: 'mazo'; mazoId: string | null }

/** Sustituye a `editorPerfil()`/`pintarEditorPerfil()` en app.html: nombre del
 * jugador y su colección de mazos. Editar un mazo (`EditorMazo`) es un paso interno
 * de este mismo componente, no un modal aparte encadenado por fuera. */
export function EditorPerfil({ perfil, onGuardar, onEliminar, onCerrar }: Props) {
  const editando = perfil != null
  const [borrador, setBorrador] = useState<Perfil>(() => perfil ?? { id: uid(), nombre: '', mazos: [], ultimo: null })
  const [vista, setVista] = useState<Vista>({ paso: 'perfil' })
  const [error, setError] = useState<string | null>(null)

  if (vista.paso === 'mazo') {
    const mazoActual = vista.mazoId ? (borrador.mazos.find((m) => m.id === vista.mazoId) ?? null) : null
    return (
      <EditorMazo
        mazo={mazoActual}
        onCancelar={() => setVista({ paso: 'perfil' })}
        onGuardar={(mazo) => {
          setBorrador((b) => {
            const i = b.mazos.findIndex((m) => m.id === mazo.id)
            const mazos = i >= 0 ? b.mazos.map((m, idx) => (idx === i ? mazo : m)) : [...b.mazos, mazo]
            return { ...b, mazos, ultimo: b.ultimo ?? mazo.id }
          })
          setVista({ paso: 'perfil' })
        }}
      />
    )
  }

  const guardar = () => {
    const nombre = borrador.nombre.trim()
    if (!nombre) {
      setError('El perfil necesita un nombre.')
      return
    }
    onGuardar({ ...borrador, nombre })
  }

  return (
    <Modal
      titulo={editando ? 'Editar perfil' : 'Nuevo perfil'}
      onCerrar={onCerrar}
      pie={
        <>
          {editando && onEliminar && (
            <button className="btn danger" onClick={onEliminar}>
              <Icono nombre="papelera" tamano={18} /> Eliminar perfil
            </button>
          )}
          <button className="btn" onClick={onCerrar}>
            Cancelar
          </button>
          <button className="btn primary" onClick={guardar}>
            Guardar perfil
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="p-n">Nombre del jugador</label>
        <input
          id="p-n"
          type="text"
          value={borrador.nombre}
          placeholder="Cómo aparece en la mesa"
          onChange={(e) => setBorrador((b) => ({ ...b, nombre: e.target.value }))}
        />
      </div>
      <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--muted)', margin: '18px 0 8px' }}>
        Sus mazos{borrador.mazos.length ? ` (${borrador.mazos.length})` : ''}
      </label>
      <div className="grid-list">
        {borrador.mazos.length ? (
          borrador.mazos.map((m) => (
            <div className="line" key={m.id}>
              <span className="txt">
                <Pips identidad={m.col} />
                <div>
                  <b>{dosComandantes(m.c, m.c2)}</b>
                  {borrador.ultimo === m.id && <span>El último que usó</span>}
                </div>
              </span>
              <span className="actions">
                <button className="btn small" onClick={() => setVista({ paso: 'mazo', mazoId: m.id })}>
                  <Icono nombre="lapiz" tamano={16} />
                </button>
                <button
                  className="btn small danger"
                  onClick={() => setBorrador((b) => ({ ...b, mazos: b.mazos.filter((x) => x.id !== m.id) }))}
                >
                  <Icono nombre="papelera" tamano={16} />
                </button>
              </span>
            </div>
          ))
        ) : (
          <p className="hint" style={{ margin: 0 }}>
            Sin mazos todavía. Añade el primero y quedará guardado.
          </p>
        )}
      </div>
      <button className="btn" style={{ marginTop: 12 }} onClick={() => setVista({ paso: 'mazo', mazoId: null })}>
        <Icono nombre="mas" tamano={18} /> Añadir mazo
      </button>
      {error && <div className="errors" style={{ margin: '14px 0 0' }}>{error}</div>}
    </Modal>
  )
}

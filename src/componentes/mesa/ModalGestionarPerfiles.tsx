import { Icono } from '../icono/Icono'
import { Modal } from '../comunes/Modal'
import { Pips } from '../comunes/Pips'
import { dosComandantes } from '../../motor/utilidades'
import type { Perfil } from '../../motor/tipos'
import { mazoUltimo } from './perfiles'

interface Props {
  perfiles: Perfil[]
  onEditar: (id: string) => void
  onCrear: () => void
  onCerrar: () => void
}

/** Sustituye a `gestionarPerfiles()` en app.html: la lista de perfiles guardados,
 * cada uno con acceso directo a su editor. */
export function ModalGestionarPerfiles({ perfiles, onEditar, onCrear, onCerrar }: Props) {
  return (
    <Modal
      titulo="Perfiles guardados"
      onCerrar={onCerrar}
      pie={
        <>
          <button className="btn" onClick={onCerrar}>
            Cerrar
          </button>
          <button className="btn primary" onClick={onCrear}>
            <Icono nombre="mas" tamano={18} /> Crear perfil
          </button>
        </>
      }
    >
      <div className="grid-list">
        {perfiles.length ? (
          perfiles.map((p) => {
            const m = mazoUltimo(p)
            return (
              <div className="line" key={p.id}>
                <span className="txt">
                  <Icono nombre="persona" tamano={22} />
                  <div>
                    <b>{p.nombre}</b>
                    <span>
                      {p.mazos.length
                        ? `${p.mazos.length} ${p.mazos.length === 1 ? 'mazo' : 'mazos'}${
                            m ? ` · ${dosComandantes(m.c, m.c2)}` : ''
                          }`
                        : 'Sin mazos'}
                    </span>
                    {m && <Pips identidad={m.col} />}
                  </div>
                </span>
                <button className="btn small" onClick={() => onEditar(p.id)}>
                  <Icono nombre="lapiz" tamano={16} /> Editar
                </button>
              </div>
            )
          })
        ) : (
          <p className="hint" style={{ margin: 0 }}>
            Aún no hay perfiles. Crea el primero y quedará guardado para las próximas partidas.
          </p>
        )}
      </div>
    </Modal>
  )
}

import { useState } from 'react'
import { Icono } from '../icono/Icono'
import { Modal } from '../comunes/Modal'
import { Desplegable, type OpcionDesplegable } from '../comunes/Desplegable'
import { Pips } from '../comunes/Pips'
import { dosComandantes } from '../../motor/utilidades'
import type { Mazo, Perfil } from '../../motor/tipos'
import { mazoUltimo } from './perfiles'

interface Props {
  indice: number
  perfiles: Perfil[]
  ocupado: boolean
  onSentarConPerfil: (perfil: Perfil, mazo: Mazo | null) => void
  onVaciar: () => void
  onCrearPerfil: () => void
  onUsarNombre: (nombre: string) => void
  avisoSinNombre: () => void
  onCerrar: () => void
}

/** Sustituye a `elegirAsiento()` en app.html: elegir un perfil (con su último
 * mazo, u otro de la lista), escribir solo un nombre para esta partida, o crear
 * un perfil nuevo directamente desde aquí. */
export function ModalElegirAsiento({
  indice,
  perfiles,
  ocupado,
  onSentarConPerfil,
  onVaciar,
  onCrearPerfil,
  onUsarNombre,
  avisoSinNombre,
  onCerrar,
}: Props) {
  const [nombreSuelto, setNombreSuelto] = useState('')

  return (
    <Modal
      titulo={`Asiento ${indice + 1}`}
      onCerrar={onCerrar}
      pie={
        <>
          {ocupado && (
            <button className="btn danger" onClick={onVaciar}>
              Dejar libre
            </button>
          )}
          <button className="btn" onClick={onCrearPerfil}>
            <Icono nombre="mas" tamano={18} /> Crear perfil
          </button>
          <button
            className="btn primary"
            onClick={() => {
              const n = nombreSuelto.trim()
              if (!n) {
                avisoSinNombre()
                return
              }
              onUsarNombre(n)
            }}
          >
            Usar este nombre
          </button>
        </>
      }
    >
      <div className="grid-list" style={{ marginBottom: 16 }}>
        {perfiles.length ? (
          perfiles.map((p) => {
            const m = mazoUltimo(p)
            const opciones: OpcionDesplegable[] = p.mazos.map((mazo) => ({
              valor: mazo.id,
              titulo: dosComandantes(mazo.c, mazo.c2),
              icono: <Pips identidad={mazo.col} />,
              buscar: `${mazo.c} ${mazo.c2} ${p.nombre}`,
              marca: p.ultimo === mazo.id ? 'último' : undefined,
            }))
            return (
              <div key={p.id}>
                <div className="line">
                  <span className="txt">
                    <Icono nombre="persona" tamano={22} />
                    <div>
                      <b>{p.nombre}</b>
                      <span>
                        {m ? (
                          <>
                            <Pips identidad={m.col} /> {dosComandantes(m.c, m.c2)}
                          </>
                        ) : (
                          'Sin mazos guardados'
                        )}
                      </span>
                    </div>
                  </span>
                  <button className="btn small" onClick={() => onSentarConPerfil(p, m)}>
                    Sentar
                  </button>
                </div>
                {p.mazos.length > 1 && (
                  <Desplegable
                    titulo={`Elegir otro de sus ${p.mazos.length} mazos`}
                    marcador="Buscar mazo por comandante"
                    opciones={opciones}
                    onElegir={(valor) => {
                      const mazo = p.mazos.find((x) => x.id === valor)
                      if (mazo) onSentarConPerfil(p, mazo)
                    }}
                  />
                )}
              </div>
            )
          })
        ) : (
          <p className="hint" style={{ margin: 0 }}>
            Todavía no hay perfiles guardados.
          </p>
        )}
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label htmlFor="suelto">O escribe un nombre solo para esta partida</label>
        <input
          id="suelto"
          type="text"
          placeholder="Invitado"
          value={nombreSuelto}
          onChange={(e) => setNombreSuelto(e.target.value)}
        />
      </div>
    </Modal>
  )
}

import { useState } from 'react'
import { Icono } from '../componentes/icono/Icono'
import { Modal } from '../componentes/comunes/Modal'
import { Desplegable, type OpcionDesplegable } from '../componentes/comunes/Desplegable'
import { Pips } from '../componentes/comunes/Pips'
import { COLORES } from '../componentes/mesa/colores'
import { mazoUltimo } from '../componentes/mesa/perfiles'
import { dosComandantes } from '../motor/utilidades'
import { CONTADORES, type CambiosJugador } from '../motor/vida'
import type { ContadorClave, Identidad, Juego, Mazo, Perfil } from '../motor/tipos'
import { ICONO_CONTADOR, MANA } from './constantesUI'

interface Props {
  juego: Juego
  indice: number
  perfiles: Perfil[]
  onContador: (clave: ContadorClave, delta: number) => void
  onMana: (color: keyof Identidad | null, delta?: number) => void
  onRehacer: (delta: number) => void
  onFuera: (delta: number) => void
  onBendicion: () => void
  onMarcarFuera: () => void
  onEditar: (cambios: CambiosJugador) => void
  onCerrar: () => void
}

/** Sustituye a `menuAsiento()` en app.html: contadores, maná, jugadas retiradas,
 * pasadas de tiempo, bendición de la ciudad, y el acceso a cambiar de mazo o
 * marcarlo como fuera. Cambiar de mazo es un paso interno de este mismo
 * componente. */
export function ModalMenuAsiento({
  juego,
  indice,
  perfiles,
  onContador,
  onMana,
  onRehacer,
  onFuera,
  onBendicion,
  onMarcarFuera,
  onEditar,
  onCerrar,
}: Props) {
  const [editando, setEditando] = useState(false)
  const [colorMana, setColorMana] = useState<keyof Identidad>('W')
  const j = juego.j[indice]

  if (editando) {
    return (
      <CambiarMazo
        jugador={j}
        perfiles={perfiles}
        onCancelar={() => setEditando(false)}
        onGuardar={(cambios) => {
          onEditar(cambios)
          setEditando(false)
        }}
      />
    )
  }

  return (
    <Modal
      titulo={j.n}
      onCerrar={onCerrar}
      pie={
        <>
          <button className="btn" onClick={() => setEditando(true)}>
            <Icono nombre="barajar" tamano={18} /> Cambiar de mazo
          </button>
          <button className={`btn ${j.out ? '' : 'danger'}`} onClick={onMarcarFuera}>
            <Icono nombre="calavera" tamano={18} /> {j.out ? 'Volver al juego' : 'Marcar como fuera'}
          </button>
          <button className="btn primary" onClick={onCerrar}>
            Listo
          </button>
        </>
      }
    >
      <div className="grid-list">
        {CONTADORES.map((c) => (
          <div className="line" key={c.clave}>
            <span className="txt">
              <Icono nombre={ICONO_CONTADOR[c.clave]} tamano={22} />
              <div>
                <b>{c.nombre}</b>
                {c.letal && <span>Queda fuera al llegar a {c.letal}</span>}
              </div>
            </span>
            <span className="stepper">
              <button onClick={() => onContador(c.clave, -(c.paso || 1))}>−</button>
              <span className="val">{j[c.clave]}</span>
              <button onClick={() => onContador(c.clave, c.paso || 1)}>+</button>
            </span>
          </div>
        ))}

        <div className="line">
          <span className="txt">
            <Icono nombre="mana" tamano={22} />
            <div>
              <b>Maná disponible</b>
              <span>Elige un color y ajusta cuánto tiene</span>
            </div>
          </span>
        </div>
        <div className="colors" style={{ marginBottom: 10 }}>
          {MANA.map((m) => (
            <button
              key={m}
              type="button"
              className="color-btn"
              aria-pressed={colorMana === m}
              title={`Maná ${m}`}
              onClick={() => setColorMana(m)}
            >
              <i className={`pip ${m}`} />
            </button>
          ))}
        </div>
        <div className="line">
          <span className="txt">
            <i className={`pip ${colorMana}`} style={{ display: 'inline-block', width: 22, height: 22, opacity: 1 }} />
            <div>
              <b>Maná {colorMana}</b>
            </div>
          </span>
          <span className="stepper">
            <button onClick={() => onMana(colorMana, -1)}>−</button>
            <span className="val">{j.mana[colorMana]}</span>
            <button onClick={() => onMana(colorMana, 1)}>+</button>
          </span>
        </div>
        <div className="line">
          <span className="txt">
            <div>
              <span>Vacía todos los colores a la vez</span>
            </div>
          </span>
          <button className="btn small" onClick={() => onMana(null)}>
            Vaciar todo
          </button>
        </div>

        <div className="line">
          <span className="txt">
            <Icono nombre="retirada" tamano={22} />
            <div>
              <b>Jugadas retiradas</b>
              <span>Devolvió la carta a la mano y jugó otra</span>
            </div>
          </span>
          <span className="stepper">
            <button onClick={() => onRehacer(-1)}>−</button>
            <span className="val">{j.rehacer}</span>
            <button onClick={() => onRehacer(1)}>+</button>
          </span>
        </div>

        <div className="line">
          <span className="txt">
            <Icono nombre="reloj" tamano={22} />
            <div>
              <b>Se pasó de tiempo</b>
              <span>Se suma solo si pones límite de turno</span>
            </div>
          </span>
          <span className="stepper">
            <button onClick={() => onFuera(-1)}>−</button>
            <span className="val">{j.fuera}</span>
            <button onClick={() => onFuera(1)}>+</button>
          </span>
        </div>

        <div className="line">
          <span className="txt">
            <Icono nombre="ciudad" tamano={22} />
            <div>
              <b>Bendición de la ciudad</b>
            </div>
          </span>
          <button className="btn small" onClick={onBendicion}>
            {j.bendicion ? 'Quitar' : 'Dar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function CambiarMazo({
  jugador,
  perfiles,
  onGuardar,
  onCancelar,
}: {
  jugador: Juego['j'][number]
  perfiles: Perfil[]
  onGuardar: (cambios: CambiosJugador) => void
  onCancelar: () => void
}) {
  const [n, setN] = useState(jugador.n)
  const [c, setC] = useState(jugador.c)
  const [c2, setC2] = useState(jugador.c2 || '')
  const [col, setCol] = useState(jugador.col)
  const [imagenId, setImagenId] = useState(jugador.imagenId)
  const [imagenId2, setImagenId2] = useState(jugador.imagenId2)

  // Elegir un mazo guardado rellena comandantes, colores y su edición de
  // imagen de una vez; los campos de abajo siguen ahí para retocarlo a mano o
  // para un mazo que no se guardó como perfil (ver ADR 0027).
  const elegirMazo = (mazo: Mazo) => {
    setC(mazo.c)
    setC2(mazo.c2)
    setCol(mazo.col)
    setImagenId(mazo.imagenId)
    setImagenId2(mazo.imagenId2)
  }

  const alternarColor = (color: string) => {
    setCol((actual) => {
      const set = new Set(actual.split(''))
      if (set.has(color)) set.delete(color)
      else set.add(color)
      return COLORES.filter((x) => set.has(x)).join('')
    })
  }

  return (
    <Modal
      titulo="Cambiar de mazo"
      onCerrar={onCancelar}
      pie={
        <>
          <button className="btn" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn primary" onClick={() => onGuardar({ n, c, c2, col, imagenId, imagenId2 })}>
            Guardar
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="e-n">Nombre</label>
        <input id="e-n" type="text" value={n} onChange={(e) => setN(e.target.value)} />
      </div>

      {perfiles.length > 0 && (
        <div className="grid-list" style={{ marginBottom: 16 }}>
          {perfiles.map((p) => {
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
                  {m && (
                    <button className="btn small" onClick={() => elegirMazo(m)}>
                      Usar
                    </button>
                  )}
                </div>
                {p.mazos.length > 1 && (
                  <Desplegable
                    titulo={`Elegir otro de sus ${p.mazos.length} mazos`}
                    marcador="Buscar mazo por comandante"
                    opciones={opciones}
                    onElegir={(valor) => {
                      const mazo = p.mazos.find((x) => x.id === valor)
                      if (mazo) elegirMazo(mazo)
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="hint" style={{ marginTop: 0 }}>
        O escribe un comandante para esta partida, sin guardarlo como mazo:
      </p>
      <div className="row2">
        <div className="field">
          <label htmlFor="e-c">Comandante</label>
          <input
            id="e-c"
            type="text"
            value={c}
            onChange={(e) => {
              setC(e.target.value)
              setImagenId('')
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="e-c2">Compañero (opcional)</label>
          <input
            id="e-c2"
            type="text"
            value={c2}
            placeholder="Solo si lleva dos comandantes"
            onChange={(e) => {
              setC2(e.target.value)
              setImagenId2('')
            }}
          />
        </div>
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Identidad de color</label>
        <div className="colors">
          {COLORES.map((color) => (
            <button
              key={color}
              type="button"
              className="color-btn"
              aria-pressed={col.includes(color)}
              onClick={() => alternarColor(color)}
            >
              <i className={`pip ${color}`} />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

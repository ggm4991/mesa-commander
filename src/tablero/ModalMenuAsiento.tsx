import { useState } from 'react'
import { Icono } from '../componentes/icono/Icono'
import { Modal } from '../componentes/comunes/Modal'
import { COLORES } from '../componentes/mesa/colores'
import { CONTADORES, type CambiosJugador } from '../motor/vida'
import type { ContadorClave, Identidad, Juego } from '../motor/tipos'
import { ICONO_CONTADOR, MANA } from './constantesUI'

interface Props {
  juego: Juego
  indice: number
  onContador: (clave: ContadorClave, delta: number) => void
  onMana: (color: keyof Identidad | null) => void
  onRehacer: (delta: number) => void
  onFuera: (delta: number) => void
  onBendicion: () => void
  onMarcarFuera: () => void
  onEditar: (cambios: CambiosJugador) => void
  onCerrar: () => void
}

/** Sustituye a `menuAsiento()` en app.html: contadores, maná, jugadas retiradas,
 * pasadas de tiempo, bendición de la ciudad, y el acceso a editar al jugador o
 * marcarlo como fuera. Editar es un paso interno de este mismo componente. */
export function ModalMenuAsiento({
  juego,
  indice,
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
  const j = juego.j[indice]

  if (editando) {
    return (
      <EditarJugador
        jugador={j}
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
            <Icono nombre="lapiz" tamano={18} /> Cambiar nombre o comandante
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
              <span>Se vacía cuando quieras</span>
            </div>
          </span>
          <span className="stepper" style={{ gap: 4 }}>
            {MANA.map((m) => (
              <button
                key={m}
                style={{ width: 44, height: 44, padding: 0 }}
                title={`Maná ${m}`}
                onClick={() => onMana(m)}
              >
                <i className={`pip ${m}`} style={{ display: 'inline-block', width: 16, height: 16 }} />
              </button>
            ))}
            <button style={{ width: 'auto', padding: '0 12px', fontSize: '13.5px' }} onClick={() => onMana(null)}>
              Vaciar
            </button>
          </span>
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

function EditarJugador({
  jugador,
  onGuardar,
  onCancelar,
}: {
  jugador: Juego['j'][number]
  onGuardar: (cambios: CambiosJugador) => void
  onCancelar: () => void
}) {
  const [n, setN] = useState(jugador.n)
  const [c, setC] = useState(jugador.c)
  const [c2, setC2] = useState(jugador.c2 || '')
  const [col, setCol] = useState(jugador.col)

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
      titulo="Editar jugador"
      onCerrar={onCancelar}
      pie={
        <>
          <button className="btn" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn primary" onClick={() => onGuardar({ n, c, c2, col })}>
            Guardar
          </button>
        </>
      }
    >
      <div className="row2">
        <div className="field">
          <label htmlFor="e-n">Nombre</label>
          <input id="e-n" type="text" value={n} onChange={(e) => setN(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="e-c">Comandante</label>
          <input id="e-c" type="text" value={c} onChange={(e) => setC(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="e-c2">Compañero (opcional)</label>
        <input
          id="e-c2"
          type="text"
          value={c2}
          placeholder="Solo si lleva dos comandantes"
          onChange={(e) => setC2(e.target.value)}
        />
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

import { Icono } from '../componentes/icono/Icono'
import { Modal } from '../componentes/comunes/Modal'
import { Pips } from '../componentes/comunes/Pips'
import { DANO_COMANDANTE_LETAL, type ComandanteEnMesa, comandantesEnMesa } from '../motor/vida'
import type { Juego } from '../motor/tipos'

interface Props {
  juego: Juego
  indice: number
  onCambiar: (clave: string, delta: number) => void
  onCerrar: () => void
}

/** Sustituye a `panelDano()` en app.html: un contador por cada comandante en la
 * mesa (los propios primero, el suyo al final, por si se lo roban). */
export function ModalPanelDano({ juego, indice, onCambiar, onCerrar }: Props) {
  const j = juego.j[indice]
  const fuentes = comandantesEnMesa(juego)
  const otros = fuentes.filter((c) => c.k !== indice)
  const propios = fuentes.filter((c) => c.k === indice)

  const fila = (c: ComandanteEnMesa) => {
    const valor = j.dmg[c.clave] || 0
    return (
      <div className="line" key={c.clave}>
        <span className="txt">
          <Icono nombre="espadas" tamano={22} />
          <div>
            <b>{c.nombre}</b>
            <span>
              <Pips identidad={c.col} /> {c.k === indice ? 'tu propio comandante, si te lo roban' : `de ${c.dueno}`}
            </span>
          </div>
        </span>
        <span className="stepper">
          <button onClick={() => onCambiar(c.clave, -1)}>−</button>
          <span className={`val${valor >= DANO_COMANDANTE_LETAL ? ' letal' : ''}`}>{valor}</span>
          <button onClick={() => onCambiar(c.clave, 1)}>+</button>
        </span>
      </div>
    )
  }

  return (
    <Modal
      titulo={`Daño de comandante hacia ${j.n}`}
      onCerrar={onCerrar}
      pie={
        <button className="btn primary" onClick={onCerrar}>
          Listo
        </button>
      }
    >
      <p className="hint" style={{ margin: '0 0 14px' }}>
        Cada punto también le resta vida. A los {DANO_COMANDANTE_LETAL} de un mismo comandante queda fuera, aunque
        sea el suyo propio en manos de otro. Los compañeros cuentan por separado.
      </p>
      <div className="grid-list">
        {otros.map(fila)}
        {propios.length > 0 && (
          <p className="hint" style={{ margin: '6px 0 0' }}>
            Su propio comandante
          </p>
        )}
        {propios.map(fila)}
      </div>
    </Modal>
  )
}

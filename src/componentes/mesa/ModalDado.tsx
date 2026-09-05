import { useState } from 'react'
import { Modal } from '../comunes/Modal'

const lanzar = (caras: number): string =>
  caras === 2 ? (Math.random() < 0.5 ? 'Cara' : 'Cruz') : String(1 + Math.floor(Math.random() * caras))

/** Sustituye a `tirarDado()` en app.html: moneda, d6 o d20. */
export function ModalDado({ onCerrar }: { onCerrar: () => void }) {
  const [cara, setCara] = useState('—')

  return (
    <Modal
      titulo="Dados"
      onCerrar={onCerrar}
      pie={
        <>
          <button className="btn" onClick={() => setCara(lanzar(2))}>
            Moneda
          </button>
          <button className="btn" onClick={() => setCara(lanzar(6))}>
            d6
          </button>
          <button className="btn" onClick={() => setCara(lanzar(20))}>
            d20
          </button>
          <button className="btn primary" onClick={onCerrar}>
            Cerrar
          </button>
        </>
      }
    >
      <div className="dado">{cara}</div>
    </Modal>
  )
}

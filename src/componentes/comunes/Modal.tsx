import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  titulo: string
  pie?: React.ReactNode
  onCerrar: () => void
  children: React.ReactNode
}

/**
 * Sustituye a `abrirModal()`/`cerrarModal()` de app.html: en vez de una función
 * global que inyecta HTML en un `#modal` fijo, cada pantalla monta este componente
 * condicionalmente con su propio estado. Ver docs/decisiones/0006.
 */
export function Modal({ titulo, pie, onCerrar, children }: Props) {
  useEffect(() => {
    const alPulsarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPulsarTecla)
    return () => document.removeEventListener('keydown', alPulsarTecla)
  }, [onCerrar])

  return createPortal(
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-head">
          <h3>{titulo}</h3>
          <button className="close" aria-label="Cerrar" onClick={onCerrar}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {pie && <div className="modal-foot">{pie}</div>}
      </div>
    </div>,
    document.body,
  )
}

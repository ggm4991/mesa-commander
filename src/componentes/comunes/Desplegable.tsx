import { useState } from 'react'
import { Icono } from '../icono/Icono'

export interface OpcionDesplegable {
  valor: string
  titulo: string
  /** Texto contra el que busca; si no se da, se busca por `titulo`. */
  buscar?: string
  icono?: React.ReactNode
  marca?: string
}

interface Props {
  titulo: string
  marcador: string
  opciones: OpcionDesplegable[]
  onElegir: (valor: string) => void
}

/** Desplegable con buscador, portado de `desplegable()`/`activarDesplegables()` en
 * app.html. Sirve para cualquier lista larga (aquí, los mazos de un perfil). */
export function Desplegable({ titulo, marcador, opciones, onElegir }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const q = busqueda.trim().toLowerCase()
  const visibles = q ? opciones.filter((o) => (o.buscar ?? o.titulo).toLowerCase().includes(q)) : opciones

  return (
    <div className="dd">
      <button type="button" className="dd-btn" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
        <span>{titulo}</span>
        <Icono nombre="abajo" tamano={18} />
      </button>
      {abierto && (
        <div className="dd-panel">
          <span className="lupa">
            <Icono nombre="buscar" tamano={18} />
            <input
              type="search"
              className="dd-buscar"
              placeholder={marcador}
              autoComplete="off"
              autoFocus
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </span>
          <div className="dd-lista">
            {visibles.map((o) => (
              <button key={o.valor} type="button" className="dd-op" onClick={() => onElegir(o.valor)}>
                <span className="txt">
                  {o.icono}
                  <div>
                    <b>{o.titulo}</b>
                  </div>
                </span>
                {o.marca && <span className="badge">{o.marca}</span>}
              </button>
            ))}
          </div>
          {visibles.length === 0 && <p className="dd-vacio">Nada coincide con la búsqueda.</p>}
        </div>
      )}
    </div>
  )
}

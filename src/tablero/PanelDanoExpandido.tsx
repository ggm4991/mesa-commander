import { useEffect, useRef } from 'react'
import { DANO_COMANDANTE_LETAL, type ComandanteEnMesa } from '../motor/vida'
import { useImagenComandante } from '../red/scryfall/useImagenComandante'
import { Pips } from '../componentes/comunes/Pips'

const MS_AUTOCOLAPSO = 3000

interface Props {
  fuente: ComandanteEnMesa
  esPropio: boolean
  valor: number
  onSumar: () => void
  onRestar: () => void
  onCerrar: () => void
}

/**
 * Al mantener pulsado un sector del cuadrado de daño (ver `IconoDanoComandante`),
 * este panel cubre el cuadrado *entero* — no solo el hueco de esa fuente — con dos
 * mitades grandes de sumar/restar: los sectores normales son demasiado pequeños
 * para acertar el gesto con el dedo, sobre todo cuando un jugador lleva compañero
 * y su hueco ya está partido en dos. Se cierra solo al tocar fuera del cuadrado, a
 * los 3 segundos sin usarlo, o al sumar/restar (ver ADR 0020).
 */
export function PanelDanoExpandido({ fuente, esPropio, valor, onSumar, onRestar, onCerrar }: Props) {
  const imagenUrl = useImagenComandante(fuente.nombre, fuente.imagenId)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const onCerrarRef = useRef(onCerrar)
  useEffect(() => {
    onCerrarRef.current = onCerrar
  }, [onCerrar])
  const letal = valor >= DANO_COMANDANTE_LETAL

  // El registro del listener y el temporizador sí son solo de montaje/desmontaje:
  // este panel entero se desmonta al cerrarse (lo decide el padre soltando
  // `sectorAbierto`), así que no hace falta reiniciarlos en cada render.
  useEffect(() => {
    const cerrarSiEsFuera = (e: PointerEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) onCerrarRef.current()
    }
    document.addEventListener('pointerdown', cerrarSiEsFuera)
    const id = setTimeout(() => onCerrarRef.current(), MS_AUTOCOLAPSO)
    return () => {
      document.removeEventListener('pointerdown', cerrarSiEsFuera)
      clearTimeout(id)
    }
  }, [])

  const etiqueta = esPropio ? `${fuente.nombre}, tu propio comandante` : `${fuente.nombre} de ${fuente.dueno}`

  return (
    <div
      ref={contenedorRef}
      className={`dano-expandido${letal ? ' letal' : ''}`}
      style={imagenUrl ? { backgroundImage: `url("${imagenUrl}")` } : undefined}
    >
      {!imagenUrl && (
        <span className="dano-expandido-id">
          <Pips identidad={fuente.col} />
        </span>
      )}
      <span className="dano-expandido-titulo">{etiqueta}</span>
      <button type="button" className="dano-mitad dano-restar" aria-label={`Restar daño de ${etiqueta}: va en ${valor}`} onClick={onRestar}>
        −
      </button>
      <button type="button" className="dano-mitad dano-sumar" aria-label={`Sumar daño de ${etiqueta}: va en ${valor}`} onClick={onSumar}>
        +
      </button>
      <span className="dano-expandido-valor">{valor}</span>
    </div>
  )
}

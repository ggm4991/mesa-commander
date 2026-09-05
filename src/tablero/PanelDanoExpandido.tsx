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
 * y su hueco ya está partido en dos. Sumar y restar no lo cierran — se puede seguir
 * corrigiendo varias veces seguidas sin volver a mantener pulsado — solo se cierra
 * al tocar fuera del cuadrado o pasados unos segundos sin tocarlo, y cada toque
 * dentro del panel retrasa ese cierre (ver ADR 0023).
 */
export function PanelDanoExpandido({ fuente, esPropio, valor, onSumar, onRestar, onCerrar }: Props) {
  const imagenUrl = useImagenComandante(fuente.nombre, fuente.imagenId)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const onCerrarRef = useRef(onCerrar)
  useEffect(() => {
    onCerrarRef.current = onCerrar
  }, [onCerrar])
  const letal = valor >= DANO_COMANDANTE_LETAL

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const reiniciarAutocolapso = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onCerrarRef.current(), MS_AUTOCOLAPSO)
  }

  // El listener de "tocar fuera" es solo de montaje/desmontaje: este panel entero
  // se desmonta al cerrarse (lo decide el padre soltando `sectorAbierto`). El
  // temporizador de inactividad, en cambio, se reinicia con cada toque dentro del
  // panel (`reiniciarAutocolapso`), no solo al abrirse.
  useEffect(() => {
    const cerrarSiEsFuera = (e: PointerEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) onCerrarRef.current()
    }
    document.addEventListener('pointerdown', cerrarSiEsFuera)
    reiniciarAutocolapso()
    return () => {
      document.removeEventListener('pointerdown', cerrarSiEsFuera)
      clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <button
        type="button"
        className="dano-mitad dano-restar"
        aria-label={`Restar daño de ${etiqueta}: va en ${valor}`}
        onClick={() => {
          onRestar()
          reiniciarAutocolapso()
        }}
      >
        −
      </button>
      <button
        type="button"
        className="dano-mitad dano-sumar"
        aria-label={`Sumar daño de ${etiqueta}: va en ${valor}`}
        onClick={() => {
          onSumar()
          reiniciarAutocolapso()
        }}
      >
        +
      </button>
      <span className="dano-expandido-valor">{valor}</span>
    </div>
  )
}

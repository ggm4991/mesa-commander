import { useEffect, useRef, useState } from 'react'
import { Pips } from '../componentes/comunes/Pips'
import { DANO_COMANDANTE_LETAL, type ComandanteEnMesa } from '../motor/vida'
import { useImagenComandante } from '../red/scryfall/useImagenComandante'
import { useTocarYMantener } from './useTocarYMantener'

const MS_AUTOCOLAPSO = 3000

interface Props {
  fuente: ComandanteEnMesa
  esPropio: boolean
  valor: number
  onSumar: () => void
  onRestar: () => void
}

/**
 * Un sector del cuadrado de daño por cada comandante de la mesa, con su
 * ilustración o su identidad de color si no hay imagen (ver `useImagenComandante`),
 * y el daño acumulado como insignia. Un toque suma un punto directamente; mantener
 * pulsado no resta a ciegas, sino que abre el propio sector en dos mitades — sumar
 * y restar — que se cierran solas al tocar fuera o pasados unos segundos sin usarlas.
 * Sustituye al panel con un contador por fuente que abría `ModalPanelDano`,
 * siguiendo el mismo patrón de un contador de vidas de mesa como LifeTap: sin menú
 * intermedio (ver ADR 0016 y 0018).
 */
export function IconoDanoComandante({ fuente, esPropio, valor, onSumar, onRestar }: Props) {
  const imagenUrl = useImagenComandante(fuente.nombre, fuente.imagenId)
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const letal = valor >= DANO_COMANDANTE_LETAL

  const gesto = useTocarYMantener(onSumar, () => setAbierto(true))

  useEffect(() => {
    if (!abierto) return
    const cerrarSiEsFuera = (e: PointerEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('pointerdown', cerrarSiEsFuera)
    const id = setTimeout(() => setAbierto(false), MS_AUTOCOLAPSO)
    return () => {
      document.removeEventListener('pointerdown', cerrarSiEsFuera)
      clearTimeout(id)
    }
  }, [abierto])

  const etiqueta = esPropio ? `${fuente.nombre}, tu propio comandante` : `${fuente.nombre} de ${fuente.dueno}`

  return (
    <div
      ref={contenedorRef}
      className={`dano-cmd${valor > 0 ? ' activo' : ''}${letal ? ' letal' : ''}${abierto ? ' abierto' : ''}`}
      style={imagenUrl ? { backgroundImage: `url("${imagenUrl}")` } : undefined}
    >
      {abierto ? (
        <>
          <button
            type="button"
            className="dano-mitad dano-restar"
            aria-label={`Restar daño de ${etiqueta}: va en ${valor}`}
            onClick={() => {
              onRestar()
              setAbierto(false)
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
              setAbierto(false)
            }}
          >
            +
          </button>
        </>
      ) : (
        <button
          type="button"
          className="dano-toque"
          title={etiqueta}
          aria-label={`Daño de ${etiqueta}: ${valor}. Toca para sumar, mantén pulsado para abrir sumar/restar.`}
          {...gesto}
        >
          {!imagenUrl && <Pips identidad={fuente.col} />}
          {valor > 0 && <span className="dano-valor">{valor}</span>}
        </button>
      )}
    </div>
  )
}

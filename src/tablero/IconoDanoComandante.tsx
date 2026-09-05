import { Pips } from '../componentes/comunes/Pips'
import { DANO_COMANDANTE_LETAL, type ComandanteEnMesa } from '../motor/vida'
import { useImagenComandante } from '../red/scryfall/useImagenComandante'
import { useTocarYMantener } from './useTocarYMantener'

interface Props {
  fuente: ComandanteEnMesa
  esPropio: boolean
  valor: number
  onSumar: () => void
  onRestar: () => void
}

/**
 * Un toque por cada comandante de la mesa, con su ilustración o su identidad de
 * color si no hay imagen (ver `useImagenComandante`), y el daño acumulado como
 * insignia. Toca para sumar un punto, mantén pulsado para restar uno — sustituye al
 * panel con un contador por fuente que abría `ModalPanelDano`, siguiendo el mismo
 * patrón de un contador de vidas de mesa como LifeTap: sin menú intermedio.
 */
export function IconoDanoComandante({ fuente, esPropio, valor, onSumar, onRestar }: Props) {
  const imagenUrl = useImagenComandante(fuente.nombre)
  const gesto = useTocarYMantener(onSumar, onRestar)
  const letal = valor >= DANO_COMANDANTE_LETAL

  return (
    <button
      type="button"
      className={`dano-cmd${valor > 0 ? ' activo' : ''}${letal ? ' letal' : ''}`}
      style={imagenUrl ? { backgroundImage: `url("${imagenUrl}")` } : undefined}
      title={esPropio ? `${fuente.nombre} (tu propio comandante)` : `${fuente.nombre} — ${fuente.dueno}`}
      aria-label={`Daño de ${fuente.nombre}${esPropio ? ', tu propio comandante' : ` de ${fuente.dueno}`}: ${valor}. Toca para sumar, mantén pulsado para restar.`}
      {...gesto}
    >
      {!imagenUrl && <Pips identidad={fuente.col} />}
      {valor > 0 && <span className="dano-valor">{valor}</span>}
    </button>
  )
}

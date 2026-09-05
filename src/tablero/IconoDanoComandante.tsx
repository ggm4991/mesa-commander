import { Pips } from '../componentes/comunes/Pips'
import { DANO_COMANDANTE_LETAL, type ComandanteEnMesa } from '../motor/vida'
import { useImagenComandante } from '../red/scryfall/useImagenComandante'
import { useTocarYMantener } from './useTocarYMantener'

interface Props {
  fuente: ComandanteEnMesa
  esPropio: boolean
  valor: number
  onSumar: () => void
  /** Mantener pulsado no resta aquí mismo: pide al cuadrado entero que muestre el
   * panel expandido de esta fuente (ver `PanelDanoExpandido` y ADR 0020). */
  onAbrir: () => void
}

/**
 * Un sector del cuadrado de daño por cada comandante de la mesa, con su
 * ilustración o su identidad de color si no hay imagen (ver `useImagenComandante`),
 * y el daño acumulado como insignia. Un toque suma un punto directamente; mantener
 * pulsado abre el cuadrado entero en modo sumar/restar, porque el propio sector es
 * demasiado pequeño para acertar un gesto de precisión con el dedo. Sustituye al
 * panel con un contador por fuente que abría `ModalPanelDano`, siguiendo el mismo
 * patrón de un contador de vidas de mesa como LifeTap: sin menú intermedio (ver
 * ADR 0016, 0018 y 0020).
 */
export function IconoDanoComandante({ fuente, esPropio, valor, onSumar, onAbrir }: Props) {
  const imagenUrl = useImagenComandante(fuente.nombre, fuente.imagenId)
  const letal = valor >= DANO_COMANDANTE_LETAL
  const gesto = useTocarYMantener(onSumar, onAbrir)
  const etiqueta = esPropio ? `${fuente.nombre}, tu propio comandante` : `${fuente.nombre} de ${fuente.dueno}`

  return (
    <div
      className={`dano-cmd${valor > 0 ? ' activo' : ''}${letal ? ' letal' : ''}`}
      style={imagenUrl ? { backgroundImage: `url("${imagenUrl}")` } : undefined}
    >
      <button
        type="button"
        className="dano-toque"
        title={etiqueta}
        aria-label={`Daño de ${etiqueta}: ${valor}. Toca para sumar, mantén pulsado para ver el cuadro entero.`}
        {...gesto}
      >
        {!imagenUrl && <Pips identidad={fuente.col} />}
        {valor > 0 && <span className="dano-valor">{valor}</span>}
      </button>
    </div>
  )
}

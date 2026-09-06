import { forwardRef } from 'react'
import { Icono } from '../componentes/icono/Icono'
import type { Juego } from '../motor/tipos'
import { estadoReloj } from './reloj'

interface Props {
  juego: Juego
  ahora: number
  /** Si la disposición reserva una celda para el reloj, se ancla ahí en vez de flotar centrado. */
  areaCentro?: string
  /** Rotación del asiento de quien tiene el turno (0/90/180/270): el reloj se
   * gira igual para que esa persona pueda leer su propio tiempo sin ladear el
   * móvil (ver ADR 0024). */
  rotacionTurno?: number
  /** Alto medido en `Tablero` (ver ADR 0026 y 0033): sin fijarlo aquí, el fondo
   * de la barra se queda con su alto de siempre aunque el botón del reloj
   * girado a 90°/270° sea más alto que eso, y el reloj asoma por fuera. */
  altoBarra?: number
  onDeshacer: () => void
  onPausa: () => void
  onPasar: () => void
  onMenu: () => void
}

/** El cluster central: deshacer, pausa, pasar turno (con el reloj) y el menú de
 * la partida. Sustituye al `.hub` de `pintarTablero()`/`pintarCrono()`.
 *
 * Expone su nodo raíz por `ref`: `Tablero` mide su alto real para dimensionar
 * el hueco de `.board` a esa medida exacta, en vez de adivinar un número de
 * píxeles fijo que se queda corto en cuanto cambia el contenido (ver ADR
 * 0026). */
export const Hub = forwardRef<HTMLDivElement, Props>(function Hub(
  { juego, ahora, areaCentro, rotacionTurno = 0, altoBarra, onDeshacer, onPausa, onPasar, onMenu },
  ref,
) {
  const estado = estadoReloj(juego, ahora)
  const clasesPass = ['pass', estado.pasado && 'over', estado.cerca && 'aviso', estado.pausado && 'pausa']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={ref}
      className="hub"
      style={
        areaCentro
          ? { position: 'static', transform: 'none', gridArea: areaCentro, justifySelf: 'center', alignSelf: 'center' }
          : altoBarra
            ? { height: altoBarra }
            : undefined
      }
    >
      <button className="ico" aria-label="Deshacer lo último apuntado" onClick={onDeshacer}>
        <Icono nombre="deshacer" tamano={18} />
      </button>
      <button
        className={`ico${estado.pausado ? ' activo' : ''}`}
        aria-label="Parar o reanudar el tiempo"
        title={estado.pausado ? 'Reanudar el tiempo' : 'Parar el tiempo'}
        onClick={onPausa}
      >
        <Icono nombre={estado.pausado ? 'play' : 'pausa'} tamano={18} />
      </button>
      <button className={clasesPass} aria-label="Pasar turno" onClick={onPasar} data-rot={rotacionTurno}>
        <span>{estado.quien}</span>
        {estado.crono && <small>{estado.crono}</small>}
        {estado.estado && <span>{estado.estado}</span>}
      </button>
      <button className="ico" aria-label="Menú de la partida" onClick={onMenu}>
        <Icono nombre="puntos" tamano={18} />
      </button>
    </div>
  )
})

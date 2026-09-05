import { useCallback, useRef, useState } from 'react'
import { guardarJuego } from '../almacenamiento/repositorio'
import { deshacer as deshacerMotor, foto as fotoMotor } from '../motor/deshacer'
import type { Juego } from '../motor/tipos'
import { useAlmacen } from '../contextos/AlmacenContexto'

export interface UseJuegoEnCurso {
  juego: Juego
  /** Aplica una transformación del motor. `agrupar` agrupa fotos repetidas en
   * menos de 1500ms (pulsaciones largas), igual que `foto(true)` en el original. */
  mutar: (fn: (juego: Juego) => Juego, opciones?: { agrupar?: boolean }) => void
  /** Igual que `mutar`, pero sin pasar por `foto()`: el maná y la edición de
   * jugador a media partida tampoco lo hacían en el original (ver motor/vida.ts). */
  mutarSinFoto: (fn: (juego: Juego) => Juego) => void
  deshacer: () => void
}

/**
 * El store que la ADR 0004 dejó pendiente: centraliza la llamada a `foto()` antes
 * de cada mutación (el motor ya no la hace por su cuenta) y persiste después de
 * cada una, igual que hacía `guardarJuego()` tras cada mutador en app.html.
 */
export function useJuegoEnCurso(inicial: Juego): UseJuegoEnCurso {
  const almacen = useAlmacen()
  const [juego, setJuegoState] = useState<Juego>(inicial)
  const juegoRef = useRef(inicial)
  const ultimaFotoRef = useRef(0)

  const aplicar = useCallback(
    (siguiente: Juego) => {
      juegoRef.current = siguiente
      setJuegoState(siguiente)
      guardarJuego(almacen, siguiente)
    },
    [almacen],
  )

  const mutar = useCallback<UseJuegoEnCurso['mutar']>(
    (fn, opciones) => {
      const { juego: conFoto, ultimaFoto } = fotoMotor(juegoRef.current, {
        agrupar: opciones?.agrupar,
        ultimaFoto: ultimaFotoRef.current,
      })
      ultimaFotoRef.current = ultimaFoto
      aplicar(fn(conFoto))
    },
    [aplicar],
  )

  const mutarSinFoto = useCallback<UseJuegoEnCurso['mutarSinFoto']>(
    (fn) => {
      aplicar(fn(juegoRef.current))
    },
    [aplicar],
  )

  const deshacer = useCallback(() => {
    aplicar(deshacerMotor(juegoRef.current))
  }, [aplicar])

  return { juego, mutar, mutarSinFoto, deshacer }
}

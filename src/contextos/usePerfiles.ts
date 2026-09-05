import { useCallback, useEffect, useState } from 'react'
import { guardarPerfiles, leerPerfiles } from '../almacenamiento/repositorio'
import type { Perfil } from '../motor/tipos'
import { useAlmacen } from './AlmacenContexto'

export interface UsePerfiles {
  perfiles: Perfil[]
  cargando: boolean
  guardarTodos: (perfiles: Perfil[]) => Promise<void>
}

/** Carga los perfiles al montar y expone cómo volver a guardarlos todos, igual que
 * `PERFILES`/`guardarPerfiles()` en app.html pero como estado de React. */
export function usePerfiles(): UsePerfiles {
  const almacen = useAlmacen()
  const [perfiles, setPerfiles] = useState<Perfil[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let cancelado = false
    leerPerfiles(almacen).then((leidos) => {
      if (!cancelado) {
        setPerfiles(leidos)
        setCargando(false)
      }
    })
    return () => {
      cancelado = true
    }
  }, [almacen])

  const guardarTodos = useCallback(
    async (nuevos: Perfil[]) => {
      setPerfiles(nuevos)
      await guardarPerfiles(almacen, nuevos)
    },
    [almacen],
  )

  return { perfiles, cargando, guardarTodos }
}

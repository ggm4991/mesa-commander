import { createContext, useContext } from 'react'
import { almacenCapacitor } from '../almacenamiento/adaptadorCapacitor'
import type { AlmacenPersistente } from '../almacenamiento/tipos'

/** Por defecto, el almacén real de Capacitor. Los tests (y en el futuro, un modo
 * sin persistencia) pueden envolver el árbol en `<AlmacenContexto.Provider value={...}>`
 * con `crearAlmacenMemoria()` para no tocar disco. */
export const AlmacenContexto = createContext<AlmacenPersistente>(almacenCapacitor)

export function useAlmacen(): AlmacenPersistente {
  return useContext(AlmacenContexto)
}

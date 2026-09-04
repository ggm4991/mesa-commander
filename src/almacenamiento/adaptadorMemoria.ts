import type { AlmacenPersistente } from './tipos'

/**
 * Implementación en memoria del contrato de almacenamiento. No toca disco ni
 * depende de ningún runtime concreto — sirve para los tests y para cualquier
 * sitio donde no haga falta persistencia real.
 */
export function crearAlmacenMemoria(): AlmacenPersistente {
  const datos = new Map<string, string>()
  return {
    async get(clave) {
      return { value: datos.has(clave) ? datos.get(clave)! : null }
    },
    async set(clave, valor) {
      datos.set(clave, valor)
    },
  }
}

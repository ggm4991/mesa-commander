import { useCallback, useEffect, useRef, useState } from 'react'
import { guardarConfig, leerConfig } from '../almacenamiento/repositorio'
import { CONFIG_POR_DEFECTO, type Config } from '../almacenamiento/tipos'
import { useAlmacen } from './AlmacenContexto'

export interface UseConfig {
  config: Config
  cargando: boolean
  actualizar: (cambios: Partial<Config>) => Promise<void>
}

export function useConfig(): UseConfig {
  const almacen = useAlmacen()
  const [config, setConfig] = useState<Config>(CONFIG_POR_DEFECTO)
  const [cargando, setCargando] = useState(true)
  // Un ref además del estado: si `actualizar` se llama varias veces seguidas antes
  // de que React vuelva a renderizar, cada llamada tiene que partir del último
  // valor real, no de la `config` que capturó el render en curso.
  const configRef = useRef(config)

  useEffect(() => {
    let cancelado = false
    leerConfig(almacen).then((leida) => {
      if (!cancelado) {
        configRef.current = leida
        setConfig(leida)
        setCargando(false)
      }
    })
    return () => {
      cancelado = true
    }
  }, [almacen])

  const actualizar = useCallback(
    async (cambios: Partial<Config>) => {
      const nueva = { ...configRef.current, ...cambios }
      configRef.current = nueva
      setConfig(nueva)
      await guardarConfig(almacen, nueva)
    },
    [almacen],
  )

  return { config, cargando, actualizar }
}

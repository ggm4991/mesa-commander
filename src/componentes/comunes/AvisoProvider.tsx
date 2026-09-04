import { useCallback, useRef, useState } from 'react'
import { ContextoAviso, type MostrarAviso } from './contextoAviso'

const DURACION_MS = 2600

export function AvisoProvider({ children }: { children: React.ReactNode }) {
  const [texto, setTexto] = useState<string | null>(null)
  const idRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const mostrar = useCallback<MostrarAviso>((t) => {
    setTexto(t)
    clearTimeout(idRef.current)
    idRef.current = setTimeout(() => setTexto(null), DURACION_MS)
  }, [])

  return (
    <ContextoAviso.Provider value={mostrar}>
      {children}
      {texto != null && <div className="toast">{texto}</div>}
    </ContextoAviso.Provider>
  )
}

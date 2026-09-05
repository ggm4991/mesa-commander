import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAviso } from '../comunes/contextoAviso'
import { buscarPorNombreExacto } from '../../red/scryfall/cliente'
import { useSugerenciasComandante } from '../../red/scryfall/useSugerenciasComandante'

interface Props {
  id: string
  etiqueta: string
  valor: string
  placeholder: string
  onCambiar: (texto: string) => void
  /** Se llama solo al elegir una sugerencia de Scryfall, nunca al escribir a mano:
   * es la señal explícita de que el nombre es el de una carta real (ver ADR 0013). */
  onElegirSugerencia: (nombre: string, identidad: string | null) => void
}

/**
 * Campo de texto con autocompletado de Scryfall. Sugiere nombres mientras se
 * escribe (con el campo enfocado — ver `useSugerenciasComandante`), y al elegir uno
 * consulta su identidad de color para rellenarla sola. Escribir sin elegir ninguna
 * sugerencia sigue funcionando exactamente igual que antes de esta pantalla: la red
 * nunca bloquea ni sustituye la introducción manual (ver ADR 0013).
 */
export function CampoComandante({ id, etiqueta, valor, placeholder, onCambiar, onElegirSugerencia }: Props) {
  const [enfocado, setEnfocado] = useState(false)
  const { sugerencias } = useSugerenciasComandante(enfocado ? valor : '')
  const queryClient = useQueryClient()
  const mostrarAviso = useAviso()

  const elegir = async (nombre: string) => {
    onCambiar(nombre)
    setEnfocado(false)
    try {
      const info = await queryClient.fetchQuery({
        queryKey: ['scryfall', 'named', nombre.toLowerCase()],
        queryFn: ({ signal }) => buscarPorNombreExacto(nombre, signal),
      })
      onElegirSugerencia(nombre, info?.identidad ?? null)
    } catch {
      mostrarAviso('No se pudo consultar Scryfall: rellena la identidad de color a mano')
      onElegirSugerencia(nombre, null)
    }
  }

  return (
    <div className="field" style={{ position: 'relative' }}>
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        type="text"
        value={valor}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onCambiar(e.target.value)}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
      />
      {enfocado && sugerencias.length > 0 && (
        <div className="dd-panel dd-panel-flotante">
          <div className="dd-lista">
            {sugerencias.map((nombre) => (
              <button
                key={nombre}
                type="button"
                className="dd-op"
                // sin esto, el blur del input cierra la lista antes de que llegue el click
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(nombre)}
              >
                <span className="txt">
                  <div>
                    <b>{nombre}</b>
                  </div>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

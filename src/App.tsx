import { useState } from 'react'
import { AvisoProvider } from './componentes/comunes/AvisoProvider'
import { Previa } from './paginas/Previa'
import { Tablero } from './paginas/Tablero'
import type { Juego } from './motor/tipos'

type Pantalla = { nombre: 'previa' } | { nombre: 'tablero'; juego: Juego }

function Contenido() {
  const [pantalla, setPantalla] = useState<Pantalla>({ nombre: 'previa' })

  if (pantalla.nombre === 'tablero') {
    // El tablero es una superposición a pantalla completa, igual que `.board-screen`
    // en el original: mientras se juega no hay nav que mostrar.
    return (
      <Tablero
        juegoInicial={pantalla.juego}
        onSalir={() => setPantalla({ nombre: 'previa' })}
        onPartidaRegistrada={() => setPantalla({ nombre: 'previa' })}
      />
    )
  }

  return (
    <>
      <nav className="nav">
        <span className="brand">Mesa Commander</span>
        <button className="tab" aria-selected="true">
          Inicio
        </button>
        <button className="tab" aria-selected="false" disabled>
          Registro
        </button>
      </nav>
      <Previa onIrAlTablero={(juego) => setPantalla({ nombre: 'tablero', juego })} />
    </>
  )
}

function App() {
  return (
    <AvisoProvider>
      <Contenido />
    </AvisoProvider>
  )
}

export default App

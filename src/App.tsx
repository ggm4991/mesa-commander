import { useState } from 'react'
import { AvisoProvider } from './componentes/comunes/AvisoProvider'
import { Previa } from './paginas/Previa'
import { Registro } from './paginas/Registro'
import { Tablero } from './paginas/Tablero'
import type { Juego } from './motor/tipos'

type Pantalla = { nombre: 'previa' } | { nombre: 'registro' } | { nombre: 'tablero'; juego: Juego }

function Contenido() {
  const [pantalla, setPantalla] = useState<Pantalla>({ nombre: 'previa' })

  if (pantalla.nombre === 'tablero') {
    // El tablero es una superposición a pantalla completa, igual que `.board-screen`
    // en el original: mientras se juega no hay nav que mostrar.
    return (
      <Tablero
        juegoInicial={pantalla.juego}
        onSalir={() => setPantalla({ nombre: 'previa' })}
        onPartidaRegistrada={() => setPantalla({ nombre: 'registro' })}
      />
    )
  }

  return (
    <>
      <nav className="nav">
        <span className="brand">
          Mesa Commander
          <span className="version" title={`Build del ${__BUILD_TIME__}`}>
            v{__APP_VERSION__} · {__BUILD_TIME__.slice(0, 16).replace('T', ' ')}
          </span>
        </span>
        <button className="tab" aria-selected={pantalla.nombre === 'previa'} onClick={() => setPantalla({ nombre: 'previa' })}>
          Inicio
        </button>
        <button className="tab" aria-selected={pantalla.nombre === 'registro'} onClick={() => setPantalla({ nombre: 'registro' })}>
          Registro
        </button>
      </nav>
      {pantalla.nombre === 'registro' ? (
        <Registro />
      ) : (
        <Previa onIrAlTablero={(juego) => setPantalla({ nombre: 'tablero', juego })} />
      )}
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

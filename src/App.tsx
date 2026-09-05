import { useState } from 'react'
import { AvisoProvider } from './componentes/comunes/AvisoProvider'
import { Previa } from './paginas/Previa'
import type { Juego } from './motor/tipos'

type Pantalla = { nombre: 'previa' } | { nombre: 'tablero'; juego: Juego }

function Contenido() {
  const [pantalla, setPantalla] = useState<Pantalla>({ nombre: 'previa' })

  return (
    <>
      <nav className="nav">
        <span className="brand">Mesa Commander</span>
        <button className="tab" aria-selected={pantalla.nombre === 'previa'} onClick={() => setPantalla({ nombre: 'previa' })}>
          Inicio
        </button>
        <button className="tab" aria-selected="false" disabled>
          Registro
        </button>
      </nav>
      {pantalla.nombre === 'previa' ? (
        <Previa onIrAlTablero={(juego) => setPantalla({ nombre: 'tablero', juego })} />
      ) : (
        // El tablero de verdad (vidas, contadores, corona) llega en el próximo commit de la Fase 3.
        <div className="wrap page on">
          <h2>Partida en marcha</h2>
          <p className="hint">
            {pantalla.juego.j.length} jugadores a {pantalla.juego.cfg.vida} vidas. El tablero real llega en el
            siguiente commit.
          </p>
          <button className="btn" onClick={() => setPantalla({ nombre: 'previa' })}>
            Volver a la pantalla previa
          </button>
        </div>
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

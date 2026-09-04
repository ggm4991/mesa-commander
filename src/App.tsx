import { useState } from 'react'
import { AvisoProvider } from './componentes/comunes/AvisoProvider'
import { useAviso } from './componentes/comunes/contextoAviso'
import { Modal } from './componentes/comunes/Modal'
import { Icono } from './componentes/icono/Icono'

// Página temporal: demuestra que el nav, los botones, el modal y el aviso ya
// funcionan, mientras las pantallas reales (Previa, Tablero, Registro) se
// portan en los próximos commits de la Fase 3.
function Contenido() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const mostrarAviso = useAviso()

  return (
    <>
      <nav className="nav">
        <span className="brand">Mesa Commander</span>
        <button className="tab" aria-selected="true">
          Inicio
        </button>
        <button className="tab" aria-selected="false">
          Registro
        </button>
      </nav>
      <div className="wrap page on">
        <h2>
          <Icono nombre="corona" /> En migración desde app.html
        </h2>
        <p className="lead">Las pantallas reales llegan en los próximos commits de la Fase 3.</p>
        <div className="actions">
          <button className="btn primary" onClick={() => setModalAbierto(true)}>
            Abrir modal de ejemplo
          </button>
          <button className="btn" onClick={() => mostrarAviso('Esto es un aviso')}>
            Mostrar aviso
          </button>
        </div>
      </div>
      {modalAbierto && (
        <Modal
          titulo="Modal de ejemplo"
          onCerrar={() => setModalAbierto(false)}
          pie={
            <button className="btn primary" onClick={() => setModalAbierto(false)}>
              Cerrar
            </button>
          }
        >
          <p>El motor y el almacenamiento ya están portados; esta pantalla llega con la Fase 3.</p>
        </Modal>
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

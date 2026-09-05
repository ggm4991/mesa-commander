import { useState } from 'react'
import { Modal } from '../componentes/comunes/Modal'
import { Icono } from '../componentes/icono/Icono'
import { hoy } from '../motor/utilidades'
import { paqueteCompleto, revisarPaquete } from './copiaSeguridad'
import type { PaqueteRevisado } from './copiaSeguridad'
import type { Config } from '../almacenamiento/tipos'
import type { Partida, Perfil } from '../motor/tipos'

interface Props {
  partidas: Partida[]
  perfiles: Perfil[]
  config: Config
  onReemplazarTodo: (d: PaqueteRevisado) => void
  onCombinar: (d: PaqueteRevisado) => void
  onRestaurarEjemplo: () => void
  onCerrar: () => void
}

/** Sustituye a `copiaSeguridad()` en app.html: un único JSON con partidas, perfiles
 * y ajustes, descargable, copiable, o cargable desde otro dispositivo. Todo local:
 * no hace ninguna llamada de red. */
export function ModalCopiaSeguridad({ partidas, perfiles, config, onReemplazarTodo, onCombinar, onRestaurarEjemplo, onCerrar }: Props) {
  const [texto, setTexto] = useState(() => JSON.stringify(paqueteCompleto(partidas, perfiles, config), null, 2))
  const [mensaje, setMensaje] = useState<{ texto: string; mal: boolean } | null>(null)

  const descargar = () => {
    try {
      const blob = new Blob([JSON.stringify(paqueteCompleto(partidas, perfiles, config), null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mesa-commander-${hoy()}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
      setMensaje({ texto: 'Archivo generado. Si tu navegador bloquea la descarga, copia el texto de abajo.', mal: false })
    } catch {
      setMensaje({ texto: 'Este navegador no deja descargar desde aquí. Copia el texto de abajo.', mal: true })
    }
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setMensaje({ texto: 'Copiado. Pégalo en una nota o en el otro dispositivo.', mal: false })
    } catch {
      setMensaje({ texto: 'Selecciónalo y cópialo a mano: el navegador no da acceso al portapapeles.', mal: true })
    }
  }

  const abrirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const lector = new FileReader()
    lector.onload = () => {
      setTexto(String(lector.result))
      setMensaje({ texto: `Cargado ${f.name}. Ahora elige reemplazar o combinar.`, mal: false })
    }
    lector.onerror = () => setMensaje({ texto: 'No se ha podido leer el archivo.', mal: true })
    lector.readAsText(f)
  }

  const conPaqueteRevisado = (usar: (d: PaqueteRevisado) => void) => {
    try {
      usar(revisarPaquete(texto))
    } catch (err) {
      setMensaje({ texto: err instanceof Error ? err.message : String(err), mal: true })
    }
  }

  return (
    <Modal
      titulo="Copia de seguridad"
      onCerrar={onCerrar}
      pie={
        <>
          <button className="btn danger" onClick={onRestaurarEjemplo}>
            <Icono nombre="deshacer" tamano={18} /> Restaurar ejemplo
          </button>
          <button className="btn" onClick={onCerrar}>
            Cerrar
          </button>
          <button className="btn" onClick={() => conPaqueteRevisado(onCombinar)}>
            Combinar
          </button>
          <button className="btn primary" onClick={() => conPaqueteRevisado(onReemplazarTodo)}>
            Reemplazar todo
          </button>
        </>
      }
    >
      <p className="hint" style={{ margin: '0 0 12px' }}>
        Todo lo de la app en un archivo: {partidas.length} partidas, {perfiles.length} perfiles y tus ajustes.
        Descárgalo, o cópialo y pégalo en otro dispositivo.
      </p>
      <div className="actions" style={{ marginBottom: 14 }}>
        <button className="btn" onClick={descargar}>
          <Icono nombre="datos" tamano={18} /> Descargar archivo
        </button>
        <button className="btn" onClick={copiar}>
          <Icono nombre="lista" tamano={18} /> Copiar al portapapeles
        </button>
        <label className="btn" htmlFor="cs-archivo">
          <Icono nombre="mas" tamano={18} /> Abrir un archivo
        </label>
        <input type="file" id="cs-archivo" accept=".json,application/json" style={{ display: 'none' }} onChange={abrirArchivo} />
      </div>
      <textarea spellCheck={false} value={texto} onChange={(e) => setTexto(e.target.value)} />
      {mensaje && <div className={mensaje.mal ? 'errors' : 'hint'} style={{ margin: '12px 0 0' }}>{mensaje.texto}</div>}
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { guardarPartidas, leerPartidas } from '../almacenamiento/repositorio'
import { useAviso } from '../componentes/comunes/contextoAviso'
import { useAlmacen } from '../contextos/AlmacenContexto'
import { useConfig } from '../contextos/useConfig'
import { usePerfiles } from '../contextos/usePerfiles'
import { calcularJugadores, nombresComandantes, nombresJugadores } from '../registro/calcularJugadores'
import type { CampoOrden, Orden } from '../registro/Ranking'
import { Ranking } from '../registro/Ranking'
import { Ficha } from '../registro/Ficha'
import { ModalFormularioPartida } from '../registro/ModalFormularioPartida'
import { ModalCopiaSeguridad } from '../registro/ModalCopiaSeguridad'
import { Modal } from '../componentes/comunes/Modal'
import { filtrarPartidas, partidasDeJugador } from '../registro/filtrarPartidas'
import { huellaMazo, huellaPartida } from '../registro/copiaSeguridad'
import type { PaqueteRevisado } from '../registro/copiaSeguridad'
import { partidasDemo, perfilesDemo } from '../registro/datosDemo'
import type { Partida } from '../motor/tipos'

type VistaReg = { tipo: 'ranking' } | { tipo: 'jugador'; nombre: string }

type EstadoModal =
  | { tipo: 'formulario'; editando: Partida | null }
  | { tipo: 'borrar'; partida: Partida }
  | { tipo: 'renombrar'; nombre: string }
  | { tipo: 'copia' }

/** Sustituye a `pintarRegistro()` (sección 10 de app.html): clasificación, ficha
 * por jugador, alta/edición/borrado manual y la copia de seguridad de toda la app.
 * La clasificación es la única vista derivada: nunca guarda un total aparte, lo
 * recalcula siempre desde las partidas (ver invariante en CLAUDE.md). */
export function Registro() {
  const almacen = useAlmacen()
  const mostrarAviso = useAviso()
  const { perfiles, guardarTodos: guardarPerfiles } = usePerfiles()
  const { config, actualizar: actualizarConfig } = useConfig()

  const [partidas, setPartidas] = useState<Partida[] | null>(null)
  // Optimista: solo se pone en falso si un guardado de verdad falla, igual que
  // `persistente` en app.html se ponía a `true` en el primer `escribir()` que
  // funcionaba y a `false` en el primero que no.
  const [persistente, setPersistente] = useState(true)
  const [vista, setVista] = useState<VistaReg>({ tipo: 'ranking' })
  const [orden, setOrden] = useState<Orden>({ campo: 'pts', dir: -1 })
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState<EstadoModal | null>(null)

  useEffect(() => {
    leerPartidas(almacen).then(setPartidas)
  }, [almacen])

  if (!partidas) return null

  // Si el jugador de la ficha abierta ya no existe (se borró su única partida, o
  // se le cambió el nombre desde otra pestaña), la vista vuelve sola a la
  // clasificación — corregido aquí, durante el render, en vez de en un efecto:
  // es React ajustando su propio estado a un cambio de props, no sincronizando
  // con nada externo.
  if (vista.tipo === 'jugador' && !nombresJugadores(partidas).includes(vista.nombre)) {
    setVista({ tipo: 'ranking' })
  }

  const guardarPartidasLocal = async (nuevas: Partida[]) => {
    setPartidas(nuevas)
    const ok = await guardarPartidas(almacen, nuevas)
    setPersistente(ok)
    return ok
  }

  const ordenar = (campo: CampoOrden) => {
    setOrden((o) => (o.campo === campo ? { campo, dir: (o.dir * -1) as 1 | -1 } : { campo, dir: -1 }))
  }

  const elegirJugador = (nombre: string) => {
    setVista({ tipo: 'jugador', nombre })
    setBusqueda('')
    // jsdom no implementa la sobrecarga con objeto de opciones; en un navegador real sí.
    try {
      window.scrollTo({ top: 0 })
    } catch {
      /* noop en entornos sin scroll real (tests) */
    }
  }

  const guardarFormulario = async (partida: Partida) => {
    const i = partidas.findIndex((p) => p.id === partida.id)
    const nuevas = i >= 0 ? partidas.map((p, idx) => (idx === i ? partida : p)) : [...partidas, partida]
    await guardarPartidasLocal(nuevas)
    setModal(null)
    mostrarAviso(modal?.tipo === 'formulario' && modal.editando ? 'Partida actualizada' : 'Partida registrada')
  }

  const confirmarBorrado = async (id: string) => {
    await guardarPartidasLocal(partidas.filter((p) => p.id !== id))
    setModal(null)
    mostrarAviso('Partida eliminada')
  }

  const confirmarRenombrar = async (nombreActual: string, nuevo: string) => {
    const nombreFinal = nuevo.trim()
    if (!nombreFinal) return
    await guardarPartidasLocal(
      partidas.map((p) => ({ ...p, seats: p.seats.map((s) => (s.j === nombreActual ? { ...s, j: nombreFinal } : s)) })),
    )
    setModal(null)
    setVista({ tipo: 'jugador', nombre: nombreFinal })
    mostrarAviso('Nombre actualizado')
  }

  const reemplazarTodo = async (d: PaqueteRevisado) => {
    await guardarPartidasLocal(d.partidas)
    if (d.perfiles.length) await guardarPerfiles(d.perfiles)
    if (d.config) await actualizarConfig(d.config)
    setModal(null)
    setVista({ tipo: 'ranking' })
    mostrarAviso('Datos reemplazados')
  }

  const combinar = async (d: PaqueteRevisado) => {
    const ids = new Set(partidas.map((g) => g.id))
    const huellas = new Set(partidas.map(huellaPartida))
    const partidasFinal = [...partidas]
    let nuevas = 0
    for (const g of d.partidas) {
      if (ids.has(g.id) || huellas.has(huellaPartida(g))) continue
      partidasFinal.push(g)
      ids.add(g.id)
      huellas.add(huellaPartida(g))
      nuevas++
    }
    const perfilesFinal = perfiles.map((p) => ({ ...p, mazos: [...p.mazos] }))
    let perfilesNuevos = 0
    let mazosNuevos = 0
    for (const p of d.perfiles) {
      const mio = perfilesFinal.find((x) => x.nombre.toLowerCase() === p.nombre.toLowerCase())
      if (!mio) {
        perfilesFinal.push(p)
        perfilesNuevos++
        continue
      }
      const tengo = new Set(mio.mazos.map(huellaMazo))
      for (const m of p.mazos) {
        if (tengo.has(huellaMazo(m))) continue
        mio.mazos.push(m)
        tengo.add(huellaMazo(m))
        mazosNuevos++
      }
    }
    await Promise.all([guardarPartidasLocal(partidasFinal), guardarPerfiles(perfilesFinal)])
    setModal(null)
    mostrarAviso(`${nuevas} partidas, ${perfilesNuevos} perfiles y ${mazosNuevos} mazos añadidos`)
  }

  const restaurarEjemplo = async () => {
    await Promise.all([guardarPartidasLocal(partidasDemo()), guardarPerfiles(perfilesDemo())])
    setModal(null)
    setVista({ tipo: 'ranking' })
    mostrarAviso('Datos de ejemplo restaurados')
  }

  const jugadores = calcularJugadores(partidas)
  const jugadoresOrdenados = [...jugadores].sort((a, b) => {
    const va = a[orden.campo]
    const vb = b[orden.campo]
    return va === vb ? a.nombre.localeCompare(b.nombre) : (va > vb ? 1 : -1) * orden.dir
  })

  return (
    <div className="wrap page on">
      {vista.tipo === 'ranking' ? (
        <Ranking
          partidas={partidas}
          jugadores={jugadoresOrdenados}
          nombresUnicos={nombresJugadores(partidas).length}
          orden={orden}
          persistente={persistente}
          onOrdenar={ordenar}
          onElegirJugador={elegirJugador}
          onNuevaPartida={() => setModal({ tipo: 'formulario', editando: null })}
          onCopiaSeguridad={() => setModal({ tipo: 'copia' })}
        />
      ) : (
        (() => {
          const jugador = jugadores.find((x) => x.nombre === vista.nombre)
          if (!jugador) return null
          const propias = partidasDeJugador(partidas, vista.nombre)
          return (
            <Ficha
              jugador={jugador}
              partidasJugador={propias}
              partidasFiltradas={filtrarPartidas(propias, vista.nombre, busqueda)}
              busqueda={busqueda}
              onBuscar={setBusqueda}
              onVolver={() => setVista({ tipo: 'ranking' })}
              onRenombrar={() => setModal({ tipo: 'renombrar', nombre: vista.nombre })}
              onNuevaPartida={() => setModal({ tipo: 'formulario', editando: null })}
              onEditar={(id) => setModal({ tipo: 'formulario', editando: partidas.find((p) => p.id === id) ?? null })}
              onBorrar={(id) => {
                const partida = partidas.find((p) => p.id === id)
                if (partida) setModal({ tipo: 'borrar', partida })
              }}
            />
          )
        })()
      )}

      {modal?.tipo === 'formulario' && (
        <ModalFormularioPartida
          partida={modal.editando}
          nombresJugadores={nombresJugadores(partidas)}
          nombresComandantes={nombresComandantes(partidas)}
          onGuardar={guardarFormulario}
          onCancelar={() => setModal(null)}
        />
      )}

      {modal?.tipo === 'borrar' && (
        <Modal
          titulo="Eliminar partida"
          onCerrar={() => setModal(null)}
          pie={
            <>
              <button className="btn" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button className="btn danger" onClick={() => confirmarBorrado(modal.partida.id)}>
                Eliminar partida
              </button>
            </>
          }
        >
          <p style={{ margin: 0 }}>
            Se borrará la partida del {modal.partida.fecha} con {modal.partida.seats.map((s) => s.j).join(', ')}. La
            clasificación se recalculará sin ella y no se puede deshacer.
          </p>
        </Modal>
      )}

      {modal?.tipo === 'renombrar' && (
        <ModalRenombrar nombre={modal.nombre} partidas={partidas} onCancelar={() => setModal(null)} onConfirmar={confirmarRenombrar} />
      )}

      {modal?.tipo === 'copia' && (
        <ModalCopiaSeguridad
          partidas={partidas}
          perfiles={perfiles}
          config={config}
          onReemplazarTodo={reemplazarTodo}
          onCombinar={combinar}
          onRestaurarEjemplo={restaurarEjemplo}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  )
}

interface PropsRenombrar {
  nombre: string
  partidas: Partida[]
  onCancelar: () => void
  onConfirmar: (nombreActual: string, nuevo: string) => void
}

function ModalRenombrar({ nombre, partidas, onCancelar, onConfirmar }: PropsRenombrar) {
  const [valor, setValor] = useState(nombre)
  const cuantas = partidas.filter((p) => p.seats.some((s) => s.j === nombre)).length
  return (
    <Modal
      titulo="Cambiar el nombre del jugador"
      onCerrar={onCancelar}
      pie={
        <>
          <button className="btn" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn primary" onClick={() => onConfirmar(nombre, valor)}>
            Cambiar el nombre
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="nuevo">Nombre nuevo</label>
        <input id="nuevo" type="text" value={valor} autoFocus onChange={(e) => setValor(e.target.value)} />
      </div>
      <p className="hint" style={{ margin: 0 }}>
        Se cambiará en las {cuantas} partidas donde aparece.
      </p>
    </Modal>
  )
}

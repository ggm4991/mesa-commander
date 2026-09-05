import { useEffect, useRef, useState } from 'react'
import { guardarJuego, leerJuego } from '../almacenamiento/repositorio'
import { Icono } from '../componentes/icono/Icono'
import { Modal } from '../componentes/comunes/Modal'
import { useAviso } from '../componentes/comunes/contextoAviso'
import { EditorPerfil } from '../componentes/mesa/EditorPerfil'
import { ModalDado } from '../componentes/mesa/ModalDado'
import { ModalElegirAsiento } from '../componentes/mesa/ModalElegirAsiento'
import { ModalGestionarPerfiles } from '../componentes/mesa/ModalGestionarPerfiles'
import { VistaMesa } from '../componentes/mesa/VistaMesa'
import { DISPOS, conDisposicionGuardada, dispoActual } from '../componentes/mesa/disposiciones'
import { asientoDesde, mazoUltimo } from '../componentes/mesa/perfiles'
import { useAlmacen } from '../contextos/AlmacenContexto'
import { useConfig } from '../contextos/useConfig'
import { usePerfiles } from '../contextos/usePerfiles'
import { empezarPartida as empezarPartidaMotor } from '../motor/partida'
import type { Asiento, Juego, Mazo, Perfil } from '../motor/tipos'
import { fechaLarga, reloj } from '../motor/utilidades'

const VIDAS_OPCIONES = [20, 25, 30, 40]
const LIMITES_OPCIONES = [0, 180, 300, 600]

type EstadoModal =
  | { tipo: 'elegirAsiento'; indice: number }
  | { tipo: 'gestionarPerfiles' }
  | { tipo: 'editorPerfil'; perfil: Perfil | null; conEliminar: boolean; alGuardar?: (perfil: Perfil) => void }
  | { tipo: 'dado' }
  | { tipo: 'vidaPersonalizada' }
  | { tipo: 'quienEmpieza'; indice: number }
  | { tipo: 'confirmarDescartar' }

interface Props {
  /** Se llama tanto al empezar una partida nueva como al continuar una a medias. */
  onIrAlTablero: (juego: Juego) => void
}

/** Sustituye a `pintarInicio()` (sección 6 de app.html): número de jugadores,
 * disposición de mesa, vida inicial, límite de turno, y arrancar la partida. La
 * copia de seguridad ("Copia de seguridad de toda la app") llega con el Registro,
 * que es donde vive el resto de esa función en el original. */
export function Previa({ onIrAlTablero }: Props) {
  const almacen = useAlmacen()
  const mostrarAviso = useAviso()
  const { perfiles, cargando: cargandoPerfiles, guardarTodos } = usePerfiles()
  const { config, actualizar: actualizarConfig } = useConfig()

  const [mesa, setMesa] = useState<(Asiento | null)[]>([null, null, null, null])
  const [inicia, setInicia] = useState<number | null>(null)
  const [modal, setModal] = useState<EstadoModal | null>(null)
  const [valorVida, setValorVida] = useState('')
  const [juego, setJuego] = useState<Juego | null>(null)

  const sembrado = useRef(false)
  useEffect(() => {
    if (cargandoPerfiles || sembrado.current) return
    sembrado.current = true
    const iniciales: (Asiento | null)[] = perfiles.slice(0, 4).map((p) => asientoDesde(p, mazoUltimo(p)))
    while (iniciales.length < 4) iniciales.push(null)
    setMesa(iniciales)
  }, [cargandoPerfiles, perfiles])

  useEffect(() => {
    leerJuego(almacen).then(setJuego)
  }, [almacen])

  const dispo = dispoActual(mesa.length, config.disposicion)

  const manejarNumJugadores = (n: number) => {
    setMesa((m) => {
      const nueva = m.slice(0, n)
      while (nueva.length < n) nueva.push(null)
      return nueva
    })
    setInicia((actual) => (actual != null && actual >= n ? null : actual))
  }

  const manejarDisposicion = (id: string) => {
    const d = DISPOS[mesa.length].find((x) => x.id === id)
    if (d) actualizarConfig({ disposicion: conDisposicionGuardada(config.disposicion, mesa.length, { id: d.id, rot: d.rot }) })
  }

  const manejarGirarAsiento = (indice: number) => {
    const rot = dispo.rot.map((r, idx) => (idx === indice ? ((r || 0) + 90) % 360 : r))
    actualizarConfig({ disposicion: conDisposicionGuardada(config.disposicion, mesa.length, { id: dispo.id, rot }) })
  }

  const manejarGirarTodo = () => {
    const rot = dispo.rot.map((r) => ((r || 0) + 90) % 360)
    actualizarConfig({ disposicion: conDisposicionGuardada(config.disposicion, mesa.length, { id: dispo.id, rot }) })
  }

  const manejarBarajar = () => {
    setMesa((m) => {
      const copia = [...m]
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copia[i], copia[j]] = [copia[j], copia[i]]
      }
      return copia
    })
    setInicia(null)
    mostrarAviso('Asientos barajados')
  }

  const manejarQuienEmpieza = () => {
    const ocupados = mesa.map((s, i) => (s ? i : -1)).filter((i) => i >= 0)
    if (!ocupados.length) {
      mostrarAviso('Primero coloca a alguien en la mesa')
      return
    }
    const elegido = ocupados[Math.floor(Math.random() * ocupados.length)]
    setInicia(elegido)
    setModal({ tipo: 'quienEmpieza', indice: elegido })
  }

  const sentarConMazo = async (indice: number, perfil: Perfil, mazo: Mazo | null) => {
    setMesa((m) => m.map((s, idx) => (idx === indice ? asientoDesde(perfil, mazo) : s)))
    if (mazo && perfil.ultimo !== mazo.id) {
      const actualizado = { ...perfil, ultimo: mazo.id }
      await guardarTodos(perfiles.map((p) => (p.id === actualizado.id ? actualizado : p)))
    }
    setModal(null)
  }

  const guardarPerfil = async (perfil: Perfil, alGuardarExtra?: (perfil: Perfil) => void) => {
    const i = perfiles.findIndex((x) => x.id === perfil.id)
    const nuevos = i >= 0 ? perfiles.map((x, idx) => (idx === i ? perfil : x)) : [...perfiles, perfil]
    await guardarTodos(nuevos)
    setModal(null)
    alGuardarExtra?.(perfil)
    mostrarAviso('Perfil guardado')
  }

  const eliminarPerfil = async (id: string) => {
    await guardarTodos(perfiles.filter((x) => x.id !== id))
    setModal(null)
    mostrarAviso('Perfil eliminado')
  }

  const manejarEmpezar = async () => {
    const gente = mesa.filter((s): s is Asiento => s != null)
    if (gente.length < 1) {
      mostrarAviso('Sienta al menos a un jugador')
      return
    }
    if (gente.length !== mesa.length) {
      mostrarAviso('Hay asientos libres. Quítalos o siéntate a alguien.')
      return
    }
    const nuevoJuego = empezarPartidaMotor({
      asientos: gente,
      vidaInicial: config.vidaInicial,
      limiteTurno: config.limiteTurno,
      dispo,
      turnoInicial: inicia,
    })
    await guardarJuego(almacen, nuevoJuego)
    onIrAlTablero(nuevoJuego)
  }

  const confirmarDescartar = async () => {
    await guardarJuego(almacen, null)
    setJuego(null)
    setModal(null)
  }

  return (
    <div className="wrap page on">
      <div className="top">
        <h1>Contador de vidas con memoria</h1>
        <p>
          Lleva la partida como cualquier contador, y al terminarla la guarda sola en el registro: quién ganó,
          quién rehizo jugadas, quién se pasó de tiempo y quién tuvo el turno más largo.
        </p>
      </div>

      {juego && (
        <>
          <div className="section-head">
            <h2>Tienes una partida a medias</h2>
            <span className="actions">
              <button className="btn danger small" onClick={() => setModal({ tipo: 'confirmarDescartar' })}>
                Descartar
              </button>
              <button className="btn primary" onClick={() => onIrAlTablero(juego)}>
                Volver a la partida
              </button>
            </span>
          </div>
          <p className="hint">
            {juego.j.length} jugadores, empezó el {fechaLarga(juego.inicio.slice(0, 10))}.
          </p>
        </>
      )}

      <div className="setup">
        <h2>Jugadores</h2>
        <div className="opts">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              className="opt"
              aria-pressed={mesa.length === n}
              onClick={() => manejarNumJugadores(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <h2>Cómo os sentáis</h2>
        <div className="opts">
          {DISPOS[mesa.length].map((d) => (
            <button
              key={d.id}
              type="button"
              className="opt"
              aria-pressed={d.id === dispo.id}
              onClick={() => manejarDisposicion(d.id)}
            >
              {d.n}
            </button>
          ))}
        </div>
        <VistaMesa
          mesa={mesa}
          dispo={dispo}
          inicia={inicia}
          onElegirAsiento={(i) => setModal({ tipo: 'elegirAsiento', indice: i })}
          onGirarAsiento={manejarGirarAsiento}
        />
        <p className="hint" style={{ margin: '10px 0 0' }}>
          Toca un asiento para sentar a alguien, o el botón de giro para orientarlo hacia su sitio.{' '}
          {inicia != null && mesa[inicia] ? (
            <>
              Empieza <b style={{ color: 'var(--brass)' }}>{mesa[inicia]?.nombre}</b>.
            </>
          ) : (
            'Si no sorteas quién empieza, arrancará el primero que toque su asiento.'
          )}
        </p>
        <div className="actions" style={{ marginTop: 12 }}>
          <button className="btn small" onClick={manejarBarajar}>
            <Icono nombre="barajar" tamano={17} /> Barajar los asientos
          </button>
          <button className="btn small" onClick={manejarGirarTodo}>
            <Icono nombre="girar" tamano={17} /> Girar la mesa entera
          </button>
          <button className="btn small" onClick={() => setModal({ tipo: 'gestionarPerfiles' })}>
            <Icono nombre="persona" tamano={17} /> Perfiles ({perfiles.length})
          </button>
        </div>

        <h2>Vida inicial</h2>
        <div className="opts">
          {VIDAS_OPCIONES.map((v) => (
            <button
              key={v}
              type="button"
              className="opt"
              aria-pressed={config.vidaInicial === v}
              onClick={() => actualizarConfig({ vidaInicial: v })}
            >
              {v}
            </button>
          ))}
          <button
            type="button"
            className="opt"
            aria-pressed={!VIDAS_OPCIONES.includes(config.vidaInicial)}
            onClick={() => {
              setValorVida(String(config.vidaInicial))
              setModal({ tipo: 'vidaPersonalizada' })
            }}
          >
            Otra: {config.vidaInicial}
          </button>
        </div>

        <h2>Límite por turno</h2>
        <div className="opts">
          {LIMITES_OPCIONES.map((v) => (
            <button
              key={v}
              type="button"
              className="opt"
              aria-pressed={config.limiteTurno === v}
              onClick={() => actualizarConfig({ limiteTurno: v })}
            >
              {v ? `${reloj(v)} min` : 'Sin límite'}
            </button>
          ))}
        </div>
        <p className="hint" style={{ margin: '10px 0 0' }}>
          Al pasar el turno, quien se haya excedido suma una pasada de tiempo automáticamente.
        </p>

        <div className="actions" style={{ marginTop: 30 }}>
          <button className="btn primary" style={{ padding: '12px 22px', fontSize: 16 }} onClick={manejarEmpezar}>
            Empezar partida
          </button>
          <button className="btn" onClick={() => setModal({ tipo: 'dado' })}>
            <Icono nombre="dado" tamano={18} /> Tirar un dado
          </button>
          <button className="btn" onClick={manejarQuienEmpieza}>
            <Icono nombre="persona" tamano={18} /> Sortear quién empieza
          </button>
        </div>
      </div>

      {modal?.tipo === 'elegirAsiento' && (
        <ModalElegirAsiento
          indice={modal.indice}
          perfiles={perfiles}
          ocupado={mesa[modal.indice] != null}
          onSentarConPerfil={(perfil, mazo) => sentarConMazo(modal.indice, perfil, mazo)}
          onVaciar={() => {
            setMesa((m) => m.map((s, idx) => (idx === modal.indice ? null : s)))
            setModal(null)
          }}
          onCrearPerfil={() =>
            setModal({
              tipo: 'editorPerfil',
              perfil: null,
              conEliminar: false,
              alGuardar: (p) => sentarConMazo(modal.indice, p, mazoUltimo(p)),
            })
          }
          onUsarNombre={(nombre) => {
            setMesa((m) =>
              m.map((s, idx) => (idx === modal.indice ? { nombre, comandante: '', comandante2: '', colores: '' } : s)),
            )
            setModal(null)
          }}
          avisoSinNombre={() => mostrarAviso('Escribe un nombre o elige un perfil')}
          onCerrar={() => setModal(null)}
        />
      )}

      {modal?.tipo === 'gestionarPerfiles' && (
        <ModalGestionarPerfiles
          perfiles={perfiles}
          onEditar={(id) => setModal({ tipo: 'editorPerfil', perfil: perfiles.find((p) => p.id === id) ?? null, conEliminar: true })}
          onCrear={() => setModal({ tipo: 'editorPerfil', perfil: null, conEliminar: false })}
          onCerrar={() => setModal(null)}
        />
      )}

      {modal?.tipo === 'editorPerfil' && (
        <EditorPerfil
          perfil={modal.perfil}
          onGuardar={(p) => guardarPerfil(p, modal.alGuardar)}
          onEliminar={modal.conEliminar && modal.perfil ? () => eliminarPerfil(modal.perfil!.id) : undefined}
          onCerrar={() => setModal(null)}
        />
      )}

      {modal?.tipo === 'dado' && <ModalDado onCerrar={() => setModal(null)} />}

      {modal?.tipo === 'vidaPersonalizada' && (
        <Modal
          titulo="Vida inicial"
          onCerrar={() => setModal(null)}
          pie={
            <>
              <button className="btn" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  actualizarConfig({ vidaInicial: Math.max(1, +valorVida || 40) })
                  setModal(null)
                }}
              >
                Usar esta vida
              </button>
            </>
          }
        >
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="v">Puntos de vida</label>
            <input id="v" type="number" min={1} max={999} value={valorVida} onChange={(e) => setValorVida(e.target.value)} />
          </div>
        </Modal>
      )}

      {modal?.tipo === 'quienEmpieza' && (
        <Modal
          titulo="Empieza…"
          onCerrar={() => setModal(null)}
          pie={
            <>
              <button
                className="btn"
                onClick={() => {
                  setInicia(null)
                  setModal(null)
                }}
              >
                Que lo decida otro
              </button>
              <button className="btn primary" onClick={() => setModal(null)}>
                Vale
              </button>
            </>
          }
        >
          <div className="dado">{mesa[modal.indice]?.nombre}</div>
          <p className="hint" style={{ margin: 0, textAlign: 'center' }}>
            Su asiento sale marcado en la mesa y la partida arrancará con su turno.
          </p>
        </Modal>
      )}

      {modal?.tipo === 'confirmarDescartar' && (
        <Modal
          titulo="Descartar la partida"
          onCerrar={() => setModal(null)}
          pie={
            <>
              <button className="btn" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button className="btn danger" onClick={confirmarDescartar}>
                Descartar
              </button>
            </>
          }
        >
          <p style={{ margin: 0 }}>Se perderá el estado actual y no se registrará nada.</p>
        </Modal>
      )}
    </div>
  )
}

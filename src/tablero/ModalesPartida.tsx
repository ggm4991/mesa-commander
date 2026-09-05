import { useState } from 'react'
import { Icono } from '../componentes/icono/Icono'
import { Modal } from '../componentes/comunes/Modal'
import { Pips } from '../componentes/comunes/Pips'
import { transcurrido } from '../motor/partida'
import { dosComandantes, duracion, reloj } from '../motor/utilidades'
import type { Juego } from '../motor/tipos'

interface PropsMenuPartida {
  juego: Juego
  sonidoActivado: boolean
  onCambiarMonarca: () => void
  onCambiarIniciativa: () => void
  onCambiarDia: () => void
  onTogglePausa: () => void
  onToggleSonido: () => void
  onSortear: () => void
  onDado: () => void
  onVerLog: () => void
  onSalir: () => void
  onTerminar: () => void
  onCerrar: () => void
}

/** Sustituye a `menuPartida()` en app.html. */
export function ModalMenuPartida({
  juego,
  sonidoActivado,
  onCambiarMonarca,
  onCambiarIniciativa,
  onCambiarDia,
  onTogglePausa,
  onToggleSonido,
  onSortear,
  onDado,
  onVerLog,
  onSalir,
  onTerminar,
  onCerrar,
}: PropsMenuPartida) {
  return (
    <Modal
      titulo="Partida"
      onCerrar={onCerrar}
      pie={
        <>
          <button className="btn" onClick={onSalir}>
            <Icono nombre="salir" tamano={18} /> Salir sin terminar
          </button>
          <button className="btn primary" onClick={onTerminar}>
            <Icono nombre="trofeo" tamano={18} /> Terminar y registrar
          </button>
        </>
      }
    >
      <div className="grid-list">
        <div className="line">
          <span className="txt">
            <Icono nombre="corona" tamano={22} />
            <div>
              <b>Monarca</b>
              <span>{juego.monarca != null ? `${juego.j[juego.monarca].n} · arrástrala en el tablero` : 'Nadie'}</span>
            </div>
          </span>
          <button className="btn small" onClick={onCambiarMonarca}>
            Cambiar
          </button>
        </div>
        <div className="line">
          <span className="txt">
            <Icono nombre="bandera" tamano={22} />
            <div>
              <b>Iniciativa</b>
              <span>{juego.iniciativa != null ? juego.j[juego.iniciativa].n : 'Nadie'}</span>
            </div>
          </span>
          <button className="btn small" onClick={onCambiarIniciativa}>
            Cambiar
          </button>
        </div>
        <div className="line">
          <span className="txt">
            <Icono nombre={juego.dia === 'noche' ? 'luna' : 'sol'} tamano={22} />
            <div>
              <b>Día y noche</b>
              <span>{juego.dia === 'dia' ? 'Es de día' : juego.dia === 'noche' ? 'Es de noche' : 'Ni de día ni de noche'}</span>
            </div>
          </span>
          <button className="btn small" onClick={onCambiarDia}>
            Cambiar
          </button>
        </div>
        <div className="line">
          <span className="txt">
            <Icono nombre="pausaCirc" tamano={22} />
            <div>
              <b>Temporizador</b>
              <span>{juego.pausado ? `En pausa a los ${reloj(transcurrido(juego))}` : 'En marcha'}</span>
            </div>
          </span>
          <button className="btn small" onClick={onTogglePausa}>
            {juego.pausado ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
        <div className="line">
          <span className="txt">
            <Icono nombre="campana" tamano={22} />
            <div>
              <b>Alarma de tiempo</b>
              <span>{sonidoActivado ? 'Suena al pasarse del límite' : 'Silenciada'}</span>
            </div>
          </span>
          <button className="btn small" onClick={onToggleSonido}>
            {sonidoActivado ? 'Silenciar' : 'Activar'}
          </button>
        </div>
        {juego.turno == null && (
          <div className="line">
            <span className="txt">
              <Icono nombre="bandera" tamano={22} />
              <div>
                <b>¿Quién empieza?</b>
                <span>O que lo decida el azar</span>
              </div>
            </span>
            <button className="btn small" onClick={onSortear}>
              Sortear
            </button>
          </div>
        )}
        <div className="line">
          <span className="txt">
            <Icono nombre="dado" tamano={22} />
            <div>
              <b>Tirar dados</b>
              <span>Moneda, d6 y d20</span>
            </div>
          </span>
          <button className="btn small" onClick={onDado}>
            Tirar
          </button>
        </div>
        <div className="line">
          <span className="txt">
            <Icono nombre="lista" tamano={22} />
            <div>
              <b>Historial de la partida</b>
              <span>{juego.log.length} apuntes</span>
            </div>
          </span>
          <button className="btn small" onClick={onVerLog}>
            Ver
          </button>
        </div>
      </div>
    </Modal>
  )
}

interface PropsElegirJugador {
  titulo: string
  juego: Juego
  onElegir: (indice: number | null) => void
  onCerrar: () => void
}

/** Sustituye a `elegirJugador()`: escoger un jugador de la mesa, o "Nadie". */
export function ModalElegirJugador({ titulo, juego, onElegir, onCerrar }: PropsElegirJugador) {
  return (
    <Modal
      titulo={titulo}
      onCerrar={onCerrar}
      pie={
        <button className="btn" onClick={onCerrar}>
          Cancelar
        </button>
      }
    >
      <div className="grid-list">
        {juego.j.map((x, k) => (
          <div className="line" key={k}>
            <span className="txt">
              <Icono nombre="persona" tamano={22} />
              <div>
                <b>{x.n}</b>
                <span>
                  <Pips identidad={x.col} /> {dosComandantes(x.c, x.c2)}
                </span>
              </div>
            </span>
            <button className="btn small" onClick={() => onElegir(k)}>
              Elegir
            </button>
          </div>
        ))}
        <div className="line">
          <span className="txt">
            <Icono nombre="puntos" tamano={22} />
            <div>
              <b>Nadie</b>
            </div>
          </span>
          <button className="btn small" onClick={() => onElegir(null)}>
            Elegir
          </button>
        </div>
      </div>
    </Modal>
  )
}

/** Sustituye a `verLog()`. */
export function ModalVerLog({ juego, onCerrar }: { juego: Juego; onCerrar: () => void }) {
  return (
    <Modal
      titulo="Historial de la partida"
      onCerrar={onCerrar}
      pie={
        <button className="btn primary" onClick={onCerrar}>
          Cerrar
        </button>
      }
    >
      <div className="log-list">
        {juego.log.length ? (
          juego.log.map((e, i) => (
            <div key={i}>
              <span className="t">{reloj(e.t)}</span>
              {e.txt}
            </div>
          ))
        ) : (
          <p className="hint">Todavía no ha pasado nada.</p>
        )}
      </div>
    </Modal>
  )
}

interface PropsTerminarPartida {
  juego: Juego
  /** Ganador que ya se veía venir (comprobarFinal), resaltado como sugerencia. */
  sugerido?: number | null
  onGanador: (indice: number, totalMinutos: number) => void
  onEmpate: (totalMinutos: number) => void
  onSinRegistrar: () => void
  onSeguirJugando: () => void
}

/** Sustituye a `terminarPartida()`: elegir el resultado antes de volcarlo al
 * registro (`guardarComoPartida`, en la página del tablero). */
export function ModalTerminarPartida({
  juego,
  sugerido,
  onGanador,
  onEmpate,
  onSinRegistrar,
  onSeguirJugando,
}: PropsTerminarPartida) {
  // Se calcula una sola vez, al abrir el modal — no en cada render, o la duración
  // mostrada cambiaría sola si algo más provoca un repintado mientras está abierto.
  const [totalMinutos] = useState(() => Math.max(1, Math.round((Date.now() - new Date(juego.inicio).getTime()) / 60000)))
  const multijugador = juego.j.length > 1

  return (
    <Modal
      titulo="Terminar la partida"
      onCerrar={onSeguirJugando}
      pie={
        <>
          <button className="btn danger" onClick={onSinRegistrar}>
            Terminar sin registrar
          </button>
          <button className="btn" onClick={onSeguirJugando}>
            Seguir jugando
          </button>
        </>
      }
    >
      <p className="hint" style={{ margin: '0 0 14px' }}>
        Duró {duracion(totalMinutos)}.{' '}
        {multijugador
          ? 'Elige el resultado y todo lo que ha contado la app pasa al registro.'
          : 'Una partida en solitario no entra en la clasificación, así que solo puedes cerrarla.'}
      </p>
      {multijugador && (
        <div className="grid-list">
          {juego.j.map((x, k) => (
            <div className="line" key={k}>
              <span className="txt">
                <b>{x.n}</b>
                <span>
                  <Pips identidad={x.col} /> {dosComandantes(x.c, x.c2)} · turno más largo {reloj(x.tMax)}
                </span>
              </span>
              <button className={`btn small${k === sugerido ? ' primary' : ''}`} onClick={() => onGanador(k, totalMinutos)}>
                Ganó
              </button>
            </div>
          ))}
          <div className="line">
            <span className="txt">
              <b>Empate en la mesa</b>
              <span>Se acabó el tiempo o la mesa lo pactó</span>
            </span>
            <button className="btn small" onClick={() => onEmpate(totalMinutos)}>
              Empate
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

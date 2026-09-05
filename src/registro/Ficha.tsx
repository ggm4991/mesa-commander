import { Icono } from '../componentes/icono/Icono'
import { Pips } from '../componentes/comunes/Pips'
import { dosComandantes, duracion, fechaLarga, reloj } from '../motor/utilidades'
import { RES } from './constantes'
import { ganadorTurno } from './calcularJugadores'
import type { JugadorRegistro } from './calcularJugadores'
import type { Partida } from '../motor/tipos'

interface Props {
  jugador: JugadorRegistro
  partidasJugador: Partida[]
  partidasFiltradas: Partida[]
  busqueda: string
  onBuscar: (texto: string) => void
  onVolver: () => void
  onRenombrar: () => void
  onNuevaPartida: () => void
  onEditar: (id: string) => void
  onBorrar: (id: string) => void
}

/** Sustituye a `pintarFicha()`/`listarPartidas()` en app.html: estadísticas de un
 * jugador y el historial (filtrable) de sus partidas. */
export function Ficha({
  jugador: p,
  partidasJugador,
  partidasFiltradas,
  busqueda,
  onBuscar,
  onVolver,
  onRenombrar,
  onNuevaPartida,
  onEditar,
  onBorrar,
}: Props) {
  return (
    <>
      <button className="back" onClick={onVolver}>
        <Icono nombre="atras" tamano={18} /> Volver a la clasificación
      </button>
      <div className="player-head">
        <div>
          <h2>{p.nombre}</h2>
          <div className="record">
            <b>{p.v}</b> victorias, <b>{p.e}</b> empates y <b>{p.d}</b> derrotas en {p.pj} partidas · juega sobre todo{' '}
            <Pips identidad={p.principalId} /> {p.principal}
          </div>
        </div>
        <span className="actions">
          <button className="btn small" onClick={onRenombrar}>
            <Icono nombre="lapiz" tamano={17} /> Cambiar el nombre
          </button>
          <button className="btn primary small" onClick={onNuevaPartida}>
            <Icono nombre="mas" tamano={17} /> Añadir partida
          </button>
        </span>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="k">Jugadas retiradas</div>
          <div className="v">{p.rehacer}</div>
        </div>
        <div className="tile">
          <div className="k">Veces que se pasó de tiempo</div>
          <div className="v">{p.tiempo}</div>
        </div>
        <div className="tile">
          <div className="k">Turno más largo</div>
          <div className="v">
            {reloj(p.turnoMax)} <small>min</small>
          </div>
        </div>
        <div className="tile">
          <div className="k">Partidas con el turno más largo de la mesa</div>
          <div className="v">
            {p.turnosLargos} <small>de {p.pj}</small>
          </div>
        </div>
      </div>

      <div className="searchbar">
        <span className="lupa">
          <Icono nombre="buscar" tamano={18} />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            placeholder="Buscar por rival, comandante, fecha o resultado"
            autoComplete="off"
          />
        </span>
        <span className="count">
          {partidasFiltradas.length} de {partidasJugador.length} partidas
        </span>
      </div>

      {!partidasFiltradas.length ? (
        <div className="empty">
          <b>Ninguna partida coincide con “{busqueda}”</b>
          Prueba con el nombre de un rival, un comandante o una fecha como 2026-07.
        </div>
      ) : (
        <div>
          {partidasFiltradas.map((g) => {
            const yo = g.seats.find((s) => s.j === p.nombre)!
            const largo = ganadorTurno(g)
            return (
              <article className="game" key={g.id}>
                <div className="game-top">
                  <span className="date">{fechaLarga(g.fecha)}</span>
                  <span className={`chip ${RES[yo.r].c}`}>{RES[yo.r].t}</span>
                  <span className="dur grow">
                    {duracion(g.duracion)} de partida · turno más largo de {largo}
                  </span>
                  <button className="btn small" aria-label="Editar la partida" onClick={() => onEditar(g.id)}>
                    <Icono nombre="lapiz" tamano={17} /> Editar
                  </button>
                  <button className="btn small danger" aria-label="Eliminar la partida" onClick={() => onBorrar(g.id)}>
                    <Icono nombre="papelera" tamano={17} /> Eliminar
                  </button>
                </div>
                <div className="seats-log">
                  {g.seats.map((s, i) => (
                    <div key={i} className={`seat-log ${s.j === p.nombre ? 'me' : ''} ${s.r === 'V' ? 'win' : ''}`}>
                      <div className="who2">
                        {s.j}
                        {s.r === 'V' && <span className="chip v">ganó</span>}
                      </div>
                      <div className="cmdr">
                        <Pips identidad={s.id} /> {dosComandantes(s.c, s.c2)}
                      </div>
                      <div className="micro">
                        <span>
                          Retiradas <b>{s.rehacer}</b>
                        </span>
                        <span>
                          Fuera de tiempo <b>{s.tiempo}</b>
                        </span>
                        <span className={s.j === largo ? 'longest' : ''}>
                          Turno más largo <b>{reloj(s.turno)}</b>
                        </span>
                        {s.vidaFinal !== undefined && (
                          <span>
                            Vida final <b>{s.vidaFinal}</b>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

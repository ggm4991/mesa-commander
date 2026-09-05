import { Icono } from '../componentes/icono/Icono'
import { Pips } from '../componentes/comunes/Pips'
import { fechaLarga } from '../motor/utilidades'
import type { JugadorRegistro } from './calcularJugadores'
import type { Partida } from '../motor/tipos'

export type CampoOrden = 'pts' | 'wr' | 'rehacer' | 'tiempo'
export interface Orden {
  campo: CampoOrden
  dir: 1 | -1
}

interface Props {
  partidas: Partida[]
  jugadores: JugadorRegistro[]
  nombresUnicos: number
  orden: Orden
  persistente: boolean
  onOrdenar: (campo: CampoOrden) => void
  onElegirJugador: (nombre: string) => void
  onNuevaPartida: () => void
  onCopiaSeguridad: () => void
}

const COLUMNAS: { campo: CampoOrden; etiqueta: string; clase?: string }[] = [
  { campo: 'pts', etiqueta: 'Puntos', clase: 'num' },
  { campo: 'wr', etiqueta: '% victorias', clase: 'num' },
  { campo: 'rehacer', etiqueta: 'Jugadas retiradas', clase: 'num hide-s' },
  { campo: 'tiempo', etiqueta: 'Pasadas de tiempo', clase: 'num hide-s' },
]

/** Sustituye a `pintarRanking()` en app.html: clasificación de la mesa, siempre
 * recalculada desde las partidas (nunca se guarda un total aparte). */
export function Ranking({
  partidas,
  jugadores,
  nombresUnicos,
  orden,
  persistente,
  onOrdenar,
  onElegirJugador,
  onNuevaPartida,
  onCopiaSeguridad,
}: Props) {
  const n = partidas.length

  return (
    <>
      <div className="top">
        <h1>Registro de la mesa</h1>
        <p>
          Todo lo que la app apunta durante la partida acaba aquí: victorias, empates, jugadas rehechas, pasadas de
          tiempo y turnos interminables.
        </p>
        <div className="meta">
          {n
            ? `${n} ${n === 1 ? 'partida registrada' : 'partidas registradas'} · ${nombresUnicos} jugadores · última el ${fechaLarga(partidas[0].fecha)}`
            : 'Todavía no hay ninguna partida registrada.'}
        </div>
      </div>

      <div className="section-head">
        <h2>Clasificación</h2>
        <span className="actions">
          <span className="hint">3 puntos por victoria, 1 por empate</span>
          <button className="btn primary" onClick={onNuevaPartida}>
            <Icono nombre="mas" tamano={18} /> Añadir partida a mano
          </button>
        </span>
      </div>

      {!jugadores.length ? (
        <div className="empty">
          <b>Aún no hay partidas</b>
          Juega una con el contador o añádela a mano, y la clasificación aparecerá sola.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="pos">#</th>
              <th>Jugador</th>
              <th className="hide-s">Balance</th>
              {COLUMNAS.map(({ campo, etiqueta, clase }) => (
                <th
                  key={campo}
                  className={`sortable ${clase ?? ''} ${orden.campo === campo ? 'active' : ''}`}
                  onClick={() => onOrdenar(campo)}
                >
                  {etiqueta}
                  <span className="arrow">{orden.campo === campo ? (orden.dir < 0 ? '▼' : '▲') : '▼'}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jugadores.map((p, i) => (
              <tr
                key={p.nombre}
                tabIndex={0}
                className={i === 0 && orden.campo === 'pts' && orden.dir < 0 ? 'leader' : ''}
                onClick={() => onElegirJugador(p.nombre)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onElegirJugador(p.nombre)
                  }
                }}
              >
                <td className="pos">{i + 1}</td>
                <td>
                  <span className="name">{p.nombre}</span>
                  <span className="sub">
                    <Pips identidad={p.principalId} /> {p.principal}
                  </span>
                </td>
                <td className="hide-s">
                  <span className="bar" title={`${p.v} victorias, ${p.e} empates, ${p.d} derrotas`}>
                    <i className="v" style={{ width: `${(p.v / p.pj) * 100}%` }} />
                    <i className="e" style={{ width: `${(p.e / p.pj) * 100}%` }} />
                    <i className="d" style={{ width: `${(p.d / p.pj) * 100}%` }} />
                  </span>
                  <span className="sub">
                    {p.v} V · {p.e} E · {p.d} D
                  </span>
                </td>
                <td className="num">
                  <span className="wr">{p.pts}</span>
                </td>
                <td className="num">{Math.round(p.wr * 100)}%</td>
                <td className="num hide-s">{p.rehacer}</td>
                <td className="num hide-s">{p.tiempo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer>
        <span>
          {persistente
            ? 'Los cambios se guardan y siguen aquí la próxima vez.'
            : 'Sin almacenamiento disponible: copia el JSON si no quieres perder los datos.'}
        </span>
        <button className="btn link" onClick={onCopiaSeguridad}>
          <Icono nombre="datos" tamano={16} /> Copia de seguridad
        </button>
      </footer>
    </>
  )
}

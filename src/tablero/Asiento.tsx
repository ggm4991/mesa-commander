import { Icono } from '../componentes/icono/Icono'
import { fondoAsiento } from '../componentes/comunes/fondo'
import { CONTADORES, nombreComandante } from '../motor/vida'
import { dosComandantes } from '../motor/utilidades'
import { useImagenComandante } from '../red/scryfall/useImagenComandante'
import type { Juego } from '../motor/tipos'
import { type BordeAsiento, estiloBotonEnFila, estiloFila } from './bordes'
import { ICONO_CONTADOR, MANA } from './constantesUI'
import { useMantenerPulsado } from './useMantenerPulsado'

interface Props {
  juego: Juego
  indice: number
  rotacion: number
  areaGrid?: string | null
  delta: number
  borde: BordeAsiento | null
  esDestinoDeCorona: boolean
  onCambiarVida: (delta: number) => void
  onAbrirMenu: () => void
  onAbrirDano: () => void
  onElegirInicio: () => void
  onRetirada: () => void
  onEmpezarArrastreCorona: (e: React.PointerEvent) => void
  seatRef: (el: HTMLDivElement | null) => void
}

/** Sustituye a `pintarAsiento()` en app.html: todo lo que se ve y se toca en el
 * hueco de un jugador — nombre, comandante, vida, contadores, corona, menú. */
export function Asiento({
  juego,
  indice,
  rotacion,
  areaGrid,
  delta,
  borde,
  esDestinoDeCorona,
  onCambiarVida,
  onAbrirMenu,
  onAbrirDano,
  onElegirInicio,
  onRetirada,
  onEmpezarArrastreCorona,
  seatRef,
}: Props) {
  const j = juego.j[indice]
  const esTurno = indice === juego.turno && !j.out
  const esperandoInicio = juego.turno == null && !j.out
  const recibido = Object.entries(j.dmg || {}).filter(([, v]) => v > 0)

  const menosVida = useMantenerPulsado(() => onCambiarVida(-1))
  const masVida = useMantenerPulsado(() => onCambiarVida(1))
  const imagenComandante = useImagenComandante(j.c)

  return (
    <div
      ref={seatRef}
      className={`seat${j.out ? ' out' : ''}${esDestinoDeCorona ? ' destino' : ''}`}
      data-asiento={indice}
      data-rot={rotacion}
      style={areaGrid ? { gridArea: areaGrid } : undefined}
    >
      <div
        className="bg"
        style={{ backgroundImage: fondoAsiento(j.col, imagenComandante), backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      {delta !== 0 && <div className="delta">{delta > 0 ? `+${delta}` : delta}</div>}
      <div className="inner">
        <div className="seat-top" style={estiloFila(borde?.arriba ?? null, borde?.hueco ?? '')}>
          <span className="seat-name">{j.n}</span>
          <span className="seat-cmd">{j.c2 ? dosComandantes(j.c, j.c2) : j.c || ''}</span>
          {esTurno && <span className="badge turn">Su turno</span>}
          {juego.iniciativa === indice && (
            <span className="badge">
              <Icono nombre="bandera" tamano={13} /> Iniciativa
            </span>
          )}
          {j.out && (
            <span className="badge">
              <Icono nombre="calavera" tamano={13} /> Fuera
            </span>
          )}
          <button
            className="more solo"
            style={estiloBotonEnFila(borde?.arriba ?? null, 'auto')}
            aria-label={`Opciones de ${j.n}`}
            onClick={onAbrirMenu}
          >
            <Icono nombre="puntos" tamano={20} />
          </button>
        </div>

        <div className="life-row">
          <button className="tap" aria-label="Quitar vida" {...menosVida}>
            −
          </button>
          <div className="life-wrap">
            {juego.monarca === indice && (
              <span
                className="corona"
                role="button"
                title="Arrastra la corona hasta el nuevo monarca"
                onPointerDown={onEmpezarArrastreCorona}
              >
                <Icono nombre="corona" tamano={24} />
              </span>
            )}
            <div className="life">{j.vida}</div>
          </div>
          <button className="tap" aria-label="Sumar vida" {...masVida}>
            +
          </button>
        </div>

        {esperandoInicio && (
          <button className="empiezo" onClick={onElegirInicio}>
            <Icono nombre="bandera" tamano={22} /> Empiezo yo
          </button>
        )}

        <div className="seat-bot" style={estiloFila(borde?.abajo ?? null, borde?.hueco ?? '')}>
          <button
            className="more"
            style={estiloBotonEnFila(borde?.abajo ?? null)}
            title="Retiró una jugada y la rehízo"
            onClick={onRetirada}
          >
            <Icono nombre="retirada" tamano={17} /> {j.rehacer}
          </button>
          {juego.j.length > 1 && (
            <button className="more" onClick={onAbrirDano}>
              <Icono nombre="espadas" tamano={17} />
              {recibido.length > 0 &&
                ' ' +
                  recibido
                    .map(([clave, valor]) => `${nombreComandante(juego, clave).split(/[ ,]/)[0]} ${valor}`)
                    .join(' · ')}
            </button>
          )}
          {CONTADORES.filter((c) => j[c.clave] > 0).map((c) => (
            <span key={c.clave} className={`ctr${c.letal && j[c.clave] >= c.letal ? ' warn' : ''}`} title={c.nombre}>
              <Icono nombre={ICONO_CONTADOR[c.clave]} tamano={16} /> {j[c.clave]}
            </span>
          ))}
          {MANA.filter((m) => (j.mana || {})[m] > 0).map((m) => (
            <span key={m} className="ctr">
              <i className={`pip ${m}`} />
              {j.mana[m]}
            </span>
          ))}
          {j.bendicion && (
            <span className="ctr" title="Bendición de la ciudad">
              <Icono nombre="ciudad" tamano={16} />
            </span>
          )}
          {j.fuera > 0 && (
            <span className="ctr warn" title="Veces que se pasó de tiempo">
              <Icono nombre="reloj" tamano={16} /> {j.fuera}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

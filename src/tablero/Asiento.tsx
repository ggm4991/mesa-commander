import { useCallback, useState } from 'react'
import { Icono } from '../componentes/icono/Icono'
import { fondoAsiento } from '../componentes/comunes/fondo'
import { CONTADORES, comandantesAgrupadosPorJugador } from '../motor/vida'
import { dosComandantes } from '../motor/utilidades'
import { useImagenComandante } from '../red/scryfall/useImagenComandante'
import type { Identidad, Juego } from '../motor/tipos'
import { type BordeAsiento, estiloBotonEnFila, estiloFila } from './bordes'
import { ICONO_CONTADOR, MANA } from './constantesUI'
import { IconoDanoComandante } from './IconoDanoComandante'
import { PanelDanoExpandido } from './PanelDanoExpandido'
import { useMantenerPulsado } from './useMantenerPulsado'

/** Por encima de esto, los contadores sueltos (sin contar el maná, que se deja
 * siempre visible porque se toca todo el rato) se agrupan en un solo botón que
 * abre el menú del asiento — más vale un resumen que una fila que se desborda y
 * se solapa con lo de al lado (ver ADR 0021). */
const UMBRAL_CONTADORES_SUELTOS = 2

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
  onCambiarDano: (clave: string, delta: number) => void
  onAjustarMana: (color: keyof Identidad, delta: number) => void
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
  onCambiarDano,
  onAjustarMana,
  onElegirInicio,
  onRetirada,
  onEmpezarArrastreCorona,
  seatRef,
}: Props) {
  const j = juego.j[indice]
  const esTurno = indice === juego.turno && !j.out
  const esperandoInicio = juego.turno == null && !j.out
  // Un cuadrado general por jugador (no por comandante): un compañero parte en dos
  // el hueco de quien lo lleva, pero no cambia el número de huecos generales — así
  // la rejilla sale siempre igual de cuadrada tenga o no compañeros la mesa (ver
  // ADR 0019). Para los 4 jugadores de un pod normal, sqrt dos columnas da la
  // rejilla de 2x2 con la que se pensó el diseño.
  const gruposDano = comandantesAgrupadosPorJugador(juego)
  const columnasDano = Math.max(1, Math.ceil(Math.sqrt(gruposDano.length)))
  const filasDano = Math.max(1, Math.ceil(gruposDano.length / columnasDano))

  // Mantener pulsado un sector no lo abre a él mismo: pide que el cuadrado entero
  // (por eso el estado vive aquí y no en `IconoDanoComandante`) muestre el panel
  // grande de esa fuente en concreto, sea cual sea su clave (ver ADR 0020).
  const [sectorAbierto, setSectorAbierto] = useState<string | null>(null)
  const cerrarSector = useCallback(() => setSectorAbierto(null), [])
  const fuenteAbierta = sectorAbierto ? (gruposDano.flat().find((c) => c.clave === sectorAbierto) ?? null) : null

  const menosVida = useMantenerPulsado(() => onCambiarVida(-1))
  const masVida = useMantenerPulsado(() => onCambiarVida(1))
  const imagenComandante = useImagenComandante(j.c, j.imagenId)

  const contadoresActivos = CONTADORES.filter((c) => j[c.clave] > 0)
  const manaActivo = MANA.filter((m) => (j.mana || {})[m] > 0)
  const otrosActivos = contadoresActivos.length + (j.bendicion ? 1 : 0) + (j.fuera > 0 ? 1 : 0)
  const resumirOtros = otrosActivos > UMBRAL_CONTADORES_SUELTOS

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

        <button className="retirada-esquina" title="Retiró una jugada y la rehízo" onClick={onRetirada}>
          <Icono nombre="retirada" tamano={16} /> {j.rehacer}
        </button>

        {juego.j.length > 1 && (
          <div className="fila-dano">
            <div
              className="dano-cuadrado"
              style={{ gridTemplateColumns: `repeat(${columnasDano}, 1fr)`, gridTemplateRows: `repeat(${filasDano}, 1fr)` }}
            >
              {gruposDano.map((grupo, k) => (
                <div key={k} className="dano-grupo">
                  {grupo.map((c) => (
                    <IconoDanoComandante
                      key={c.clave}
                      fuente={c}
                      esPropio={c.k === indice}
                      valor={j.dmg[c.clave] || 0}
                      onSumar={() => onCambiarDano(c.clave, 1)}
                      onAbrir={() => setSectorAbierto(c.clave)}
                    />
                  ))}
                </div>
              ))}
              {fuenteAbierta && (
                <PanelDanoExpandido
                  fuente={fuenteAbierta}
                  esPropio={fuenteAbierta.k === indice}
                  valor={j.dmg[fuenteAbierta.clave] || 0}
                  onSumar={() => {
                    onCambiarDano(fuenteAbierta.clave, 1)
                    cerrarSector()
                  }}
                  onRestar={() => {
                    onCambiarDano(fuenteAbierta.clave, -1)
                    cerrarSector()
                  }}
                  onCerrar={cerrarSector}
                />
              )}
            </div>
          </div>
        )}

        <div className="seat-bot" style={estiloFila(borde?.abajo ?? null, borde?.hueco ?? '')}>
          {manaActivo.map((m) => (
            <button key={m} type="button" className="ctr" title={`Maná ${m}: toca para gastar uno`} onClick={() => onAjustarMana(m, -1)}>
              <i className={`pip ${m}`} />
              {j.mana[m]}
            </button>
          ))}
          {resumirOtros ? (
            <button className="ctr" onClick={onAbrirMenu}>
              <Icono nombre="puntos" tamano={16} /> {otrosActivos} más
            </button>
          ) : (
            <>
              {contadoresActivos.map((c) => (
                <span key={c.clave} className={`ctr${c.letal && j[c.clave] >= c.letal ? ' warn' : ''}`} title={c.nombre}>
                  <Icono nombre={ICONO_CONTADOR[c.clave]} tamano={16} /> {j[c.clave]}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

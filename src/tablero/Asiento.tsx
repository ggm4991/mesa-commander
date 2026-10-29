import { useCallback, useEffect, useRef, useState } from 'react'
import { Icono } from '../componentes/icono/Icono'
import { fondoAsiento } from '../componentes/comunes/fondo'
import { CONTADORES, comandantesAgrupadosPorJugador } from '../motor/vida'
import { useImagenComandante } from '../red/scryfall/useImagenComandante'
import type { Identidad, Juego } from '../motor/tipos'
import { type BordeAsiento, estiloBotonEnFila, estiloEsquinas, estiloFila } from './bordes'
import { ICONO_CONTADOR, MANA } from './constantesUI'
import { IconoDanoComandante } from './IconoDanoComandante'
import { type DispoTablero, ordenEspacialDesde } from './layouts'
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
  /** Para ordenar el cuadrado de daño de comandante como lo ve este asiento en
   * concreto, no en el orden de índice fijo (ver `ordenEspacialDesde`, ADR
   * 0056). */
  dispo: DispoTablero
  delta: number
  borde: BordeAsiento | null
  esDestinoDeCorona: boolean
  onCambiarVida: (delta: number) => void
  onAbrirMenu: () => void
  onCambiarDano: (clave: string, delta: number) => void
  onAjustarMana: (color: keyof Identidad, delta: number) => void
  onElegirInicio: () => void
  onRetirada: () => void
  onLanzarComandante: () => void
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
  dispo,
  delta,
  borde,
  esDestinoDeCorona,
  onCambiarVida,
  onAbrirMenu,
  onCambiarDano,
  onAjustarMana,
  onElegirInicio,
  onRetirada,
  onLanzarComandante,
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
  const ordenVisor = ordenEspacialDesde(dispo, indice, juego.j.length)
  const gruposDano = comandantesAgrupadosPorJugador(juego, ordenVisor)
  const columnasDano = Math.max(1, Math.ceil(Math.sqrt(gruposDano.length)))
  const filasDano = Math.max(1, Math.ceil(gruposDano.length / columnasDano))
  // Con exactamente 4 jugadores, `ordenEspacialDesde` ya coloca cada asiento
  // en la celda que le toca (arriba-izq., arriba-der., abajo-izq.,
  // abajo-der., el mismo orden en que una rejilla 2×2 se rellena sola) — es
  // un mini-mapa real de la mesa, girado como el propio asiento (ver ADR
  // 0056).

  // Mantener pulsado un sector no lo abre a él mismo: pide que el cuadrado entero
  // (por eso el estado vive aquí y no en `IconoDanoComandante`) muestre el panel
  // grande de esa fuente en concreto, sea cual sea su clave (ver ADR 0020).
  const [sectorAbierto, setSectorAbierto] = useState<string | null>(null)
  const cerrarSector = useCallback(() => setSectorAbierto(null), [])
  const fuenteAbierta = sectorAbierto ? (gruposDano.flat().find((c) => c.clave === sectorAbierto) ?? null) : null

  // El cuadrado de daño ya no ocupa sitio fijo en el asiento: se abre como un
  // pequeño popup con el botón de debajo de la vida. La referencia apunta al
  // propio `.dano-cuadrado`, no al fondo semitransparente que lo envuelve
  // (`.dano-popup`): así "tocar fuera" es fuera del cuadrado de verdad, y no
  // queda absorbido por el fondo que cubre el asiento entero (ver ADR 0026).
  const [mostrarDano, setMostrarDano] = useState(false)
  const popupDanoRef = useRef<HTMLDivElement>(null)
  const cerrarPopupDano = useCallback(() => {
    setMostrarDano(false)
    setSectorAbierto(null)
  }, [])
  useEffect(() => {
    if (!mostrarDano) return
    const cerrarSiEsFuera = (e: PointerEvent) => {
      if (!popupDanoRef.current?.contains(e.target as Node)) cerrarPopupDano()
    }
    document.addEventListener('pointerdown', cerrarSiEsFuera)
    return () => document.removeEventListener('pointerdown', cerrarSiEsFuera)
  }, [mostrarDano, cerrarPopupDano])

  // Pasado un segundo manteniendo pulsado, cada toque sube o baja la vida de 10
  // en 10 en vez de 1 en 1 (ver useMantenerPulsado y ADR 0054).
  const menosVida = useMantenerPulsado((acelerado) => onCambiarVida(acelerado ? -10 : -1))
  const masVida = useMantenerPulsado((acelerado) => onCambiarVida(acelerado ? 10 : 1))
  const imagenComandante = useImagenComandante(j.c, j.imagenId)

  // El impuesto de comandante no aparece aquí: tiene su propio botón siempre
  // visible junto al de daño (más abajo), porque a diferencia del resto de
  // contadores es el único que se toca casi todos los turnos.
  const contadoresActivos = CONTADORES.filter((c) => c.clave !== 'tax' && j[c.clave] > 0)
  const manaActivo = MANA.filter((m) => (j.mana || {})[m] > 0)
  // "Fuera" (veces que se pasó de tiempo) no cuenta aquí: vive en su propia
  // esquina, siempre visible igual que las jugadas retiradas, no en esta fila.
  const otrosActivos = contadoresActivos.length + (j.bendicion ? 1 : 0)
  const resumirOtros = otrosActivos > UMBRAL_CONTADORES_SUELTOS

  return (
    <div
      ref={seatRef}
      className={`seat${j.out ? ' out' : ''}${esDestinoDeCorona ? ' destino' : ''}${esTurno ? ' turno' : ''}`}
      data-asiento={indice}
      data-rot={rotacion}
      style={areaGrid ? { gridArea: areaGrid } : undefined}
    >
      <div
        className="bg"
        style={{ backgroundImage: fondoAsiento(j.col, imagenComandante), backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="inner">
        <div className="seat-top" style={estiloFila(borde?.arriba ?? null, borde?.hueco ?? '')}>
          {juego.iniciativa === indice && (
            <span className="badge" aria-label="Iniciativa">
              <Icono nombre="bandera" tamano={13} /> <span className="badge-texto">Iniciativa</span>
            </span>
          )}
          {j.out && (
            <span className="badge" aria-label="Fuera">
              <Icono nombre="calavera" tamano={13} /> <span className="badge-texto">Fuera</span>
            </span>
          )}
          <button
            className="more solo"
            style={estiloBotonEnFila(borde?.arriba ?? null)}
            aria-label={`Opciones de ${j.n}`}
            onClick={onAbrirMenu}
          >
            <Icono nombre="puntos" tamano={20} />
          </button>
        </div>

        {/* Solo el icono: con el texto de antes ("Daño de comandante", "Comandante
         * ×N") ya no cabían arriba junto al resto de controles fijos. El texto
         * sigue en el DOM, visualmente oculto, para quien usa lector de pantalla y
         * para no reescribir las pruebas que buscan este texto. En flujo normal,
         * no superpuesto como `.esquinas-fijas`: con cuatro controles fijos más
         * estos dos no cabían ya ni en un asiento de 4 jugadores, no solo en los
         * más estrechos de 6 (ver ADR 0042). */}
        <div className="acciones-arriba">
          {juego.j.length > 1 && (
            <button type="button" className="accion-arriba accion-dano" onClick={() => setMostrarDano(true)}>
              <Icono nombre="espadas" tamano={20} />
              <span className="visualmente-oculto">Daño de comandante</span>
            </button>
          )}
          <button
            type="button"
            className="accion-arriba accion-impuesto"
            title="Toca cada vez que lo lances desde la zona de mando: sube el impuesto en 2 (regla 903.9a)"
            onClick={onLanzarComandante}
          >
            <Icono nombre={ICONO_CONTADOR.tax} tamano={20} />
            <span className="visualmente-oculto">Comandante ×{Math.floor(j.tax / 2)}</span>
            <i className="accion-num">×{Math.floor(j.tax / 2)}</i>
          </button>
        </div>

        <div className="life-row">
          <button className="tap" aria-label="Quitar vida" {...menosVida}>
            −
          </button>
          <div className="life-wrap">
            {delta !== 0 && <div className="delta">{delta > 0 ? `+${delta}` : delta}</div>}
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

        <div className="esquinas-fijas" style={estiloEsquinas(borde?.arriba ?? null)}>
          <span className={`tiempo-esquina${j.fuera > 0 ? ' warn' : ''}`} title="Veces que se pasó de tiempo">
            <Icono nombre="reloj" tamano={16} /> {j.fuera}
          </span>
          <button className="retirada-esquina" title="Retiró una jugada y la rehízo" onClick={onRetirada}>
            <Icono nombre="retirada" tamano={16} /> {j.rehacer}
          </button>
        </div>

        <div className="seat-estados" style={estiloFila(borde?.abajo ?? null, borde?.hueco ?? '')}>
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
            </>
          )}
        </div>

        {juego.j.length > 1 && mostrarDano && (
          <div className="dano-popup">
            <div
              className="dano-cuadrado"
              ref={popupDanoRef}
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
                  onSumar={() => onCambiarDano(fuenteAbierta.clave, 1)}
                  onRestar={() => onCambiarDano(fuenteAbierta.clave, -1)}
                  onCerrar={cerrarSector}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

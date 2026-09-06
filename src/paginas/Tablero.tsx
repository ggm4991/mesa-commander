import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Icono } from '../componentes/icono/Icono'
import { ModalDado } from '../componentes/mesa/ModalDado'
import { useAviso } from '../componentes/comunes/contextoAviso'
import { useAlmacen } from '../contextos/AlmacenContexto'
import { useConfig } from '../contextos/useConfig'
import { guardarJuego, guardarPartidas, leerPartidas, normalizarPartidas } from '../almacenamiento/repositorio'
import {
  alternarPausa,
  cambiarDiaNoche,
  cambiarIniciativa,
  cambiarMonarca,
  cambiarMonarcaPorArrastre,
  elegirInicio,
  pasarTurno,
  registrar,
} from '../motor/partida'
import {
  ajustarFuera,
  ajustarMana,
  ajustarRehacer,
  alternarBendicion,
  alternarFueraDeJuego,
  cambiarVida,
  comprobarFinal,
  contador,
  danoComandante,
  editarJugador,
  retirada,
} from '../motor/vida'
import type { ContadorClave, Identidad, Juego } from '../motor/tipos'
import { construirPartida } from '../registro/construirPartida'
import { validar } from '../registro/validar'
import { Asiento } from '../tablero/Asiento'
import { Hub } from '../tablero/Hub'
import { dispoTablero } from '../tablero/layouts'
import { ModalElegirJugador, ModalMenuPartida, ModalTerminarPartida, ModalVerLog } from '../tablero/ModalesPartida'
import { ModalMenuAsiento } from '../tablero/ModalMenuAsiento'
import { estadoReloj } from '../tablero/reloj'
import { despertarAudio, sonarAlarma } from '../tablero/sonido'
import { useArrastrarCorona } from '../tablero/useArrastrarCorona'
import { useBordesAsientos } from '../tablero/useBordesAsientos'
import { useJuegoEnCurso } from '../tablero/useJuegoEnCurso'

type EstadoModal =
  | { tipo: 'menuAsiento'; indice: number }
  | { tipo: 'menuPartida' }
  | { tipo: 'elegirJugador'; titulo: string; alElegir: (indice: number | null) => void }
  | { tipo: 'verLog' }
  | { tipo: 'dado' }
  | { tipo: 'terminarPartida'; sugerido?: number | null }

interface Props {
  juegoInicial: Juego
  /** Vuelve a la pantalla previa; la partida sigue guardada como "a medias". */
  onSalir: () => void
  /** Tras registrar la partida con éxito. */
  onPartidaRegistrada: () => void
}

/** Sustituye a `pintarTablero()` y el resto de la sección 8 de app.html. */
export function Tablero({ juegoInicial, onSalir, onPartidaRegistrada }: Props) {
  const almacen = useAlmacen()
  const mostrarAviso = useAviso()
  const { config, actualizar: actualizarConfig } = useConfig()
  const { juego, mutar, mutarSinFoto, deshacer } = useJuegoEnCurso(juegoInicial)
  const [modal, setModal] = useState<EstadoModal | null>(null)

  const dispo = dispoTablero(juego.j.length, juego.cfg.dispo)

  const tableroRef = useRef<HTMLDivElement>(null)
  const asientoRefs = useRef<(HTMLDivElement | null)[]>([])
  const bordes = useBordesAsientos(tableroRef, asientoRefs, dispo.rot, !!dispo.centro)

  // El hueco entre filas tiene que medir exactamente lo que ocupa el hub: uno
  // fijo a ojo se queda corto en cuanto cambia el contenido (el texto del
  // reloj, el tamaño de letra del sistema...) y la barra acaba invadiendo los
  // asientos de al lado (ver ADR 0026). Mismo patrón que `useBordesAsientos`
  // (medir tras cada render + un listener de resize, sin `ResizeObserver`,
  // que jsdom no implementa) en vez de una API nueva para un caso más.
  const hubRef = useRef<HTMLDivElement>(null)
  const [altoHub, setAltoHub] = useState(64)
  const medirHub = useCallback(() => {
    const alto = Math.ceil(hubRef.current?.getBoundingClientRect().height ?? 0)
    if (alto > 0) setAltoHub((actual) => (actual === alto ? actual : alto))
  }, [])
  useLayoutEffect(() => {
    medirHub()
  })
  useEffect(() => {
    addEventListener('resize', medirHub)
    return () => removeEventListener('resize', medirHub)
  }, [medirHub])

  const { arrastre, empezar: empezarArrastreCorona } = useArrastrarCorona((desde, destino) =>
    mutar((j) => cambiarMonarcaPorArrastre(j, desde, destino)),
  )

  // El reloj se repinta cada 500ms, igual que el `tick` original.
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 500)
    return () => clearInterval(id)
  }, [])
  // Cualquier acción que cambie `tIni` (reclamar el turno, pasarlo, reanudar tras
  // una pausa...) necesita un `ahora` fresco ya mismo: si no, hasta el próximo
  // tick de 500ms el reloj resta contra un `ahora` de antes de ese cambio y
  // muestra una duración negativa un instante.
  useEffect(() => {
    setAhora(Date.now())
  }, [juego])

  // La alarma solo suena una vez por turno.
  const alarmaSonadaRef = useRef(false)
  useEffect(() => {
    alarmaSonadaRef.current = false
  }, [juego.turno])
  useEffect(() => {
    const estado = estadoReloj(juego, ahora)
    if (estado.pasado && !alarmaSonadaRef.current) {
      alarmaSonadaRef.current = true
      sonarAlarma(config.sonido !== false)
    }
  }, [juego, ahora, config.sonido])

  // Un solo jugador en pie: se sugiere terminar la partida, una sola vez.
  useEffect(() => {
    const ganador = comprobarFinal(juego)
    if (ganador != null) {
      mutar((j) => ({ ...j, fin: true }))
      setModal({ tipo: 'terminarPartida', sugerido: ganador })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [juego])

  const audioDespiertoRef = useRef(false)
  const alTocarTablero = () => {
    if (audioDespiertoRef.current) return
    audioDespiertoRef.current = true
    despertarAudio()
  }

  // El delta flotante (+3/-2) y su registro se agrupan 2s, igual que en el
  // original: la vida cambia al momento, pero el apunte y el guardado esperan a
  // que el jugador deje de tocar.
  const [deltasVisibles, setDeltasVisibles] = useState<Record<number, number>>({})
  const deltaAcumRef = useRef<Record<number, number>>({})
  const timersDelta = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const juegoRef = useRef(juego)
  juegoRef.current = juego

  const alCambiarVida = (indice: number, delta: number) => {
    mutar((j) => cambiarVida(j, indice, delta), { agrupar: true })
    deltaAcumRef.current[indice] = (deltaAcumRef.current[indice] || 0) + delta
    setDeltasVisibles((d) => ({ ...d, [indice]: deltaAcumRef.current[indice] }))
    clearTimeout(timersDelta.current[indice])
    timersDelta.current[indice] = setTimeout(() => {
      const total = deltaAcumRef.current[indice] || 0
      delete deltaAcumRef.current[indice]
      if (total !== 0) {
        const nombre = juegoRef.current.j[indice].n
        const vidaActual = juegoRef.current.j[indice].vida
        mutar((j) => registrar(j, `${nombre} ${total > 0 ? 'gana' : 'pierde'} ${Math.abs(total)} de vida y queda a ${vidaActual}`))
      }
      setDeltasVisibles((d) => {
        const { [indice]: _quitado, ...resto } = d
        return resto
      })
    }, 2000)
  }
  useEffect(() => {
    const timers = timersDelta.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
    }
  }, [])

  const guardarComoPartida = async (ganador: number, totalMinutos: number) => {
    const registro = construirPartida(juego, ganador, totalMinutos)
    const errores = validar(registro)
    if (errores.length) {
      mostrarAviso(errores[0])
      return
    }
    const partidas = await leerPartidas(almacen)
    await guardarPartidas(almacen, normalizarPartidas([...partidas, registro]))
    await guardarJuego(almacen, null)
    setModal(null)
    mostrarAviso('Partida registrada')
    onPartidaRegistrada()
  }

  return (
    <div className="board-screen" onPointerDown={alTocarTablero}>
      <div
        className="board"
        ref={tableroRef}
        style={{ gridTemplateColumns: dispo.cols, gridTemplateRows: dispo.rows, rowGap: altoHub }}
      >
        {juego.j.map((_, i) => (
          <Asiento
            key={i}
            juego={juego}
            indice={i}
            rotacion={dispo.rot[i] || 0}
            areaGrid={dispo.areas[i]}
            delta={deltasVisibles[i] || 0}
            borde={bordes[i]}
            esDestinoDeCorona={arrastre != null && arrastre.destino === i && arrastre.desde !== i}
            onCambiarVida={(d) => alCambiarVida(i, d)}
            onAbrirMenu={() => setModal({ tipo: 'menuAsiento', indice: i })}
            onCambiarDano={(clave, delta) => mutar((j) => danoComandante(j, i, clave, delta))}
            onAjustarMana={(color, delta) => mutarSinFoto((j) => ajustarMana(j, i, color, delta))}
            onElegirInicio={() => mutarSinFoto((j) => elegirInicio(j, i))}
            onRetirada={() => mutar((j) => retirada(j, i, 1))}
            onEmpezarArrastreCorona={(e) => empezarArrastreCorona(i, e)}
            seatRef={(el) => {
              asientoRefs.current[i] = el
            }}
          />
        ))}
        <Hub
          ref={hubRef}
          juego={juego}
          ahora={ahora}
          areaCentro={dispo.centro}
          rotacionTurno={juego.turno != null ? dispo.rot[juego.turno] || 0 : 0}
          onDeshacer={deshacer}
          onPausa={() => mutar((j) => alternarPausa(j))}
          onPasar={() => mutar((j) => pasarTurno(j))}
          onMenu={() => setModal({ tipo: 'menuPartida' })}
        />
      </div>

      {arrastre && (
        <div className="corona-fantasma" style={{ left: arrastre.x, top: arrastre.y }}>
          <Icono nombre="corona" tamano={46} />
        </div>
      )}

      {modal?.tipo === 'menuAsiento' && (
        <ModalMenuAsiento
          juego={juego}
          indice={modal.indice}
          onContador={(clave: ContadorClave, d) => mutar((j) => contador(j, modal.indice, clave, d))}
          onMana={(color: keyof Identidad | null) => mutarSinFoto((j) => ajustarMana(j, modal.indice, color))}
          onRehacer={(d) => mutar((j) => ajustarRehacer(j, modal.indice, d))}
          onFuera={(d) => mutar((j) => ajustarFuera(j, modal.indice, d))}
          onBendicion={() => mutar((j) => alternarBendicion(j, modal.indice))}
          onMarcarFuera={() => {
            mutar((j) => alternarFueraDeJuego(j, modal.indice))
            setModal(null)
          }}
          onEditar={(cambios) => mutarSinFoto((j) => editarJugador(j, modal.indice, cambios))}
          onCerrar={() => setModal(null)}
        />
      )}

      {modal?.tipo === 'menuPartida' && (
        <ModalMenuPartida
          juego={juego}
          sonidoActivado={config.sonido !== false}
          onCambiarMonarca={() =>
            setModal({
              tipo: 'elegirJugador',
              titulo: '¿Quién es el monarca?',
              alElegir: (k) => {
                mutar((j) => cambiarMonarca(j, k))
                setModal(null)
              },
            })
          }
          onCambiarIniciativa={() =>
            setModal({
              tipo: 'elegirJugador',
              titulo: '¿Quién tiene la iniciativa?',
              alElegir: (k) => {
                mutar((j) => cambiarIniciativa(j, k))
                setModal(null)
              },
            })
          }
          onCambiarDia={() => mutar((j) => cambiarDiaNoche(j))}
          onTogglePausa={() => {
            mutar((j) => alternarPausa(j))
            setModal(null)
          }}
          onToggleSonido={() => {
            const activar = config.sonido === false
            actualizarConfig({ sonido: activar })
            if (activar) sonarAlarma(true)
          }}
          onSortear={() => {
            const vivos = juego.j.map((x, k) => (x.out ? -1 : k)).filter((k) => k >= 0)
            const elegido = vivos[Math.floor(Math.random() * vivos.length)]
            mostrarAviso(`Empieza ${juego.j[elegido].n}`)
            mutarSinFoto((j) => elegirInicio(j, elegido))
            setModal(null)
          }}
          onDado={() => setModal({ tipo: 'dado' })}
          onVerLog={() => setModal({ tipo: 'verLog' })}
          onSalir={() => {
            setModal(null)
            onSalir()
          }}
          onTerminar={() => setModal({ tipo: 'terminarPartida' })}
          onCerrar={() => setModal(null)}
        />
      )}

      {modal?.tipo === 'elegirJugador' && (
        <ModalElegirJugador titulo={modal.titulo} juego={juego} onElegir={modal.alElegir} onCerrar={() => setModal(null)} />
      )}

      {modal?.tipo === 'verLog' && <ModalVerLog juego={juego} onCerrar={() => setModal(null)} />}

      {modal?.tipo === 'dado' && <ModalDado onCerrar={() => setModal(null)} />}

      {modal?.tipo === 'terminarPartida' && (
        <ModalTerminarPartida
          juego={juego}
          sugerido={modal.sugerido}
          onSeguirJugando={() => setModal(null)}
          onSinRegistrar={async () => {
            await guardarJuego(almacen, null)
            setModal(null)
            onSalir()
          }}
          onGanador={(k, total) => guardarComoPartida(k, total)}
          onEmpate={(total) => guardarComoPartida(-1, total)}
        />
      )}
    </div>
  )
}

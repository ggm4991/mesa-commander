import { useState } from 'react'
import { Modal } from '../componentes/comunes/Modal'
import { COLORES } from '../componentes/mesa/colores'
import { hoy, reloj, segundos, uid } from '../motor/utilidades'
import { validar } from './validar'
import type { AsientoPartida, Partida, Resultado } from '../motor/tipos'

interface AsientoBorrador extends Omit<AsientoPartida, 'turno'> {
  /** Editable como texto ("4:30") mientras dura el formulario; se convierte a
   * segundos solo al guardar, para no deformar lo que el usuario está tecleando. */
  turno: string
}
interface Borrador {
  id: string
  fecha: string
  duracion: number
  seats: AsientoBorrador[]
}

const asientoVacio = (): AsientoBorrador => ({ j: '', c: '', c2: '', id: '', r: 'D', rehacer: 0, tiempo: 0, turno: reloj(180) })

const aBorrador = (p: Partida | null): Borrador =>
  p
    ? { id: p.id, fecha: p.fecha, duracion: p.duracion, seats: p.seats.map((s) => ({ ...s, turno: reloj(s.turno) })) }
    : { id: uid(), fecha: hoy(), duracion: 120, seats: [asientoVacio(), asientoVacio(), asientoVacio(), asientoVacio()] }

function aPartidaFinal(b: Borrador): Partida {
  return {
    id: b.id,
    fecha: b.fecha,
    duracion: b.duracion,
    seats: b.seats.map((s) => ({ ...s, j: s.j.trim(), c: s.c.trim(), c2: (s.c2 || '').trim(), turno: segundos(s.turno) })),
  }
}

interface Props {
  /** null = partida nueva. */
  partida: Partida | null
  nombresJugadores: string[]
  nombresComandantes: string[]
  onGuardar: (partida: Partida) => void
  onCancelar: () => void
}

/** Sustituye a `abrirFormulario()`/`pintarFormulario()` en app.html: alta y edición
 * manual de una partida, con la misma validación que usa el tablero al terminar
 * una de verdad (ver `validar()`). */
export function ModalFormularioPartida({ partida, nombresJugadores, nombresComandantes, onGuardar, onCancelar }: Props) {
  const editando = partida != null
  const [borrador, setBorrador] = useState<Borrador>(() => aBorrador(partida))
  const [errores, setErrores] = useState<string[]>([])

  const actualizarAsiento = (i: number, cambios: Partial<AsientoBorrador>) => {
    setBorrador((b) => ({ ...b, seats: b.seats.map((s, idx) => (idx === i ? { ...s, ...cambios } : s)) }))
  }

  const alternarColor = (i: number, color: string) => {
    setBorrador((b) => {
      const s = b.seats[i]
      const set = new Set((s.id || '').split(''))
      if (set.has(color)) set.delete(color)
      else set.add(color)
      const id = COLORES.filter((c) => set.has(c)).join('')
      return { ...b, seats: b.seats.map((x, idx) => (idx === i ? { ...x, id } : x)) }
    })
  }

  const quitarAsiento = (i: number) => {
    setBorrador((b) => ({ ...b, seats: b.seats.filter((_, idx) => idx !== i) }))
  }

  const anadirAsiento = () => {
    setBorrador((b) => ({ ...b, seats: [...b.seats, asientoVacio()] }))
  }

  const guardar = () => {
    const final = aPartidaFinal(borrador)
    const nuevosErrores = validar(final)
    if (nuevosErrores.length) {
      setErrores(nuevosErrores)
      return
    }
    onGuardar(final)
  }

  return (
    <Modal
      titulo={editando ? 'Editar partida' : 'Nueva partida'}
      onCerrar={onCancelar}
      pie={
        <>
          <button className="btn" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn primary" onClick={guardar}>
            {editando ? 'Guardar cambios' : 'Registrar partida'}
          </button>
        </>
      }
    >
      {errores.length > 0 && (
        <div className="errors">
          No se ha podido guardar:
          <ul>
            {errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <datalist id="dl-j">
        {nombresJugadores.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <datalist id="dl-c">
        {nombresComandantes.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <div className="row">
        <div className="field">
          <label htmlFor="f-fecha">Fecha</label>
          <input
            id="f-fecha"
            type="date"
            value={borrador.fecha}
            onChange={(e) => setBorrador((b) => ({ ...b, fecha: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="f-dur">Duración en minutos</label>
          <input
            id="f-dur"
            type="number"
            min={1}
            max={900}
            value={borrador.duracion}
            onChange={(e) => setBorrador((b) => ({ ...b, duracion: +e.target.value }))}
          />
        </div>
        <div className="field">
          <label>Jugadores</label>
          <input type="text" value={borrador.seats.length} disabled />
        </div>
      </div>

      {borrador.seats.map((s, i) => (
        <div className="seat-form" key={i}>
          <div className="seat-title">
            <span>Asiento {i + 1}</span>
            {borrador.seats.length > 2 && (
              <button className="btn link danger" onClick={() => quitarAsiento(i)}>
                Quitar de la mesa
              </button>
            )}
          </div>
          <div className="row cuatro">
            <div className="field">
              <label>Jugador</label>
              <input type="text" list="dl-j" value={s.j} placeholder="Nombre" onChange={(e) => actualizarAsiento(i, { j: e.target.value })} />
            </div>
            <div className="field">
              <label>Comandante</label>
              <input
                type="text"
                list="dl-c"
                value={s.c}
                placeholder="Nombre en inglés"
                onChange={(e) => actualizarAsiento(i, { c: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Compañero (opcional)</label>
              <input
                type="text"
                list="dl-c"
                value={s.c2 || ''}
                placeholder="Si lleva dos"
                onChange={(e) => actualizarAsiento(i, { c2: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Resultado</label>
              <select value={s.r} onChange={(e) => actualizarAsiento(i, { r: e.target.value as Resultado })}>
                <option value="V">Victoria</option>
                <option value="D">Derrota</option>
                <option value="E">Empate</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Jugadas retiradas</label>
              <input
                type="number"
                min={0}
                max={99}
                value={s.rehacer}
                onChange={(e) => actualizarAsiento(i, { rehacer: Math.max(0, +e.target.value || 0) })}
              />
            </div>
            <div className="field">
              <label>Veces fuera de tiempo</label>
              <input
                type="number"
                min={0}
                max={99}
                value={s.tiempo}
                onChange={(e) => actualizarAsiento(i, { tiempo: Math.max(0, +e.target.value || 0) })}
              />
            </div>
            <div className="field">
              <label>Turno más largo (min:seg)</label>
              <input type="text" value={s.turno} placeholder="4:30" onChange={(e) => actualizarAsiento(i, { turno: e.target.value })} />
            </div>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Identidad de color del comandante</label>
            <div className="colors">
              {COLORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="color-btn"
                  aria-pressed={(s.id || '').includes(c)}
                  aria-label={`Color ${c}`}
                  onClick={() => alternarColor(i, c)}
                >
                  <i className={`pip ${c}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
      {borrador.seats.length < 6 && (
        <button className="btn" onClick={anadirAsiento}>
          Añadir jugador a la mesa
        </button>
      )}
    </Modal>
  )
}

import { describe, expect, it } from 'vitest'
import { nuevoJugador } from '../../src/motor/jugador'
import { estadoReloj } from '../../src/tablero/reloj'
import type { Juego } from '../../src/motor/tipos'

function juegoDePrueba(limite: number): Juego {
  const t = 1_000_000_000
  return {
    id: 'x',
    inicio: new Date(t).toISOString(),
    cfg: { vida: 40, limite, dispo: null },
    j: [nuevoJugador({ nombre: 'Ana' }, 40), nuevoJugador({ nombre: 'Beto' }, 40)],
    turno: 0,
    tIni: t,
    acum: 0,
    pausado: false,
    monarca: null,
    iniciativa: null,
    dia: null,
    log: [],
    fin: false,
    undo: [],
  }
}

describe('estadoReloj', () => {
  it('sin turno, pregunta quién empieza', () => {
    const juego = { ...juegoDePrueba(300), turno: null }
    const e = estadoReloj(juego, juego.tIni)
    expect(e).toMatchObject({ quien: '¿Quién empieza?', crono: '', estado: 'toca tu asiento', pasado: false, cerca: false })
  })

  it('a 1:00 de un límite de 5:00, sin avisos', () => {
    const juego = juegoDePrueba(300)
    const e = estadoReloj(juego, juego.tIni + 60_000)
    expect(e).toMatchObject({ quien: 'Ana', crono: '1:00', estado: 'de 5:00', pasado: false, cerca: false })
  })

  it('al quedar un minuto o menos, se pone en aviso', () => {
    const juego = juegoDePrueba(300)
    const e = estadoReloj(juego, juego.tIni + 240_000) // 4:00, quedan 60s
    expect(e).toMatchObject({ estado: 'quedan 1:00', pasado: false, cerca: true })
  })

  it('pasado el límite, se marca como pasado con el exceso', () => {
    const juego = juegoDePrueba(300)
    const e = estadoReloj(juego, juego.tIni + 315_000) // 5:15, pasado 0:15
    expect(e).toMatchObject({ estado: 'se pasó 0:15', pasado: true, cerca: false })
  })

  it('sin límite de turno, no hay aviso ni "pasado", solo el reloj corriendo', () => {
    const juego = juegoDePrueba(0)
    const e = estadoReloj(juego, juego.tIni + 999_000)
    expect(e).toMatchObject({ estado: '', pasado: false, cerca: false })
  })

  it('en pausa, no cuenta como pasado ni cerca aunque el tiempo lo supere', () => {
    const juego = { ...juegoDePrueba(300), pausado: true, acum: 400 }
    const e = estadoReloj(juego, juego.tIni + 999_000)
    expect(e).toMatchObject({ estado: 'en pausa', pasado: false, cerca: false, pausado: true })
  })

  it('un nombre largo se recorta a 12 caracteres con puntos suspensivos', () => {
    const juego = juegoDePrueba(0)
    juego.j[0].n = 'Un nombre muy muy largo'
    const e = estadoReloj(juego, juego.tIni)
    expect(e.quien).toBe('Un nombre mu…')
  })
})

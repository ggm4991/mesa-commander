import { describe, expect, it } from 'vitest'
import { cambiarVida } from '../../src/motor/vida'
import { deshacer, foto } from '../../src/motor/deshacer'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego } from '../../src/motor/tipos'

function partidaDePrueba(): Juego {
  return {
    id: 'x',
    inicio: new Date().toISOString(),
    cfg: { vida: 40, limite: 0, dispo: null },
    j: [nuevoJugador({ nombre: 'Ana' }, 40)],
    turno: 0,
    tIni: Date.now(),
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

describe('foto / deshacer', () => {
  it('deshacer restaura el estado justo antes de la última foto', () => {
    const inicial = partidaDePrueba()
    const { juego: conFoto } = foto(inicial)
    const mutado = cambiarVida(conFoto, 0, -10)
    expect(mutado.j[0].vida).toBe(30)

    const restaurado = deshacer(mutado)
    expect(restaurado.j[0].vida).toBe(40)
  })

  it('sin snapshots no hace nada', () => {
    const juego = partidaDePrueba()
    expect(deshacer(juego)).toBe(juego)
  })

  it('agrupa fotos repetidas en menos de 1500ms (pulsaciones largas)', () => {
    const juego = partidaDePrueba()
    const ahora = Date.now()
    const primera = foto(juego, { agrupar: true, ahora })
    expect(primera.juego.undo).toHaveLength(1) // primera foto de la sesión: nunca se agrupa

    const segunda = foto(primera.juego, { agrupar: true, ultimaFoto: primera.ultimaFoto, ahora: ahora + 200 })
    expect(segunda.juego.undo).toHaveLength(1) // dentro de los 1500ms: se agrupa con la anterior

    const tercera = foto(segunda.juego, { agrupar: true, ultimaFoto: segunda.ultimaFoto, ahora: ahora + 2000 })
    expect(tercera.juego.undo).toHaveLength(2) // pasados los 1500ms: nueva foto
  })

  it('no guarda más de 40 snapshots', () => {
    const ahora = Date.now()
    let resultado = { juego: partidaDePrueba(), ultimaFoto: 0 }
    for (let i = 0; i < 45; i++) {
      resultado = foto(resultado.juego, { ahora: ahora + i * 2000 })
    }
    expect(resultado.juego.undo).toHaveLength(40)
  })
})

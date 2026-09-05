import { describe, expect, it } from 'vitest'
import { elegirInicio, empezarPartida, pasarTurno } from '../../src/motor/partida'
import { ajustarMana } from '../../src/motor/vida'

const asientos = ['Ana', 'Beto', 'Cris', 'Dora'].map((nombre) => ({ nombre, comandante: 'C', colores: 'R' }))

describe('inicio de partida', () => {
  it('con sorteo previo, empieza directamente con ese asiento', () => {
    const juego = empezarPartida({ asientos, vidaInicial: 40, limiteTurno: 0, dispo: null, turnoInicial: 2 })
    expect(juego.turno).toBe(2)
    expect(juego.j[juego.turno as number].n).toBe('Cris')
    expect(juego.log.some((e) => /Empieza Cris/.test(e.txt))).toBe(true)
  })

  it('sin sorteo, la partida queda esperando a que alguien toque su asiento', () => {
    const juego = empezarPartida({ asientos, vidaInicial: 40, limiteTurno: 0, dispo: null, turnoInicial: null })
    expect(juego.turno).toBeNull()
  })

  it('pasar turno antes de empezar no hace nada', () => {
    const juego = empezarPartida({ asientos, vidaInicial: 40, limiteTurno: 0, dispo: null, turnoInicial: null })
    expect(pasarTurno(juego)).toBe(juego)
  })

  it('el primero que toca su asiento empieza, y ya no se lo puede robar otro', () => {
    let juego = empezarPartida({ asientos, vidaInicial: 40, limiteTurno: 0, dispo: null, turnoInicial: null })

    juego = elegirInicio(juego, 1)
    expect(juego.turno).toBe(1)
    expect(juego.log.some((e) => /Empieza Beto/.test(e.txt))).toBe(true)

    const antes = juego.turno
    juego = elegirInicio(juego, 3)
    expect(juego.turno).toBe(antes)

    juego = pasarTurno(juego)
    expect(juego.turno).toBe(2)
  })

  it('pasar el turno vacía el maná de todos, no solo el de quien lo pasa (regla 500.4)', () => {
    let juego = empezarPartida({ asientos, vidaInicial: 40, limiteTurno: 0, dispo: null, turnoInicial: 0 })
    juego = ajustarMana(juego, 0, 'U')
    juego = ajustarMana(juego, 1, 'R')
    expect(juego.j[0].mana.U).toBe(1)
    expect(juego.j[1].mana.R).toBe(1)

    juego = pasarTurno(juego)
    expect(juego.j[0].mana).toEqual({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 })
    expect(juego.j[1].mana).toEqual({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 })
  })
})

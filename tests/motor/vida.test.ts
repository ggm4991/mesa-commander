import { describe, expect, it } from 'vitest'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego } from '../../src/motor/tipos'
import {
  DANO_COMANDANTE_LETAL,
  VENENO_LETAL,
  cambiarVida,
  comandantesEnMesa,
  comprobarFinal,
  contador,
  danoComandante,
  retirada,
  revisar,
} from '../../src/motor/vida'

function partidaDePrueba(): Juego {
  const j = [
    nuevoJugador({ nombre: 'Ana', comandante: 'Thrasios, Triton Hero', comandante2: 'Kydele, Chosen of Kruphix' }, 100),
    nuevoJugador({ nombre: 'Beto', comandante: 'Krenko, Mob Boss' }, 100),
  ]
  return {
    id: 'x',
    inicio: new Date().toISOString(),
    cfg: { vida: 100, limite: 0, dispo: null },
    j,
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

describe('daño de comandante (regla 903.10a)', () => {
  it('la mesa tiene un comandante por hueco: Ana lleva compañero', () => {
    expect(comandantesEnMesa(partidaDePrueba())).toHaveLength(3)
  })

  it('compañeros por separado no se suman: 20 y 20 no eliminan', () => {
    let juego = partidaDePrueba()
    juego = danoComandante(juego, 1, '0:0', 20)
    juego = danoComandante(juego, 1, '0:1', 20)
    expect(juego.j[1].out).toBe(false)
    expect(juego.j[1].vida).toBe(60)
  })

  it(`${DANO_COMANDANTE_LETAL} de un mismo comandante elimina`, () => {
    let juego = partidaDePrueba()
    juego = danoComandante(juego, 1, '0:0', 20)
    juego = danoComandante(juego, 1, '0:0', 1)
    expect(juego.j[1].out).toBe(true)
  })

  it('el propio comandante robado también elimina a su dueño', () => {
    let juego = partidaDePrueba()
    juego = danoComandante(juego, 0, '0:0', 21)
    expect(juego.j[0].out).toBe(true)
  })
})

describe('revisar / eliminación', () => {
  it('elimina por vida a 0 o menos, y queda anotado', () => {
    let juego = partidaDePrueba()
    juego = cambiarVida(juego, 0, -100)
    expect(juego.j[0].out).toBe(true)
    expect(juego.log[0].txt).toContain('queda fuera de la partida')
  })

  it(`elimina con ${VENENO_LETAL} contadores de veneno`, () => {
    let juego = partidaDePrueba()
    juego = contador(juego, 0, 'ven', VENENO_LETAL)
    expect(juego.j[0].out).toBe(true)
  })

  it('no vuelve a anotar si ya estaba fuera', () => {
    let juego = partidaDePrueba()
    juego = cambiarVida(juego, 0, -100)
    const largo = juego.log.length
    juego = revisar(juego, 0)
    expect(juego.log).toHaveLength(largo)
  })
})

describe('contadores', () => {
  it('no bajan de 0', () => {
    const juego = contador(partidaDePrueba(), 0, 'exp', -5)
    expect(juego.j[0].exp).toBe(0)
  })

  it('registra el cambio con el nombre del contador', () => {
    const juego = contador(partidaDePrueba(), 0, 'exp', 3)
    expect(juego.j[0].exp).toBe(3)
    expect(juego.log[0].txt).toBe('Ana: Experiencia a 3')
  })
})

describe('comprobarFinal', () => {
  it('cuando solo queda un jugador en pie, devuelve su índice', () => {
    const juego = cambiarVida(partidaDePrueba(), 1, -200)
    expect(juego.j[1].out).toBe(true)
    expect(comprobarFinal(juego)).toBe(0)
  })

  it('con más de un jugador en pie, no hay ganador todavía', () => {
    expect(comprobarFinal(partidaDePrueba())).toBeNull()
  })
})

describe('retirada', () => {
  it('registra solo al subir, no al bajar (no es el botón de deshacer)', () => {
    let juego = retirada(partidaDePrueba(), 0, 1)
    expect(juego.log).toHaveLength(1)
    juego = retirada(juego, 0, -1)
    expect(juego.j[0].rehacer).toBe(0)
    expect(juego.log).toHaveLength(1)
  })
})

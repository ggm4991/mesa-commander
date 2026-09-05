import { describe, expect, it } from 'vitest'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego } from '../../src/motor/tipos'
import {
  DANO_COMANDANTE_LETAL,
  VENENO_LETAL,
  ajustarFuera,
  ajustarMana,
  ajustarRehacer,
  alternarBendicion,
  alternarFueraDeJuego,
  cambiarVida,
  comandantesAgrupadosPorJugador,
  comandantesEnMesa,
  comprobarFinal,
  contador,
  danoComandante,
  editarJugador,
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

describe('comandantesAgrupadosPorJugador', () => {
  it('un grupo por jugador, no por comandante: un compañero no añade un grupo nuevo', () => {
    const grupos = comandantesAgrupadosPorJugador(partidaDePrueba())
    expect(grupos).toHaveLength(2) // Ana y Beto, aunque Ana lleve dos comandantes
    expect(grupos[0]).toHaveLength(2) // el grupo de Ana lleva sus dos comandantes
    expect(grupos[1]).toHaveLength(1) // el de Beto, solo el suyo
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

describe('ajustarRehacer / ajustarFuera (menú de asiento)', () => {
  it('a diferencia de retirada(), ajustarRehacer registra incluso al bajar', () => {
    let juego = ajustarRehacer(partidaDePrueba(), 0, 1)
    expect(juego.log[0].txt).toBe('Ana: jugadas retiradas a 1')
    juego = ajustarRehacer(juego, 0, -1)
    expect(juego.j[0].rehacer).toBe(0)
    expect(juego.log[0].txt).toBe('Ana: jugadas retiradas a 0')
  })

  it('ajustarFuera no baja de 0 y siempre registra', () => {
    const juego = ajustarFuera(partidaDePrueba(), 0, -5)
    expect(juego.j[0].fuera).toBe(0)
    expect(juego.log[0].txt).toBe('Ana: pasadas de tiempo a 0')
  })
})

describe('alternarBendicion', () => {
  it('la da y la quita, anotando cada cambio', () => {
    let juego = alternarBendicion(partidaDePrueba(), 0)
    expect(juego.j[0].bendicion).toBe(true)
    expect(juego.log[0].txt).toBe('Ana tiene la bendición de la ciudad')
    juego = alternarBendicion(juego, 0)
    expect(juego.j[0].bendicion).toBe(false)
    expect(juego.log[0].txt).toBe('Ana pierde la bendición de la ciudad')
  })
})

describe('alternarFueraDeJuego', () => {
  it('usa un texto de registro distinto al de la eliminación automática', () => {
    const juego = alternarFueraDeJuego(partidaDePrueba(), 0)
    expect(juego.j[0].out).toBe(true)
    expect(juego.log[0].txt).toBe('Ana queda fuera') // revisar() diría "...de la partida"
  })

  it('se puede volver a marcar como en juego', () => {
    let juego = alternarFueraDeJuego(partidaDePrueba(), 0)
    juego = alternarFueraDeJuego(juego, 0)
    expect(juego.j[0].out).toBe(false)
    expect(juego.log[0].txt).toBe('Ana vuelve al juego')
  })
})

describe('ajustarMana', () => {
  it('suma un punto del color pulsado, sin tocar el registro', () => {
    const juego = ajustarMana(partidaDePrueba(), 0, 'U')
    expect(juego.j[0].mana.U).toBe(1)
    expect(juego.log).toHaveLength(0)
  })

  it('vaciar (color null) pone todos los colores a 0', () => {
    let juego = ajustarMana(partidaDePrueba(), 0, 'U')
    juego = ajustarMana(juego, 0, 'R')
    juego = ajustarMana(juego, 0, null)
    expect(juego.j[0].mana).toEqual({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 })
  })

  it('con delta -1, gasta un punto del color', () => {
    let juego = ajustarMana(partidaDePrueba(), 0, 'U')
    juego = ajustarMana(juego, 0, 'U')
    juego = ajustarMana(juego, 0, 'U', -1)
    expect(juego.j[0].mana.U).toBe(1)
  })

  it('no baja de cero', () => {
    const juego = ajustarMana(partidaDePrueba(), 0, 'U', -1)
    expect(juego.j[0].mana.U).toBe(0)
  })
})

describe('editarJugador', () => {
  it('cambia nombre, comandantes y colores sin tocar el registro', () => {
    const juego = editarJugador(partidaDePrueba(), 1, { n: 'Beto R.', c: 'Krenko, Mob Boss', c2: '', col: 'R' })
    expect(juego.j[1]).toMatchObject({ n: 'Beto R.', c: 'Krenko, Mob Boss', c2: '', col: 'R' })
    expect(juego.log).toHaveLength(0)
  })

  it('un nombre en blanco no borra el nombre existente', () => {
    const juego = editarJugador(partidaDePrueba(), 0, { n: '   ' })
    expect(juego.j[0].n).toBe('Ana')
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

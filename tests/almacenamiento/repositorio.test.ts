import { describe, expect, it } from 'vitest'
import { crearAlmacenMemoria } from '../../src/almacenamiento/adaptadorMemoria'
import {
  guardarConfig,
  guardarJuego,
  guardarPartidas,
  guardarPerfiles,
  leerConfig,
  leerJuego,
  leerPartidas,
  leerPerfiles,
  normalizarPartidas,
} from '../../src/almacenamiento/repositorio'
import type { AlmacenPersistente } from '../../src/almacenamiento/tipos'
import { nuevoJugador } from '../../src/motor/jugador'
import type { Juego, Partida } from '../../src/motor/tipos'

const partida = (id: string, fecha: string): Partida => ({
  id,
  fecha,
  duracion: 100,
  seats: [{ j: 'Ana', c: 'X', c2: '', id: 'R', r: 'V', rehacer: 0, tiempo: 0, turno: 60 }],
})

describe('partidas', () => {
  it('sin nada guardado, devuelve una lista vacía (sembrar DEMO es cosa de la app, no del repositorio)', async () => {
    const almacen = crearAlmacenMemoria()
    expect(await leerPartidas(almacen)).toEqual([])
  })

  it('guarda y relee tal cual', async () => {
    const almacen = crearAlmacenMemoria()
    await guardarPartidas(almacen, [partida('g1', '2026-08-01')])
    expect(await leerPartidas(almacen)).toEqual([partida('g1', '2026-08-01')])
  })

  it('normalizarPartidas asigna id a las que no lo tienen y ordena por fecha descendente', () => {
    const sinId = { ...partida('', '2026-07-01'), id: '' }
    const normalizadas = normalizarPartidas([sinId, partida('g2', '2026-08-01')])
    expect(normalizadas[0].fecha).toBe('2026-08-01') // la más reciente primero
    expect(normalizadas[1].id).not.toBe('')
  })
})

describe('perfiles', () => {
  it('migra perfiles de un solo comandante (formato antiguo) al leer', async () => {
    const almacen = crearAlmacenMemoria()
    await almacen.set(
      'mesa:perfiles',
      JSON.stringify([{ id: 'p1', nombre: 'Gonzalo', comandante: 'Edgar Markov', colores: 'WBR' }]),
    )
    const perfiles = await leerPerfiles(almacen)
    expect(perfiles[0].mazos).toHaveLength(1)
    expect(perfiles[0].mazos[0].c).toBe('Edgar Markov')
  })

  it('guarda y relee sin perder los mazos', async () => {
    const almacen = crearAlmacenMemoria()
    const perfil = { id: 'p2', nombre: 'Marta', ultimo: 'm1', mazos: [{ id: 'm1', c: 'X', c2: '', col: 'U', imagenId: '' }] }
    await guardarPerfiles(almacen, [perfil])
    expect(await leerPerfiles(almacen)).toEqual([perfil])
  })
})

describe('config', () => {
  it('sin nada guardado, devuelve los valores por defecto', async () => {
    const almacen = crearAlmacenMemoria()
    expect(await leerConfig(almacen)).toEqual({ vidaInicial: 40, limiteTurno: 0, disposicion: {}, sonido: true })
  })

  it('lo guardado se combina sobre los valores por defecto', async () => {
    const almacen = crearAlmacenMemoria()
    await guardarConfig(almacen, { vidaInicial: 100, limiteTurno: 0, disposicion: {}, sonido: true })
    const config = await leerConfig(almacen)
    expect(config.vidaInicial).toBe(100)
    expect(config.sonido).toBe(true)
  })
})

describe('juego', () => {
  function juegoDePrueba(): Juego {
    return {
      id: 'x',
      inicio: new Date().toISOString(),
      cfg: { vida: 40, limite: 0, dispo: null },
      j: [nuevoJugador({ nombre: 'Ana' }, 40)],
      turno: 0,
      tIni: 111,
      acum: 0,
      pausado: false,
      monarca: null,
      iniciativa: null,
      dia: null,
      log: [],
      fin: false,
      undo: ['{"algo":1}'],
    }
  }

  it('al guardar, el historial de deshacer no se persiste', async () => {
    const almacen = crearAlmacenMemoria()
    await guardarJuego(almacen, juegoDePrueba())
    const crudo = await almacen.get('mesa:juego')
    expect(JSON.parse(crudo.value as string).undo).toBeUndefined()
  })

  it('al leer, el historial vuelve vacío y tIni se pone al día', async () => {
    const almacen = crearAlmacenMemoria()
    await guardarJuego(almacen, juegoDePrueba())
    const releido = await leerJuego(almacen, 999)
    expect(releido?.undo).toEqual([])
    expect(releido?.tIni).toBe(999)
  })

  it('guardar null borra la partida en curso', async () => {
    const almacen = crearAlmacenMemoria()
    await guardarJuego(almacen, juegoDePrueba())
    await guardarJuego(almacen, null)
    expect(await leerJuego(almacen)).toBeNull()
  })

  it('sin partida guardada, o con datos corruptos sin jugadores, devuelve null', async () => {
    const almacen = crearAlmacenMemoria()
    expect(await leerJuego(almacen)).toBeNull()
    await almacen.set('mesa:juego', JSON.stringify({ algo: 'raro' }))
    expect(await leerJuego(almacen)).toBeNull()
  })
})

describe('un almacén que falla', () => {
  const almacenRoto: AlmacenPersistente = {
    get: () => Promise.reject(new Error('sin conexión')),
    set: () => Promise.reject(new Error('sin espacio')),
  }

  it('leer devuelve null en vez de lanzar', async () => {
    expect(await leerPartidas(almacenRoto)).toEqual([])
    expect(await leerConfig(almacenRoto)).toEqual({ vidaInicial: 40, limiteTurno: 0, disposicion: {}, sonido: true })
  })

  it('guardar devuelve false en vez de lanzar', async () => {
    expect(await guardarPartidas(almacenRoto, [])).toBe(false)
  })
})

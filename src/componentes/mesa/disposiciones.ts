// Disposiciones de mesa por número de jugadores, portadas de app.html (sección 7,
// DISPOS). Es UI, no motor: el motor solo transporta `dispo` dentro de `cfg` sin
// interpretarla (ver motor/tipos.ts y ADR 0004). Se comparte entre la pantalla
// previa (aquí) y el tablero (siguiente commit), que la lee de `Juego.cfg.dispo`.
export interface Dispo {
  id: string
  n: string
  cols: string
  rows: string
  areas?: (string | null)[]
  centro?: string
  rot: number[]
}

export const DISPOS: Record<number, Dispo[]> = {
  1: [{ id: '1a', n: 'Pantalla completa', cols: '1fr', rows: '1fr', rot: [0] }],
  2: [
    { id: '2a', n: 'Cara a cara', cols: '1fr', rows: '1fr 1fr', rot: [180, 0] },
    { id: '2b', n: 'Uno a cada lado', cols: '1fr 1fr', rows: '1fr', rot: [90, 270] },
    { id: '2c', n: 'Los dos del mismo lado', cols: '1fr', rows: '1fr 1fr', rot: [0, 0] },
  ],
  3: [
    {
      id: '3a',
      n: 'Uno enfrente',
      cols: '1fr 1fr',
      rows: '1fr 1fr',
      areas: ['1/1/2/3', '2/1/3/2', '2/2/3/3'],
      rot: [180, 0, 0],
    },
    {
      id: '3b',
      n: 'Rodeando el móvil',
      cols: '1fr 1.1fr 1fr',
      rows: '1fr 1fr',
      areas: ['1/1/2/4', '2/1/3/2', '2/3/3/4'],
      rot: [180, 90, 270],
      centro: '2/2/3/3',
    },
    { id: '3c', n: 'En columna', cols: '1fr', rows: 'repeat(3,1fr)', rot: [180, 180, 0] },
  ],
  4: [
    { id: '4a', n: 'Dos y dos', cols: '1fr 1fr', rows: '1fr 1fr', rot: [180, 180, 0, 0] },
    {
      id: '4b',
      n: 'Uno en cada lado',
      cols: '1fr 1.1fr 1fr',
      rows: '1fr 1.3fr 1fr',
      areas: ['1/1/2/4', '2/1/3/2', '2/3/3/4', '3/1/4/4'],
      rot: [180, 90, 270, 0],
      centro: '2/2/3/3',
    },
    { id: '4c', n: 'En columna', cols: '1fr', rows: 'repeat(4,1fr)', rot: [180, 180, 0, 0] },
  ],
  5: [
    {
      id: '5a',
      n: 'Dos, dos y uno',
      cols: '1fr 1fr',
      rows: 'repeat(3,1fr)',
      areas: [null, null, null, null, '3/1/4/3'],
      rot: [180, 180, 0, 0, 0],
    },
    {
      id: '5b',
      n: 'Rodeando el móvil',
      cols: '1fr 1fr',
      rows: 'repeat(3,1fr)',
      areas: ['1/1/2/2', '1/2/2/3', '2/1/3/2', '2/2/3/3', '3/1/4/3'],
      rot: [180, 180, 90, 270, 0],
    },
    {
      id: '5c',
      n: 'Todos en la misma dirección',
      cols: '1fr 1fr',
      rows: 'repeat(3,1fr)',
      areas: [null, null, null, null, '3/1/4/3'],
      rot: [0, 0, 0, 0, 0],
    },
  ],
  6: [
    { id: '6a', n: 'Tres y tres', cols: 'repeat(3,1fr)', rows: '1fr 1fr', rot: [180, 180, 180, 0, 0, 0] },
    { id: '6b', n: 'Rodeando el móvil', cols: '1fr 1fr', rows: 'repeat(3,1fr)', rot: [180, 180, 90, 270, 0, 0] },
    { id: '6c', n: 'Dos columnas', cols: '1fr 1fr', rows: 'repeat(3,1fr)', rot: [0, 0, 0, 0, 0, 0] },
  ],
}

export interface DisposicionGuardada {
  id: string
  rot: number[]
}

/** Disposición activa para `numJugadores`: la guardada en `config.disposicion` si
 * sigue siendo válida (mismo id, mismo número de asientos), o la primera por defecto. */
export function dispoActual(
  numJugadores: number,
  disposicionGuardada: Record<string, unknown>,
): Dispo {
  const opciones = DISPOS[numJugadores]
  const guardada = disposicionGuardada[numJugadores] as DisposicionGuardada | undefined
  const base = (guardada && opciones.find((d) => d.id === guardada.id)) || opciones[0]
  const rot =
    guardada && Array.isArray(guardada.rot) && guardada.rot.length === numJugadores
      ? guardada.rot.slice()
      : base.rot.slice()
  return { ...base, rot }
}

/** Nuevo valor de `config.disposicion` recordando la elección para `numJugadores`. */
export function conDisposicionGuardada(
  disposicion: Record<string, unknown>,
  numJugadores: number,
  dispo: DisposicionGuardada,
): Record<string, unknown> {
  return { ...disposicion, [numJugadores]: { id: dispo.id, rot: dispo.rot.slice() } }
}

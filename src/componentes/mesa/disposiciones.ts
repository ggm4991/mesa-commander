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
  /** Índice (0-based) de `rows` donde se inserta una fila propia para el hub, de
   * `conFilaHub()`. Sin ella, el hub flota centrado por `position:absolute` sobre
   * el hueco entre filas (`row-gap`) — que solo cae en el sitio correcto cuando
   * hay una única fila de huecos (2 filas de asientos). Con 3 o más filas, ese
   * centrado cae sobre la fila de en medio y los asientos quedan tapados: ahí
   * hace falta reservarle su propia fila, como ya hacían `centro` en 3b/4b
   * (ver ADR 0039). */
  filaHub?: number
  rot: number[]
}

/** Si `filaHub` está definida, inserta `tamano` como pista extra en `rows` (una
 * cadena de pistas separadas por espacio, p. ej. `'1fr 1fr 1fr'`) en esa
 * posición; si no, devuelve `rows` tal cual. Compartida entre `VistaMesa` (con
 * un tamaño de previsualización fijo) y `Tablero` (con el alto real medido del
 * hub, ver ADR 0026) para no duplicar la lógica de inserción en los dos sitios. */
export function conFilaHub(rows: string, filaHub: number | undefined, tamano: string): string {
  if (filaHub == null) return rows
  const pistas = rows.split(' ')
  pistas.splice(filaHub, 0, tamano)
  return pistas.join(' ')
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
      // El orden de los asientos sigue las agujas del reloj vistas desde
      // arriba (regla 103.1): arriba, luego abajo-derecha, luego abajo-
      // izquierda — no el orden en que aparecían en la rejilla (ver ADR 0031).
      areas: ['1/1/2/3', '2/2/3/3', '2/1/3/2'],
      rot: [180, 0, 0],
    },
    {
      id: '3b',
      n: 'Rodeando el móvil',
      cols: '1fr 1.1fr 1fr',
      rows: '1fr 1fr',
      areas: ['1/1/2/4', '2/3/3/4', '2/1/3/2'],
      rot: [180, 270, 90],
      centro: '2/2/3/3',
    },
    { id: '3c', n: 'En columna', cols: '1fr', rows: 'repeat(3,1fr)', rot: [180, 180, 0] },
  ],
  4: [
    {
      id: '4a',
      n: 'Dos y dos',
      cols: '1fr 1fr',
      rows: '1fr 1fr',
      areas: ['1/1/2/2', '1/2/2/3', '2/2/3/3', '2/1/3/2'],
      rot: [180, 180, 0, 0],
    },
    {
      id: '4b',
      n: 'Uno en cada lado',
      // En LifeTap (la referencia que dio el usuario) el hub no comparte fila
      // con los dos asientos de los lados: es su propia tira, por debajo de
      // ellos — los tres bloques de jugador (arriba, los dos de lado, abajo)
      // quedan de un alto parecido entre sí. Antes el hub vivía en la misma
      // fila que los laterales (`centro` a tres columnas), lo que le quitaba
      // alto justo a esa fila; con `filaHub` tiene su propia fila reservada,
      // igual que ya hacen 5a-5d y 6b (ver ADR 0039 y 0051).
      cols: '1fr 1fr',
      rows: '1fr 1fr 1fr',
      areas: ['1/1/2/3', '2/2/3/3', '4/1/5/3', '2/1/3/2'],
      rot: [180, 270, 0, 90],
      centro: '3/1/4/3',
      filaHub: 2,
    },
    { id: '4c', n: 'En columna', cols: '1fr', rows: 'repeat(4,1fr)', rot: [180, 180, 0, 0] },
  ],
  5: [
    {
      id: '5a',
      n: 'Dos, dos y uno',
      cols: '1fr 1fr',
      rows: '1fr 1fr 1fr',
      // Fila 2 reservada para el hub (`filaHub`): las áreas que antes empezaban en
      // la fila 2 o 3 suben una línea de grid para dejarle sitio (ver Dispo.filaHub).
      areas: ['1/1/2/2', '1/2/2/3', '3/2/4/3', '4/1/5/3', '3/1/4/2'],
      centro: '2/1/3/3',
      filaHub: 1,
      rot: [180, 180, 0, 0, 0],
    },
    {
      id: '5b',
      n: 'Rodeando el móvil',
      cols: '1fr 1fr',
      rows: '1fr 1fr 1fr',
      areas: ['1/1/2/2', '1/2/2/3', '3/2/4/3', '4/1/5/3', '3/1/4/2'],
      centro: '2/1/3/3',
      filaHub: 1,
      rot: [180, 180, 270, 0, 90],
    },
    {
      id: '5c',
      n: 'Todos en la misma dirección',
      cols: '1fr 1fr',
      rows: '1fr 1fr 1fr',
      // Áreas explícitas también en los dos primeros asientos (antes en `null`,
      // colocados por el auto-flow del grid): con una fila de más por `filaHub`,
      // depender del auto-flow para saltársela es más frágil que decirlo a mano.
      areas: ['1/1/2/2', '1/2/2/3', '3/1/4/2', '3/2/4/3', '4/1/5/3'],
      centro: '2/1/3/3',
      filaHub: 1,
      rot: [0, 0, 0, 0, 0],
    },
    {
      id: '5d',
      n: 'Cuatro esquinas y uno en medio',
      // La disposición por defecto de LifeTap para 5 jugadores: 4 en las esquinas
      // de una rejilla 2×2, el quinto destacado en el centro. Ahí su quinto
      // asiento se superpone a los otros cuatro (un simple círculo flotante); en
      // Mesa Commander cada asiento lleva vida, maná y daño de comandante — contenido
      // real que no puede quedar tapado — así que el "centro" es una fila propia
      // entre las dos parejas de esquinas, no una superposición (ver ADR 0040).
      cols: '1fr 1fr',
      rows: '1fr 1fr 1fr',
      areas: ['1/1/2/2', '1/2/2/3', '3/1/4/3', '4/2/5/3', '4/1/5/2'],
      centro: '2/1/3/3',
      filaHub: 1,
      rot: [180, 180, 0, 0, 0],
    },
  ],
  6: [
    {
      id: '6a',
      n: 'Tres y tres',
      cols: 'repeat(3,1fr)',
      rows: '1fr 1fr',
      areas: ['1/1/2/2', '1/2/2/3', '1/3/2/4', '2/3/3/4', '2/2/3/3', '2/1/3/2'],
      rot: [180, 180, 180, 0, 0, 0],
    },
    {
      id: '6b',
      n: 'Rodeando el móvil',
      cols: '1fr 1fr',
      rows: '1fr 1fr 1fr',
      areas: ['1/1/2/2', '1/2/2/3', '3/2/4/3', '4/2/5/3', '4/1/5/2', '3/1/4/2'],
      centro: '2/1/3/3',
      filaHub: 1,
      rot: [180, 180, 270, 0, 0, 90],
    },
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

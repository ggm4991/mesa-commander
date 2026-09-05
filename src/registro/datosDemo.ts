import { normalizarPartidas } from '../almacenamiento/repositorio'
import { uid } from '../motor/utilidades'
import type { AsientoPartida, Mazo, Partida, Perfil } from '../motor/tipos'

/** Doce partidas de ejemplo, portadas literalmente de `DEMO` en app.html, para que
 * el registro no se vea vacío la primera vez ni tras "Restaurar ejemplo" en la copia
 * de seguridad. Sin `id` de partida: `normalizarPartidas` le asigna uno nuevo cada
 * vez que se restauran, igual que hacía `normalizar()` en el original. */
const DEMO_SIN_ID: Omit<Partida, 'id'>[] = [
  {
    fecha: '2026-08-25', duracion: 132, seats: [
      { j: 'Gonzalo', c: 'Edgar Markov', id: 'WBR', r: 'V', rehacer: 1, tiempo: 0, turno: 245 },
      { j: 'Marta', c: 'Tatyova, Benthic Druid', id: 'GU', r: 'D', rehacer: 0, tiempo: 1, turno: 412 },
      { j: 'Iván', c: 'Krenko, Mob Boss', id: 'R', r: 'D', rehacer: 2, tiempo: 0, turno: 198 },
      { j: 'Lucía', c: "Yuriko, the Tiger's Shadow", id: 'UB', r: 'D', rehacer: 0, tiempo: 0, turno: 176 },
    ],
  },
  {
    fecha: '2026-08-18', duracion: 158, seats: [
      { j: 'Marta', c: 'Muldrotha, the Gravetide', id: 'UBG', r: 'V', rehacer: 1, tiempo: 2, turno: 534 },
      { j: 'Rubén', c: 'Kaalia of the Vast', id: 'WBR', r: 'D', rehacer: 0, tiempo: 0, turno: 203 },
      { j: 'Dani', c: 'Prosper, Tome-Bound', id: 'BR', r: 'D', rehacer: 3, tiempo: 1, turno: 288 },
      { j: 'Gonzalo', c: 'Edgar Markov', id: 'WBR', r: 'D', rehacer: 0, tiempo: 0, turno: 221 },
    ],
  },
  {
    fecha: '2026-08-11', duracion: 171, seats: [
      { j: 'Lucía', c: "Yuriko, the Tiger's Shadow", id: 'UB', r: 'E', rehacer: 0, tiempo: 1, turno: 190 },
      { j: 'Gonzalo', c: 'Lathril, Blade of the Elves', id: 'BG', r: 'E', rehacer: 2, tiempo: 0, turno: 307 },
      { j: 'Iván', c: 'Krenko, Mob Boss', id: 'R', r: 'E', rehacer: 1, tiempo: 0, turno: 264 },
      { j: 'Marta', c: 'Tatyova, Benthic Druid', id: 'GU', r: 'E', rehacer: 0, tiempo: 2, turno: 455 },
    ],
  },
  {
    fecha: '2026-08-04', duracion: 118, seats: [
      { j: 'Iván', c: 'Krenko, Mob Boss', id: 'R', r: 'V', rehacer: 0, tiempo: 0, turno: 171 },
      { j: 'Dani', c: 'Talrand, Sky Summoner', id: 'U', r: 'D', rehacer: 1, tiempo: 0, turno: 224 },
      { j: 'Rubén', c: 'Isshin, Two Heavens as One', id: 'WBR', r: 'D', rehacer: 0, tiempo: 1, turno: 259 },
      { j: 'Lucía', c: "Atraxa, Praetors' Voice", id: 'WUBG', r: 'D', rehacer: 2, tiempo: 1, turno: 386 },
    ],
  },
  {
    fecha: '2026-07-28', duracion: 145, seats: [
      { j: 'Gonzalo', c: 'Lathril, Blade of the Elves', id: 'BG', r: 'V', rehacer: 0, tiempo: 0, turno: 281 },
      { j: 'Marta', c: 'Muldrotha, the Gravetide', id: 'UBG', r: 'D', rehacer: 2, tiempo: 1, turno: 498 },
      { j: 'Rubén', c: 'Kaalia of the Vast', id: 'WBR', r: 'D', rehacer: 1, tiempo: 0, turno: 206 },
      { j: 'Iván', c: 'Meren of Clan Nel Toth', id: 'BG', r: 'D', rehacer: 0, tiempo: 0, turno: 243 },
    ],
  },
  {
    fecha: '2026-07-21', duracion: 126, seats: [
      { j: 'Rubén', c: 'Isshin, Two Heavens as One', id: 'WBR', r: 'V', rehacer: 0, tiempo: 0, turno: 188 },
      { j: 'Lucía', c: "Atraxa, Praetors' Voice", id: 'WUBG', r: 'D', rehacer: 1, tiempo: 2, turno: 441 },
      { j: 'Dani', c: 'Prosper, Tome-Bound', id: 'BR', r: 'D', rehacer: 2, tiempo: 0, turno: 277 },
      { j: 'Gonzalo', c: 'Edgar Markov', id: 'WBR', r: 'D', rehacer: 1, tiempo: 0, turno: 214 },
    ],
  },
  {
    fecha: '2026-07-14', duracion: 139, seats: [
      { j: 'Marta', c: 'Tatyova, Benthic Druid', id: 'GU', r: 'V', rehacer: 1, tiempo: 1, turno: 463 },
      { j: 'Iván', c: 'Meren of Clan Nel Toth', id: 'BG', r: 'D', rehacer: 0, tiempo: 0, turno: 232 },
      { j: 'Dani', c: 'Talrand, Sky Summoner', id: 'U', r: 'D', rehacer: 1, tiempo: 0, turno: 201 },
      { j: 'Lucía', c: "Yuriko, the Tiger's Shadow", id: 'UB', r: 'D', rehacer: 0, tiempo: 0, turno: 167 },
    ],
  },
  {
    fecha: '2026-07-07', duracion: 164, seats: [
      { j: 'Lucía', c: "Atraxa, Praetors' Voice", id: 'WUBG', r: 'V', rehacer: 2, tiempo: 1, turno: 398 },
      { j: 'Gonzalo', c: 'Lathril, Blade of the Elves', id: 'BG', r: 'D', rehacer: 0, tiempo: 0, turno: 265 },
      { j: 'Rubén', c: 'Kaalia of the Vast', id: 'WBR', r: 'D', rehacer: 1, tiempo: 0, turno: 219 },
      { j: 'Marta', c: 'Muldrotha, the Gravetide', id: 'UBG', r: 'D', rehacer: 0, tiempo: 2, turno: 512 },
    ],
  },
  {
    fecha: '2026-06-30', duracion: 112, seats: [
      { j: 'Dani', c: 'Prosper, Tome-Bound', id: 'BR', r: 'V', rehacer: 2, tiempo: 0, turno: 259 },
      { j: 'Iván', c: 'Krenko, Mob Boss', id: 'R', r: 'D', rehacer: 1, tiempo: 0, turno: 183 },
      { j: 'Gonzalo', c: 'Edgar Markov', id: 'WBR', r: 'D', rehacer: 0, tiempo: 1, turno: 238 },
      { j: 'Marta', c: 'Tatyova, Benthic Druid', id: 'GU', r: 'D', rehacer: 1, tiempo: 0, turno: 404 },
    ],
  },
  {
    fecha: '2026-06-23', duracion: 151, seats: [
      { j: 'Gonzalo', c: 'Edgar Markov', id: 'WBR', r: 'V', rehacer: 1, tiempo: 0, turno: 252 },
      { j: 'Lucía', c: "Yuriko, the Tiger's Shadow", id: 'UB', r: 'D', rehacer: 0, tiempo: 0, turno: 174 },
      { j: 'Rubén', c: 'Isshin, Two Heavens as One', id: 'WBR', r: 'D', rehacer: 2, tiempo: 1, turno: 296 },
      { j: 'Dani', c: 'Talrand, Sky Summoner', id: 'U', r: 'D', rehacer: 0, tiempo: 0, turno: 211 },
    ],
  },
  {
    fecha: '2026-06-16', duracion: 169, seats: [
      { j: 'Iván', c: 'Meren of Clan Nel Toth', id: 'BG', r: 'E', rehacer: 1, tiempo: 0, turno: 249 },
      { j: 'Rubén', c: 'Kaalia of the Vast', id: 'WBR', r: 'E', rehacer: 0, tiempo: 1, turno: 227 },
      { j: 'Marta', c: 'Muldrotha, the Gravetide', id: 'UBG', r: 'E', rehacer: 2, tiempo: 2, turno: 541 },
      { j: 'Dani', c: 'Prosper, Tome-Bound', id: 'BR', r: 'E', rehacer: 1, tiempo: 0, turno: 263 },
    ],
  },
  {
    fecha: '2026-06-09', duracion: 121, seats: [
      { j: 'Rubén', c: 'Isshin, Two Heavens as One', id: 'WBR', r: 'V', rehacer: 1, tiempo: 0, turno: 196 },
      { j: 'Gonzalo', c: 'Lathril, Blade of the Elves', id: 'BG', r: 'D', rehacer: 0, tiempo: 0, turno: 272 },
      { j: 'Lucía', c: "Atraxa, Praetors' Voice", id: 'WUBG', r: 'D', rehacer: 3, tiempo: 1, turno: 369 },
      { j: 'Iván', c: 'Krenko, Mob Boss', id: 'R', r: 'D', rehacer: 0, tiempo: 0, turno: 180 },
    ],
  },
].map((p) => ({ ...p, seats: p.seats as AsientoPartida[] }))

const mazo = (c: string, col: string, c2?: string): Mazo => ({ id: uid(), c, c2: c2 || '', col })
const conMazos = (nombre: string, ...mazos: Mazo[]): Perfil => ({
  id: uid(),
  nombre,
  mazos,
  ultimo: mazos[0] ? mazos[0].id : null,
})

/** Seis perfiles de ejemplo con sus mazos, generados una vez al cargar el módulo
 * (igual que `PERFILES_DEMO` en app.html): sus ids se mantienen estables mientras
 * dura la sesión, aunque se restauren varias veces. */
const PERFILES_DEMO: Perfil[] = [
  conMazos('Gonzalo', mazo('Edgar Markov', 'WBR'), mazo('Lathril, Blade of the Elves', 'BG')),
  conMazos('Marta', mazo('Muldrotha, the Gravetide', 'UBG'), mazo('Tatyova, Benthic Druid', 'GU')),
  conMazos('Iván', mazo('Krenko, Mob Boss', 'R'), mazo('Meren of Clan Nel Toth', 'BG')),
  conMazos('Lucía', mazo("Atraxa, Praetors' Voice", 'WUBG'), mazo("Yuriko, the Tiger's Shadow", 'UB')),
  conMazos('Rubén', mazo('Isshin, Two Heavens as One', 'WBR'), mazo('Kaalia of the Vast', 'WBR')),
  conMazos('Dani', mazo('Prosper, Tome-Bound', 'BR'), mazo('Talrand, Sky Summoner', 'U')),
]

export function partidasDemo(): Partida[] {
  return normalizarPartidas(DEMO_SIN_ID.map((p) => ({ ...p, id: '' })))
}

export function perfilesDemo(): Perfil[] {
  return structuredClone(PERFILES_DEMO)
}

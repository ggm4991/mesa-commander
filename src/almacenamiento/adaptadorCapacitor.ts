import { Preferences } from '@capacitor/preferences'
import type { AlmacenPersistente } from './tipos'

/**
 * Adaptador sobre `@capacitor/preferences`: funciona igual en el WebView nativo
 * que en el navegador (Capacitor cae a `localStorage` fuera de una app nativa).
 * No es almacenamiento cifrado — ver docs/decisiones/0005 para cuándo eso importa.
 */
export const almacenCapacitor: AlmacenPersistente = {
  get: (clave) => Preferences.get({ key: clave }),
  set: (clave, valor) => Preferences.set({ key: clave, value: valor }),
}

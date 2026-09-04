// Portado literal del objeto ICONOS de app.html (sección 1): 36 iconos SVG en línea,
// sin librería. `interfaz-tactil.test.js` (en pruebas/, el runner heredado) ya
// comprobaba que todo icono referenciado existiera aquí y que ninguno quedara sin
// usar; ese mismo contraste se repite para src/ en tests/componentes/Icono.test.tsx.
export const ICONOS = {
  corona: 'M4 19h16M3 6l5 4 4-6 4 6 5-4-2 11H5L3 6z',
  espadas: 'M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M5 14l-2 2 3 3 2-2',
  retirada: 'M9 14 4 9l5-5M4 9h10.5A5.5 5.5 0 0 1 20 14.5v0A5.5 5.5 0 0 1 14.5 20H11',
  deshacer: 'M3 12a9 9 0 1 0 2.6-6.3M3 3v5h5',
  pausa: 'M9 5v14M15 5v14',
  play: 'M7 4l12 8-12 8V4z',
  puntos: 'M5 12h.01M12 12h.01M19 12h.01',
  reloj: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  veneno: 'M12 3s6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 6-10 6-10z',
  estrella: 'M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.4l6-.9L12 3z',
  rayo: 'M13 2 4 14h7l-1 8 9-12h-7l1-8z',
  monedas:
    'M20 5.5C20 6.9 16.4 8 12 8S4 6.9 4 5.5 7.6 3 12 3s8 1.1 8 2.5zM4 5.5v13C4 19.9 7.6 21 12 21s8-1.1 8-2.5v-13M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5',
  gema: 'M6 3h12l3 6-9 12L3 9l3-6zM3 9h18',
  tormenta: 'M13 12l-3 5h4l-3 5M6.5 16a4.5 4.5 0 1 1 1-8.9 6 6 0 0 1 11.5 2.4A3.8 3.8 0 0 1 18 16',
  ciudad: 'M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5',
  bandera: 'M4 21V4M4 4h11l-2 4 2 4H4',
  sol: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  luna: 'M20 14A8.5 8.5 0 0 1 10 4a8.5 8.5 0 1 0 10 10z',
  dado: 'M4 4h16v16H4zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01',
  lista: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  calavera: 'M9 18v2h6v-2M5 12a7 7 0 1 1 14 0c0 2-1 3.6-2 4.3V18H7v-1.7C6 15.6 5 14 5 12zM9.5 11h.01M14.5 11h.01',
  lapiz: 'M4 20h4L20 8l-4-4L4 16v4z',
  trofeo: 'M8 4h8v5a4 4 0 0 1-8 0V4zM8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M9 21h6M12 13v4',
  salir: 'M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M9 16l-4-4 4-4M5 12h11',
  barajar: 'M17 4l3 3-3 3M17 14l3 3-3 3M4 7h4l8 10h4M4 17h4l2-2.5M14 9.5 16 7h4',
  girar: 'M21 12a9 9 0 1 1-2.6-6.3M21 3v5h-5',
  persona: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1',
  mas: 'M12 5v14M5 12h14',
  atras: 'M19 12H5M12 19l-7-7 7-7',
  papelera: 'M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3',
  datos:
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  buscar: 'M21 21l-4.3-4.3M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z',
  campana: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  abajo: 'M6 9l6 6 6-6',
  mana: 'M12 3c3 4 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-6 6-10z',
  pausaCirc: 'M10 9v6M14 9v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
} as const

export type NombreIcono = keyof typeof ICONOS

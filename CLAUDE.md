# Mesa Commander

Contador de vidas para Magic: The Gathering en formato Commander, con registro de
partidas y clasificación. Cubre lo que hace una app de contador al uso y además
guarda cada partida al terminarla, que es lo que ninguna de ellas hace.

## Cómo se ejecuta

No hay compilación ni dependencias. `app.html` es un único archivo con el HTML, el
CSS y el JavaScript dentro. Se abre a doble clic en cualquier navegador moderno.

```bash
npm test                      # todas las pruebas
node pruebas/ejecutar.js corona   # solo las que contengan "corona" en el nombre
```

Node solo hace falta para las pruebas. La app no lo usa.

## Por qué un solo archivo

Es deliberado: la app tiene que poder abrirse desde el móvil sin servidor, sin
instalación y sin conexión. Partirla en módulos ES obligaría a servirla por HTTP
(los `import` fallan con el protocolo `file://`). Si algún día se parte, hará falta
un empaquetador que vuelva a dejar un `app.html` autónomo como salida.

## Convenciones

- **Todo en español**: nombres de funciones, variables, comentarios y textos.
  `pintarTablero`, `guardarPartidas`, `dosComandantes`. Solo quedan en inglés los
  nombres de cartas y comandantes, porque así es como se buscan.
- **Comentarios que explican el porqué**, no el qué. Si un comentario repite lo que
  dice el código, sobra.
- **Sin dependencias.** Los iconos son SVG en línea (objeto `ICONOS` + función `ic`),
  no una librería. Las fuentes vienen de Google Fonts y degradan a las del sistema.
- **Reglas de Magic verificadas.** Antes de dar por buena una regla, comprobarla en
  las Reglas Completas o en Scryfall, no de memoria. Las decisiones que dependen de
  una regla llevan su número en el comentario (por ejemplo la 903.10a).

## Estructura de `app.html`

El script está dividido en secciones numeradas con comentarios de banda:

1. Utilidades: formato de tiempo, escapado, iconos, pips de color.
2. Almacenamiento: `window.storage` con `leer`/`escribir`. Cuatro claves,
   `mesa:partidas`, `mesa:perfiles`, `mesa:juego` y `mesa:config`.
3. Datos de ejemplo (`DEMO`, `PERFILES_DEMO`) y migraciones.
4. Modales y avisos.
5. Perfiles y sus mazos.
6. Pantalla previa: disposición de la mesa y giro de asientos.
7. Motor de partida: vidas, contadores, daño de comandante, turnos, deshacer.
8. Tablero.
9. Terminar y volcar al registro.
10. Registro: clasificación, fichas y alta manual.
11. Navegación y arranque.

## Invariantes que conviene no romper

- **El registro es la fuente de la verdad.** La clasificación no se guarda: se
  recalcula siempre desde `PARTIDAS` en `calcularJugadores()`. No añadir contadores
  acumulados en paralelo.
- **El daño de comandante va por comandante, no por jugador.** Las claves de
  `jugador.dmg` son `"asiento:hueco"`, donde hueco es 0 o 1 según sea el comandante
  principal o su compañero. Un jugador aparece en su propia lista de fuentes, porque
  si le roban el comandante puede morir por su propio daño (regla 903.10a).
- **`JUEGO.turno === null` significa que la partida espera** a que alguien toque su
  asiento para arrancar. Cualquier función que use `JUEGO.j[JUEGO.turno]` tiene que
  contemplar ese caso.
- **El tiempo del turno se acumula en `JUEGO.acum`.** Pausar no cierra el turno; si
  se cierra, el récord de turno más largo sale partido en trozos.
- **Todo cambio de estado pasa por `foto()` antes de mutar**, o el botón de deshacer
  se queda cojo. En los cambios de vida se llama con `foto(true)` para agrupar las
  pulsaciones largas en un solo paso.
- **Los datos guardados se migran, no se descartan.** `migrarJuego` y
  `migrarPerfiles` convierten los formatos antiguos al abrir. Al cambiar una
  estructura, ampliar esas funciones.

## Pruebas

En `pruebas/` hay nueve archivos que cargan el JavaScript de `app.html` con un DOM
simulado y comprueban la lógica sin navegador. Cada comprobación imprime una línea
que empieza por `ok` o por `FALLO`; el lanzador cuenta esas marcas.

Cada archivo monta su propio DOM falso, y ahí hay duplicación de sobra: extraer un
`pruebas/entorno.js` común sería la primera limpieza útil.

Lo que no cubren, y hay que mirar a mano en el navegador: el aspecto visual, los
giros de 90° y 270° (usan unidades de consulta de contenedor), el sonido de la
alarma y el arrastre real con el dedo.

## Pendiente

- Planechase y Archenemy, cargando planos y esquemas desde la API de Scryfall en
  vez de copiar el texto de las cartas, que es propiedad de Wizards.
- Autocompletado de comandantes contra Scryfall, con su identidad de color rellenada
  sola en vez de a mano.
- Convertirla en PWA: manifiesto y service worker para instalarla en el móvil y que
  funcione a pantalla completa sin conexión.
- Quién elimina a quién, para poder mirar rivalidades en el registro.

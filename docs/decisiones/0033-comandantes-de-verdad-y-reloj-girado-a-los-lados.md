# 0033. El buscador solo sugiere comandantes de verdad, y el reloj gira también a los lados

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

El usuario pidió dos cosas más tras usar la app: que el autocompletado de
comandante solo sugiera cartas que de verdad puedan serlo, y que el reloj del
hub se vea siempre orientado hacia quien tiene el turno — algo que la ADR
0024 ya resolvía para 180°, pero no para 90°/270° (asientos a los lados),
que quedaron sin cubrir en su momento.

### El buscador

`buscarNombres()` usaba `/cards/autocomplete`, el mismo endpoint que el
propio buscador de Scryfall — rápido, pero sin ningún filtro: sugiere
cualquier carta, no solo comandantes legales. Ese endpoint no admite
parámetros de búsqueda adicionales, así que hacía falta pasarse a
`/cards/search`, que sí entiende `is:commander` (cubre criaturas legendarias,
trasfondos con permiso, planeswalkers con esa habilidad — cualquier carta que
de verdad pueda ser tu comandante, no solo "es legendaria").

El primer intento combinó `is:commander` con una expresión regular ancla
(`name:/^texto/i`), pensada para imitar el "empieza por" del autocompletado
oficial. Al comprobarlo a mano contra la propia API (como pide `CLAUDE.md`
para cualquier cosa que dependa de una fuente externa, no solo reglas de
Magic) apareció un problema real: **`name:/^krenko/i` no encuentra "Krenko,
Mob Boss"** — ni siquiera sin ancla (`name:/krenko/i`), aunque el sustantivo
`name:krenko` (sin regex) sí la encuentra entre sus 6 resultados. Es una
limitación conocida de cómo Scryfall indexa la búsqueda por expresión
regular, no un error de sintaxis por parte de esta app: el regex se salta
cartas reales, con total silencio. Para un buscador de comandantes, que un
comandante de verdad —y bastante popular— no aparezca nunca en las
sugerencias es peor defecto que sugerir de más.

### El reloj a los lados

`.hub .pass[data-rot='180']` ya giraba el botón del reloj; no había reglas
para `'90'`/`'270'`. Además, aunque se añadieran esas reglas sin más, un
`transform` no cambia el hueco que el propio botón reserva en el diseño de
`.hub` — girado 90°, su ancho (~132px) pasa a ser su alto visual, muy por
encima de los ~69px que mide la barra en el caso normal (0°/180°), así que
se saldría de su hueco tal como ya pasó dos veces con la propia barra
(ADR 0025, 0026).

## Decisión

- **`buscarNombres()` pasa a `/cards/search` con `name:"texto" is:commander`**
  (comillas, no regex): coincide en cualquier parte del nombre, no solo al
  empezar —más resultados de los estrictamente necesarios—, pero no se salta
  ningún comandante real, que es lo que de verdad importa aquí. El texto se
  escapa solo para las comillas internas (`"` → `\"`), no hace falta más.
- **`.hub .pass[data-rot='90']` y `[data-rot='270']` giran igual que `'180'`**,
  mismo mecanismo ya establecido.
- **La medición del hub (ADR 0026) pasa a mirar también `.pass`**: `medirHub`
  en `Tablero.tsx` toma el máximo entre el alto de `.hub` y el de `.pass`
  (que sí refleja su propio giro en `getBoundingClientRect`, al ser un
  `transform` sobre el propio elemento, no sobre un hijo) — mismo principio
  de "medir de verdad, no adivinar un número" que ya fijó esa ADR, aplicado
  ahora al caso de los asientos laterales.

## Alternativas consideradas

- **Seguir con el regex, pero probando variantes** (escapar distinto, con o
  sin ancla, con o sin `/i`). Se descarta tras comprobar que ni siquiera la
  versión más simple posible (`name:/krenko/i`, sin ancla ni combinarlo con
  nada más) encuentra la carta: el límite está en cómo Scryfall indexa el
  regex, no en cómo se construye la expresión desde aquí.
- **Rotar `.hub` entero en vez de solo `.pass`** para los 90°/270°. Se
  descarta: los iconos de deshacer/pausa/menú son los mismos para cualquier
  jugador y no necesitan orientarse hacia nadie; girar la barra entera
  además cambiaría cómo se reparten esos iconos en el espacio, sin ganar
  nada.

## Consecuencias

- Verificado con peticiones reales a la API de Scryfall (no solo con
  mocks): `name:"krenko" is:commander` devuelve los 3 comandantes Krenko de
  verdad, incluido "Krenko, Mob Boss"; el regex ancla se quedaba en 2. El
  buscador de la app, probado en un navegador real, ya muestra los 3.
- Verificado con un navegador real en una mesa de 5 "Rodeando el móvil": al
  tocarle el turno a alguien sentado a un lado (90° o 270°), el alto medido
  del hub sube de 69px a 132px automáticamente y el reloj se lee girado, sin
  invadir ningún asiento.
- Otras búsquedas de esta app que dependan de una expresión regular de
  Scryfall deberían comprobarse a mano contra la API real antes de darlas
  por buenas, no solo contra un caso de prueba cualquiera: el fallo
  encontrado aquí no salta con nombres al azar, solo con cartas concretas.

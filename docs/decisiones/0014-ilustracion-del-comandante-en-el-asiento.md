# 0014. La ilustración del comandante como fondo del asiento, con recorte de arte

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

El requisito original de conectar con Scryfall mencionaba explícitamente
traer "imágenes como los comandantes" además de la identidad de color. El
cliente de Scryfall (primer commit de la Fase 4) ya sabía traer una imagen
de la carta, pero nada la pintaba todavía en ningún sitio. El hueco natural
es el fondo de cada asiento del tablero (`.bg` en `Asiento.tsx`), que hoy
muestra un degradado de color según la identidad del mazo (`fondoIdentidad`).

Al probarlo primero con la imagen `normal` de Scryfall (la carta entera:
marco, coste de maná, texto de reglas, ilustración), el resultado era
ilegible — el texto de la carta compite con el número de vida y el resto de
la interfaz por la atención, y a tamaños de asiento pequeños (una mesa de 5
o 6 jugadores dedica poco espacio a cada uno) resulta casi decorativo por
accidente, no informativo. Verificado a simple vista contra Scryfall real,
no hacía falta ninguna prueba automática para verlo: bastaba con mirar la
captura.

## Decisión

- **Se usa el recorte `image_uris.art_crop` de Scryfall**, no `normal`: solo
  la ilustración, sin marco ni texto, pensado por la propia Scryfall para
  usos de fondo. `src/red/scryfall/cliente.ts` solo pide y expone ese
  recorte — no hay ningún otro consumidor de `InfoComandante.imagen` todavía
  que necesite la carta completa.
- **La imagen sustituye al degradado de color solo cuando existe**
  (`fondoAsiento()` en `componentes/comunes/fondo.ts`): sin comandante, sin
  coincidencia en Scryfall, o sin red, el asiento se queda exactamente como
  antes de esta fase. Nunca hay un hueco en blanco ni un mensaje de error
  ocupando el sitio de un jugador.
- **Se pide con el mismo hook y la misma clave de caché que ya usa
  `CampoComandante`** (`useImagenComandante`, clave
  `['scryfall','named',nombre]`): si el mazo se creó eligiendo una sugerencia
  al crear el perfil, la imagen del asiento sale de caché al instante, sin
  ni siquiera tocar la red al empezar la partida.
- **Solo se pide la del comandante principal** (`j.c`), no la del compañero:
  un asiento tiene un único fondo, y ya era así con el degradado de color
  (que tampoco distinguía entre las dos cartas).

## Alternativas consideradas

- **Usar `normal` (la carta completa).** Descartado tras verlo: la
  ilustración queda diminuta y el texto de la carta, en un idioma que no
  es el de la interfaz, resulta más ruido que información.
- **Recortar o difuminar la imagen `normal` con CSS** en vez de pedir un
  recorte distinto. Se descarta porque Scryfall ya sirve exactamente el
  recorte que hace falta (`art_crop`) sin tener que adivinar con CSS dónde
  está la ilustración dentro de cada carta (varía según el diseño de marco).

## Consecuencias

- Verificado con un navegador real: crear un perfil con "Edgar Markov"
  (sin pasar por el autocompletado, solo escribiendo el nombre exacto),
  sentarlo y empezar la partida — su asiento muestra la ilustración al
  cargar, el otro asiento (sin comandante) mantiene el degradado de color,
  y la interfaz (vida, botones, nombre) sigue siendo legible encima.
- Si en el futuro hace falta la carta completa en algún otro sitio (una
  ficha de detalle, por ejemplo), habrá que exponer también `normal` en
  `InfoComandante` — hoy no se pide porque nadie la usa.

# 0013. La identidad de color solo se rellena sola al elegir una sugerencia

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

El apartado "Pendiente" del `CLAUDE.md` original pedía "autocompletado de
comandantes contra Scryfall, con su identidad de color rellenada sola en vez
de a mano". El campo natural para esto es `EditorMazo` (comandante y
compañero de un mazo, dentro de un perfil), que hoy ya deja marcar la
identidad a mano con los botones de color.

Había que decidir dos cosas: **cuándo** se dispara la consulta a Scryfall
mientras se escribe, y **cuándo** se sobrescribe la identidad de color que el
usuario pueda haber marcado ya a mano.

## Decisión

- **Elegir una sugerencia de la lista es lo único que rellena la identidad
  de color sola.** Escribir texto libre, aunque coincida con el nombre exacto
  de una carta, nunca dispara la consulta de identidad ni toca los botones de
  color — solo el autocompletado de nombres (que sí se activa al escribir).
  Es una regla predecible: la única forma de que la app decida algo por el
  usuario es que el usuario haya señalado explícitamente "esta es la carta de
  Scryfall que quiero", pulsando una sugerencia.
- **La identidad se combina, no se sustituye**: un mazo con compañero suma la
  identidad de las dos cartas (`mezclarIdentidad()` solo enciende colores,
  nunca los apaga). Elegir el compañero de Scryfall después de haber marcado
  ya el color del comandante principal a mano no borra ese color.
- **Las sugerencias solo se piden mientras el campo está enfocado** —
  `useSugerenciasComandante` recibe `''` en vez del texto real cuando no lo
  está. Cambiar el valor de un campo sin haberlo enfocado antes (algo que solo
  pasa en un test, disparando el evento a mano) nunca activa la consulta.
  Sin esto, cualquier prueba que rellenara el campo de comandante sin más
  dispararía una petición de verdad a la primera vez que el temporizador del
  *debounce* venciera, aunque fuera muchos tests después.
- **Un fallo al consultar Scryfall tras elegir una sugerencia avisa sin
  bloquear**: el nombre elegido se queda puesto (con la ortografía exacta de
  Scryfall) y la identidad de color se puede seguir marcando a mano, como
  siempre — solo cambia que ya no se ha podido rellenar sola.

## Alternativas consideradas

- **Rellenar la identidad automáticamente en cuanto el texto coincide con un
  nombre exacto de Scryfall, sin necesidad de elegir una sugerencia.** Se
  descarta: sería una consulta de red por cada pulsación de tecla que
  completara por casualidad un nombre válido, y sobrescribiría en silencio
  colores que el usuario acabara de marcar a mano un segundo antes.
- **Sustituir la identidad entera en vez de combinarla.** Se descarta porque
  rompería el caso normal de un mazo con dos comandantes: elegir el segundo
  borraría el color que ya tenía el primero.

## Consecuencias

- Verificado también con un navegador real contra la API pública de Scryfall
  (sin mocks): escribir "edgar mark", elegir "Edgar Markov" de la lista, y
  comprobar que los tres pips de su identidad real (W, B, R) quedan
  marcados — sin errores de CORS ni de consola.
- Cualquier campo nuevo que use `CampoComandante` (el formulario de alta
  manual del Registro es el candidato más próximo) hereda esta misma regla
  sin tener que redecidirla.

# 0045. Un asomo de la ilustración del comandante en la vista previa de mesa

Fecha: 2026-10-20
Estado: Aceptada

## Contexto

La imagen de Scryfall del comandante solo se veía en dos sitios: el editor
de mazo (`SelectorImagenComandante`, una miniatura) y el tablero de verdad
(`fondoAsiento`, a toda opacidad como fondo del asiento). El usuario pidió
que la vista previa de la mesa (`VistaMesa`, la rejilla de asientos de la
pantalla previa) mostrara también un adelanto, pero sutil — el degradado de
identidad de color sigue siendo lo principal, la ilustración solo "se vea un
poco".

## Decisión

`useImagenComandante` (el mismo hook que ya usa `Asiento.tsx` en el
tablero) pasa a usarse también en la vista previa. Como es un hook, no se
puede llamar dentro del `.map()` de `VistaMesa` sin romper las reglas de
hooks — el número de llamadas cambiaría según cuántos asientos tenga la
disposición. Se extrae cada hueco a su propio componente, `AsientoPrevia`,
que ya puede llamarlo una vez por instancia.

Encima de `.pbg` (el degradado de color, sin tocar) se añade una capa
nueva, `.pbg-comandante`, con la ilustración a `opacity: 0.35` — visible
pero sin competir con el color ni con el texto.

Un problema de verdad apareció al implementarlo: con `.pbg-comandante` en
`z-index: -1`, el mismo valor que ya tenía `.pbg`, la capa de la imagen no
se pintaba encima aunque fuera después en el DOM — comprobado con un
navegador real, subiendo el `z-index` a un valor muy alto (`50`) para
confirmar que la imagen sí cargaba y sí tenía el CSS correcto, y que el
problema era solo el empate de `z-index`. `.pbg` baja a `z-index: -2` para
que `.pbg-comandante` (`z-index: -1`) tenga un valor inequívocamente mayor,
en vez de depender de un desempate por orden del DOM que, al menos en este
caso, no se comportó como cabría esperar.

## Alternativas consideradas

- **Reemplazar `.pbg` por la imagen**, como hace `fondoAsiento` en el
  tablero de verdad. Se descarta explícitamente: el usuario pidió que se
  viera "un poco", no que sustituyera al color — en la vista previa lo que
  importa de un vistazo es la identidad, no la ilustración.
- **Confiar en que el mismo `z-index` entre hermanos se resuelve por orden
  del DOM**, como parecía razonable antes de probarlo. Se descarta tras
  comprobar con un navegador real que no pintaba donde tocaba; usar valores
  de `z-index` distintos y sin ambigüedad es más fiable y no cuesta nada
  más.

## Consecuencias

- Verificado con un navegador real y una llamada de verdad a Scryfall
  (`Atraxa, Grand Unifier`, `Edgar Markov`): la ilustración aparece tenue
  detrás del asiento ocupado, sin tapar el nombre ni los pips de color; los
  asientos libres o sin comandante se quedan en el degradado de siempre.
- `tests/componentes/mesa/VistaMesa.test.tsx` necesitó envolver sus
  renders en `ProveedorQueryDePrueba` (antes no hacía falta: nada en
  `VistaMesa` llamaba a `useQuery`) y montar un servidor MSW, mismo
  planteamiento que ya usaba `tests/tablero/Asiento.test.tsx`.
  `tests/paginas/Previa.test.tsx`, que monta `VistaMesa` por dentro,
  necesitó el mismo envoltorio aunque sus pruebas no sienten a nadie con
  comandante de verdad (la llamada queda `enabled:false`, pero el hook de
  todas formas exige un `QueryClientProvider` en el árbol).
- Dos pruebas nuevas cubren el caso con y sin imagen resuelta.

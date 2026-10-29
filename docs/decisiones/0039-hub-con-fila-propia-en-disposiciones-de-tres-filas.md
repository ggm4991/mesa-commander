# 0039. El hub reserva su propia fila de grid en vez de estirar el hueco entre todas

Fecha: 2026-10-20
Estado: Aceptada

## Contexto

El usuario probó la app con gente real y la disposición de mesa que más gustó
fue la de LifeTap; aportó un análisis externo del layout de esa app (extraído
de su APK, sin copiar código ni recursos) para ver qué patrones adaptar. La
comparación mostró que Mesa Commander ya cubre casi todo lo que hace LifeTap
(rejillas por número de jugadores con varias variantes, rotación por
asiento, tamaño de letra fluido por *container query*) — pero el usuario
señaló un problema concreto: "la barra del tiempo y ajustes" (el hub:
deshacer, pausa, pasar turno, menú) no deja hueco suficiente a los
jugadores.

Verificado con un navegador real (Playwright, instalado y desinstalado sin
quedar como dependencia): en toda disposición de **5 jugadores** y en "6b"
("Rodeando el móvil" de 6) — las únicas que usan **3 filas** de asientos — el
hub se solapaba literalmente con los asientos de la fila del medio,
tapándolos. Las de 2 y 4 jugadores, las únicas que las ADR 0023/0026
mencionan como verificadas en su momento, estaban bien.

La causa: `.board` fija `row-gap` al alto medido del hub (`altoHub`, ver ADR
0026) para que la barra tenga sitio **sin invadir los asientos de al lado**
(ADR 0023). Pero `row-gap` en CSS Grid se aplica **por igual entre todas las
filas**, no solo en la que de verdad contiene el hub. Con 2 filas (un único
hueco) eso coincide con el único sitio donde puede estar el hub y funciona
por accidente. Con 3 filas (5 jugadores; "6b" de 6) hay *dos* huecos del
mismo alto exagerado, y el `.hub` — centrado con `position:absolute;
top:50%` sobre `.board` entero — cae en el centro geométrico de las tres
filas, que con filas iguales es siempre el centro de la fila del medio, no
un hueco. Las disposiciones que ya usaban `centro` (3b, 4b) no tienen este
problema porque ahí el hub no se centra por `position:absolute`: `Hub.tsx`
lo coloca con `position:static; grid-area:centro` en cuanto `centro` existe,
un mecanismo distinto que si acierta el sitio.

## Decisión

Las disposiciones de 3 filas pasan a reservarle al hub **su propia fila de
grid**, con el mismo mecanismo que ya usaban 3b/4b (`centro` + `grid-area`),
en vez de depender del `row-gap` estirado:

- `Dispo` (`disposiciones.ts`) y `LayoutGenerico`/`DispoTablero` (`layouts.ts`)
  ganan un campo `filaHub?: number`: el índice (0-based) de la fila que hay
  que insertar en `rows` para el hub. `conFilaHub(rows, filaHub, tamano)`,
  compartida entre `VistaMesa` (con un tamaño de previsualización fijo) y
  `Tablero` (con el alto real medido, `altoHub`), hace esa inserción.
- `5a`, `5b`, `5c` y `6b` pasan de `rows:'repeat(3,1fr)'` sin `centro` a
  `rows:'1fr 1fr 1fr'` + `filaHub:1` + `centro:'2/1/3/3'` (la fila
  insertada, a lo ancho de las dos columnas). Las `areas` de los asientos que
  antes empezaban en la fila 2 o 3 suben una línea de grid. El reparto
  genérico de emergencia (`LAYOUTS[5]`/`LAYOUTS[6]` en `layouts.ts`, para
  partidas guardadas sin disposición válida) recibe el mismo tratamiento,
  con áreas explícitas también para los dos primeros asientos en vez de
  dejarlos al *auto-flow* del grid.
- `Tablero.tsx` aplica `rowGap: dispo.filaHub != null ? 6 : altoHub` — con
  fila propia, el hueco entre el resto de filas vuelve al tamaño pequeño de
  siempre (6px, el valor de antes de la ADR 0023) en vez de duplicar el alto
  del hub en cada hueco de la rejilla.
- `Hub.tsx` no necesitó ningún cambio: ya sabía colocarse por `grid-area`
  en cuanto `centro` existe, desde la ADR original que introdujo esa rama
  para 3b/4b.

## Alternativas consideradas

- **Adivinar un `top` distinto de 50% para el `position:absolute`.** Se
  descarta: con CSS Grid no hay forma de dirigirse a "el primer hueco entre
  filas" como posición — solo se puede calcular en píxeles a mano, la misma
  clase de número frágil que las ADR 0025/0026 ya descartaron para el alto
  del propio hub.
- **Ocultar el hub automáticamente durante la partida (estilo
  `autoHideMenu` de LifeTap)** para liberar sitio en vez de arreglar el
  solape. Se descarta para este caso: no soluciona el problema de fondo (el
  hub seguiría tapando asientos mientras está visible, que es la mayor
  parte del tiempo) y cambia el modelo de interacción de pasar turno, que el
  usuario no pidió.

## Consecuencias

- Verificado con capturas de un navegador real antes y después del cambio,
  para 2, 4, 5 (las tres variantes) y 6 (las dos variantes) jugadores: ya no
  hay solape en ninguna, y las de 2/4 jugadores quedan exactamente igual que
  antes (sin regresión).
- `tests/tablero/layouts.test.ts` tenía dos aserciones que fijaban a mano el
  formato `repeat(N,1fr)` y las áreas rotas de antes para el reparto
  genérico de 5 jugadores: se actualizaron a los valores correctos, y se
  añadió una prueba explícita de que `dispoTablero(5|6, null)` trae
  `filaHub`/`centro`.
- Si en el futuro se añade otra disposición con 3 filas o más (o se retoca
  3b/4b), hay que decidir también su `filaHub`/`centro` a mano — no hay
  comprobación automática que avise si se olvida, igual que pasaba ya con
  `centro` antes de esta ADR.

# 0007. El modal abierto se guarda como un único estado en la pantalla, no por componente

Fecha: 2026-09-04
Estado: Aceptada

## Contexto

La pantalla previa (`Previa.tsx`) puede abrir siete modales distintos: elegir
asiento, gestionar perfiles, editar/crear perfil, tirar un dado, vida
personalizada, quién empieza y confirmar que se descarta la partida. Varios
de ellos se encadenan: desde "elegir asiento" se puede abrir "crear perfil",
y al guardarlo hay que volver a sentar en ese mismo asiento y cerrarlo todo
— el equivalente en app.html a que `editorPerfil()` reciba un callback
(`guardarPerfilCB`) y a que `abrirModal()` sobrescribiera el modal anterior.

## Decisión

`Previa` guarda un único `modal: EstadoModal | null` (una unión discriminada
por `tipo`), no un booleano por cada modal. Abrir un modal es
`setModal({tipo: '...', ...datos})`; cerrarlo es `setModal(null)`; encadenar
uno con otro (como "crear perfil" desde "elegir asiento") es sustituir el
valor de `modal` por el del siguiente, pasándole en sus datos la función que
hay que ejecutar al terminar (por ejemplo, `alGuardar` en el caso de
`editorPerfil`).

## Alternativas consideradas

- **Un `useState<boolean>` por modal** (`elegirAsientoAbierto`,
  `perfilesAbierto`, ...). Se descarta porque no expresa que solo puede haber
  un modal abierto a la vez, y encadenar uno con otro (crear perfil desde
  elegir asiento) obligaría a cerrar uno y abrir otro con estado repartido
  entre varias variables en vez de una transición de estado clara.
- **Un contexto de modal global**, con un `abrirModal()`/`cerrarModal()` de
  ámbito toda la app. Ya se descartó en la ADR 0006 para el caso general
  (cada pantalla monta su `<Modal>` con su propio estado); aquí se confirma
  esa misma decisión para el caso concreto de varios modales relacionados
  entre sí dentro de una sola pantalla.

## Consecuencias

- Cada pantalla que tenga varios modales relacionados (el Tablero, en el
  siguiente commit, tendrá el panel de daño, el menú de asiento, terminar
  partida...) repite este mismo patrón: un `EstadoModal` propio de esa
  pantalla, no un mecanismo compartido entre pantallas.
- El componente de cada modal (`ModalElegirAsiento`, `EditorPerfil`...) no
  sabe nada de qué modal vino antes ni de cuál viene después: recibe
  callbacks (`onGuardar`, `onCrearPerfil`...) y la pantalla es la única que
  decide a qué `EstadoModal` saltar en cada uno.
- La "Copia de seguridad de toda la app" (el enlace que cierra `pintarInicio`
  en el original) no se ha portado todavía: vive de verdad en la sección de
  Registro (`copiaSeguridad()`), así que llegará con esa fase, no con esta.

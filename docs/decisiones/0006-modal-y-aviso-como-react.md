# 0006. Modal y aviso pasan de funciones globales a componente y contexto

Fecha: 2026-09-04
Estado: Aceptada

## Contexto

En `app.html`, `abrirModal(titulo, cuerpo, pie)`/`cerrarModal()` y `aviso(txt)`
eran funciones globales que inyectaban HTML directamente en dos huecos fijos
del documento (`#modal`, `#toast`). Cualquier pantalla las llamaba desde
cualquier sitio. Al portar la sección 4 a componentes, había que decidir el
equivalente en React.

## Decisión

- **Modal** es un componente (`<Modal titulo pie onCerrar>`) que cada pantalla
  monta condicionalmente con su propio `useState`, en vez de una función
  global que abre/cierra un hueco compartido. Usa `createPortal` a
  `document.body`, igual que el original montaba sobre un `#modal` fijo fuera
  del flujo normal del documento.
- **Aviso** sigue siendo ambient (cualquier componente, en cualquier parte del
  árbol, tiene que poder disparar uno) así que se queda como React Context:
  `<AvisoProvider>` en la raíz de la app, y `useAviso()` para disparar un
  mensaje desde donde haga falta.

## Alternativas consideradas

- **Un `ModalProvider` global**, simétrico al de Aviso, con una función
  `abrirModal()` expuesta por contexto. Se descarta porque el contenido de
  cada modal en `app.html` es distinto y bastante grande (formularios de
  varios campos, listas...): forzarlo todo a pasar por una única función que
  recibe HTML/JSX como parámetro no gana nada frente a que cada pantalla
  monte su propio `<Modal>` con su propio estado — y además, con el estado
  del formulario viviendo en el componente que lo usa, no en un contexto
  compartido, hay menos riesgo de que un modal accidentalmente arrastre
  estado del anterior.
- **Aviso también por estado local de cada pantalla**, sin contexto. Se
  descarta porque en el original una única partida podía disparar avisos
  desde media docena de sitios distintos (validaciones, `revisar()`,
  `deshacer()`...); replicar esa ambient-ness sin contexto obligaría a pasar
  `mostrarAviso` como prop por varios niveles.

## Consecuencias

- Cada pantalla que necesite un modal lo importa y lo monta con su propio
  `useState<boolean>` (o el estado que corresponda), sin depender de una API
  global — se repite este patrón según se porten Previa, Tablero y Registro.
- `AvisoProvider` tiene que envolver la aplicación una sola vez, en `App.tsx`.
- La verificación de esta fase se hizo con Testing Library (cierre por click,
  por Escape, por click fuera; aparición y desaparición del aviso a los
  2600ms con temporizadores simulados) y además con Chromium real vía
  Playwright, para comprobar el aspecto visual y que no había errores de
  consola — capturas y consola limpia confirmadas antes de dar la fase por
  cerrada.

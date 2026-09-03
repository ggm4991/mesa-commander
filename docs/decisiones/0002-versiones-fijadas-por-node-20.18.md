# 0002. Versiones de herramientas fijadas por Node 20.18.1

Fecha: 2026-09-03
Estado: Aceptada

## Contexto

Al instalar el scaffold (Fase 0), varias herramientas fallaron al ejecutarse
aunque `npm install` terminaba "bien" (solo con avisos `EBADENGINE`, que npm
no trata como error). El motivo es el mismo en los tres casos: la versión más
reciente de la herramienta exige un Node más nuevo del que hay instalado en
esta máquina (`v20.18.1`), y esa versión más nueva depende de un binario
nativo distinto por plataforma (Rust/napi) que npm **no llega a descargar**
cuando el `engines` declarado no encaja — no es el bug de npm/cli#4828 que
sugiere el propio mensaje de error, sino un filtrado silencioso de
`optionalDependencies` por versión de Node:

- **Vite 8**: usa por defecto el nuevo bundler Rolldown, que requiere
  Node ≥20.19. Sin el binario nativo, tanto `vite build` como `vitest`
  (que arranca Vite por debajo) fallan con `Cannot find native binding`.
- **oxlint 1.8x**: mismo patrón — su binario nativo más reciente exige
  Node ≥20.19.
- **Capacitor 8**: exige Node ≥22, un salto mayor; además `npm install` sin
  fijar versión instaló `@capacitor/core@8` junto a `@capacitor/cli@7`
  (mayores distintos, potencialmente incompatibles entre sí).

## Decisión

Fijar explícitamente, mientras esta máquina siga en Node 20.18.1:

- `vite@^6` (con `@vitejs/plugin-react@^4`, la versión de ese plugin que
  espera Vite 6 como peer dependency).
- `oxlint@^0.15.0`.
- `@capacitor/core@^7` junto a `@capacitor/cli@^7` (mismo major).

Todas estas versiones declaran soporte para Node ≥18 o ≥20.0.0, sin el salto
a 20.19/22 que dispara el problema del binario nativo.

## Alternativas consideradas

- **Actualizar Node en la máquina** (con `nvm`/Volta, ambos ya presentes).
  Se descarta por ahora porque es un cambio a nivel de sistema que afecta a
  cualquier otro proyecto que use esta instalación de Node, no solo a Mesa
  Commander — no es una decisión que deba tomarse de forma unilateral dentro
  de esta migración. Si el usuario decide actualizar Node más adelante, estas
  fijaciones de versión se pueden soltar sin más cambios.
- **Ignorar el aviso `EBADENGINE` y usar las versiones más recientes de
  todas formas.** Se descarta porque no es un aviso cosmético: la app
  literalmente no arrancaba (`vite build`, `vitest run` y `oxlint` fallaban
  los tres con el mismo error de binario nativo ausente).

## Consecuencias

- El proyecto queda en versiones ligeramente por detrás de la última de cada
  herramienta, documentado aquí para que quede claro que es intencional y no
  un descuido al actualizar dependencias en el futuro.
- Si en algún momento se actualiza Node a ≥20.19 (o ≥22 para Capacitor 8), se
  puede revisar esta ADR y soltar las fijaciones de versión.

# 0001. Stack de la migración: React + TypeScript + Vite + Capacitor

Fecha: 2026-09-03
Estado: Aceptada

## Contexto

Mesa Commander era un único `app.html` (HTML+CSS+JS vanilla, sin build) elegido
así deliberadamente para poder abrirse desde el móvil con `file://`, sin
servidor. El objetivo ahora es convertirlo en una app móvil real, y además:

- Tener tests de verdad (hoy cada uno de los 9 archivos de `pruebas/` monta un
  DOM falso a mano, con bastante duplicación ya señalada en el `CLAUDE.md`
  original).
- Conectar con la API de Scryfall para imagen/identidad de color de
  comandantes.
- Que la app siga funcionando offline si falla la conexión.
- Que la liga sea privada por ahora, pero compartible entre dispositivos más
  adelante.
- Que todo el proceso quede documentado, para poder aprenderlo, no solo
  recibir el resultado.

## Decisión

**React + TypeScript, empaquetado con Vite y con Capacitor como shell móvil.**
Testing con **Vitest + Testing Library**. Llamadas a Scryfall a través de
**TanStack Query** (caché + comportamiento offline). **Supabase** (Postgres +
Auth + Row Level Security) queda reservado para cuando se implemente la
sincronización entre dispositivos — no se instala en esta fase.

## Alternativas consideradas

- **Seguir en vanilla JS, partiendo `app.html` en módulos ES.** Se descarta
  porque los `import` no funcionan bajo el protocolo `file://` (ya lo señala
  el propio README del proyecto), y partir en módulos sin un framework no
  resuelve el problema real: falta de tests aislables, sin una forma estándar
  de manejar caché/estado de red.
- **React Native o Flutter.** Ambos obligarían a reescribir también el motor
  de partida (vidas, daño de comandante, turnos), que hoy ya está escrito y
  probado en JavaScript. Capacitor permite reutilizar ese código casi tal
  cual, portándolo a TypeScript puro, y además da una PWA instalable "gratis"
  (que ya estaba en el apartado "Pendiente" del `CLAUDE.md` original) sin
  coste añadido.
- **Quedarse sin capa de tests nueva y seguir con el DOM simulado a mano.** Se
  descarta porque, con la lógica ya separada del DOM en TypeScript puro (ver
  la Fase 1 del plan de migración), Vitest la prueba sin ningún mock — es
  estrictamente menos trabajo que mantener el simulador actual, no más.

## Consecuencias

- La UI se reescribe por completo en componentes React; el motor de partida
  (vidas, contadores, daño de comandante, turnos, deshacer) y el
  almacenamiento se portan con cambios mínimos de lógica, solo de forma
  (de mutar variables globales a recibir/devolver estado).
- La app deja de poder abrirse a doble clic: pasa a necesitar un paso de
  build (`npm run build` / `npm run dev`), a cambio de poder instalarse como
  PWA y como app nativa empaquetada por Capacitor.
- Queda abierta, para cuando llegue la sincronización multi-dispositivo, la
  elección concreta de proveedor de autenticación sobre Supabase — se
  decidirá en su propia ADR cuando se aborde esa fase.

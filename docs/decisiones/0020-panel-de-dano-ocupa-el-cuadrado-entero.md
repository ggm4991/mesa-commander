# 0020. Mantener pulsado un sector cubre el cuadrado entero, no solo su hueco

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

La ADR 0018 abría el propio sector pulsado en dos mitades pequeñas
(sumar/restar). Con el hueco general ya repartido a la mitad para un
jugador con compañero (ADR 0019), cada mitad de sumar/restar quedaba
dentro de una fracción de un cuarto del cuadrado — un objetivo diminuto,
difícil de acertar con el dedo. El usuario pidió que, al mantener pulsado
cualquier sector, el panel de sumar/restar ocupara el cuadrado *entero*, y
que esto valiera igual para cada comandante de un jugador con compañero
(cada uno abre el cuadrado entero para sí mismo, no los dos a la vez).

## Decisión

- **El estado de "qué sector está abierto" sube a `Asiento.tsx`**, no vive
  dentro de `IconoDanoComandante`: solo el padre conoce los límites del
  cuadrado entero. `IconoDanoComandante` queda como una función pura de
  interacción — toca y suma, mantén pulsado y pide al padre que abra su
  clave (`onAbrir`) — sin gestionar ningún estado de apertura él mismo.
- **`PanelDanoExpandido` es un componente nuevo**, hermano de los sectores
  dentro de `.dano-cuadrado` (no un hijo del sector), con
  `position:absolute;inset:0` para cubrir el cuadrado completo sin importar
  cuál de los sectores lo abrió. Muestra la ilustración de esa fuente en
  concreto, su nombre, y dos mitades grandes de sumar/restar — mismo cierre
  automático que antes (tocar fuera, o 3 segundos sin usarlo), ahora
  gestionado dentro del propio panel en vez de en cada sector.
- Como cada `IconoDanoComandante` pide abrir *su propia* clave, un jugador
  con compañero abre el cuadrado entero para uno de sus dos comandantes a
  la vez, nunca los dos juntos — ya estaba implícito en el diseño por
  sector, y se conserva sin cambios adicionales.

## Alternativas consideradas

- **Agrandar solo las dos mitades dentro del propio hueco**, sin cubrir el
  cuadrado entero. Se descarta: con un hueco ya partido a la mitad por un
  compañero, agrandar "dentro de esa mitad" seguía dejando un objetivo
  pequeño — el pedido explícito era ocupar el cuadrado completo.
- **Un modal aparte para sumar/restar**, en vez de un panel dentro del
  propio cuadrado. Se descarta por la misma razón de siempre en esta zona
  de la app (ADR 0016): un menú intermedio es justo lo que se quería evitar.

## Consecuencias

- Verificado con un navegador real: mantener pulsado cualquier sector — el
  propio o el de un rival, principal o compañero — cubre el cuadrado
  entero con una mitad roja y una verde grandes y fáciles de tocar; sumar,
  restar, tocar fuera y el cierre automático por tiempo siguen funcionando
  igual que antes.

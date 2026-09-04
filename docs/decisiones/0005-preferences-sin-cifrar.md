# 0005. `@capacitor/preferences` no cifra, y por ahora no hace falta que lo haga

Fecha: 2026-09-04
Estado: Aceptada

## Contexto

El requisito de que la app sea "segura de usar" hay que revisarlo en cada
fase que toque almacenamiento o red, no dejarlo para el final. En esta fase
se decidió `@capacitor/preferences` como adaptador de almacenamiento local
(ver `docs/decisiones/0001`), que en Android usa `SharedPreferences` y en iOS
`UserDefaults` — ninguno de los dos cifra su contenido por defecto.

## Decisión

Se acepta `@capacitor/preferences` sin cifrar para esta fase, porque hoy no
guarda nada sensible: nombres de jugadores, nombres de comandantes, vidas y
duraciones de partida. Nada de eso es una credencial ni un dato privado más
allá de lo que ya se ve jugando en la mesa.

## Alternativas consideradas

- **`@capacitor-community/secure-storage` o el Keychain/Keystore nativo desde
  ya.** Se descarta por prematuro: añade una dependencia y una superficie de
  fallos (claves de cifrado, migración si el usuario cambia de dispositivo)
  para proteger datos que hoy no son sensibles.

## Consecuencias

- Cuando llegue la sincronización con Supabase (Fase 6 del plan de
  migración), este dispositivo empezará a guardar algo que si es sensible:
  el token de sesión del usuario. En ese momento hay que revisar esta
  decisión y, si `@capacitor/preferences` sigue siendo donde vive ese token,
  pasar a almacenamiento cifrado. Esta ADR queda como el recordatorio
  explícito de que ese cambio de contexto obliga a repetir la pregunta, no
  a asumir que la respuesta de hoy sigue valiendo.

# 0029. Un `.apk` de Android de verdad, vía Capacitor, en vez de solo la PWA

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Con la PWA ya instalable (ADR 0028), el usuario aclaró que lo que quería era
una app de verdad para Android o iOS, no algo que se sigue abriendo desde un
navegador aunque no se note a simple vista. Capacitor ya estaba puesto desde
la Fase 0 (`capacitor.config.ts`, `@capacitor/core` y `@capacitor/cli` en
`package.json`), pero faltaban dos cosas para poder compilar de verdad:

1. **El SDK de Android no estaba instalado.** Android Studio sí estaba, pero
   nunca se había completado su asistente de bienvenida (que es quien
   normalmente descarga el SDK) — no había ni `ANDROID_HOME` ni una carpeta
   de SDK en ninguna ubicación habitual.
2. **iOS no es viable desde esta máquina**: compilar para iPhone exige un Mac
   con Xcode instalado, algo que no depende de ninguna decisión de este
   proyecto. Queda anotado como lo que es: no bloqueado por falta de
   trabajo, sino por no tener el hardware.

## Decisión

- **Instalar el SDK de Android por terminal**, sin abrir Android Studio:
  `commandlinetools-win` (verificado su SHA-256 contra el que publica
  Google) descomprimido en `cmdline-tools/latest/` dentro de
  `%LOCALAPPDATA%\Android\Sdk` (la ubicación por defecto, para que Android
  Studio lo reconozca igual si se abre más adelante), y `sdkmanager` para
  aceptar licencias e instalar `platform-tools`, las plataformas 34-36 y sus
  `build-tools`. `ANDROID_HOME`/`ANDROID_SDK_ROOT` se fijan a nivel de
  usuario (`setx`), y `android/local.properties` (con `sdk.dir`, ignorado
  por su propio `.gitignore`) queda como alternativa que no depende de
  variables de entorno.
- **JDK 21, no 17.** El primer intento de compilar con el JDK 17 recién
  instalado falló con `invalid source release: 21`: el módulo
  `@capacitor/android` de Capacitor 8 pide `sourceCompatibility 21` en su
  Gradle. Instalar un JDK más nuevo en vez de buscar una versión más vieja
  de Capacitor que pidiera menos — mismo criterio que ya se siguió con Node
  en la ADR 0003, no fijar versiones antiguas del proyecto para esquivar un
  requisito del entorno cuando actualizar el entorno es una opción real y
  sin coste para el resto de la máquina.
- **`npx cap add android` genera `android/`, y se commitea tal cual.** Es el
  propio proyecto de Capacitor (con su `.gitignore` interno, que ya excluye
  `build/`, `local.properties` y los assets web copiados) — no algo que se
  regenere solo desde cero cada vez, porque puede llevar configuración
  nativa a mano (permisos, iconos nativos, etc.) que `cap sync` no
  reconstruye. `npm run build` sigue siendo el paso previo obligatorio:
  Capacitor copia `dist/`, no las fuentes de `src/`.
- **De momento, solo build de depuración** (`./gradlew assembleDebug`),
  firmado automáticamente con la clave de depuración de Android — instalable
  a mano en cualquier Android con "orígenes desconocidos" permitido, pero no
  válido para publicar en la Play Store (eso pide una clave de *release*
  propia, todavía sin crear).

## Alternativas consideradas

- **Pedir al usuario que instalara el SDK abriendo Android Studio** (su
  asistente de bienvenida lo hace solo). Era la opción más simple de
  ejecutar, pero el usuario prefirió que se hiciera por terminal para no
  tener que estar pendiente de una ventana con barras de progreso — ver
  decisión explícita tomada con `AskUserQuestion` en esta misma sesión.
- **Generar los iconos nativos de Android con `@capacitor/assets` o
  similar.** Se descarta por ahora: el `.apk` de depuración usa el icono por
  defecto del proyecto de Capacitor; adaptar el icono de la app (el mismo
  dibujo de la corona que ya tienen el favicon y los iconos de la PWA) queda
  como retoque pendiente, no bloqueante para poder instalar y probar.

## Consecuencias

- Verificado de extremo a extremo en esta máquina: `assembleDebug` termina
  en `BUILD SUCCESSFUL` y genera un `.apk` de ~4,3 MB en
  `android/app/build/outputs/apk/debug/`, servido por HTTP en la red local
  para instalarlo directamente desde el navegador del móvil (mismo patrón
  que ya se usaba para probar la PWA).
- Cualquiera que clone este repo y quiera compilar el `.apk` necesita el
  mismo SDK de Android y JDK 21 instalados — documentado en `CLAUDE.md`
  ("Empaquetar para Android") para no tener que redescubrirlo.
- La instalación del SDK y del JDK 21 en esta máquina es un cambio de
  entorno, no del repositorio: no hay nada que journalizar en el propio
  proyecto más allá de esta ADR y la sección nueva de `CLAUDE.md`.

# 0036. La versión y la hora del build se ven en la app, y Android ya no se queda en 1.0

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Tras varias rondas seguidas reinstalando el `.apk` para probar cada arreglo,
el usuario preguntó si había alguna forma de saber, al instalar, si la app
se había actualizado de verdad. La respuesta honesta era que no: `package.json`
tiene un campo `"version": "0.1.0"` que no se muestra en ningún sitio de la
app, y `android/app/build.gradle` seguía con `versionCode 1` /
`versionName "1.0"`, los valores por defecto que deja `npx cap add android`
la primera vez — nunca se habían tocado en ninguna de las
Fase 4 (14/n)-(18/n). Con los dos fijos, ni la propia app ni la pantalla de
"información de la aplicación" de Android podían distinguir un `.apk` de
otro.

## Decisión

- **La app muestra su versión y la hora del build junto al nombre**, en la
  barra de navegación (`.nav .brand`): `v0.1.0 · 2026-09-06 20:09`, por
  ejemplo. `vite.config.ts` inyecta dos constantes globales en tiempo de
  compilación —`__APP_VERSION__` (de `package.json`) y `__BUILD_TIME__`
  (`new Date().toISOString()` en el instante del `npm run build`)—, sin
  ningún archivo ni paso manual adicional: cada `npm run build` dice solo
  la hora en la que se compiló, así que instalar una build encima de otra
  se nota con solo mirar la pantalla de inicio.
- **`vitest.config.ts` fija las mismas dos constantes a valores fijos de
  prueba** (`'0.0.0-test'`, una fecha en 1970), para que los tests no
  dependan de la hora real en la que se ejecutan ni fallen por no existir
  esas variables fuera de un build real.
- **`android/app/build.gradle` deja de fijar `versionCode`/`versionName` a
  mano**: `versionName` pasa a leer `package.json` (mismo número que ve la
  app), y `versionCode` se calcula solo como los minutos transcurridos
  desde 1970 en el momento de compilar — cabe de sobra en un entero de 32
  bits hasta bien pasado el año 6000, sube siempre, y no hace falta
  acordarse de incrementarlo a mano en cada build (algo que, en la práctica
  de esta migración con commits casi diarios, se habría olvidado tarde o
  temprano).

## Alternativas consideradas

- **Usar el hash corto de git como identificador de build**, en vez de la
  hora. Se descarta por sencillez: leer la hora no depende de tener `git`
  disponible en el entorno donde se compila (relevante de cara a un futuro
  pipeline de CI), y para el propósito de "¿es esto más nuevo que lo que
  tenía?" la hora es igual de útil y no hace falta cruzarla con `git log`
  para interpretarla.
- **Incrementar `versionCode` a mano en cada release**, guardándolo como un
  número fijo en el propio `build.gradle` (el patrón más habitual para
  publicar en la Play Store). Se descarta por ahora, mientras el `.apk` es
  solo de depuración para instalar a mano: un contador automático no puede
  olvidarse de subir, cosa que sí puede pasar con uno manual en mitad de
  una sesión con muchas rondas seguidas. Si algún día se firma una build de
  *release* de verdad para la Play Store, esta decisión habrá que
  revisarla (la Play Store exige que cada subida tenga un `versionCode`
  mayor que el anterior, pero prefiere control explícito por versión, no
  un timestamp).

## Consecuencias

- Verificado con un navegador real que la barra de navegación muestra
  `v0.1.0 · 2026-09-06 20:09` (la hora del build, no la hora actual).
- Verificado con `aapt2 dump badging` sobre el `.apk` reconstruido:
  `versionName='0.1.0'` (antes `'1.0'`) y `versionCode` distinto entre dos
  builds seguidas con solo un minuto de diferencia (`29812094` →
  `29812095`), confirmando que sube solo en cada compilación.
- 1 prueba nueva (`tests/App.test.tsx`) que comprueba que la versión se
  pinta con los valores fijos de prueba.
- Quien quiera un número de versión "de verdad" más adelante (para marketing
  o para la propia Play Store) solo tiene que subir `package.json`; el resto
  —la app y el `.apk`— lo recogen solos en el siguiente build.

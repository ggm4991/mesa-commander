# 0032. La copia de seguridad se guarda de verdad en Android, no solo en el navegador

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

El usuario reportó que generar la copia de seguridad no funcionaba en el
`.apk` de Android (ADR 0029). `ModalCopiaSeguridad.descargar()` seguía el
truco clásico de navegador: crear un `Blob`, un `<a href="blob:...">
download="...">` y simular un clic. Eso funciona en cualquier pestaña de
navegador, pero un `WebView` nativo como el que usa Capacitor no tiene ningún
"gestor de descargas" al que ese enlace pueda avisar — el clic no hace nada
en absoluto, sin ningún error visible que explique por qué.

## Decisión

`descargar()` distingue con `Capacitor.isNativePlatform()`:

- **Nativo (Android/iOS):** escribe el archivo de verdad con
  `@capacitor/filesystem` (`Filesystem.writeFile`, en `Directory.Cache`,
  como texto plano con `Encoding.UTF8`) y pasa la ruta resultante a
  `@capacitor/share` (`Share.share`), que abre el selector nativo de "Compartir
  o guardar en..." — Google Drive, la app Archivos, Bluetooth, otra app,
  lo que tenga instalado quien juega. Es el patrón habitual de Capacitor
  para "exportar un archivo": no hay una carpeta de Descargas fija a la que
  escribir directamente y esperar que alguien la encuentre.
- **Navegador/PWA:** se queda exactamente como estaba (el `<a download>` de
  siempre), porque ahí sí funciona y da la descarga directa de toda la vida,
  mejor experiencia que forzar un selector de compartir para algo tan simple.

## Alternativas consideradas

- **Pedir permisos de almacenamiento y escribir directamente en
  `Directory.Documents`/`External`**, sin pasar por `Share`. Se descarta:
  Android ya no deja escribir libremente fuera del espacio privado de la
  app sin permisos adicionales cada vez más restringidos (Scoped Storage,
  Android 10+), y el selector de compartir consigue el mismo resultado
  (el archivo acaba donde quien juega decida) sin pedir ningún permiso de
  almacenamiento nuevo.
- **Detectar el entorno mirando `navigator.userAgent` o similar** en vez de
  `Capacitor.isNativePlatform()`. Se descarta: Capacitor ya expone la forma
  oficial y fiable de saber si se está corriendo dentro de su propio shell
  nativo, sin heurísticas de user-agent que pueden dar falsos positivos.

## Consecuencias

- Nuevas dependencias `@capacitor/filesystem` y `@capacitor/share` —mismos
  plugins oficiales de Capacitor que ya usa `@capacitor/preferences`, ninguna
  dependencia de terceros.
- 2 pruebas nuevas mockeando `@capacitor/core`, `@capacitor/filesystem` y
  `@capacitor/share`, comprobando que la rama nativa llama a
  `Filesystem.writeFile` y `Share.share`, y que la rama de navegador no las
  toca en absoluto.
- Pendiente de confirmar en el propio `.apk` reconstruido (no se puede
  verificar `Capacitor.isNativePlatform() === true` desde un navegador de
  escritorio ni desde Playwright, que no corren dentro del shell nativo).

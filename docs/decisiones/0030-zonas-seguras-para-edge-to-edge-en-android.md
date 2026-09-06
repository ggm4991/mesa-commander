# 0030. Márgenes de zona segura para que la barra de estado no tape la interfaz

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

Ya instalado el `.apk` de la ADR 0029 en un móvil real, el usuario mandó una
captura: la barra de estado del sistema (hora, batería, iconos de conexión)
se pintaba encima de la barra de navegación de la app ("Mesa Commander" /
"Inicio" / "Registro"), tapando parte de los botones y dificultando tocarlos.

La causa es "edge-to-edge": desde Android 15 (API 35, que es justo el
`targetSdkVersion` de este proyecto — ver ADR 0029), el sistema ya no reserva
un hueco para sí mismo por defecto: cualquier app dibuja debajo de la barra
de estado y de la barra de gestos salvo que ella misma se aparte con los
márgenes de "zona segura". `index.html` ya llevaba `viewport-fit=cover` en
el `<meta name="viewport">` desde el principio (pensado para tapar toda la
pantalla, notch incluido), pero nada en `index.css` usaba todavía los
márgenes `env(safe-area-inset-*)` que ese `viewport-fit` habilita — así que
la interfaz se pintaba de verdad hasta el borde físico de la pantalla, sin
que nada la apartase de la barra de estado.

## Decisión

Añadir `env(safe-area-inset-*)` a los tres sitios donde la interfaz llega
hasta el borde de la pantalla (buscados por tener `position: fixed` con
`inset: 0` o equivalente, no solo el que salió en la captura):

- **`.nav`** (la barra superior de Previa/Registro): suma el margen superior
  e izquierdo/derecho a su `padding` existente, sin tocar el inferior.
- **`.board-screen`** (el tablero de juego, a pantalla completa de verdad):
  `padding` en los cuatro lados, porque en horizontal el hueco de la cámara o
  el notch puede caer a la izquierda o la derecha en vez de arriba.
- **`.overlay`** (el fondo de cualquier modal): mismo criterio que
  `.board-screen`, sumado a su `padding` de siempre.
- **`.toast`** (el aviso flotante de abajo): solo el margen inferior, por si
  la barra de gestos del sistema queda más alta de lo que ya preveía su
  `bottom: 26px`.

En todos los casos se **suma** el margen de zona segura al que ya había, no
se sustituye: en un navegador de escritorio o un Android sin recorte de
pantalla, `env(safe-area-inset-*)` vale `0px` y el resultado es idéntico al
de antes.

## Alternativas consideradas

- **Desactivar edge-to-edge desde el lado nativo** (`MainActivity.java`,
  forzando que el sistema vuelva a reservar su propio hueco). Se descarta:
  Android 15+ está moviendo esa posibilidad hacia la desaparición para apps
  con `targetSdkVersion` alto, así que apoyarse en ello sería una solución de
  fecha de caducidad conocida. Los márgenes de zona segura por CSS son además
  la misma técnica que ya hacía falta para la PWA (ADR 0028) en un iPhone con
  notch, así que resuelven los dos casos con un único mecanismo.
- **Arreglar solo `.nav`**, que es lo único que salió en la captura. Se
  descarta: `.board-screen` tiene exactamente el mismo problema en cuanto
  alguien juegue con la partida en horizontal o en un móvil con recorte
  lateral, y `.overlay` lo hereda cualquier modal — más vale corregir el
  patrón entero ahora que localizar cada aparición suelta según vaya
  reportándose.

## Consecuencias

- Verificado con `npm run build`/lint/tests en verde y una compilación
  nueva del `.apk` (ADR 0029) con el CSS corregido — pero la comprobación
  visual de verdad solo puede hacerse en un dispositivo real: los
  navegadores sin recorte de pantalla (incluido Chromium bajo Playwright, ya
  usado en rondas anteriores para verificación visual) siempre devuelven
  `0px` en `env(safe-area-inset-*)`, así que no hay forma de reproducir este
  bug ni confirmar su arreglo fuera de un móvil de verdad. Queda pendiente
  que el usuario confirme en el suyo.
- Cualquier futuro elemento que use `position: fixed` para cubrir la
  pantalla entera (o gran parte de un borde) debería revisarse con el mismo
  criterio, tanto en la PWA como en el `.apk`.

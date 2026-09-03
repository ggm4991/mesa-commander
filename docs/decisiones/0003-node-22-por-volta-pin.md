# 0003. Node 22 para este proyecto, fijado con `volta pin`

Fecha: 2026-09-03
Estado: Aceptada

## Contexto

La ADR 0002 fijó Vite, oxlint y Capacitor a versiones antiguas para evitar el
requisito de Node ≥20.19/≥22 de sus últimas versiones, descartando actualizar
Node porque parecía un cambio de alcance global (afectaría a cualquier otro
proyecto que use esa misma instalación de Node en la máquina). El usuario
señaló que esa opción debería haberse planteado, no descartado sin más: si
actualizar el entorno resuelve el problema de raíz, hay que decirlo y ofrecer
hacerlo, no rodearlo en silencio con versiones antiguas.

Al revisar el entorno, la máquina tiene dos gestores de Node instalados:
`nvm-windows` (controla el Node global, hoy en 20.18.1) y **Volta**. Volta no
tenía ningún toolchain propio instalado todavía — actuaba solo como paso a
través hacia el Node de `nvm-windows`.

## Decisión

Usar `volta pin node@22` dentro de `d:\mesa-commander`. Esto instala Node 22
bajo el propio Volta y añade un campo `"volta"` a `package.json` que fija esa
versión **solo cuando se trabaja dentro de esta carpeta** — el shim de Volta
detecta el `package.json` del proyecto y antepone ese Node a cualquier otro.
El Node global gestionado por `nvm-windows` (20.18.1, el que usan los demás
proyectos de la máquina) queda intacto.

Con Node 22 disponible, se sueltan las fijaciones de la ADR 0002 y el
proyecto vuelve a las versiones más recientes: `vite@^8`,
`@vitejs/plugin-react@^6`, `oxlint@^1.81`, `@capacitor/core@^8` y
`@capacitor/cli@^8`.

## Alternativas consideradas

- **Actualizar el Node global con `nvm-windows`.** Habría resuelto lo mismo,
  pero de forma menos precisa: cambia qué Node ven *todos* los proyectos de
  la máquina, no solo este. El pin de Volta consigue el mismo resultado para
  Mesa Commander sin ese efecto lateral, así que es la opción más ajustada.
- **Mantener las versiones antiguas (ADR 0002).** Era una solución de verdad,
  no una chapuza, pero dejaba el proyecto permanentemente por detrás de las
  versiones activas de sus propias herramientas por una limitación de esta
  máquina en concreto, en vez de resolver esa limitación cuando había una
  forma de hacerlo sin coste para el resto del sistema.

## Consecuencias

- Cualquiera que clone este repo y tenga Volta instalado obtiene Node 22
  automáticamente al entrar en la carpeta, sin instrucciones adicionales.
- Sin Volta instalado, el campo `"volta"` de `package.json` no hace nada:
  hará falta Node ≥22 a mano (o volver a las versiones ancladas de la
  ADR 0002 si no es posible actualizar).
- `npm audit` señala 3 avisos moderados heredados de una dependencia de
  `@capacitor/cli` (`xcode`, que usa una versión de `uuid` con un aviso de
  seguridad) — es una herramienta de solo build para proyectos iOS, no código
  que se ejecute en la app ni esté expuesto a red, así que se deja anotado
  aquí en vez de forzar un downgrade con `npm audit fix --force`.
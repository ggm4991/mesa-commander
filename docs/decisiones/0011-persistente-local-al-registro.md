# 0011. El aviso de "sin almacenamiento" es local al Registro, no global

Fecha: 2026-09-05
Estado: Aceptada

## Contexto

app.html llevaba una variable global `persistente`, puesta a `false` al
arrancar y a `true` o `false` según el resultado del último `escribir()` de
*cualquier* pantalla — partidas, perfiles, configuración o la partida en
curso. El pie del Registro (`pintarPie()`) leía esa variable para avisar de
si el almacenamiento estaba fallando.

Reproducir ese diseño en la versión en componentes exigiría un estado
compartido por encima de `Previa`, `Tablero` y `Registro` que registrara el
resultado de cada escritura de la app entera — un cambio transversal a las
tres pantallas ya construidas en fases anteriores, solo para una nota al pie
que además nunca ha llegado a activarse en la práctica (`adaptadorCapacitor`
y `adaptadorMemoria` no fallan salvo que el propio dispositivo deniegue el
almacenamiento).

## Decisión

`Registro` lleva su propio estado `persistente`, que empieza en `true`
(optimista) y pasa a `false` solo si una escritura hecha *desde el propio
Registro* (guardar partidas, perfiles o configuración al editar, borrar,
combinar o reemplazar) devuelve `false`. No refleja fallos de escritura
ocurridos en `Previa` o el `Tablero` antes de llegar aquí.

## Alternativas consideradas

- **Estado global compartido entre las tres pantallas.** Es lo más fiel al
  original, pero convierte una nota de pie de página en una razón para que
  `Previa` y el `Tablero` —que no necesitan saber nada de esto— pasen a
  depender de un contexto nuevo. Se deja para si el almacenamiento real
  (Capacitor, y más adelante Supabase en la Fase 6) demuestra que hace falta.
- **No mostrar nada.** Se descarta porque el aviso, aunque nunca se haya visto
  disparado, es la única señal que tendría un usuario si el dispositivo le
  deniega el almacenamiento — mejor una nota que puede quedarse desactualizada
  un rato que ninguna.

## Consecuencias

- Si en el futuro se detecta que el usuario necesita saber de un fallo de
  guardado ocurrido en otra pantalla antes de llegar al Registro, esta
  decisión hay que revisarla y sí subir `persistente` a un contexto
  compartido (candidato natural: extender `AlmacenContexto`).

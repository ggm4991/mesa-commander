# Esbozo del modo online (Fase 6)

Fecha de este esbozo: 2026-09-11. **Esto no es una ADR.** Recoge, antes de que
la Fase 6 empiece de verdad (hoy sigue en Fase 4, ver `CLAUDE.md`), las ideas
que se han discutido para el modo online y las convierte en un modelo de
datos, una arquitectura y una lista de huecos por decidir. Cada decisión
concreta que se tome a partir de aquí — qué proveedor de autenticación
exactamente, cómo se invita a una liga, si el cierre es automático — se
documenta en su propia ADR bajo `docs/decisiones/`, como marca la convención
del proyecto ("cada decisión no trivial lleva su ADR... escrita al tomar la
decisión, no al final"). Este archivo es el sitio donde vive el plan
mientras tanto, y se reescribe según cambien las ideas; no es un contrato
congelado.

`docs/decisiones/0001-stack-react-ts-vite-capacitor.md` ya reservó **Supabase**
(Postgres + Auth + Row Level Security) para "cuando se implemente la
sincronización entre dispositivos", pero lo hizo pensando en sincronizar los
datos privados de una sola persona entre sus propios dispositivos. Lo que
sigue amplía bastante ese alcance: cuentas de verdad con amistad entre ellas,
y ligas con administración y ajustes propios. Vale la pena decirlo así de
claro desde el principio porque cambia el diseño — ya no basta con "subir el
JSON local a la nube tal cual", hace falta un modelo relacional con permisos
por fila.

## 1. Las ideas, tal como se plantearon

1. **Ligas administradas.** Las crea un usuario, que pasa a ser su admin; solo
   un admin puede añadir gente a la liga o administrarla. Se plantea permitir
   un segundo admin (límite: 2 por liga).
2. **Cuentas de verdad, con amistad.** Los perfiles dejan de ser solo un
   nombre local: cada persona tiene su cuenta, con sus mazos y sus
   estadísticas globales, y se añaden entre sí como amigos. Cada mazo podría
   llevar un enlace a una plataforma externa donde verlo (Moxfield, Archidekt,
   EDHREC...).
3. **Elegir liga o partida libre al crear partida.** Antes de nada, al
   arrancar una partida nueva, hay que decidir si pertenece a una liga o es
   una partida suelta.
4. **Ajustes por liga.** Como mínimo: quién puede crear partidas (solo los
   admins, o cualquier miembro), un nombre fijo, ver quién pertenece, una
   fecha límite opcional y un cierre que deja un podio.

Y dos restricciones que valen para todo lo anterior: **seguridad máxima
contra filtración de datos**, y montarlo **barato pero en la nube**, no en
local.

## 2. Qué del modelo actual no aguanta el salto a varias cuentas

Antes de diseñar tablas nuevas conviene mirar qué asume hoy el modelo local,
porque dos de esas asunciones se rompen en cuanto hay más de una cuenta real:

- **Un jugador de una partida guardada es solo un nombre.** `AsientoPartida.j`
  (`src/motor/tipos.ts:103`) es un `string` suelto, y `calcularJugadores()`
  (`src/registro/calcularJugadores.ts:56`) agrupa la clasificación agrupando
  por ese texto. No hay ningún id que enlace un hueco jugado con un
  `Perfil.id` — el enlace es por coincidencia de nombre. Funciona en local
  porque una sola persona no se pone dos nombres iguales a propósito; en
  cuanto hay cuentas de verdad, dos personas *sí* pueden compartir nombre, y
  renombrar una cuenta partiría su propio historial en dos. La tabla de
  partidas en la nube necesita un id estable de verdad.
- **`AsientoPartida.id` no es un id.** Es la identidad de color del jugador
  ese `col` (`src/registro/construirPartida.ts:19`), heredado tal cual del
  motor. Aviso para no confundirlo con la clave primaria al diseñar las
  tablas nuevas — se mantiene el dato (hace falta para la ficha), pero con
  otro nombre de columna.
- **El comandante jugado no depende del mazo guardado.** `construirPartida()`
  copia `c`/`c2`/identidad de color del estado *en vivo* de la partida, no
  del `Mazo` que se eligió al sentarse. Es decir: el historial ya es hoy una
  foto fija de lo que se jugó, no una referencia a algo editable. El esquema
  en la nube debe conservar exactamente esa distinción: una fila de partida
  jugada guarda el comandante como texto (foto), y por separado puede además
  enlazar opcionalmente a la cuenta y al mazo que la jugaron (referencia
  real) — sin que editar el mazo más tarde reescriba partidas ya jugadas.
- **No todo el mundo en la mesa va a tener cuenta el primer día.** Si crear
  una cuenta fuera obligatorio para que la partida cuente, el modo online
  sería más fricción que la app actual. El hueco de un jugador sin cuenta
  tiene que poder seguir siendo solo un nombre, igual que hoy.

## 3. Modelo de datos propuesto (Postgres / Supabase)

Pensado como una ampliación del modelo actual, no un reemplazo: las mismas
formas (`Mazo`, `Partida`, `AsientoPartida`) siguen reconocibles, con los ids
reales que hoy faltan añadidos al lado, no en sustitución del texto.

```
cuentas            — una fila por usuario (1:1 con auth.users de Supabase)
  id uuid PK (= auth.users.id)
  nombre_visible text unique
  creado_en timestamptz

mazos              — antes Perfil.mazos, ahora por cuenta
  id uuid PK
  cuenta_id uuid → cuentas
  comandante text, comandante2 text null
  identidad_color text
  imagen_id text null, imagen_id2 text null      -- igual que hoy (Fase 4)
  enlace_externo text null                       -- URL libre, sin integración
  creado_en timestamptz

amistades          — grafo de amigos, por solicitud/aceptación
  solicitante_id uuid → cuentas
  receptor_id uuid → cuentas
  estado text check in ('pendiente','aceptada','rechazada')
  creado_en timestamptz
  PK (solicitante_id, receptor_id)

ligas
  id uuid PK
  nombre text
  creado_por uuid → cuentas
  quien_crea_partidas text check in ('solo_admins','cualquiera') default 'cualquiera'
  fecha_limite date null
  cerrada boolean default false
  cerrada_en timestamptz null
  creado_en timestamptz

miembros_liga
  liga_id uuid → ligas
  cuenta_id uuid → cuentas
  rol text check in ('admin','miembro')
  invitado_por uuid → cuentas
  creado_en timestamptz
  PK (liga_id, cuenta_id)

partidas           — antes Partida, ahora con liga opcional
  id uuid PK
  liga_id uuid null → ligas        -- null = partida libre (idea 3)
  fecha date, duracion int
  creado_por uuid → cuentas
  creado_en timestamptz

partida_asientos   — antes Partida.seats[], ahora tabla propia
  id uuid PK
  partida_id uuid → partidas
  cuenta_id uuid null → cuentas    -- null = jugador sin cuenta (invitado)
  mazo_id uuid null → mazos        -- null = sin mazo guardado
  nombre_mostrado text             -- = AsientoPartida.j de hoy
  comandante text, comandante2 text null, identidad_color text   -- foto fija
  resultado text check in ('V','D','E')
  rehacer int, tiempo int, turno int, vida_final int null
```

`partida_asientos` está pensada para poder reconstruir exactamente el tipo
`AsientoPartida[]` que ya existe (`nombre_mostrado`→`j`, `comandante`→`c`,
`identidad_color`→el `id` de hoy, `resultado`→`r`, etc.). Eso importa porque
significa que **`calcularJugadores()` no necesita reescribirse**: se le puede
seguir pasando un `Partida[]`, solo que construido a partir de una consulta a
Supabase en vez de `leerPartidas()` local. La clasificación de una liga es
literalmente `calcularJugadores(partidasDeEsaLiga)` — el mismo invariante que
ya vale hoy ("el registro es la fuente de la verdad", `CLAUDE.md`) se extiende
solo, sin tabla nueva de "puntuaciones". El cierre de una liga (idea 4) no
necesita "congelar" ni guardar un podio aparte: `cerrada = true` simplemente
bloquea que se añadan más partidas a esa liga, y el podio sigue siendo esa
misma función corriendo sobre lo que ya hay — deja de cambiar porque ya no
entra nada nuevo, no porque se haya copiado a otro sitio.

Límite de 2 admins, invariante que cruza filas (cuántas filas `rol='admin'`
hay ya para esa `liga_id`) y por tanto no expresable con un `CHECK` normal de
una sola fila — hace falta un trigger:

```sql
create or replace function limite_admins_liga() returns trigger
language plpgsql security definer as $$
begin
  if new.rol = 'admin' and (
    select count(*) from miembros_liga
    where liga_id = new.liga_id and rol = 'admin'
  ) >= 2 then
    raise exception 'una liga admite como mucho 2 administradores';
  end if;
  return new;
end;
$$;

create trigger comprobar_limite_admins
before insert or update on miembros_liga
for each row execute function limite_admins_liga();
```

(Sintaxis orientativa — se revisa contra la documentación de Postgres/Supabase
del momento al implementarlo, no se toma como migración lista para correr.)

## 4. Arquitectura: dónde vive esto

| Opción | Modelo de datos | Auth incluida | Seguridad por fila | Coste base | Pega principal |
|---|---|---|---|---|---|
| **Supabase** (recomendado) | Postgres relacional | Sí (email, magic link, OAuth) | RLS nativa en el motor | Gratis hasta 500 MB / 5 GB egress; Pro $25/mes | El proyecto gratis se pausa tras 7 días sin actividad (se reactiva a mano, no se pierden datos) |
| **Firebase** | Firestore, documental/NoSQL | Sí (Firebase Auth) | Reglas de seguridad propias, no SQL | Gratis con cuotas diarias (50k lecturas/20k escrituras al día) | Consultas relacionales (ligas con miembros, rankings por liga) encajan peor en documentos que en filas con `JOIN` |
| **PocketBase autoalojado** | SQLite + API propia | Sí, integrada | Reglas propias por colección | El software es gratis, pero el hosting ya no: Railway y Fly.io quitaron sus capas gratuitas; solo Render mantiene una gratis (con *cold starts*) | Mantenimiento propio del servidor — actualizaciones, copias de seguridad, disponibilidad — recae en el usuario, no en un proveedor |
| **Backend propio** (Postgres + funciones serverless + Auth.js/Clerk) | El que se quiera | Hay que montarla o pagarla aparte | Hay que reimplementarla a mano en cada función | Variable, normalmente más barato a gran escala, no aquí | Más piezas que mantener seguras tú mismo — justo lo contrario de lo que pide "seguridad máxima" con poco esfuerzo |

**Recomendación: seguir con Supabase**, ya reservado por la ADR 0001, y
reforzado ahora por el propio alcance nuevo: ligas, membresías y rankings son
relaciones (quién pertenece a qué, quién jugó con quién) que encajan de forma
natural en tablas con claves foráneas, y `RLS` aplica el filtro de "quién
puede ver esta fila" dentro de la propia base de datos — no solo en el código
del cliente, que es justo la propiedad que pide "seguridad máxima contra
filtración de datos" (ver sección 5). El nivel gratis, con las cifras de más
abajo, es realista para un grupo de amigos jugando Commander durante años.

## 5. Seguridad: cómo se sostiene "seguridad máxima"

- **RLS para lectura/escritura de una fila; funciones `SECURITY DEFINER` para
  cualquier escritura que dependa de una regla que cruza varias filas.** El
  límite de 2 admins, "solo puedes invitar a quien ya es tu amigo aceptado",
  o "no se puede crear partida en una liga cerrada" no se pueden expresar de
  forma segura como una política RLS normal sobre un `INSERT` suelto del
  cliente (abren ventana a condiciones de carrera o a que el cliente se salte
  el paso intermedio). El patrón: el cliente nunca hace `insert into
  miembros_liga`, llama a una función `invitar_a_liga(liga_id, cuenta_id)`
  que comprueba las reglas y hace el `insert` por dentro, con permisos
  elevados solo dentro de esa función:

  ```sql
  create or replace function invitar_a_liga(p_liga_id uuid, p_cuenta_id uuid)
  returns void language plpgsql security definer as $$
  begin
    if not exists (select 1 from miembros_liga
                   where liga_id = p_liga_id and cuenta_id = auth.uid() and rol = 'admin')
    then raise exception 'solo un administrador de la liga puede invitar'; end if;

    if not exists (select 1 from amistades
                   where estado = 'aceptada'
                   and (solicitante_id, receptor_id) in
                       ((auth.uid(), p_cuenta_id), (p_cuenta_id, auth.uid())))
    then raise exception 'solo puedes invitar a amigos aceptados'; end if;

    insert into miembros_liga (liga_id, cuenta_id, rol, invitado_por)
    values (p_liga_id, p_cuenta_id, 'miembro', auth.uid());
  end;
  $$;
  ```

- **Sin buscador público de usuarios.** Si cualquiera puede buscar por nombre
  para mandar solicitud de amistad, existe un endpoint que enumera cuentas —
  el riesgo de filtración más típico en apps sociales pequeñas. Alternativa
  propuesta: cada cuenta tiene un código/enlace de invitación propio que
  comparte por fuera (WhatsApp, Discord...) para el *primer* contacto; a
  partir de ahí, invitar a una liga solo vale entre amigos ya aceptados (ver
  función de arriba) — la idea 2 (amistad) y la idea 1 (ligas) se apoyan la
  una en la otra para cerrar esta vía.
- **La clave `service_role` de Supabase nunca va en el cliente.** Solo la
  clave `anon`, que depende por completo de que RLS esté bien escrita en cada
  tabla — repasar con `select * from pg_policies` antes de dar cualquier
  tabla por terminada.
- **Autenticación de Supabase Auth, no propia.** Email/contraseña o enlace
  mágico, con posible OAuth (Google) más adelante — evita guardar y
  gestionar contraseñas a mano.
- **El token de sesión pasa a ser un dato sensible en el dispositivo.** La
  ADR 0005 ya lo señaló como su propio recordatorio: `@capacitor/preferences`
  no cifra, y eso era aceptable solo porque hoy no se guarda nada sensible.
  En cuanto exista un token de sesión de Supabase, esa ADR hay que
  revisarla y probablemente pasar ese valor concreto a
  `@capacitor-community/secure-storage` (o el equivalente que exista para
  entonces) — no todo el almacén, solo el token.
- **Ninguna estadística se acepta calculada desde el cliente.** Igual que hoy
  `calcularJugadores()` deriva siempre de las partidas guardadas y nunca al
  revés, en la nube tampoco se acepta un `pts`/`wr` que mande el cliente —
  se recalcula siempre desde `partida_asientos`. Ya no es solo un principio
  de diseño, es además una barrera de seguridad: ninguna cuenta puede
  mentir sobre su propio historial.
- **Copias de seguridad.** El nivel gratis de Supabase no incluye copias de
  seguridad gestionadas — la exportación local que ya existe
  (`registro/copiaSeguridad.ts`) sigue siendo la red de respaldo real del
  usuario mientras no se pague el nivel Pro (que sí las incluye).

## 6. Cómo encajan las cuatro ideas

1. **Ligas administradas** → `ligas` + `miembros_liga.rol`, con el límite de
   2 admins por trigger y las invitaciones por la función `invitar_a_liga`
   (solo admins, solo hacia amigos aceptados).
2. **Cuentas y amistad** → `cuentas` (1:1 con `auth.users`), `amistades` por
   solicitud/aceptación, `mazos` por cuenta con `enlace_externo` como campo
   de texto libre (sin scraping ni integración con la plataforma externa,
   solo el enlace). Las estadísticas globales de una cuenta son
   `calcularJugadores()` corriendo sobre todas sus `partida_asientos`, dentro
   o fuera de liga.
3. **Elegir liga o partida libre** → `partidas.liga_id` nullable. En la
   pantalla previa, un paso nuevo antes de repartir asientos: "¿liga o
   partida libre?"; si es de liga, la lista de perfiles seleccionables se
   filtra a los miembros de esa liga.
4. **Ajustes de liga** → `ligas.quien_crea_partidas` decide si crear partida
   dentro de esa liga pasa por una función `crear_partida_en_liga(...)` que
   comprueba admin-o-cualquiera y que la liga no esté `cerrada`; `nombre` y
   la lista de `miembros_liga` ya son visibles por RLS a cualquier miembro;
   `fecha_limite` queda como dato informativo del ajuste (ver la pregunta
   abierta sobre cierre automático, sección 9); el cierre lo dispara un admin
   y el podio es la clasificación ya explicada en la sección 3, sin tabla
   aparte.

## 7. Coste estimado

Con Supabase, en septiembre de 2026: el nivel gratis da 500 MB de base de
datos, 5 GB de salida (*egress*) al mes, 1 GB de almacenamiento de archivos y
hasta 50.000 usuarios activos al mes de Auth — sin coste y sin tarjeta. La
única pega real es que un proyecto gratis se pausa tras 7 días sin ninguna
consulta real a la base de datos (no basta con abrir el panel); se reactiva a
mano desde el propio panel sin perder datos, así que para una app que se usa
en noches de juego y puede quedarse callada entre medias, es una molestia
recuperable, no una pérdida. El nivel Pro son 25 $/mes y quita la pausa,
sube los límites y añade copias de seguridad gestionadas.

Para el tamaño esperado — un grupo de amigos y unas pocas ligas, partidas de
texto sin adjuntos (las imágenes de comandante siguen viviendo en Scryfall,
solo se guarda su id, igual que ya hace la Fase 4) — es muy improbable salir
del nivel gratis en mucho tiempo. Tiene sentido empezar ahí y pasar a Pro
solo si la pausa semanal molesta en la práctica o si en algún momento
importan las copias de seguridad gestionadas más que la exportación manual
que ya existe.

Como alternativa de "backend propio" más barata a más escala: los
proveedores que antes daban capa gratis para alojar un servidor pequeño
(Railway, Fly.io) ya no la dan — piden tarjeta desde el primer minuto; de los
habituales, solo Render mantiene un nivel gratis de verdad hoy, a cambio de
*cold starts* (el servidor se duerme y tarda unos segundos en despertar). Eso
hace más difícil defender un PocketBase autoalojado como "barato" frente al
nivel gratis de Supabase, que no pide tarjeta ni servidor propio que
mantener.

*Cifras consultadas en septiembre de 2026 vía búsqueda web; conviene
reconfirmarlas en el panel de precios de cada proveedor en el momento de
implementar esto, no dar este párrafo por definitivo dentro de mucho tiempo.*

## 8. Cómo trocear la Fase 6

1. Esquema base + Auth + RLS mínima: una cuenta ve y sincroniza solo lo suyo
   (el alcance original de la ADR 0001, sin ligas ni amigos todavía).
2. Vincular una cuenta a un dispositivo que ya tenía partidas/perfiles
   locales: fusión, no descarte — mismo principio que `migrarJuego`/
   `migrarPerfiles` ya aplican a formatos antiguos.
3. Amistades (solicitud/aceptación).
4. Ligas + membresía + roles + sus ajustes.
5. Partidas ligadas a una liga frente a partidas libres, con su visibilidad
   compartida entre miembros.
6. Cierre de liga y podio.
7. *(opcional, más adelante)* Tiempo real con Supabase Realtime, para ver a
   los demás jugando en directo — no hace falta para nada de lo pedido aquí;
   se deja fuera salvo que se pida explícitamente.

## 9. Lo que queda abierto a propósito

Preguntas que este esbozo no resuelve porque son del tipo que la propia
convención del proyecto pide decidir "al tomar la decisión", con su ADR,
no de antemano en una sesión de ideas:

- Email/contraseña, enlace mágico, OAuth de Google, o varios a la vez.
- El código de invitación al primer contacto (sección 5): ¿enlace corto,
  código de texto, o buscar por `@nombre_visible` exacto y con límite de
  peticiones?
- El límite de 2 admins por liga: ¿fijo en el código o configurable por
  liga?
- Cierre por `fecha_limite`: ¿automático (necesita un trabajo programado,
  p. ej. `pg_cron`) o siempre manual por un admin, con la fecha como dato
  informativo?
- Qué pasa exactamente al vincular cuenta si ya había partidas locales con
  nombres que no coinciden con ninguna cuenta (fusión con confirmación
  manual, dado que ya no hay id estable que los enlace — ver sección 2).
- Si el modo sin cuenta sigue existiendo indefinidamente en paralelo, o el
  online acaba siendo el único camino.

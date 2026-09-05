# 0022. El maná se vacía al pasar el turno, y se puede gastar tocándolo

Fecha: 2026-09-06
Estado: Aceptada

## Contexto

El propio `app.html` original nunca vaciaba el maná anotado al pasar de
turno — se quedaba acumulado hasta que alguien lo pusiera a cero a mano
desde el menú del asiento. El usuario señaló que eso no refleja la regla
real de Magic (500.4: el maná no usado desaparece de la reserva al final
de cada paso, no solo del turno), y pidió que se vaciara solo al pasar
turno; de paso, que tocar directamente la ficha de maná del asiento (no
solo el selector del menú) gastara un punto, para no tener que abrir el
menú cada vez que se gasta maná durante el turno.

## Decisión

- **`pasarTurno()` vacía el maná de *todos* los jugadores**, no solo el de
  quien pasa el turno — el maná de cualquiera desaparece en cuanto cambia
  de paso, no solo al final del propio turno de su dueño; vaciarlo de
  todos en el único punto donde ya se sabe que un turno ha terminado es la
  aproximación más simple que respeta el espíritu de la regla sin tener
  que modelar pasos y fases que esta app no rastrea.
- **`ajustarMana()` acepta un `delta`** (antes siempre sumaba 1): el menú
  de asiento lo sigue usando para sumar (`delta` por defecto, `1`), y la
  ficha de maná del propio asiento ahora es un botón que llama con
  `delta:-1`, sin bajar de cero.
- Es una decisión que **se aparta a propósito del comportamiento del
  original** (que nunca vaciaba nada): el pedido explícito era acercarse
  más a la regla real, no portar fielmente un comportamiento que el propio
  usuario identificó como incorrecto.

## Alternativas consideradas

- **Vaciar solo el maná de quien pasa el turno.** Se descarta: el maná de
  cualquier jugador desaparece en algún punto entre turno y turno por la
  regla real, no solo el de quien tiene el turno activo — vaciarlo de
  todos a la vez es más simple y más correcto que intentar rastrear de
  quién era "válido" seguir teniéndolo.
- **Un botón de restar aparte, junto al de sumar de cada color.** Se
  descarta frente a tocar la propia ficha: la ficha del asiento ya existe
  y ya muestra el número, así que convertirla en el propio control de
  gastar es un botón menos que aprender, no uno más.

## Consecuencias

- Verificado con una prueba del motor: dos jugadores con maná distinto
  puesto, pasar el turno y comprobar que a ambos les queda vacío.
- Cualquier función futura que dependa de que el maná "se conserve" entre
  turnos (no hay ninguna hoy) tendría que tenerlo en cuenta.

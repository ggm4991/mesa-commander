# Mesa Commander

Contador de vidas para partidas de Magic: The Gathering en formato Commander que,
al terminar, guarda la partida y mantiene una clasificación de la mesa.

## Abrirlo

Doble clic en `app.html`. No hay que instalar nada ni compilar nada: es un único
archivo con todo dentro y funciona sin conexión.

Para usarlo en el móvil, abre el archivo desde el navegador y añádelo a la pantalla
de inicio.

## Qué hace

**Durante la partida.** De uno a seis jugadores, con la mesa dispuesta como os
sentáis de verdad y cada asiento girado hacia su sitio. Vidas con pulsación larga,
daño de comandante que descuenta vida y elimina a los 21, contadores de infectar,
experiencia, energía, impuesto de comandante, tesoros, tormenta y maná. Monarca con
corona arrastrable, iniciativa, bendición de la ciudad, día y noche. Cronómetro por
turno con aviso en rojo el último minuto y alarma al pasarse. Dados, sorteo de quién
empieza y deshacer.

**Al terminar.** Eliges ganador o empate y la partida entra sola en el registro con
lo que la app ya sabe: el turno más largo de cada uno, las veces que se pasaron de
tiempo y las jugadas que retiraron.

**El registro.** Clasificación ordenable, ficha por jugador con buscador de partidas,
y alta, edición y borrado a mano.

## Datos

Todo se guarda en el navegador. Desde el enlace de copia de seguridad se exporta e
importa un único archivo JSON con partidas, perfiles y ajustes, con opción de
reemplazar todo o de combinar sin duplicar.

## Pruebas

```bash
npm test
```

Ver `CLAUDE.md` para la arquitectura y las convenciones del código.

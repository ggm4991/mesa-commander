# Verificación manual

Checklist viva de lo que ningún test automático cubre. Se revisa a mano en
navegador o dispositivo cada vez que una fase toca alguno de estos puntos —
no lleva fecha, se actualiza in-place. Continúa la práctica que ya seguía
`app.html` (su propio `CLAUDE.md` señalaba estos mismos puntos como "hay que
mirar a mano en el navegador").

- [ ] Aspecto visual general de cada pantalla.
- [ ] Rotación de asientos a 90° y 270° (usa `container-type:size` y unidades
      `cqw`/`cqh`; jsdom no las calcula de verdad, así que Testing Library no
      puede verificar esto).
- [ ] Arrastre real de la corona (monarca) con el dedo, no solo con ratón.
- [ ] Sonido y vibración de la alarma de turno.
- [ ] Instalación como PWA (manifiesto, icono, arranque a pantalla completa).
- [ ] Persistencia de datos tras matar la app y reabrirla.
- [ ] Comportamiento en modo avión (offline real, no solo DevTools).
- [ ] Actualización del service worker: que no sirva una versión obsoleta
      tras publicar un cambio.

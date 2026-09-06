import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// La versión de `package.json` y el instante del build quedan disponibles en
// la app (App.tsx los muestra junto al nombre) para poder comprobar a
// simple vista, después de instalar un `.apk` nuevo, si de verdad es una
// build distinta a la anterior — antes no había ninguna forma de saberlo
// (ver ADR 0036).
const version = JSON.parse(readFileSync('./package.json', 'utf-8')).version as string

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mesa Commander',
        short_name: 'Mesa Cmdr',
        description: 'Contador de vidas y registro de partidas de Magic: The Gathering Commander',
        lang: 'es',
        theme_color: '#221a2b',
        background_color: '#221a2b',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // El comandante (identidad, imagen) es lo único que pide red de verdad
        // en esta app (ver ADR 0012): cachearlo aquí, además de en TanStack
        // Query, es lo que permite volver a abrir la app sin conexión y seguir
        // viendo las ilustraciones ya consultadas, no solo mientras dura la
        // sesión en memoria.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.scryfall\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'scryfall-api',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/cards\.scryfall\.io\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'scryfall-imagenes',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})

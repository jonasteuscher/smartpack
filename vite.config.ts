import { defineConfig } from 'vite';
import { fileURLToPath } from "url";
import { URL } from "url";
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

const APP_NAME = 'SmartPack';
const APP_SHORT_NAME = 'SmartPack';
const APP_DESCRIPTION = 'SmartPack creates your individual packing list – based on destination, weather, activities and travel details.';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'img/logo/Logo_500x500.PNG',
        'img/logo/Logo_500x350_Emblem.PNG'
      ],
      devOptions: {
        enabled: true,
        type: 'module'
      },
      strategies: 'generateSW',
      filename: 'service-worker.js',
      manifest: {
        name: APP_NAME,
        short_name: APP_SHORT_NAME,
        description: APP_DESCRIPTION,
        theme_color: '#05FF88',
        background_color: '#111827',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'de',
        categories: ['travel', 'productivity'],
        icons: [
          {
            src: 'img/logo/Logo_500x500.PNG',
            sizes: '500x500',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'img/logo/Logo_500x350_Emblem.PNG',
            sizes: '350x350',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        cleanupOutdatedCaches: true,
        importScripts: ['sw-additional.js']
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@context': fileURLToPath(new URL('./src/context', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url))
    }
  },
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: 4173
  }
});

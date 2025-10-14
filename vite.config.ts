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
      includeAssets: ['img/logo/Logo_500x500.PNG'],
      manifest: {
        name: APP_NAME,
        short_name: APP_SHORT_NAME,
        description: APP_DESCRIPTION,
        theme_color: '#05FF88',
        background_color: '#111827',
        display: 'standalone',
        start_url: '/dashboard',
        scope: '/dashboard',
        lang: 'de',
        categories: ['travel', 'productivity'],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
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

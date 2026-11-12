import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg'],
    manifest: {
      name: 'Sugamuxi Ecoturismo', short_name: 'Sugamuxi', description: 'Marketplace de ecoturismo',
      theme_color: '#14532d', background_color: '#f0fdf4', display: 'standalone', start_url: '/',
      icons: [{ src: '/pwa-192.svg', sizes: '192x192', type: 'image/svg+xml' }, { src: '/pwa-512.svg', sizes: '512x512', type: 'image/svg+xml' }]
    }, workbox: { globPatterns: ['**/*.{js,css,html,svg,png}'], navigateFallback: '/index.html' }
  })],
  resolve: { alias: { '@': '/src' } },
  server: { port: 5173, host: '0.0.0.0', proxy: { '/api': 'http://backend:8000', '/media': 'http://backend:8000' } }
});

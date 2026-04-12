import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  plugins: [
    react(),
    // Only enable PWA service worker in production — it causes caching
    // issues during development, especially on iOS standalone mode.
    ...(mode === 'production'
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            manifest: false,
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            },
          }),
        ]
      : []),
  ],
  server: {
    port: 5173,
    host: true,
    // Allow phone on local network to connect to HMR websocket
    hmr: {
      host: '192.168.1.167',
    },
  },
}));

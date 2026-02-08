import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'lovable-uploads/ec1d44df-3c96-417c-a521-760d8a0e4f29.png'],
      manifest: {
        name: 'Axenro - Personal Health Tracker',
        short_name: 'Axenro',
        description: 'Track your fitness journey with precision. Monitor nutrition, log workouts, and visualize your progress.',
        theme_color: '#3b82f6',
        background_color: '#0a0f1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/lovable-uploads/ec1d44df-3c96-417c-a521-760d8a0e4f29.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/ec1d44df-3c96-417c-a521-760d8a0e4f29.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/ec1d44df-3c96-417c-a521-760d8a0e4f29.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

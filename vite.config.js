import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // явно указываем корень проекта
  publicDir: 'public', // говорим Vite, где искать index.html и статику
  build: {
    outDir: 'dist', // куда собирать проект
  },
  server: {
    proxy: {
      '/feed.xml': {
        target: 'https://example.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/feed.xml/, '/feed.xml'),
      },
    },
  },
});
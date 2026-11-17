import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// "base" precisa ser o nome do repositório, porque o GitHub Pages
// publica o site em https://imnotjean01.github.io/Minhas-financas/
export default defineConfig({
  plugins: [react()],
  base: '/Minhas-financas/',
  server: {
    port: 5173,
    open: true,
  },
});

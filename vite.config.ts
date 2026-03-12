import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'playground',
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    rollupOptions: {
      external: ['react-markdown']
    }
  }
});

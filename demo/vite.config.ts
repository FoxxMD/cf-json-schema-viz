import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'cf-json-schema-viz': path.resolve(__dirname, '../src'),
      'cf-json-schema-viz/styles.css': path.resolve(__dirname, '../src/styles.css'),
      // Replace lodash with lodash-es to avoid CJS require() calls
      'lodash': 'lodash-es',
    },
  },
  optimizeDeps: {
    include: ['@stoplight/json-schema-tree', '@stoplight/json'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});

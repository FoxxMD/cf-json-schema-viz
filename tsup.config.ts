import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],

  treeshake: true,
  sourcemap: true,
  onSuccess: async () => {
    // Copy CSS file to dist
    copyFileSync('src/styles.css', 'dist/styles.css');
    console.log('Copied styles.css to dist/');
  },
});

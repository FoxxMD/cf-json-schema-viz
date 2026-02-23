import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2020',
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  onSuccess: async () => {
    // Copy CSS file to dist - exported separately for consumers to import
    copyFileSync('src/styles.css', 'dist/styles.css');
  },
});

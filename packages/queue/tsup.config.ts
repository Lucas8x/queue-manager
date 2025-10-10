import { defineConfig } from 'tsup';

export default defineConfig({
  target: 'esnext',
  clean: true,
  minify: true,
  format: ['esm'],
  outDir: './dist/',
  dts: true,
});

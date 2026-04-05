import { defineConfig } from 'vite';
import { resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  plugins: [angular({ tsconfig: resolve(__dirname, 'tsconfig.app.json') })],
  server: {
    port: 5200
  },
  publicDir: resolve(__dirname, 'public')
});

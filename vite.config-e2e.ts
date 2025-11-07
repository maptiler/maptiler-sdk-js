import { defineConfig } from 'vite';
import packagejson from './package.json';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        mapLoad: 'public/mapLoad.html',
      },
    },
  },
  root: './e2e',
  resolve: {
    alias: {
      '@maptiler/sdk': '../src',
      '@maptiler/sdk/dist/maptiler-sdk.css': '../dist/maptiler-sdk.css',
    },
  },
  define: {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
    __MT_NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
  },
});

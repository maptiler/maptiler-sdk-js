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
  define: {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
    __MT_NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
  },
});

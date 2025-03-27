import { defineConfig } from "vitest/config";
import packagejson from "./package.json";

export default defineConfig({
  server: {
    port: 3000,
  },
  define: {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
  },
  plugins: [
    {
      name: 'url-override',
      /**
       * Changing logged URLs to include the path to the demo directory.
       */
      configureServer: (server) => {
        const printUrls = server.printUrls;

        server.printUrls = () => {
          if (server.resolvedUrls !== null) {
            for (const [key, value] of Object.entries(server.resolvedUrls)) {
              for (let i = 0; i < value.length; i++) {
                server.resolvedUrls[key][i] += "demos/index.html";
              }
            }
          }

          printUrls();
        }
      }
    }
  ],
});

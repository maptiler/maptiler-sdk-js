import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    port: 3000,
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

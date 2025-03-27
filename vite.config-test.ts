import { defineConfig } from "vitest/config";
import packagejson from "./package.json";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    typecheck: {
      tsconfig: "./tsconfig.json",
    },
    // environment: "jsdom",
    globals: true,
    setupFiles: ["@vitest/web-worker", "./vitest-setup-tests.ts"],
  },
  define: {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
  },
});

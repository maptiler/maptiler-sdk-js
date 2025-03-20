import { defineConfig } from "vitest/config";

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
});

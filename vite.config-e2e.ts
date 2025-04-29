import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        mapLoad: "public/mapLoad.html",
        animatedRoutLayer: "public/animatedRouteLayer.html",
      },
    },
  },
  root: "./e2e",
});

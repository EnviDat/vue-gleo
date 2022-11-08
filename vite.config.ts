import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [
    vue({
      reactivityTransform: true,
    }),
  ],
  server: {
    host: true,
    port: 3001,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@gleo": path.resolve(__dirname, "../gleo/src"),
    },
  },
});

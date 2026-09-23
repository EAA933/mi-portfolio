import { defineConfig } from "vite";

// Configuración con soporte nativo de JSX vía esbuild
export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    target: "es2020",
    sourcemap: false,
    assetsInlineLimit: 0,
  },
});

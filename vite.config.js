import { defineConfig } from "vite";

// Configuración mínima. Root = esta carpeta; el punto de entrada es index.html,
// que carga /src/main.js como módulo. base "./" permite desplegar en cualquier
// subruta (Vercel/Netlify/estático) sin romper las rutas de los assets.
export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    sourcemap: false,
    // Los assets pesados (texturas) se cargarán en diferido en fases posteriores.
    assetsInlineLimit: 0,
  },
  server: {
    open: true,
  },
});

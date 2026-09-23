/**
 * router.js — ruteo por hash (#slug-del-proyecto)
 * ------------------------------------------------------------------
 * Permite abrir un proyecto por URL directa y que el botón "atrás" del
 * navegador cierre el caso de estudio. Mínimo y sin dependencias.
 * ------------------------------------------------------------------
 */
export const router = {
  slug() {
    return decodeURIComponent((location.hash || "").replace(/^#/, "")) || null;
  },
  // Empuja un nuevo estado (crea entrada en el historial → "atrás" funciona).
  abrir(slug) {
    if (this.slug() !== slug) history.pushState({ slug }, "", `#${slug}`);
  },
  // Vuelve al estado sin hash.
  cerrar() {
    if (this.slug()) history.pushState({ slug: null }, "", location.pathname + location.search);
  },
  // Escucha cambios (incluye botón atrás/adelante).
  alCambiar(cb) {
    window.addEventListener("popstate", () => cb(this.slug()));
    window.addEventListener("hashchange", () => cb(this.slug()));
  },
};

export default router;

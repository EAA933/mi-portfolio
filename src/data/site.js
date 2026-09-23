/**
 * site.js — IDENTIDAD Y METADATOS DEL SITIO (fuente única)
 * ------------------------------------------------------------------
 * De aquí leen: el hero, el preloader, el CTA final de la galaxia,
 * el footer y los meta tags (SEO + Open Graph). Cambiar un dato aquí
 * lo cambia en todo el sitio.
 * ------------------------------------------------------------------
 */

export const site = {
  autor: {
    nombre: "Eduardo Aranda Arteaga",
    iniciales: "EAA",                     // preloader / favicon
    rol: "Desarrollador de producto y web",
    // Se muestra en el hero bajo el nombre y en el CTA final:
    lema: "Construyo cosas que la gente usa.",
    ubicacion: "México",
  },

  contacto: {
    email: "earandaa933@gmail.com",
    github: "https://github.com/EAA933",
    linkedin: "https://www.linkedin.com/in/eduardoaranda-risk/",
  },

  // Metadatos para <head>: SEO + Open Graph + favicon.
  meta: {
    titulo: "Eduardo Aranda — Portafolio",
    descripcion:
      "Desarrollador de producto y web. Un viaje por mis proyectos: sitios, " +
      "herramientas y automatizaciones nacidas de problemas reales.",
    url: "https://eduardoaranda.dev",        // TODO: dominio final (Vercel/Netlify o propio)
    ogImage: "/og.jpg",                       // TODO: generar imagen de preview 1200x630
    idioma: "es",
    autor: "Eduardo Aranda Arteaga",
  },
};

export default site;

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
    rol: "Full Stack Engineer · Web 3D & Automatizaciones con IA",
    // Se muestra en el hero bajo el nombre y en el CTA final:
    lema: "Transformo procesos manuales y costosos en plataformas web ultra-rápidas y automatizaciones que multiplican resultados.",
    ubicacion: "México",
  },

  contacto: {
    email: "earandaa933@gmail.com",
    github: "https://github.com/EAA933",
    linkedin: "https://www.linkedin.com/in/eduardoaranda-risk/",
    // Access key de Web3Forms (https://web3forms.com): los mensajes del
    // formulario llegan a tu correo. Es pública por diseño (va en el
    // cliente). Si queda vacía, el formulario abre el cliente de correo.
    web3formsKey: "",
  },

  // Metadatos para <head>: SEO + Open Graph + favicon.
  meta: {
    titulo: "Eduardo Aranda — Full Stack & Automatizaciones con IA",
    descripcion:
      "Full Stack Engineer. Desarrollo plataformas web de alto rendimiento (Three.js/Cloudflare) y flujos de automatización e IA que ahorran tiempo y costos a empresas.",
    url: "https://eduardoaranda.dev",        // TODO: dominio final (Vercel/Netlify o propio)
    ogImage: "/og.jpg",
    idioma: "es",
    autor: "Eduardo Aranda Arteaga",
  },
};

export default site;

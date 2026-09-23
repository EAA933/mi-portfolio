/**
 * grid.js — Vista rápida (modo reclutador)
 * ------------------------------------------------------------------
 * Cuadrícula estilo apple.com con una tarjeta por proyecto + bloque
 * "Sobre mí" con CV. Es también el modo por defecto cuando no hay WebGL
 * o hay prefers-reduced-motion. Todo es DOM: usable en <1s, sin 3D.
 * ------------------------------------------------------------------
 */
export function crearGrid(projects, site) {
  const cont = document.createElement("div");
  cont.id = "vista-rapida";
  cont.setAttribute("data-lenis-prevent", ""); // scroll nativo del overlay (Lenis lo ignora)

  const tarjetas = projects
    .map((p) => {
      const cat = p.categoria === "automatizacion" ? "Automatización" : "Web";
      const chips = (p.stack || []).slice(0, 4).map((s) => `<span>${s}</span>`).join("");
      const links = [];
      if (p.links?.sitio) links.push(`<a href="${p.links.sitio}" target="_blank" rel="noopener">Ver sitio ↗</a>`);
      if (p.links?.codigo) links.push(`<a href="${p.links.codigo}" target="_blank" rel="noopener">Código ↗</a>`);
      if (!links.length) {
        links.push(`<a href="mailto:${site.contacto.email}?subject=${encodeURIComponent(`Consulta de proyecto similar a ${p.nombre}`)}">Cotizar similar →</a>`);
      }
      const cap = p.capturas?.[0];
      return `
        <article class="vr-card" style="--acc:${p.planeta?.acento || "#8899aa"}">
          <div class="shot"${cap ? ` style="background-image:url('${cap}');background-size:cover;background-position:top center"` : ""}>${cap ? "" : p.nombre}</div>
          <div class="cuerpo">
            <div class="cat">${cat}</div>
            <h3>${p.nombre}</h3>
            <p>${p.tagline || p.descripcion || ""}</p>
            <div class="chips">${chips}</div>
            ${links.length ? `<div class="links">${links.join("")}</div>` : ""}
          </div>
        </article>`;
    })
    .join("");

  cont.innerHTML = `
    <div class="vr-wrap">
      <div class="vr-head">
        <h1>Proyectos</h1>
        <p>${site.meta.descripcion}</p>
      </div>
      <div class="vr-grid">${tarjetas}</div>

      <div class="vr-about">
        <div class="foto">${site.autor.iniciales}</div>
        <div>
          <h2>${site.autor.nombre}</h2>
          <p style="color:var(--accent);font-weight:600;margin-bottom:8px">⚡ Disponible para desarrollo freelance y proyectos de alto impacto</p>
          <p>${site.autor.rol}. Ayudo a empresas y fundadores a convertir procesos lentos y costosos en plataformas web ultra-rápidas, tableros de decisión y flujos de automatización con IA. Trabajo extremo a extremo: arquitectura cloud edge, frontend interactivo y backend de datos.</p>
          <div class="acciones">
            <a class="btn btn-primario" href="mailto:${site.contacto.email}">Hablemos</a>
            <a class="btn btn-secundario" href="${site.contacto.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
            <a class="btn btn-secundario" href="${site.contacto.github}" target="_blank" rel="noopener">GitHub ↗</a>
            <a class="btn btn-secundario" href="${import.meta.env.BASE_URL}cv.pdf" download>Descargar CV</a>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(cont);

  return { el: cont };
}

export default crearGrid;

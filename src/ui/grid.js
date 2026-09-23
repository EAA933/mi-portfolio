/**
 * grid.js — Vista rápida (modo reclutador)
 * ------------------------------------------------------------------
 * Cuadrícula estilo apple.com con una tarjeta por proyecto + bloque
 * "Sobre mí" con CV. Es también el modo por defecto cuando no hay WebGL
 * o hay prefers-reduced-motion. Todo es DOM: usable en <1s, sin 3D.
 * ------------------------------------------------------------------
 */
export function crearGrid(projects, site, onAbrirCaso) {
  const cont = document.createElement("div");
  cont.id = "vista-rapida";
  cont.setAttribute("data-lenis-prevent", ""); // scroll nativo del overlay (Lenis lo ignora)

  const tarjetas = projects
    .map((p, i) => {
      const cat = p.categoria === "automatizacion" ? "Automatización" : "Web";
      const chips = (p.stack || []).slice(0, 4).map((s) => `<span>${s}</span>`).join("");
      const links = [];
      const btnTexto = p.storytelling ? "🌱 Ver caso & storytelling ↗" : "📊 Ver caso y métricas ↗";
      links.push(`<button type="button" class="btn-vr-caso" data-indice="${i}" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#fff;border-radius:999px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;">${btnTexto}</button>`);
      if (p.links?.sitio) links.push(`<a href="${p.links.sitio}" target="_blank" rel="noopener">Ver sitio ↗</a>`);
      if (p.links?.codigo) links.push(`<a href="${p.links.codigo}" target="_blank" rel="noopener">Código ↗</a>`);
      const cap = p.capturas?.[0];
      return `
        <article class="vr-card" data-stagger="${i % 3}" style="--acc:${p.planeta?.acento || "#8899aa"}">
          <div class="shot"${cap ? ` style="background-image:url('${cap}');background-size:cover;background-position:top center"` : ""}>${cap ? "" : p.nombre}</div>
          <div class="cuerpo">
            <div class="cat">${cat}</div>
            <h3>${p.nombre}</h3>
            <p>${p.tagline || p.descripcion || ""}</p>
            ${p.eficiencia ? `
              <div class="vr-eficiencia" style="display:flex;align-items:center;gap:6px;margin:8px 0;font-size:11.5px;color:#94a3b8;background:rgba(255,255,255,0.03);padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">
                <span style="color:var(--acc);font-weight:700;">⚡ Eficiencia:</span>
                <span style="color:#fff;font-weight:600;">${p.eficiencia.resumen.porcentaje}</span>
                <span>•</span>
                <span style="color:#34d399;">${p.eficiencia.resumen.impacto}</span>
              </div>
            ` : p.storytelling ? `
              <div class="vr-eficiencia" style="display:flex;align-items:center;gap:6px;margin:8px 0;font-size:11.5px;color:#94a3b8;background:rgba(255,255,255,0.03);padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">
                <span style="color:var(--acc);font-weight:700;">🌱 Impacto:</span>
                <span style="color:#fff;font-weight:600;">+1,000 visitas/mes</span>
                <span>•</span>
                <span style="color:#22c55e;">#1 en Google</span>
              </div>
            ` : ""}
            <div class="chips">${chips}</div>
            ${links.length ? `<div class="links">${links.join("")}</div>` : ""}
          </div>
        </article>`;
    })
    .join("");

  cont.innerHTML = `
    <div class="vr-wrap">
      <header class="vr-head">
        <h1>Proyectos</h1>
        <p>${site.meta.descripcion}</p>
      </header>
      <div class="vr-grid">${tarjetas}</div>

      <section class="vr-about">
        <div class="foto">${site.autor.iniciales}</div>
        <div>
          <h2>${site.autor.nombre}</h2>
          <p style="color:var(--accent);font-weight:600;margin-bottom:8px">⚡ Disponible para desarrollo freelance y proyectos de alto impacto</p>
          <p>${site.autor.rol}. Ayudo a empresas y fundadores a convertir procesos lentos y costosos en plataformas web ultra-rápidas, tableros de decisión y flujos de automatización con IA. Trabajo extremo a extremo: arquitectura cloud edge, frontend interactivo y backend de datos.</p>
          <div class="acciones">
            <button type="button" class="btn btn-primario btn-trigger-contacto">Iniciar Proyecto / Contactar →</button>
            <a class="btn btn-secundario" href="${site.contacto.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
            <a class="btn btn-secundario" href="${site.contacto.github}" target="_blank" rel="noopener">GitHub ↗</a>
            <a class="btn btn-secundario" href="${import.meta.env.BASE_URL}cv.pdf" download>Descargar CV</a>
          </div>
        </div>
      </section>
    </div>
  `;
  document.body.appendChild(cont);

  // Animaciones suaves de entrada (fade-in / slide-up) al hacer scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revelado");
        }
      });
    },
    {
      root: cont,
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.1,
    }
  );

  const elementosAnimables = cont.querySelectorAll(".vr-head, .vr-card, .vr-about");
  elementosAnimables.forEach((el) => observer.observe(el));

  cont.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-vr-caso");
    if (btn && onAbrirCaso) {
      const idx = parseInt(btn.dataset.indice, 10);
      onAbrirCaso(idx);
    }
  });

  return {
    el: cont,
    activar: () => {
      // Dispara la revelación de los elementos en el viewport inicial
      requestAnimationFrame(() => {
        elementosAnimables.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add("revelado");
          }
        });
      });
    },
  };
}

export default crearGrid;

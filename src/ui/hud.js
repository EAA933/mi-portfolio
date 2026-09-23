/**
 * hud.js — capa de interfaz (Fase 3)
 * ------------------------------------------------------------------
 * Dos piezas:
 *   1) Panel de órbita: tarjeta de vidrio que aparece a un costado
 *      cuando la nave está en la órbita de un planeta.
 *   2) HUD del caso de estudio: overlay a pantalla completa con
 *      Reto → Solución → Resultado, métricas, galería y enlaces.
 * Construye el DOM una vez y lo re-llena por proyecto.
 * ------------------------------------------------------------------
 */
import { gsap } from "gsap";
import { montarGraficoEficiencia } from "../components/EfficiencyChart.jsx";

const EASE = "power3.out";

function el(tag, clase, html) {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (html != null) n.innerHTML = html;
  return n;
}

export function crearHUD() {
  // ── Panel de órbita ───────────────────────────────────────────
  const panel = el("aside", "");
  panel.id = "panel-orbita";
  panel.setAttribute("aria-hidden", "true");
  document.body.appendChild(panel);

  // ── HUD del caso de estudio ───────────────────────────────────
  const hud = el("div", "");
  hud.id = "hud";
  hud.setAttribute("role", "dialog");
  hud.setAttribute("aria-modal", "true");
  hud.setAttribute("data-lenis-prevent", ""); // scroll interno nativo (Lenis lo ignora)
  const cerrarBtn = el("button", "btn btn-secundario cerrar", "← Volver a órbita");
  const wrap = el("div", "hud-wrap");
  hud.appendChild(cerrarBtn);
  hud.appendChild(wrap);
  document.body.appendChild(hud);

  let onCerrarActual = null;
  let animPanel = null;
  let reactRootActual = null;

  function aplicarAcento(proyecto) {
    const acc = proyecto.planeta?.acento || "#d8a94b";
    document.documentElement.style.setProperty("--accent", acc);
  }

  // ── Panel de órbita ───────────────────────────────────────────
  function mostrarPanel(proyecto, lado, onExplorar) {
    aplicarAcento(proyecto);
    panel.className = lado === "der" ? "lado-der" : "lado-izq";

    const metricas = (proyecto.metricas || [])
      .slice(0, 3)
      .map((m) => `<div class="m"><b>${m.valor}</b><span>${m.etiqueta}</span></div>`)
      .join("");

    panel.innerHTML = `
      <div class="eyebrow">${proyecto.categoria === "automatizacion" ? "Automatización" : "Web"}</div>
      <h2>${proyecto.nombre}</h2>
      <p class="tagline">${proyecto.tagline || ""}</p>
      <div class="chips">${(proyecto.stack || []).slice(0, 5).map((s) => `<span>${s}</span>`).join("")}</div>
      <div class="metricas">${metricas}</div>
      <button class="btn btn-primario" data-explorar>Explorar →</button>
    `;
    panel.querySelector("[data-explorar]").addEventListener("click", () => onExplorar(proyecto));

    // Aparición por CSS (clase .visible) — robusta ante el throttle del rAF.
    panel.className = lado === "der" ? "lado-der" : "lado-izq";
    // Forzamos un reflow para que la transición corra desde el estado base.
    void panel.offsetWidth;
    panel.classList.add("visible");
    panel.setAttribute("aria-hidden", "false");
  }

  function ocultarPanel() {
    if (!panel.classList.contains("visible")) return;
    panel.classList.remove("visible");
    panel.setAttribute("aria-hidden", "true");
  }

  // ── HUD del caso de estudio ───────────────────────────────────
  function abrirCaso(proyecto, onCerrar) {
    aplicarAcento(proyecto);
    onCerrarActual = onCerrar || null;

    const cap0 = proyecto.capturas?.[0];
    const cap1 = proyecto.capturas?.[1];

    const metricas = (proyecto.metricas || [])
      .map((m) => `<div class="m"><b>${m.valor}</b><span>${m.etiqueta}</span></div>`)
      .join("");

    const acciones = [];
    if (proyecto.links?.sitio)
      acciones.push(`<a class="btn btn-primario" href="${proyecto.links.sitio}" target="_blank" rel="noopener">Ver sitio ↗</a>`);
    if (proyecto.links?.codigo)
      acciones.push(`<a class="btn btn-secundario" href="${proyecto.links.codigo}" target="_blank" rel="noopener">Ver código ↗</a>`);

    wrap.innerHTML = `
      <header class="hud-header hud-reveal">
        <div class="eyebrow">${proyecto.categoria === "automatizacion" ? "Automatización" : "Sitio web"}</div>
        <h1>${proyecto.nombre}</h1>
        <p class="tagline">${proyecto.tagline || ""}</p>
      </header>
      <div class="metricas hud-reveal">${metricas}</div>
      <div class="galeria hud-reveal">
        <div class="dispositivo mac"><div class="barra"><i></i><i></i><i></i></div>
          <div class="pantalla"${cap0 ? ` style="background-image:url('${cap0}')"` : ""}>${cap0 ? "" : proyecto.nombre}</div></div>
        <div class="dispositivo phone">
          <div class="pantalla"${cap1 ? ` style="background-image:url('${cap1}')"` : ""}>${cap1 ? "" : proyecto.nombre}</div></div>
      </div>
      <section class="bloque hud-reveal"><h3>Reto</h3><p>${proyecto.reto || ""}</p></section>
      <section class="bloque hud-reveal"><h3>Solución</h3><p>${proyecto.solucion || ""}</p></section>
      <section class="bloque hud-reveal"><h3>Resultado</h3><p>${proyecto.resultado || ""}</p></section>

      <!-- Gráfico interactivo Recharts: Eficiencia Operativa -->
      <section class="bloque bloque-eficiencia hud-reveal">
        <div id="hud-eficiencia-container"></div>
      </section>

      <div class="chips hud-reveal">${(proyecto.stack || []).map((s) => `<span>${s}</span>`).join("")}</div>
      ${acciones.length ? `<div class="acciones hud-reveal">${acciones.join("")}</div>` : ""}

      <div class="hud-conversion-card hud-reveal">
        <span class="hcc-tag">💼 Consultoría &amp; Desarrollo Freelance</span>
        <h3>¿Tienes un reto similar en tu negocio?</h3>
        <p>Desarrollo soluciones a la medida con arquitectura robusta: desde plataformas web modernas con costo de operación nulo hasta automatizaciones con IA que reducen días de carga manual a solo minutos.</p>
        <div class="hcc-actions">
          <button type="button" class="btn btn-primario btn-trigger-contacto" data-tipo="${proyecto.categoria === 'automatizacion' ? 'Automatización con IA' : 'Plataforma Web / 3D'}" data-mensaje="Hola Eduardo, estuve viendo el caso de estudio de &quot;${proyecto.nombre}&quot; y me interesa desarrollar una solución con requerimientos similares.">Cotizar solución similar →</button>
          <a class="btn btn-secundario" href="https://www.linkedin.com/in/eduardoaranda-risk/" target="_blank" rel="noopener">Conectar en LinkedIn ↗</a>
        </div>
      </div>
    `;

    // Montar el gráfico interactivo con Recharts
    if (reactRootActual) {
      try { reactRootActual.unmount(); } catch (e) {}
      reactRootActual = null;
    }
    const efContainer = wrap.querySelector("#hud-eficiencia-container");
    if (efContainer && proyecto.eficiencia) {
      reactRootActual = montarGraficoEficiencia(efContainer, proyecto);
    }

    // Animación suave de entrada (fade-in / slide-up) para cada bloque al hacer scroll
    const hudObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revelado");
          }
        });
      },
      {
        root: hud,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.1,
      }
    );

    wrap.querySelectorAll(".hud-reveal").forEach((elem) => {
      hudObserver.observe(elem);
    });

    // La aparición del contenedor y el contenido se hace por CSS
    // (.activo), robusto ante el throttle del requestAnimationFrame.
    hud.scrollTop = 0;
    hud.classList.add("activo");
    document.body.classList.add("enfoque-hud");
  }

  function cerrarCaso() {
    if (!hud.classList.contains("activo")) return;
    const cb = onCerrarActual;
    onCerrarActual = null;
    if (reactRootActual) {
      try { reactRootActual.unmount(); } catch (e) {}
      reactRootActual = null;
    }
    hud.classList.remove("activo");
    document.body.classList.remove("enfoque-hud");
    setTimeout(() => { if (cb) cb(); }, 480);
  }

  const api = {
    mostrarPanel,
    ocultarPanel,
    abrirCaso,
    cerrarCaso,
    estaAbierto: () => hud.classList.contains("activo"),
    // main.js puede sobreescribir esto para enrutar el cierre por el
    // historial (botón atrás). Por defecto solo cierra el HUD.
    pedirCerrar: () => cerrarCaso(),
  };
  // El botón "Volver a órbita" pide el cierre por el camino de main.
  cerrarBtn.addEventListener("click", () => api.pedirCerrar());
  return api;
}

export default crearHUD;

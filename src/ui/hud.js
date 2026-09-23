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
  let hudObserver = null;

  function aplicarAcento(proyecto) {
    const acc = proyecto.planeta?.acento || "#d8a94b";
    document.documentElement.style.setProperty("--accent", acc);
  }

  // ── Panel de órbita ───────────────────────────────────────────
  function mostrarPanel(proyecto, lado, onExplorar) {
    aplicarAcento(proyecto);
    panel.className = lado === "der" ? "lado-der" : "lado-izq";

    const esHuerto = proyecto.planeta?.tipo === "huerto";
    panel.classList.toggle("tema-huerto-orbita", esHuerto);

    const eyebrowTxt = esHuerto
      ? "🌿 PROYECTO AGRÍCOLA • HUERTO DE HORTALIZAS"
      : proyecto.tema === "hospital"
      ? "🩺 Salud digital · Web"
      : proyecto.categoria === "automatizacion"
      ? "Automatización"
      : "Web";

    const tituloPanel = esHuerto
      ? `Cosecha <span class="cosecha-serif-accent" style="font-size:32px;">Hidalguense</span>`
      : proyecto.nombre;

    const metricas = (proyecto.metricas || [])
      .slice(0, 3)
      .map((m) => `<div class="m"><b>${m.valor}</b><span>${m.etiqueta}</span></div>`)
      .join("");

    panel.innerHTML = `
      <div class="eyebrow">${eyebrowTxt}</div>
      <h2>${tituloPanel}</h2>
      <p class="tagline">${proyecto.tagline || ""}</p>
      <div class="chips">${(proyecto.stack || []).slice(0, 5).map((s) => `<span>${s}</span>`).join("")}</div>
      <div class="metricas">${metricas}</div>
      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
        <button class="btn btn-primario ${esHuerto ? 'btn-huerto-explorar' : ''}" data-explorar>${esHuerto ? "🌿 Conocer huerto & verduras →" : "Explorar caso →"}</button>
        <button type="button" class="btn btn-secundario btn-orbita-360 ${esHuerto ? 'btn-huerto-360' : ''}" title="${esHuerto ? 'Recorrido 360° por el huerto y parcelas' : 'Inspección libre 360°'}">${esHuerto ? '🌿 Huerto 360°' : '🪐 Vista 360°'}</button>
      </div>
    `;
    panel.querySelector("[data-explorar]").addEventListener("click", () => onExplorar(proyecto));
    panel.querySelector(".btn-orbita-360")?.addEventListener("click", () => {
      if (api.onPedirInspeccion360) api.onPedirInspeccion360(proyecto);
    });

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

  // ── Helper para renderizar proyectos con Storytelling enriquecido ───
  function renderStorytellingHTML(proyecto, cap0, cap1) {
    const st = proyecto.storytelling;

    // Si tiene el nuevo formato estructurado de Cosecha Hidalguense (El Reto, Flujos, La Solución, Impacto)
    if (st.reto && st.flujos && st.solucion) {
      const reto = st.reto;
      const flujos = st.flujos;
      const solucion = st.solucion;
      const impacto = st.impacto;

      // 1. Puntos de dolor del reto
      const puntosDolorHTML = (reto.puntosDolor || [])
        .map(
          (p, idx) => `
          <div class="story-reto-card hud-reveal" data-stagger="${idx % 3}">
            <span class="story-reto-icon">${p.icono}</span>
            <h5>${p.titulo}</h5>
            <p>${p.desc}</p>
          </div>`
        )
        .join("");

      // 2. Diagramas de Flujo
      const primerDiagrama = flujos.diagramas?.[0];
      const tabsDiagramaHTML = (flujos.diagramas || [])
        .map(
          (d, idx) => `
          <button type="button" class="diagrama-tab ${idx === 0 ? "activo" : ""}" data-diagrama="${d.id}">
            ${d.titulo}
          </button>`
        )
        .join("");

      const pasosPrimerDiagramaHTML = (primerDiagrama?.pasos || [])
        .map(
          (p) => `
          <div class="diagrama-nodo" data-paso="${p.paso}">
            <div class="diagrama-step-badge">${p.paso}</div>
            <div class="diagrama-nodo-body">
              <h6>${p.titulo}</h6>
              <p>${p.desc}</p>
            </div>
            <div class="diagrama-nodo-tech">${p.tech}</div>
          </div>`
        )
        .join("");

      // 3. Pilares de la Solución
      const pilaresSolucionHTML = (solucion.pilares || [])
        .map(
          (p, idx) => `
          <div class="story-solucion-card hud-reveal" data-stagger="${idx % 4}">
            <span class="story-solucion-icon">${p.icono}</span>
            <h5>${p.titulo}</h5>
            <p>${p.desc}</p>
          </div>`
        )
        .join("");

      const kpisHTML = (impacto.kpis || [])
        .map(
          (k, idx) => `
          <div class="story-impacto-card hud-reveal" data-stagger="${idx % 4}">
            <div class="story-impacto-valor">${k.valor}<span>${k.unidad || ""}</span></div>
            <div class="story-impacto-titulo">${k.titulo}</div>
            <div class="story-impacto-desc">${k.desc}</div>
          </div>`
        )
        .join("");

      return `
        <!-- 01. EL RETO -->
        <section class="hud-story-section hud-reveal" id="seccion-reto">
          <div class="hud-story-tag"><span>⚠️</span> ${reto.etiqueta}</div>
          <h2>${reto.titulo}</h2>
          <p class="story-subtitulo">${reto.subtitulo}</p>

          <div class="story-reto-intro hud-reveal">
            <p>${reto.problemaContexto}</p>
          </div>

          <div class="story-reto-grid">
            ${puntosDolorHTML}
          </div>
        </section>

        <!-- 02. FLUJOS DE DIAGRAMAS -->
        <section class="hud-story-section hud-reveal" id="seccion-flujos">
          <div class="hud-story-tag"><span>🗺️</span> ${flujos.etiqueta}</div>
          <h2>${flujos.titulo}</h2>
          <p class="story-subtitulo">${flujos.subtitulo}</p>

          <div class="hud-diagrama-wrapper hud-reveal">
            <div class="diagrama-topbar">
              <div>
                <span class="diagrama-topbar-tag">Pipeline de Conexión Parcela ➔ Mesa</span>
                <h5 class="diagrama-topbar-titulo" id="hud-diagrama-top-titulo">${primerDiagrama?.titulo || ""}</h5>
              </div>
              <div class="diagrama-tabs" role="tablist">
                ${tabsDiagramaHTML}
              </div>
            </div>

            <div class="diagrama-lead-box" id="hud-diagrama-lead">
              <span class="diagrama-lead-icon">💡</span>
              <span class="diagrama-lead-text">${primerDiagrama?.lead || ""}</span>
            </div>

            <div class="diagrama-pipeline" id="hud-diagrama-pipeline">
              ${pasosPrimerDiagramaHTML}
            </div>
          </div>
        </section>

        <!-- 03. LA SOLUCIÓN & EXPERIENCIA EN VIVO -->
        <section class="hud-story-section hud-reveal" id="seccion-solucion">
          <div class="hud-story-tag"><span>✨</span> ${solucion.etiqueta}</div>
          <h2>${solucion.titulo}</h2>
          <p class="story-subtitulo">${solucion.subtitulo}</p>

          <div class="story-solucion-grid">
            ${pilaresSolucionHTML}
          </div>

          <div class="galeria-showcase-header hud-reveal">
            <span class="galeria-live-badge"><span class="badge-pulse-live"></span> CATÁLOGO DE HUERTO &amp; TIENDA DIGITAL ACTIVA</span>
            <span class="galeria-badge-tech">Cloudflare Pages + D1 Edge SQL</span>
          </div>
          <div class="galeria hud-reveal">
            <div class="dispositivo mac">
              <div class="barra"><i></i><i></i><i></i><span class="barra-url" style="font-size:11px;margin-left:8px">cosechahidalguense.com</span></div>
              <div class="pantalla"${cap0 ? ` style="background-image:url('${cap0}')"` : ""}>${cap0 ? "" : proyecto.nombre}</div>
            </div>
            <div class="dispositivo phone">
              <div class="barra" style="height:20px;border-bottom:1px solid var(--hairline);display:flex;justify-content:center;align-items:center;"><span style="width:36px;height:4px;background:var(--hairline);border-radius:99px;"></span></div>
              <div class="pantalla"${cap1 ? ` style="background-image:url('${cap1}')"` : ""}>${cap1 ? "" : proyecto.nombre}</div>
            </div>
          </div>

        </section>

        <!-- 04. IMPACTO & MÉTRICAS REALES -->
        <section class="hud-story-section hud-reveal" id="seccion-impacto">
          <div class="hud-story-tag"><span>🚀</span> ${impacto.etiqueta}</div>
          <h2>${impacto.titulo}</h2>
          <p class="story-subtitulo">${impacto.subtitulo}</p>

          <div class="story-comparativa-box hud-reveal">
            <div class="story-comp-item antes hud-reveal" data-stagger="0">
              <span class="story-comp-tag">❌ Proceso Anterior con Intermediarios</span>
              <p>${impacto.comparativa.antes}</p>
            </div>
            <div class="story-comp-item ahora hud-reveal" data-stagger="1">
              <span class="story-comp-tag">✅ Con Cosecha Hidalguense</span>
              <p>${impacto.comparativa.ahora}</p>
            </div>
          </div>

          <div class="story-hosting-grid">
            ${kpisHTML}
          </div>
        </section>

        <!-- 05. GALERÍA REAL DEL SITIO — todo sobre peticiones del cliente -->
        <section class="hud-story-section hud-reveal" id="seccion-galeria">
          <div class="hud-story-tag"><span>📸</span> 05. La entrega · sobre peticiones del cliente</div>
          <h2>Cada pantalla nació de una petición concreta</h2>
          <p class="story-subtitulo">Fotos reales de <b>cosechahidalguense.com</b> en producción. Nada es de relleno: cada vista responde a algo que el productor pidió, y así lo construimos.</p>

          <div class="cosecha-galeria-real">
            <div class="galeria-real-intro hud-reveal">
              <p><strong>Cómo trabajamos:</strong> escuchamos la necesidad del cliente (vender directo por WhatsApp sin intermediarios, empacar con QR trazable, y un panel que ellos mismos manejen), y la volvimos una pieza concreta del producto. Esto es lo que quedó en línea.</p>
            </div>

            <div class="cosecha-galeria-grid">
              <figure class="cosecha-shot hud-reveal">
                <div class="cosecha-shot-bar"><i></i><i></i><i></i><span class="cosecha-shot-url">cosechahidalguense.com</span></div>
                <img src="${import.meta.env.BASE_URL}captures/cosecha-home.png" alt="Inicio de Cosecha Hidalguense" loading="lazy" />
                <figcaption><span class="cosecha-pedido">Pedido: “que se vea serio y del campo”</span><b>Portada de marca</b>Propuesta de valor clara, catálogo destacado y botón directo a WhatsApp.</figcaption>
              </figure>

              <figure class="cosecha-shot hud-reveal">
                <div class="cosecha-shot-bar"><i></i><i></i><i></i><span class="cosecha-shot-url">/productores</span></div>
                <img src="${import.meta.env.BASE_URL}captures/cosecha-catalogo.png" alt="Catálogo de productores" loading="lazy" />
                <figcaption><span class="cosecha-pedido">Pedido: “que encuentren por verdura”</span><b>Catálogo de productores</b>Filtros por cultivo y color, ficha con certificaciones y enlace 1‑a‑1.</figcaption>
              </figure>

              <figure class="cosecha-shot hud-reveal">
                <div class="cosecha-shot-bar"><i></i><i></i><i></i><span class="cosecha-shot-url">/cajas</span></div>
                <img src="${import.meta.env.BASE_URL}captures/cosecha-cajas.png" alt="Venta de cajas agrícolas" loading="lazy" />
                <figcaption><span class="cosecha-pedido">Pedido: “vender las cajas con QR”</span><b>Venta de cajas</b>Empaque agrícola con trazabilidad “quién sembró tu caja”.</figcaption>
              </figure>

              <figure class="cosecha-shot hud-reveal">
                <div class="cosecha-shot-bar"><i></i><i></i><i></i><span class="cosecha-shot-url">/admin.html</span></div>
                <img src="${import.meta.env.BASE_URL}captures/cosecha-admin.png" alt="Panel de administración (login)" loading="lazy" />
                <figcaption><span class="cosecha-pedido">Pedido: “que yo lo actualice solo”</span><b>Panel /admin.html</b>Login privado; el productor gestiona catálogo, cajas y mensajes desde su teléfono. Corre en Cloudflare (Pages + Workers + D1), $0/mes.</figcaption>
              </figure>
            </div>
          </div>
        </section>
      `;
    }

    // Fallback para otros proyectos o formato anterior
    return `<div class="story-fallback"><p>Caso de estudio en preparación.</p></div>`;
  }

  // Textos del caso estándar; el tema "hospital" (MedScan) usa lenguaje clínico.
  function textosCaso(proyecto) {
    if (proyecto.tema === "hospital") {
      const host = proyecto.links?.sitio ? proyecto.links.sitio.replace(/^https?:\/\//, "") : "";
      return {
        galeriaTag: "🩺 Interfaz en producción",
        galeriaSub: host ? `Web + móvil · en vivo en ${host}` : "Web + móvil",
        retoBadge: "01. Diagnóstico", retoIcon: "🩺", retoTitulo: "El problema", retoPie: "Comparar a mano, sitio por sitio",
        solBadge: "02. Tratamiento", solIcon: "💊", solTitulo: "La solución",
        resBadge: "03. Resultado", resIcon: "📋", resTitulo: "El impacto",
        modEyebrow: "Cómo funciona", modTitulo: "Arquitectura del sistema",
        modDesc: "Las piezas que hacen posible comparar precios de medicamentos en segundos.",
        modImpactoIcon: "✓",
      };
    }
    return {
      galeriaTag: "💻 Interfaz &amp; Producto en Producción",
      galeriaSub: "Visualización multiplataforma Web + Mobile con telemetría en vivo",
      retoBadge: "01. El Reto", retoIcon: "⚠️", retoTitulo: "Problemática Operativa", retoPie: "🛑 Fricción antes de la automatización",
      solBadge: "02. La Solución", solIcon: "⚡", solTitulo: "Ingeniería &amp; Software",
      resBadge: "03. Resultado", resIcon: "📈", resTitulo: "Impacto en Negocio",
      modEyebrow: "Módulos del Sistema", modTitulo: "Arquitectura &amp; Capacidades Clave",
      modDesc: "Componentes críticos desarrollados para garantizar fiabilidad, velocidad y mínima carga cognitiva.",
      modImpactoIcon: "🎯",
    };
  }

  function renderCasoEstandarHTML(proyecto, cap0, cap1) {
    const tx = textosCaso(proyecto);
    const hotspotsHTML = (proyecto.hotspots && proyecto.hotspots.length)
      ? `
        <section class="hud-hotspots-section hud-reveal">
          <div class="hud-hotspots-header">
            <div class="eyebrow" style="margin-bottom:6px;">${tx.modEyebrow}</div>
            <h3>${tx.modTitulo}</h3>
            <p>${tx.modDesc}</p>
          </div>
          <div class="hud-hotspots-grid">
            ${proyecto.hotspots.map((h, idx) => `
              <div class="hud-hotspot-card hud-reveal" data-stagger="${idx % 4}">
                <div class="hud-hotspot-top">
                  <span style="font-size:22px;">${h.icono || "⚡"}</span>
                  <span class="hud-hotspot-cat">${h.categoria || "Core"}</span>
                </div>
                <h4>${h.titulo}</h4>
                <p>${h.descripcion}</p>
                <div class="hud-hotspot-impact">
                  <span>${tx.modImpactoIcon}</span> ${h.impacto || "Alta disponibilidad"}
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      `
      : "";

    return `
      <!-- Vitrina de Producto & Dispositivos en Producción -->
      <div class="hud-galeria-card hud-reveal">
        <div class="hud-galeria-card-top">
          <div class="hud-galeria-card-tag">
            ${tx.galeriaTag}
          </div>
          <div class="hud-galeria-card-sub">
            ${tx.galeriaSub}
          </div>
        </div>
        <div class="galeria">
          <div class="dispositivo mac">
            <div class="barra"><i></i><i></i><i></i></div>
            <div class="pantalla"${cap0 ? ` style="background-image:url('${cap0}');background-size:cover;background-position:top center;"` : ""}>
              ${cap0 ? "" : `<div style="font-weight:700;font-size:16px;color:#fff;">${proyecto.nombre}</div>`}
            </div>
          </div>
          <div class="dispositivo phone">
            <div class="pantalla"${cap1 ? ` style="background-image:url('${cap1}');background-size:cover;background-position:top center;"` : ""}>
              ${cap1 ? "" : `<div style="font-weight:700;font-size:12px;color:#fff;">${proyecto.nombre}</div>`}
            </div>
          </div>
        </div>
      </div>

      <!-- Bento Grid de Tarjetas: El Reto, La Solución, El Resultado -->
      <div class="hud-bento-casos hud-reveal">
        <div class="hud-card-bento bento-reto" data-stagger="0">
          <div class="bento-header">
            <span class="bento-badge">${tx.retoBadge}</span>
            <span class="bento-icon">${tx.retoIcon}</span>
          </div>
          <h3>${tx.retoTitulo}</h3>
          <p>${proyecto.reto || ""}</p>
          <div class="bento-footer-tag">
            ${tx.retoPie}
          </div>
        </div>

        <div class="hud-card-bento bento-solucion" data-stagger="1">
          <div class="bento-header">
            <span class="bento-badge">${tx.solBadge}</span>
            <span class="bento-icon">${tx.solIcon}</span>
          </div>
          <h3>${tx.solTitulo}</h3>
          <p>${proyecto.solucion || ""}</p>
          <div class="bento-footer-tag">
            <span>🛠️</span> ${(proyecto.stack || []).slice(0, 3).join(" • ")}
          </div>
        </div>

        <div class="hud-card-bento bento-resultado" data-stagger="2">
          <div class="bento-header">
            <span class="bento-badge">${tx.resBadge}</span>
            <span class="bento-icon">${tx.resIcon}</span>
          </div>
          <h3>${tx.resTitulo}</h3>
          <p>${proyecto.resultado || ""}</p>
          <div class="bento-footer-tag">
            <span style="color:#10b981;">✓</span> ${proyecto.eficiencia?.resumen?.porcentaje || proyecto.resultadoTag || "Operación optimizada"}
          </div>
        </div>
      </div>

      <!-- Módulos de Arquitectura Clave -->
      ${hotspotsHTML}

      <!-- Gráfico interactivo Recharts: Eficiencia Operativa -->
      ${proyecto.eficiencia ? `
      <section class="bloque bloque-eficiencia hud-reveal">
        <div id="hud-eficiencia-container"></div>
      </section>` : ""}
    `;
  }

  // ── HUD del caso de estudio ───────────────────────────────────
  function abrirCaso(proyecto, onCerrar) {
    aplicarAcento(proyecto);
    onCerrarActual = onCerrar || null;

    const esHuerto = proyecto.planeta?.tipo === "huerto";
    const esHospital = proyecto.tema === "hospital";
    hud.classList.toggle("tema-hospital", esHospital);
    if (esHuerto) {
      hud.classList.add("tema-cosecha");
      document.body.classList.add("tema-cosecha-activo");
      cerrarBtn.innerHTML = "🌿 Volver al huerto";

      let particulas = hud.querySelector(".hud-cosecha-particulas");
      if (!particulas) {
        particulas = document.createElement("div");
        particulas.className = "hud-cosecha-particulas";
        for (let k = 0; k < 28; k++) {
          const m = document.createElement("div");
          m.className = "hud-cosecha-mote";
          const s = 3 + Math.random() * 5.5;
          m.style.width = `${s}px`;
          m.style.height = `${s}px`;
          m.style.left = `${Math.random() * 100}%`;
          m.style.animationDelay = `${Math.random() * 8}s`;
          m.style.animationDuration = `${7 + Math.random() * 8}s`;
          particulas.appendChild(m);
        }
        hud.appendChild(particulas);
      }
    } else {
      hud.classList.remove("tema-cosecha");
      document.body.classList.remove("tema-cosecha-activo");
      cerrarBtn.innerHTML = esHospital ? "← Volver al portafolio" : "← Volver a órbita";
      hud.querySelector(".hud-cosecha-particulas")?.remove();
    }

    const cap0 = proyecto.capturas?.[0];
    const cap1 = proyecto.capturas?.[1];

    const metricas = (proyecto.metricas || [])
      .map((m, idx) => {
        if (esHuerto) {
          const badge = m.badge || (m.valor === "$0" ? "100% Serverless" : m.valor.includes("1,000") ? "⭐ #1 en Google" : m.valor === "#1" ? "Orgánico" : "⚡ Tiempo Real");
          return `
            <div class="m hud-reveal" data-stagger="${idx % 4}">
              <div class="m-val-row">
                <b>${m.valor}</b>
                <span class="m-badge">${badge}</span>
              </div>
              <span>${m.etiqueta}</span>
            </div>`;
        }
        return `<div class="m hud-reveal" data-stagger="${idx % 4}"><b>${m.valor}</b><span>${m.etiqueta}</span></div>`;
      })
      .join("");

    const acciones = [];
    if (proyecto.links?.sitio)
      acciones.push(`<a class="btn btn-primario" href="${proyecto.links.sitio}" target="_blank" rel="noopener">Ver sitio ↗</a>`);
    if (proyecto.links?.codigo)
      acciones.push(`<a class="btn btn-secundario" href="${proyecto.links.codigo}" target="_blank" rel="noopener">Ver código ↗</a>`);

    const botonPlaneta = esHospital
      ? `<button type="button" class="btn btn-hosp-360 btn-abrir-inspeccion-360">Ver su planeta en 3D ↗</button>`
      : esHuerto
      ? `<button type="button" class="btn btn-cosecha-recorrido btn-abrir-inspeccion-360">
          <span style="font-size:16px">🌿</span> Recorrer Huerto &amp; Cultivos 360°
        </button>`
      : `<button type="button" class="btn btn-secundario btn-abrir-inspeccion-360" style="margin-top:6px;border-color:var(--accent);box-shadow:0 0 20px -4px var(--accent);display:inline-flex;align-items:center;gap:8px;">
          <span style="font-size:16px">🪐</span> Inspeccionar Planeta 360°
        </button>`;

    const eyebrowTxt = esHospital
      ? `<span class="hosp-cruz" aria-hidden="true"></span> Salud digital · Comparador de precios`
      : esHuerto
      ? `<span class="eyebrow-dot"></span> PROYECTO AGRÍCOLA • HUERTO DE HORTALIZAS &amp; MERCADO DIGITAL`
      : (proyecto.categoria === "automatizacion" ? "Automatización" : "Sitio web");

    const tituloHTML = esHuerto
      ? `Cosecha <span class="cosecha-serif-accent">Hidalguense</span>`
      : proyecto.nombre;

    const taglineHTML = esHuerto
      ? `Del campo de Hidalgo a tu mesa, <span class="cosecha-tagline-fresco">100% fresco y en línea.</span>`
      : (proyecto.tagline || "");

    const contenidoPrincipal = proyecto.storytelling
      ? renderStorytellingHTML(proyecto, cap0, cap1)
      : renderCasoEstandarHTML(proyecto, cap0, cap1);

    wrap.innerHTML = `
      <header class="hud-header hud-reveal">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;">
          <div>
            <div class="eyebrow">${eyebrowTxt}</div>
            <h1>${tituloHTML}</h1>
            <p class="tagline">${taglineHTML}</p>
          </div>
          ${botonPlaneta}
        </div>
        ${esHospital ? `<svg class="hosp-ekg" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 H210 L225 30 L235 12 L247 48 L259 4 L271 56 L283 30 H330 L342 22 L354 30 H600" /></svg>` : ""}
      </header>
      <div class="metricas hud-reveal">${metricas}</div>

      ${contenidoPrincipal}

      <div class="chips hud-reveal">${(proyecto.stack || []).map((s) => `<span>${s}</span>`).join("")}</div>
      ${acciones.length ? `<div class="acciones hud-reveal">${acciones.join("")}</div>` : ""}

      <div class="hud-conversion-card hud-reveal">
        <span class="hcc-tag">💼 Consultoría &amp; Desarrollo Freelance</span>
        <h3>¿Tienes un reto similar en tu negocio?</h3>
        <p>Desarrollo soluciones a la medida con arquitectura robusta: desde plataformas web modernas con costo de operación nulo hasta flujos de automatización que reducen días de carga manual a solo minutos.</p>
        <div class="hcc-actions">
          <button type="button" class="btn btn-primario btn-trigger-contacto" data-tipo="${proyecto.categoria === 'automatizacion' ? 'Automatización con IA' : 'Plataforma Web / Edge'}" data-mensaje="Hola Eduardo, estuve viendo el caso de estudio de &quot;${proyecto.nombre}&quot; y me interesa desarrollar una solución con requerimientos similares.">Cotizar solución similar →</button>
          <a class="btn btn-secundario" href="https://www.linkedin.com/in/eduardoaranda-risk/" target="_blank" rel="noopener">Conectar en LinkedIn ↗</a>
        </div>
      </div>
    `;

    // Interacción de pestañas en el diagrama de flujos (Cosecha Hidalguense)
    if (proyecto.storytelling?.flujos?.diagramas) {
      const tabs = wrap.querySelectorAll(".diagrama-tab");
      const pipelineCont = wrap.querySelector("#hud-diagrama-pipeline");
      const leadCont = wrap.querySelector("#hud-diagrama-lead .diagrama-lead-text");
      const tituloCont = wrap.querySelector("#hud-diagrama-top-titulo");

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const diagId = tab.dataset.diagrama;
          tabs.forEach((t) => t.classList.remove("activo"));
          tab.classList.add("activo");

          const diag = proyecto.storytelling.flujos.diagramas.find((d) => d.id === diagId);
          if (diag) {
            if (tituloCont) tituloCont.textContent = diag.titulo;
            if (leadCont) leadCont.textContent = diag.lead;
            if (pipelineCont) {
              pipelineCont.innerHTML = (diag.pasos || [])
                .map(
                  (p) => `
                  <div class="diagrama-nodo" data-paso="${p.paso}">
                    <div class="diagrama-step-badge">${p.paso}</div>
                    <div class="diagrama-nodo-body">
                      <h6>${p.titulo}</h6>
                      <p>${p.desc}</p>
                    </div>
                    <div class="diagrama-nodo-tech">${p.tech}</div>
                  </div>`
                )
                .join("");
            }
          }
        });
      });
    } else if (proyecto.storytelling?.arquitectura?.flujos) {
      const tabs = wrap.querySelectorAll(".diagrama-tab");
      const pipelineCont = wrap.querySelector("#hud-diagrama-pipeline");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const flujoKey = tab.dataset.flujo;
          tabs.forEach((t) => t.classList.remove("activo"));
          tab.classList.add("activo");

          const flujos = proyecto.storytelling.arquitectura.flujos[flujoKey] || [];
          if (pipelineCont) {
            pipelineCont.innerHTML = flujos
              .map(
                (f, idx) => `
                <div class="diagrama-nodo ${idx === 0 ? "activo" : ""}" data-paso="${f.paso}">
                  <div class="diagrama-step-badge">${f.paso}</div>
                  <div class="diagrama-nodo-body">
                    <h6>${f.titulo}</h6>
                    <p>${f.desc}</p>
                  </div>
                  <div class="diagrama-nodo-tech">${f.tech}</div>
                </div>`
              )
              .join("");
          }
        });
      });
    }

    // Montar el gráfico interactivo con Recharts
    if (reactRootActual) {
      try { reactRootActual.unmount(); } catch (e) {}
      reactRootActual = null;
    }
    const efContainer = wrap.querySelector("#hud-eficiencia-container");
    if (efContainer && proyecto.eficiencia) {
      reactRootActual = montarGraficoEficiencia(efContainer, proyecto);
    }

    // Botón para activar el Modo Inspección 3D Orbital Libre
    wrap.querySelector(".btn-abrir-inspeccion-360")?.addEventListener("click", () => {
      if (api.onPedirInspeccion360) api.onPedirInspeccion360(proyecto);
    });

    // Activar inmediatamente el HUD para que el caso de estudio aparezca al instante sin retraso
    hud.scrollTop = 0;
    hud.classList.add("activo");
    document.body.classList.add("enfoque-hud");

    // Desconectar observer previo si existía
    if (hudObserver) {
      hudObserver.disconnect();
      hudObserver = null;
    }

    const elementosReveal = Array.from(wrap.querySelectorAll(".hud-reveal"));

    // Scroll-triggered reveal con IntersectionObserver
    if ("IntersectionObserver" in window) {
      hudObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revelado");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: hud,
          rootMargin: "120px 0px 60px 0px",
          threshold: 0.05,
        }
      );

      // Comprobación inicial: revelar de inmediato los elementos del pliegue superior
      // y registrar los siguientes para la transición scroll-triggered suave
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        elementosReveal.forEach((elem, idx) => {
          const rect = elem.getBoundingClientRect();
          if (rect.top < vh * 0.95 || idx < 4) {
            elem.classList.add("revelado");
          } else {
            elem.classList.remove("revelado");
            hudObserver.observe(elem);
          }
        });
      });

      // Mecanismo de seguridad: previene que ningún elemento quede oculto si el usuario no hace scroll
      setTimeout(() => {
        elementosReveal.forEach((elem) => {
          const rect = elem.getBoundingClientRect();
          if (rect.top < window.innerHeight * 1.2) {
            elem.classList.add("revelado");
          }
        });
      }, 350);
    } else {
      elementosReveal.forEach((elem) => {
        elem.classList.add("revelado");
      });
    }
  }

  function cerrarCaso() {
    if (!hud.classList.contains("activo")) return;
    if (hudObserver) {
      hudObserver.disconnect();
      hudObserver = null;
    }
    const cb = onCerrarActual;
    onCerrarActual = null;
    if (reactRootActual) {
      try { reactRootActual.unmount(); } catch (e) {}
      reactRootActual = null;
    }
    hud.classList.remove("activo");
    hud.classList.remove("tema-cosecha", "tema-hospital");
    document.body.classList.remove("tema-cosecha-activo");
    cerrarBtn.innerHTML = "← Volver a órbita";
    hud.querySelector(".hud-cosecha-particulas")?.remove();
    document.body.classList.remove("enfoque-hud");
    setTimeout(() => { if (cb) cb(); }, 480);
  }

  const api = {
    mostrarPanel,
    ocultarPanel,
    abrirCaso,
    cerrarCaso,
    estaAbierto: () => hud.classList.contains("activo"),
    ocultarTemporalmentePara360: () => {
      hud.classList.remove("activo");
      document.body.classList.remove("enfoque-hud");
    },
    restaurarTras360: () => {
      hud.classList.add("activo");
      document.body.classList.add("enfoque-hud");
    },
    onPedirInspeccion360: null,
    // main.js puede sobreescribir esto para enrutar el cierre por el
    // historial (botón atrás). Por defecto solo cierra el HUD.
    pedirCerrar: () => cerrarCaso(),
  };
  // El botón "Volver a órbita" pide el cierre por el camino de main.
  cerrarBtn.addEventListener("click", () => api.pedirCerrar());
  return api;
}

export default crearHUD;

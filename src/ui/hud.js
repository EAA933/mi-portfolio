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

      // 4. Simulador Interactivo Cosecha Hidalguense
      const sim = solucion.simulador;
      const cultivosChipsHTML = (sim?.cultivos || [])
        .map(
          (c, idx) => `
          <button type="button" class="sim-cultivo-pill ${idx === 0 ? "activo" : ""}" data-id="${c.id}" data-colores="${(c.colores || []).join(",")}">
            <span class="sim-cultivo-ico">${c.icon}</span>
            <span>${c.nombre}</span>
          </button>`
        )
        .join("");

      const productoresCardsHTML = (sim?.productores || [])
        .map(
          (prod, idx) => `
          <div class="sim-productor-card ${idx === 0 ? "seleccionado" : ""}" data-id="${prod.id}">
            <div class="sim-prod-top">
              <div class="sim-prod-disco">${prod.nombre.charAt(0)}</div>
              <div class="sim-prod-meta">
                <h5>${prod.nombre}</h5>
                <span class="sim-prod-mun">📍 ${prod.municipio}</span>
              </div>
              <span class="sim-prod-temporada">🌱 ${prod.temporada}</span>
            </div>
            <div class="sim-prod-badges">
              ${(prod.certificaciones || []).map((cert) => `<span class="sim-badge-cert">✓ Certificación ${cert}</span>`).join("")}
              <span class="sim-badge-cultivo">${prod.cultivo}</span>
            </div>
          </div>`
        )
        .join("");

      const cajasOptionsHTML = (sim?.cajas || [])
        .map(
          (c, idx) => `
          <div class="sim-caja-option ${idx === 0 ? "seleccionada" : ""}" data-id="${c.id}" data-precio="${c.precioUnitario}">
            <div class="sim-caja-head">
              <span class="sim-caja-tag">${c.nombre}</span>
              <span class="sim-caja-precio">$${c.precioUnitario.toFixed(2)} <small>c/u</small></span>
            </div>
            <div class="sim-caja-dims">📐 ${c.medidas} • Capacidad: ${c.capacidad}</div>
            <p class="sim-caja-det">${c.resistencia}</p>
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

          <!-- LAB INTERACTIVO: SIMULADOR DE COSECHA HIDALGUENSE -->
          <div class="hud-simulador-cosecha hud-reveal" id="hud-simulador-cosecha">
            <div class="sim-header">
              <div>
                <span class="sim-eyebrow">🌱 LAB INTERACTIVO DE LA PLATAFORMA</span>
                <h4 class="sim-titulo">Experimenta la Solución de Cosecha Hidalguense</h4>
                <p class="sim-subtitulo">Comprueba el catálogo en vivo con WhatsApp, el empaque con QR trazable o el panel táctil de administración.</p>
              </div>
              <div class="sim-segmented-control" role="tablist">
                <button type="button" class="sim-segment-btn activo" data-modo="catalogo">🫑 1. Catálogo &amp; Productores</button>
                <button type="button" class="sim-segment-btn" data-modo="cajas">📦 2. Cajas &amp; Trazabilidad QR</button>
                <button type="button" class="sim-segment-btn" data-modo="admin">📱 3. Panel /admin.html</button>
              </div>
            </div>

            <!-- VISTA 1: CATÁLOGO DE CULTIVOS & PRODUCTORES -->
            <div class="sim-vista" id="sim-vista-catalogo">
              <div class="sim-grid-comprador">
                <div class="sim-selector-col">
                  <div class="sim-col-label">Filtrar por Cultivo de Invernadero:</div>
                  <div class="sim-cultivos-pills">
                    ${cultivosChipsHTML}
                  </div>

                  <div class="sim-col-label" style="margin-top:16px;">Variedades de Color (Pimiento Morrón):</div>
                  <div class="sim-colores-pills" id="sim-colores-container">
                    <button type="button" class="sim-color-btn activo" data-color="Rojo" style="--c:#c0342f"><span class="dot"></span> Rojo</button>
                    <button type="button" class="sim-color-btn" data-color="Amarillo" style="--c:#e8b62c"><span class="dot"></span> Amarillo</button>
                    <button type="button" class="sim-color-btn" data-color="Naranja" style="--c:#e07b28"><span class="dot"></span> Naranja</button>
                    <button type="button" class="sim-color-btn" data-color="Verde" style="--c:#4a8c3f"><span class="dot"></span> Verde</button>
                  </div>

                  <div class="sim-col-label" style="margin-top:18px;">Productores Verificados en Tasquillo:</div>
                  <div class="sim-productores-list">
                    ${productoresCardsHTML}
                  </div>
                </div>

                <div class="sim-resumen-col">
                  <div class="sim-checkout-card">
                    <div class="sim-checkout-header">
                      <span class="sim-checkout-tag">Enlace 1 a 1 sin Intermediarios</span>
                      <span class="sim-origen-pill" id="sim-sum-origen">📍 Tasquillo, Hidalgo</span>
                    </div>

                    <div class="sim-checkout-item">
                      <span id="sim-sum-productor-nombre">Hermanos Arteaga Trejo</span>
                    </div>
                    <div class="sim-cultivo-badge-selected" id="sim-sum-cultivo-info">
                      🫑 Pimiento morrón (Variedad Roja) • Certificación SENASICA
                    </div>

                    <div class="sim-checkout-divider"></div>

                    <div class="sim-total-row">
                      <span>Costo de intermediación:</span>
                      <b style="color:#16a34a">$0.00 MXN (100% al productor)</b>
                    </div>
                    <div class="sim-garantia-envio">🌱 Negociación y acuerdo directo por WhatsApp con el agricultor.</div>

                    <div class="sim-whatsapp-box">
                      <div class="sim-wa-header">
                        <span>💬 Mensaje compilado para WhatsApp:</span>
                      </div>
                      <pre class="sim-wa-preview" id="sim-whatsapp-preview"></pre>
                      <button type="button" class="btn sim-btn-wa" id="sim-btn-wa">
                        <span>📲 Simular Conexión Directa por WhatsApp</span>
                      </button>
                      <div class="sim-wa-feedback" id="sim-wa-feedback" style="opacity:0"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- VISTA 2: CAJAS AGRÍCOLAS & QR "QUIÉN SEMBRÓ TU CAJA" -->
            <div class="sim-vista" id="sim-vista-cajas" style="display:none;">
              <div class="sim-cajas-layout">
                <div class="sim-cajas-selector-col">
                  <div class="sim-col-label">1. Modelo de Caja de Cartón Corrugado Ventilada:</div>
                  <div class="sim-cajas-grid">
                    ${cajasOptionsHTML}
                  </div>

                  <div class="sim-col-label" style="margin-top:18px;">2. Volumen Requerido (Precio con Descuento Agrícola):</div>
                  <div class="sim-volumen-row">
                    <button type="button" class="sim-vol-btn activo" data-vol="50" data-factor="1">50 pzas</button>
                    <button type="button" class="sim-vol-btn" data-vol="100" data-factor="0.92">100 pzas</button>
                    <button type="button" class="sim-vol-btn" data-vol="500" data-factor="0.82">500 pzas (Mayoreo)</button>
                    <button type="button" class="sim-vol-btn" data-vol="1000" data-factor="0.75">1,000 pzas (-25%)</button>
                  </div>

                  <div class="sim-cajas-cotizacion-box">
                    <div class="sim-cajas-cot-row">
                      <span>Inversión estimada:</span>
                      <b id="sim-cajas-total">$1,225.00 MXN</b>
                    </div>
                    <p class="sim-cajas-cot-desc">Incluye troquel de ventilación, resistencia a condensación y <b>código QR personalizado con tu marca</b> impreso en cara frontal.</p>
                  </div>
                </div>

                <div class="sim-cajas-preview-col">
                  <div class="sim-caja-mockup-card">
                    <div class="sim-caja-mockup-header">
                      <span>📦 Prototipo Físico &amp; Trazabilidad</span>
                      <span class="sim-badge-caja-tipo">Corrugado Doble Kraft</span>
                    </div>

                    <div class="sim-caja-grafica">
                      <div class="sim-caja-impresion">
                        <div class="sim-caja-brand-title">COSECHA HIDALGUENSE</div>
                        <div class="sim-caja-brand-sub">DEL CAMPO HIDALGUENSE PARA TU MESA</div>
                        <div class="sim-caja-sellos-row">
                          <span>🌱 TASQUILLO, HGO</span>
                          <span>✓ INOCUIDAD SENASICA</span>
                        </div>
                      </div>

                      <div class="sim-caja-qr-area" id="sim-trigger-scan">
                        <div class="sim-caja-qr-box">
                          <!-- Código QR interactivo -->
                          <svg viewBox="0 0 100 100" class="sim-caja-qr-svg">
                            <rect width="100" height="100" fill="#ffffff" rx="8"/>
                            <rect x="10" y="10" width="26" height="26" fill="#8c491a" rx="4"/>
                            <rect x="14" y="14" width="18" height="18" fill="#ffffff" rx="2"/>
                            <rect x="18" y="18" width="10" height="10" fill="#8c491a" rx="1"/>
                            <rect x="64" y="10" width="26" height="26" fill="#8c491a" rx="4"/>
                            <rect x="68" y="14" width="18" height="18" fill="#ffffff" rx="2"/>
                            <rect x="72" y="18" width="10" height="10" fill="#8c491a" rx="1"/>
                            <rect x="10" y="64" width="26" height="26" fill="#8c491a" rx="4"/>
                            <rect x="14" y="68" width="18" height="18" fill="#ffffff" rx="2"/>
                            <rect x="18" y="72" width="10" height="10" fill="#8c491a" rx="1"/>
                            <rect x="42" y="12" width="16" height="6" fill="#8c491a"/>
                            <rect x="44" y="24" width="12" height="12" fill="#8c491a"/>
                            <rect x="42" y="44" width="16" height="16" fill="#8c491a"/>
                            <rect x="64" y="44" width="12" height="12" fill="#8c491a"/>
                            <rect x="80" y="44" width="10" height="26" fill="#8c491a"/>
                            <rect x="42" y="66" width="14" height="24" fill="#8c491a"/>
                            <rect x="64" y="66" width="26" height="10" fill="#8c491a"/>
                            <rect x="64" y="82" width="10" height="8" fill="#8c491a"/>
                            <rect x="80" y="82" width="10" height="8" fill="#8c491a"/>
                          </svg>
                        </div>
                        <div class="sim-qr-label">
                          <b>¿QUIÉN SEMBRÓ TU CAJA?</b>
                          <span>Toca aquí para escanear el QR</span>
                        </div>
                      </div>
                    </div>

                    <!-- Ficha de Trazabilidad revelada tras escanear -->
                    <div class="sim-trazabilidad-revelada" id="sim-trazabilidad-box">
                      <div class="sim-traza-header">
                        <span class="sim-traza-check">✓</span>
                        <div>
                          <h6>Trazabilidad Verificada en cosechahidalguense.com</h6>
                          <p>Escaneado desde la caja física en cocina/restaurante</p>
                        </div>
                      </div>
                      <div class="sim-traza-grid">
                        <div class="sim-traza-k">Productor:</div>
                        <div class="sim-traza-v" id="sim-traza-productor">Hermanos Arteaga Trejo</div>
                        <div class="sim-traza-k">Ubicación:</div>
                        <div class="sim-traza-v">Tasquillo, Valle del Mezquital, Hidalgo</div>
                        <div class="sim-traza-k">Cultivo:</div>
                        <div class="sim-traza-v" id="sim-traza-cultivo">Pimiento morrón de invernadero</div>
                        <div class="sim-traza-k">Inocuidad:</div>
                        <div class="sim-traza-v">Certificación oficial SENASICA</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- VISTA 3: PANEL MÓVIL /admin.html -->
            <div class="sim-vista" id="sim-vista-admin" style="display:none;">
              <div class="sim-productor-grid">
                <div class="sim-phone-frame">
                  <div class="sim-phone-notch"><span></span></div>
                  <div class="sim-phone-screen">
                    <div class="sim-phone-header">
                      <span class="sim-pwa-badge">📱 /admin.html</span>
                      <span class="sim-battery">☀️ Modo Campo</span>
                    </div>

                    <div class="sim-admin-subtabs">
                      <button type="button" class="sim-admin-tab activo" data-subtab="productores">Productores</button>
                      <button type="button" class="sim-admin-tab" data-subtab="cajas">Cajas</button>
                      <button type="button" class="sim-admin-tab" data-subtab="mensajes">Mensajes</button>
                    </div>

                    <div class="sim-phone-body">
                      <!-- Subtab 1: Productores -->
                      <div class="sim-subtab-pane" id="sim-pane-productores">
                        <h5>Hermanos Arteaga Trejo</h5>
                        <p class="sim-phone-sub">Tasquillo, Hgo. • Invernadero Pimiento</p>

                        <div class="sim-switch-box">
                          <div>
                            <div class="sim-switch-title">Estado en Catálogo</div>
                            <div class="sim-switch-desc" id="sim-badge-cosecha" style="color:#15803d;font-weight:700">🟢 Productor Activo</div>
                          </div>
                          <button type="button" class="sim-toggle-pill" id="sim-toggle-cosecha">ON</button>
                        </div>

                        <div class="sim-stepper-box">
                          <div class="sim-stepper-label">Capacidad de Corte Semanal:</div>
                          <div class="sim-stepper-controls">
                            <button type="button" class="sim-step-btn" id="sim-kilos-menos">−</button>
                            <span class="sim-kilos-val" id="sim-kilos-val">120 cajas</span>
                            <button type="button" class="sim-step-btn" id="sim-kilos-mas">+</button>
                          </div>
                        </div>

                        <button type="button" class="btn sim-sync-btn" id="sim-btn-sync">
                          <span>⚡ Guardar en Cloudflare D1 SQL</span>
                        </button>
                        <div class="sim-telemetry-badge" id="sim-telemetry">
                          <span>📡 Estado de red:</span> Cloudflare Edge D1 listo
                        </div>
                      </div>

                      <!-- Subtab 2: Cajas -->
                      <div class="sim-subtab-pane" id="sim-pane-cajas" style="display:none;">
                        <h5>Inventario de Cajas Agrícolas</h5>
                        <p class="sim-phone-sub">Empaque para pimiento morrón con QR</p>
                        <div class="sim-admin-caja-row">
                          <span>Cajas ventiladas en stock:</span>
                          <b>850 piezas</b>
                        </div>
                        <div class="sim-admin-caja-row">
                          <span>Lote de QR generado:</span>
                          <b>#TAS-2026-08</b>
                        </div>
                        <div class="sim-telemetry-badge ok" style="margin-top:12px;">
                          ✓ Sincronizado con API /api/cajas
                        </div>
                      </div>

                      <!-- Subtab 3: Mensajes -->
                      <div class="sim-subtab-pane" id="sim-pane-mensajes" style="display:none;">
                        <h5>Bandeja de Contacto Directo</h5>
                        <p class="sim-phone-sub">3 solicitudes recibidas esta semana</p>
                        <div class="sim-msg-item">
                          <b>Restaurante La Huasteca (Pachuca)</b>
                          <p>"Interesados en 40 cajas de pimiento amarillo semanal..."</p>
                          <small>Vía Web • Ayer 16:40</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="sim-productor-explicacion">
                  <span class="sim-tag-agtech">🌿 Panel Autónomo Desplegado en Cloudflare</span>
                  <h4>Autonomía Tecnológica Total para los Agricultores</h4>
                  <p>A diferencia de sistemas que requieren desarrolladores para cambiar un precio o dar de alta un agricultor, la consola <code>/admin.html</code> ofrece:</p>
                  <ul class="sim-feature-list">
                    <li><b>Independencia de Operación:</b> La cooperativa y agricultores actualizan temporadas de corte y números de contacto en 2 toques.</li>
                    <li><b>Sincronización en el Borde con D1:</b> Base de datos distribuida con replicación instantánea que responde en menos de 35ms en México.</li>
                    <li><b>Costo Fijo de Hosting de $0 USD/mes:</b> Desplegado completamente sobre Cloudflare Pages y Workers, eliminando cuotas de servidores para el campo.</li>
                  </ul>
                </div>
              </div>
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

  // ── Controlador Interactivo de Experiencia UX para Cosecha Hidalguense ───
  function setupSimuladorCosecha(wrap, proyecto) {
    const sim = wrap.querySelector("#hud-simulador-cosecha");
    if (!sim) return;

    const simData = proyecto.storytelling?.solucion?.simulador;
    if (!simData) return;

    let modoActual = "catalogo";
    let cultivoActual = simData.cultivos?.[0]?.nombre || "Pimiento morrón";
    let colorActual = "Rojo";
    let productorActual = simData.productores?.[0] || {
      nombre: "Hermanos Arteaga Trejo",
      municipio: "Tasquillo, Hidalgo",
      whatsapp: "771 118 9043",
      certificaciones: ["SENASICA"]
    };

    let cajaId = simData.cajas?.[0]?.id || "caja-morron";
    let volumenActual = 50;
    let factorDescuento = 1;

    let cosechaActiva = true;
    let capacidadCajas = 120;

    // Actualiza la comanda para WhatsApp
    function actualizarComprador() {
      const sumProductor = sim.querySelector("#sim-sum-productor-nombre");
      const sumOrigen = sim.querySelector("#sim-sum-origen");
      const sumCultivo = sim.querySelector("#sim-sum-cultivo-info");
      const sumMsg = sim.querySelector("#sim-whatsapp-preview");

      if (sumProductor) sumProductor.textContent = productorActual.nombre;
      if (sumOrigen) sumOrigen.textContent = `📍 ${productorActual.municipio}`;

      const textoCultivo = cultivoActual === "Pimiento morrón"
        ? `Pimiento morrón (${colorActual})`
        : cultivoActual;

      const certTexto = (productorActual.certificaciones || []).join(", ");
      if (sumCultivo) {
        sumCultivo.textContent = `🫑 ${textoCultivo} • Certificación ${certTexto || "SENASICA"}`;
      }

      if (sumMsg) {
        sumMsg.textContent = `*Hola ${productorActual.nombre}! 🌿*\nTe contacto desde cosechahidalguense.com.\n\nMe interesa cotizar cosecha fresca:\n• *Cultivo:* ${textoCultivo}\n• *Origen:* ${productorActual.municipio}\n• *Certificación:* ${certTexto}\n• *Volumen:* 50 cajas con empaque ventilado\n\n¿Tienen disponibilidad para despacho esta semana?`;
      }
    }

    // Actualiza el cotizador de cajas
    function actualizarCajas() {
      const caja = simData.cajas?.find((c) => c.id === cajaId) || simData.cajas?.[0];
      if (!caja) return;

      const precioUnit = caja.precioUnitario * factorDescuento;
      const total = precioUnit * volumenActual;

      const totalEl = sim.querySelector("#sim-cajas-total");
      if (totalEl) {
        totalEl.textContent = `$${total.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
      }

      const trazaProd = sim.querySelector("#sim-traza-productor");
      const trazaCultivo = sim.querySelector("#sim-traza-cultivo");
      if (trazaProd) trazaProd.textContent = productorActual.nombre;
      if (trazaCultivo) trazaCultivo.textContent = `${caja.nombre} con QR de origen`;
    }

    // Tabs del simulador
    sim.querySelectorAll(".sim-segment-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        modoActual = btn.dataset.modo;
        sim.querySelectorAll(".sim-segment-btn").forEach((b) => b.classList.remove("activo"));
        btn.classList.add("activo");

        const vCat = sim.querySelector("#sim-vista-catalogo");
        const vCaj = sim.querySelector("#sim-vista-cajas");
        const vAdm = sim.querySelector("#sim-vista-admin");

        if (vCat) vCat.style.display = modoActual === "catalogo" ? "block" : "none";
        if (vCaj) vCaj.style.display = modoActual === "cajas" ? "block" : "none";
        if (vAdm) vAdm.style.display = modoActual === "admin" ? "block" : "none";
      });
    });

    // Píldoras de cultivo
    sim.querySelectorAll(".sim-cultivo-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        sim.querySelectorAll(".sim-cultivo-pill").forEach((p) => p.classList.remove("activo"));
        pill.classList.add("activo");
        cultivoActual = pill.querySelector("span:last-child")?.textContent || "Pimiento morrón";

        const coloresContainer = sim.querySelector("#sim-colores-container");
        if (coloresContainer) {
          coloresContainer.style.display = cultivoActual === "Pimiento morrón" ? "flex" : "none";
        }
        actualizarComprador();
      });
    });

    // Píldoras de color para pimiento morrón
    sim.querySelectorAll(".sim-color-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        sim.querySelectorAll(".sim-color-btn").forEach((b) => b.classList.remove("activo"));
        btn.classList.add("activo");
        colorActual = btn.dataset.color;
        actualizarComprador();
      });
    });

    // Tarjetas de productores
    sim.querySelectorAll(".sim-productor-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = parseInt(card.dataset.id, 10);
        const prod = simData.productores?.find((p) => p.id === id);
        if (prod) {
          productorActual = prod;
          sim.querySelectorAll(".sim-productor-card").forEach((c) => c.classList.remove("seleccionado"));
          card.classList.add("seleccionado");
          actualizarComprador();
          actualizarCajas();
        }
      });
    });

    // Botón de WhatsApp
    const btnWa = sim.querySelector("#sim-btn-wa");
    const waFeedback = sim.querySelector("#sim-wa-feedback");
    if (btnWa && waFeedback) {
      btnWa.addEventListener("click", () => {
        waFeedback.textContent = `✓ Mensaje directo generado para ${productorActual.nombre} (${productorActual.whatsapp}) sin intermediarios.`;
        waFeedback.style.opacity = "1";
        setTimeout(() => {
          waFeedback.style.opacity = "0";
        }, 4500);
      });
    }

    // Selector de modelo de caja
    sim.querySelectorAll(".sim-caja-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        cajaId = opt.dataset.id;
        sim.querySelectorAll(".sim-caja-option").forEach((o) => o.classList.remove("seleccionada"));
        opt.classList.add("seleccionada");
        actualizarCajas();
      });
    });

    // Selector de volumen de cajas
    sim.querySelectorAll(".sim-vol-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        volumenActual = parseInt(btn.dataset.vol, 10);
        factorDescuento = parseFloat(btn.dataset.factor);
        sim.querySelectorAll(".sim-vol-btn").forEach((b) => b.classList.remove("activo"));
        btn.classList.add("activo");
        actualizarCajas();
      });
    });

    // Escanear QR interactivo
    const triggerScan = sim.querySelector("#sim-trigger-scan");
    const trazaBox = sim.querySelector("#sim-trazabilidad-box");
    if (triggerScan && trazaBox) {
      triggerScan.addEventListener("click", () => {
        trazaBox.classList.add("visible");
        trazaBox.style.animation = "none";
        trazaBox.offsetHeight; // trigger reflow
        trazaBox.style.animation = "pulsoTrazabilidad 0.6s ease";
      });
    }

    // Admin PWA Subtabs
    sim.querySelectorAll(".sim-admin-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const sub = tab.dataset.subtab;
        sim.querySelectorAll(".sim-admin-tab").forEach((t) => t.classList.remove("activo"));
        tab.classList.add("activo");

        const pProd = sim.querySelector("#sim-pane-productores");
        const pCaj = sim.querySelector("#sim-pane-cajas");
        const pMsg = sim.querySelector("#sim-pane-mensajes");

        if (pProd) pProd.style.display = sub === "productores" ? "block" : "none";
        if (pCaj) pCaj.style.display = sub === "cajas" ? "block" : "none";
        if (pMsg) pMsg.style.display = sub === "mensajes" ? "block" : "none";
      });
    });

    // Toggle Cosecha en Admin
    const toggleCosecha = sim.querySelector("#sim-toggle-cosecha");
    const badgeCosecha = sim.querySelector("#sim-badge-cosecha");
    if (toggleCosecha && badgeCosecha) {
      toggleCosecha.addEventListener("click", () => {
        cosechaActiva = !cosechaActiva;
        toggleCosecha.classList.toggle("inactivo", !cosechaActiva);
        toggleCosecha.textContent = cosechaActiva ? "ON" : "OFF";
        badgeCosecha.textContent = cosechaActiva ? "🟢 Productor Activo (Recibiendo pedidos)" : "🔴 Pausado Temporalmente";
        badgeCosecha.style.color = cosechaActiva ? "#15803d" : "#b91c1c";
      });
    }

    // Stepper de capacidad
    const btnMenos = sim.querySelector("#sim-kilos-menos");
    const btnMas = sim.querySelector("#sim-kilos-mas");
    const valKilos = sim.querySelector("#sim-kilos-val");
    if (btnMenos && btnMas && valKilos) {
      btnMenos.addEventListener("click", () => {
        if (capacidadCajas > 10) capacidadCajas -= 10;
        valKilos.textContent = `${capacidadCajas} cajas`;
      });
      btnMas.addEventListener("click", () => {
        capacidadCajas += 10;
        valKilos.textContent = `${capacidadCajas} cajas`;
      });
    }

    // Botón de sincronización con Cloudflare D1
    const btnSync = sim.querySelector("#sim-btn-sync");
    const telemetry = sim.querySelector("#sim-telemetry");
    if (btnSync && telemetry) {
      btnSync.addEventListener("click", () => {
        telemetry.innerHTML = `<span class="sim-pulse-dot"></span> Sincronizando en Edge Workers...`;
        telemetry.className = "sim-telemetry-badge sync";
        setTimeout(() => {
          const ping = Math.floor(22 + Math.random() * 12);
          telemetry.innerHTML = `✓ SQL D1 Actualizado en <b>${ping}ms</b> • Nodo Cloudflare Querétaro (QRO)`;
          telemetry.className = "sim-telemetry-badge ok";
        }, 300);
      });
    }

    actualizarComprador();
    actualizarCajas();
  }

  function renderCasoEstandarHTML(proyecto, cap0, cap1) {
    const hotspotsHTML = (proyecto.hotspots && proyecto.hotspots.length)
      ? `
        <section class="hud-hotspots-section hud-reveal">
          <div class="hud-hotspots-header">
            <div class="eyebrow" style="margin-bottom:6px;">Módulos del Sistema</div>
            <h3>Arquitectura &amp; Capacidades Clave</h3>
            <p>Componentes críticos desarrollados para garantizar fiabilidad, velocidad y mínima carga cognitiva.</p>
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
                  <span>🎯</span> ${h.impacto || "Alta disponibilidad"}
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
            <span>💻</span> Interfaz &amp; Producto en Producción
          </div>
          <div class="hud-galeria-card-sub">
            Visualización multiplataforma Web + Mobile con telemetría en vivo
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
            <span class="bento-badge">01. El Reto</span>
            <span class="bento-icon">⚠️</span>
          </div>
          <h3>Problemática Operativa</h3>
          <p>${proyecto.reto || ""}</p>
          <div class="bento-footer-tag">
            <span>🛑</span> Fricción antes de la automatización
          </div>
        </div>

        <div class="hud-card-bento bento-solucion" data-stagger="1">
          <div class="bento-header">
            <span class="bento-badge">02. La Solución</span>
            <span class="bento-icon">⚡</span>
          </div>
          <h3>Ingeniería &amp; Software</h3>
          <p>${proyecto.solucion || ""}</p>
          <div class="bento-footer-tag">
            <span>🛠️</span> ${(proyecto.stack || []).slice(0, 3).join(" • ")}
          </div>
        </div>

        <div class="hud-card-bento bento-resultado" data-stagger="2">
          <div class="bento-header">
            <span class="bento-badge">03. Resultado</span>
            <span class="bento-icon">📈</span>
          </div>
          <h3>Impacto en Negocio</h3>
          <p>${proyecto.resultado || ""}</p>
          <div class="bento-footer-tag">
            <span style="color:#10b981;">✓</span> ${proyecto.eficiencia?.resumen?.porcentaje || "Operación 100% optimizada"}
          </div>
        </div>
      </div>

      <!-- Módulos de Arquitectura Clave -->
      ${hotspotsHTML}

      <!-- Gráfico interactivo Recharts: Eficiencia Operativa -->
      <section class="bloque bloque-eficiencia hud-reveal">
        <div id="hud-eficiencia-container"></div>
      </section>
    `;
  }

  // ── HUD del caso de estudio ───────────────────────────────────
  function abrirCaso(proyecto, onCerrar) {
    aplicarAcento(proyecto);
    onCerrarActual = onCerrar || null;

    const esHuerto = proyecto.planeta?.tipo === "huerto";
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
      cerrarBtn.innerHTML = "← Volver a órbita";
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

    const botonPlaneta = esHuerto
      ? `<button type="button" class="btn btn-cosecha-recorrido btn-abrir-inspeccion-360">
          <span style="font-size:16px">🌿</span> Recorrer Huerto &amp; Cultivos 360°
        </button>`
      : `<button type="button" class="btn btn-secundario btn-abrir-inspeccion-360" style="margin-top:6px;border-color:var(--accent);box-shadow:0 0 20px -4px var(--accent);display:inline-flex;align-items:center;gap:8px;">
          <span style="font-size:16px">🪐</span> Inspeccionar Planeta 360°
        </button>`;

    const eyebrowTxt = esHuerto
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

    // Inicializar simulador de Cosecha Hidalguense
    if (proyecto.storytelling?.solucion?.simulador || proyecto.storytelling?.galeria?.simulador) {
      setupSimuladorCosecha(wrap, proyecto);
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
    hud.classList.remove("tema-cosecha");
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

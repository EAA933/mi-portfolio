/**
 * inspector360.js — Modo Inspección 3D Orbital Libre (Planet 360° Viewer)
 * ------------------------------------------------------------------
 * Permite orbitar libremente con mouse/touch alrededor del planeta de
 * cualquier proyecto para admirar sus shaders procedurales, nubes,
 * luces nocturnas y atmósfera en 360°.
 * Integra puntos de interés flotantes (hotspots 3D) en la superficie
 * que proyectan detalles de la arquitectura técnica del proyecto.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { gsap } from "gsap";

export function crearInspector360(escena, camara, projects, planetas, onSalir) {
  // Estado interno
  const estado = {
    activo: false,
    indice: -1,
    theta: 0,
    phi: Math.PI / 2,
    distancia: 22,
    targetTheta: 0,
    targetPhi: Math.PI / 2,
    targetDistancia: 22,
    distMin: 14,
    distMax: 42,
    autoRotar: true,
    mostrarHotspots: true,
    arrastrando: false,
    prevPointer: { x: 0, y: 0 },
    velTheta: 0,
    velPhi: 0,
    touchDistInicial: 0,
    hotspotActivo: null,
  };

  // Vector auxiliar de proyección
  const _v = new THREE.Vector3();
  const _norm = new THREE.Vector3();
  const _toCam = new THREE.Vector3();

  // ── Contenedor principal de la interfaz 360 ──────────────────
  const cont = document.createElement("div");
  cont.id = "inspector-360";
  cont.className = "inspector-360";
  cont.innerHTML = `
    <!-- Barra superior -->
    <header class="i360-header">
      <div class="i360-badge">
        <span class="i360-pulse"></span>
        <span class="i360-badge-txt">MODO INSPECCIÓN 360° // ÓRBITA LIBRE</span>
      </div>
      <div class="i360-titular">
        <h2 class="i360-nombre">Nombre Proyecto</h2>
        <span class="i360-tipo">TIPO DE CUERPO CELESTE</span>
      </div>
      <button type="button" class="btn btn-secundario i360-btn-cerrar">
        <span>✕ Volver al caso de estudio</span>
      </button>
    </header>

    <!-- Capa de Hotspots 3D proyectados -->
    <div class="i360-hotspots-layer" id="i360-hotspots-layer"></div>

    <!-- Modal emergente para detalle de hotspot -->
    <div class="i360-card-hotspot" id="i360-card-hotspot">
      <div class="ich-head">
        <span class="ich-icon">🌐</span>
        <div>
          <span class="ich-cat">ARQUITECTURA</span>
          <h4 class="ich-titulo">Título del Hotspot</h4>
        </div>
        <button type="button" class="ich-cerrar" aria-label="Cerrar detalle">✕</button>
      </div>
      <p class="ich-desc">Descripción técnica de la solución implementada en este sector del planeta.</p>
      <div class="ich-footer">
        <span class="ich-impacto-lbl">Impacto:</span>
        <span class="ich-impacto-val">Sub-50ms</span>
      </div>
    </div>

    <!-- Barra inferior con controles tácticos -->
    <footer class="i360-footer">
      <div class="i360-hint">
        <span class="i360-hint-icon">🖱️</span>
        <span>Arrastra para rotar en 360° • Rueda o pellizca para zoom</span>
      </div>
      <div class="i360-controles">
        <button type="button" class="i360-ctrl-btn i360-btn-autorotar activo" title="Alternar auto-rotación">
          <span class="i360-ctrl-icon">🔄</span> Auto-rotación
        </button>
        <button type="button" class="i360-ctrl-btn i360-btn-hotspots activo" title="Mostrar/ocultar puntos de interés">
          <span class="i360-ctrl-icon">👁️</span> Puntos de arquitectura
        </button>
        <button type="button" class="i360-ctrl-btn i360-btn-reset" title="Restablecer ángulo y distancia">
          <span class="i360-ctrl-icon">🎯</span> Centrar vista
        </button>
      </div>
    </footer>
  `;
  document.body.appendChild(cont);

  // Referencias a elementos internos
  const elHeaderNombre = cont.querySelector(".i360-nombre");
  const elHeaderTipo = cont.querySelector(".i360-tipo");
  const elBadgeTxt = cont.querySelector(".i360-badge-txt");
  const elBtnCerrar = cont.querySelector(".i360-btn-cerrar");
  const elHotspotsLayer = cont.querySelector("#i360-hotspots-layer");
  const elCardHotspot = cont.querySelector("#i360-card-hotspot");
  const elCardIcon = cont.querySelector(".ich-icon");
  const elCardCat = cont.querySelector(".ich-cat");
  const elCardTitulo = cont.querySelector(".ich-titulo");
  const elCardDesc = cont.querySelector(".ich-desc");
  const elCardImpacto = cont.querySelector(".ich-impacto-val");
  const elBtnCardCerrar = cont.querySelector(".ich-cerrar");
  const elBtnAutoRotar = cont.querySelector(".i360-btn-autorotar");
  const elBtnHotspots = cont.querySelector(".i360-btn-hotspots");
  const elBtnReset = cont.querySelector(".i360-btn-reset");
  const elHint = cont.querySelector(".i360-hint");

  // Elementos HTML de los hotspots del planeta activo
  let hotspotElements = [];

  // ── Gestos de Mouse / Touch para rotación orbital libre ─────
  cont.addEventListener("pointerdown", (e) => {
    // Si se hizo clic en un botón o en el card, no rotar
    if (e.target.closest("button") || e.target.closest(".i360-card-hotspot") || e.target.closest(".i360-hotspot-punto")) {
      return;
    }
    estado.arrastrando = true;
    estado.prevPointer.x = e.clientX;
    estado.prevPointer.y = e.clientY;
    estado.velTheta = 0;
    estado.velPhi = 0;
    cont.classList.add("arrastrando");
    try { cont.setPointerCapture(e.pointerId); } catch (err) {}
  });

  cont.addEventListener("pointermove", (e) => {
    if (!estado.arrastrando) return;
    const dx = e.clientX - estado.prevPointer.x;
    const dy = e.clientY - estado.prevPointer.y;
    estado.prevPointer.x = e.clientX;
    estado.prevPointer.y = e.clientY;

    const sensRot = 0.0055;
    const dTheta = -dx * sensRot;
    const dPhi = -dy * sensRot;

    estado.targetTheta += dTheta;
    estado.targetPhi = Math.max(0.12, Math.min(Math.PI - 0.12, estado.targetPhi + dPhi));

    estado.velTheta = dTheta;
    estado.velPhi = dPhi;
  });

  const finalizarArrastre = (e) => {
    if (estado.arrastrando) {
      estado.arrastrando = false;
      cont.classList.remove("arrastrando");
      try { if (e?.pointerId) cont.releasePointerCapture(e.pointerId); } catch (err) {}
    }
  };
  cont.addEventListener("pointerup", finalizarArrastre);
  cont.addEventListener("pointercancel", finalizarArrastre);

  // Zoom con rueda del ratón
  cont.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY * 0.02;
    estado.targetDistancia = Math.max(estado.distMin, Math.min(estado.distMax, estado.targetDistancia + factor));
  }, { passive: false });

  // Soporte para gestos táctiles multitouch (pinch-to-zoom)
  cont.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      estado.touchDistInicial = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  cont.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = (estado.touchDistInicial - dist) * 0.05;
      estado.touchDistInicial = dist;
      estado.targetDistancia = Math.max(estado.distMin, Math.min(estado.distMax, estado.targetDistancia + diff));
    }
  }, { passive: true });

  // ── Botones de la barra de controles ─────────────────────────
  elBtnAutoRotar.addEventListener("click", () => {
    estado.autoRotar = !estado.autoRotar;
    elBtnAutoRotar.classList.toggle("activo", estado.autoRotar);
  });

  elBtnHotspots.addEventListener("click", () => {
    estado.mostrarHotspots = !estado.mostrarHotspots;
    elBtnHotspots.classList.toggle("activo", estado.mostrarHotspots);
    elHotspotsLayer.style.display = estado.mostrarHotspots ? "block" : "none";
    if (!estado.mostrarHotspots) ocultarCardHotspot();
  });

  elBtnReset.addEventListener("click", () => {
    const proyecto = projects[estado.indice];
    const rBase = 8 * (proyecto?.planeta?.tamaño ?? 1);
    estado.targetTheta = 0.35;
    estado.targetPhi = Math.PI / 2.2;
    estado.targetDistancia = rBase * 2.5;
    estado.velTheta = 0;
    estado.velPhi = 0;
  });

  elBtnCerrar.addEventListener("click", () => cerrar());
  elBtnCardCerrar.addEventListener("click", () => ocultarCardHotspot());

  // Tecla ESC para salir
  window.addEventListener("keydown", (e) => {
    if (estado.activo && (e.key === "Escape" || e.key === "Esc")) {
      cerrar();
    }
  });

  function mostrarCardHotspot(hotspot, acento) {
    estado.hotspotActivo = hotspot;
    elCardIcon.textContent = hotspot.icono || "🌐";
    elCardCat.textContent = hotspot.categoria || "ARQUITECTURA";
    elCardCat.style.color = acento;
    elCardTitulo.textContent = hotspot.titulo;
    elCardDesc.textContent = hotspot.descripcion;
    elCardImpacto.textContent = hotspot.impacto || "Alto impacto";
    elCardImpacto.style.color = acento;
    elCardHotspot.style.setProperty("--ich-acc", acento);
    elCardHotspot.classList.add("visible");
  }

  function ocultarCardHotspot() {
    estado.hotspotActivo = null;
    elCardHotspot.classList.remove("visible");
  }

  // ── Configurar Hotspots para el proyecto ─────────────────────
  function montarHotspotsProyecto(proyecto) {
    elHotspotsLayer.innerHTML = "";
    hotspotElements = [];
    ocultarCardHotspot();

    const acento = proyecto.planeta?.acento || "#38bdf8";
    const lista = proyecto.hotspots || [];

    lista.forEach((hs, idx) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "i360-hotspot-punto";
      item.setAttribute("aria-label", hs.titulo);
      item.style.setProperty("--hs-acc", acento);

      item.innerHTML = `
        <span class="hs-ring"></span>
        <span class="hs-core"></span>
        <span class="hs-tag">${hs.icono || "⚡"} ${hs.titulo}</span>
      `;

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        mostrarCardHotspot(hs, acento);
      });

      item.addEventListener("mouseenter", () => {
        mostrarCardHotspot(hs, acento);
      });

      elHotspotsLayer.appendChild(item);

      hotspotElements.push({
        el: item,
        data: hs,
        posVec: new THREE.Vector3(hs.pos[0], hs.pos[1], hs.pos[2]).normalize(),
      });
    });
  }

  // ── Abrir Inspector 360 ──────────────────────────────────────
  function abrir(indice) {
    if (indice < 0 || indice >= projects.length) return;
    const proyecto = projects[indice];
    const planeta = planetas[indice];
    if (!proyecto || !planeta) return;

    estado.activo = true;
    estado.indice = indice;
    const acento = proyecto.planeta?.acento || "#38bdf8";

    // Radio del planeta
    const rBase = 8 * (proyecto.planeta?.tamaño ?? 1);
    estado.distMin = rBase * 1.35;
    estado.distMax = rBase * 4.2;
    estado.distancia = rBase * 2.5;
    estado.targetDistancia = estado.distancia;

    // Calcular ángulos theta y phi iniciales a partir de la posición de la cámara
    const P = planeta.grupo.position;
    const offset = camara.position.clone().sub(P);
    estado.distancia = offset.length();
    estado.targetDistancia = Math.max(estado.distMin, Math.min(estado.distMax, estado.distancia));
    estado.phi = Math.acos(THREE.MathUtils.clamp(offset.y / estado.distancia, -1, 1));
    estado.theta = Math.atan2(offset.x, offset.z);
    estado.targetPhi = estado.phi;
    estado.targetTheta = estado.theta;

    // Llenar datos de cabecera
    elHeaderNombre.textContent = proyecto.nombre;
    const esHuerto = proyecto.planeta?.tipo === "huerto";
    if (elBadgeTxt) {
      elBadgeTxt.textContent = esHuerto
        ? "🌿 RECORRIDO BOTÁNICO 360° // HUERTO Y PARCELAS"
        : "MODO INSPECCIÓN 360° // ÓRBITA LIBRE";
    }

    const tipos = {
      huerto: "PRODUCCIÓN AGRÍCOLA • HUERTO ORGÁNICO & CULTIVOS DE HIDALGO",
      terrestre: "MUNDO FÉRTIL • BIOMAS & LUCES NOCTURNAS",
      gaseoso: "GIGANTE GASEOSO • ANILLOS DE HIELO & AURORAS",
      hielo: "MUNDO CRIOGÉNICO • GLACIARES DE METANO",
      cristal: "PLANETA DE CRISTAL • RED GEOMÉTRICA DE DATOS",
      medico: "MUNDO CLÍNICO • ESCÁNER DE PRECIOS & ANILLO DE CÁPSULAS",
      luna: "SATÉLITE PLATEADO • CRÁTERES & LENTES EN ÓRBITA",
    };
    elHeaderTipo.textContent = tipos[proyecto.planeta?.tipo] || "CUERPO CELESTE";
    cont.style.setProperty("--i360-acc", acento);
    cont.classList.toggle("tema-huerto", esHuerto);

    if (elHint) {
      elHint.innerHTML = esHuerto
        ? `<span class="i360-hint-icon">🌿</span><span>Gira para recorrer el huerto • Rueda para acercarte a los sembradíos</span>`
        : `<span class="i360-hint-icon">🖱️</span><span>Arrastra para rotar en 360° • Rueda o pellizca para zoom</span>`;
    }

    // Montar hotspots
    montarHotspotsProyecto(proyecto);

    // Clases CSS
    document.body.classList.add("modo-inspeccion-360");
    document.body.classList.remove("enfoque-hud");
    cont.classList.add("activo");
  }

  // ── Cerrar Inspector 360 ─────────────────────────────────────
  function cerrar() {
    if (!estado.activo) return;
    estado.activo = false;
    cont.classList.remove("activo");
    document.body.classList.remove("modo-inspeccion-360");
    ocultarCardHotspot();

    if (onSalir) onSalir(estado.indice);
  }

  // ── Actualización por frame (Tick loop) ──────────────────────
  function actualizar(dt) {
    if (!estado.activo || estado.indice < 0) return;
    const proyecto = projects[estado.indice];
    const planeta = planetas[estado.indice];
    if (!proyecto || !planeta) return;

    const rBase = 8 * (proyecto.planeta?.tamaño ?? 1);

    // Auto-rotación constante cuando el usuario no está arrastrando
    if (estado.autoRotar && !estado.arrastrando) {
      estado.targetTheta += 0.18 * dt;
    }

    // Inercia angular
    if (!estado.arrastrando && (Math.abs(estado.velTheta) > 0.0001 || Math.abs(estado.velPhi) > 0.0001)) {
      estado.targetTheta += estado.velTheta;
      estado.targetPhi = Math.max(0.12, Math.min(Math.PI - 0.12, estado.targetPhi + estado.velPhi));
      estado.velTheta *= 0.91;
      estado.velPhi *= 0.91;
    }

    // Interpolación suave (lerp)
    estado.theta += (estado.targetTheta - estado.theta) * 0.14;
    estado.phi += (estado.targetPhi - estado.phi) * 0.14;
    estado.distancia += (estado.targetDistancia - estado.distancia) * 0.12;

    // Calcular posición esférica de la cámara alrededor del planeta
    const P = planeta.grupo.position;
    const sinPhi = Math.sin(estado.phi);
    const cosPhi = Math.cos(estado.phi);
    const sinTheta = Math.sin(estado.theta);
    const cosTheta = Math.cos(estado.theta);

    const camX = P.x + estado.distancia * sinPhi * sinTheta;
    const camY = P.y + estado.distancia * cosPhi;
    const camZ = P.z + estado.distancia * sinPhi * cosTheta;

    camara.position.set(camX, camY, camZ);
    camara.lookAt(P);

    // ── Actualizar Hotspots 3D sobre la superficie del planeta ──
    if (estado.mostrarHotspots && hotspotElements.length) {
      const radioSuperficie = rBase * 1.03;
      const camPos = camara.position;

      for (let i = 0; i < hotspotElements.length; i++) {
        const hs = hotspotElements[i];
        // Posición tridimensional sobre la superficie
        _v.copy(hs.posVec).multiplyScalar(radioSuperficie).add(P);

        // Vector normal y vector hacia la cámara
        _norm.copy(hs.posVec).normalize();
        _toCam.copy(camPos).sub(_v).normalize();

        // Producto punto: determina si está en el hemisferio visible
        const dot = _norm.dot(_toCam);

        if (dot <= 0.02) {
          // Ocultar si está detrás del planeta
          hs.el.style.opacity = "0";
          hs.el.style.pointerEvents = "none";
        } else {
          // Proyectar coordenadas 3D a píxeles de pantalla
          _v.project(camara);
          const px = (_v.x * 0.5 + 0.5) * window.innerWidth;
          const py = (-_v.y * 0.5 + 0.5) * window.innerHeight;

          hs.el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
          const op = Math.min(1, Math.max(0, (dot - 0.02) * 3.8));
          hs.el.style.opacity = op.toFixed(2);
          hs.el.style.pointerEvents = dot > 0.15 ? "auto" : "none";
        }
      }
    }
  }

  return {
    abrir,
    cerrar,
    actualizar,
    estaActivo: () => estado.activo,
    getIndice: () => estado.indice,
  };
}

export default crearInspector360;

/**
 * radar.js — Minimapa y Radar Táctico de Navegación Espacial
 * ------------------------------------------------------------------
 * Muestra el plano de ruta estelar con los sectores del viaje (proyectos),
 * posición en tiempo real de la nave y saltos directos por clic.
 * ------------------------------------------------------------------
 */

export function crearRadar(projects, rig, onSaltar) {
  const radar = document.createElement("nav");
  radar.id = "radar-estelar";
  radar.setAttribute("aria-label", "Radar de navegación estelar");

  const sectores = [
    {
      codigo: "00",
      etiqueta: "HANGAR",
      subtitulo: "Inicio / Despegue",
      progreso: 0.0,
      rangoMin: 0.0,
      rangoMax: rig.rangos[0].aproximacion,
    },
    ...projects.map((p, i) => ({
      codigo: `0${i + 1}`,
      etiqueta: p.nombre.split(" ")[0].toUpperCase(),
      nombreCompleto: p.nombre,
      subtitulo: p.categoria === "automatizacion" ? "Automatización" : "Sitio Web",
      progreso: rig.rangos[i].centro,
      rangoMin: rig.rangos[i].aproximacion,
      rangoMax: rig.rangos[i].fin,
      acento: p.planeta?.acento || "#38bdf8",
    })),
    {
      codigo: `0${projects.length + 1}`,
      etiqueta: "GALAXIA",
      subtitulo: "Contacto & Filtros",
      progreso: 0.985,
      rangoMin: rig.rangos[projects.length - 1].fin,
      rangoMax: 1.0,
      acento: "#a855f7",
    },
  ];

  const itemsHTML = sectores
    .map(
      (s, idx) => `
      <button type="button" class="radar-sector" data-index="${idx}" data-prog="${s.progreso}" title="${s.nombreCompleto || s.etiqueta}: ${s.subtitulo}">
        <span class="radar-nodo">
          <span class="radar-pulso"></span>
        </span>
        <span class="radar-info">
          <span class="radar-cod">SEC-${s.codigo}</span>
          <span class="radar-tag">${s.etiqueta}</span>
        </span>
      </button>
    `
    )
    .join("");

  radar.innerHTML = `
    <div class="radar-cabecera">
      <span class="radar-icono">🛰️</span>
      <span class="radar-titulo">RUTA ESTELAR</span>
      <span class="radar-telemetria" id="radar-pct">00%</span>
    </div>
    <div class="radar-track">
      <div class="radar-linea">
        <div class="radar-progreso-linea" id="radar-fill"></div>
        <div class="radar-ship-cursor" id="radar-cursor" title="Posición actual de la nave">
          <span class="ship-icon">▲</span>
        </div>
      </div>
      <div class="radar-sectores">${itemsHTML}</div>
    </div>
  `;

  document.body.appendChild(radar);

  const fillEl = radar.querySelector("#radar-fill");
  const cursorEl = radar.querySelector("#radar-cursor");
  const pctEl = radar.querySelector("#radar-pct");
  const botonesSectores = radar.querySelectorAll(".radar-sector");

  botonesSectores.forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = parseFloat(btn.dataset.prog);
      if (!isNaN(p)) {
        onSaltar(p);
      }
    });
  });

  let sectorActivo = -1;

  function actualizar(progreso) {
    // La ruta estelar empieza cuando sale la nave del hangar / hero (progreso >= 0.025)
    const enVuelo = progreso >= 0.025;
    radar.classList.toggle("en-vuelo", enVuelo);

    const pClamped = Math.max(0, Math.min(progreso, 1));
    const pct = Math.round(pClamped * 100);
    if (pctEl) pctEl.textContent = `${pct < 10 ? "0" + pct : pct}%`;

    if (fillEl) fillEl.style.height = `${pClamped * 100}%`;
    if (cursorEl) cursorEl.style.top = `${pClamped * 100}%`;

    // Detectar sector activo
    let nuevoActivo = -1;
    for (let i = 0; i < sectores.length; i++) {
      const s = sectores[i];
      if (progreso >= s.rangoMin && progreso <= s.rangoMax) {
        nuevoActivo = i;
        break;
      }
    }
    if (nuevoActivo === -1) {
      if (progreso < sectores[0].rangoMin) nuevoActivo = 0;
      else nuevoActivo = sectores.length - 1;
    }

    if (nuevoActivo !== sectorActivo) {
      sectorActivo = nuevoActivo;
      botonesSectores.forEach((btn, i) => {
        btn.classList.toggle("activo", i === sectorActivo);
      });
      const acento = sectores[sectorActivo]?.acento;
      if (acento) {
        radar.style.setProperty("--radar-acc", acento);
      }
    }
  }

  return {
    el: radar,
    actualizar,
  };
}

export default crearRadar;

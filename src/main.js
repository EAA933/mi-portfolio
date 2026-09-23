/**
 * main.js — arranque de la aplicación
 * ------------------------------------------------------------------
 * Viaje espacial: la NAVE alienígena guía a la cámara entre las
 * estrellas, pasa junto a los planetas (cada uno un proyecto), y al
 * elegir uno la nave DESCIENDE/aterriza y se abre el caso de estudio.
 *
 * Un solo bucle de render dentro de gsap.ticker.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { gsap } from "gsap";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import "./styles/base.css";
import "./styles/hud.css";
import "./styles/grid.css";
import "./styles/radar.css";
import "./styles/contact.css";

import projects from "./data/projects.js";
import site from "./data/site.js";
import { crearGrid } from "./ui/grid.js";
import { crearRadar } from "./ui/radar.js";
import { crearModalContacto } from "./ui/contactModal.js";
import { detectarCapacidades, GestorCalidad } from "./core/quality.js";
import { Renderizador } from "./core/renderer.js";
import { RigCamara } from "./core/cameraRig.js";
import { Scroll } from "./core/scroll.js";
import { Starfield } from "./scene/starfield.js";
import { crearPlaneta } from "./scene/planets/factory.js";
import { crearNave } from "./scene/ship.js";
import { crearGalaxia } from "./scene/galaxy.js";
import { crearHUD } from "./ui/hud.js";
import { router } from "./ui/router.js";

// smoothstep para transiciones por progreso.
const suave = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

const cap = detectarCapacidades();

if (!cap.webgl || cap.reducirMovimiento) {
  // Sin 3D: arrancamos directo en Vista rápida (usable en <1s).
  document.body.classList.add("modo-fallback", "modo-rapida");
  crearGrid(projects, site);
  const btn3d = document.querySelector('#switch-vista [data-vista="3d"]');
  if (btn3d) btn3d.disabled = true;
  const pl = document.getElementById("preloader");
  if (pl) pl.classList.add("oculto"); // sin 3D no hay carga pesada
  console.info("[main] Modo fallback → Vista rápida (sin WebGL o movimiento reducido).");
} else {
  iniciar3D();
}

function iniciar3D() {
  document.body.classList.add("modo-3d");

  const alturaVh = projects.length * 150 + 320; // recorrido de scroll
  document.getElementById("escena-scroll").style.height = `${alturaVh}vh`;

  // — Calidad y renderer —
  const calidad = new GestorCalidad(cap);
  const canvas = document.getElementById("lienzo");
  const rzd = new Renderizador(canvas, calidad);
  const { escena, camara } = rzd;

  // — Iluminación basada en imagen (IBL) para que los metales reflejen —
  const pmrem = new THREE.PMREMGenerator(rzd.renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // Sol único (alto contraste día/noche) + relleno frío tenue.
  const sol = new THREE.DirectionalLight(0xffffff, 2.3);
  sol.position.set(-1, 0.4, 0.6);
  escena.add(sol);
  escena.add(new THREE.HemisphereLight(0x8098c0, 0x060608, 0.28));
  const solDir = sol.position.clone().normalize();

  // — Cielo estrellado con túnel warp relativista —
  const starfield = new Starfield(escena, calidad.params.estrellas, camara);

  // — Trayectoria de la cámara (derivada de projects.js) —
  const rig = new RigCamara(projects);

  // — Planetas —
  const planetas = [];
  projects.forEach((p, j) => {
    const planeta = crearPlaneta(p);
    planeta.grupo.position.copy(rig.posicionesPlanetas[j]);
    planeta.grupo.userData.indice = j; // para el raycaster
    planeta.grupo.scale.setScalar(0.001); // aparecen con la "entrada"
    escena.add(planeta.grupo);
    planetas.push(planeta);
  });

  // — Preloader con progreso real (rastrea el modelo .glb y demás cargas) —
  const preloader = document.getElementById("preloader");
  const fill = preloader ? preloader.querySelector(".pl-fill") : null;
  const cargas = new THREE.LoadingManager();
  const ocultarPreloader = () => {
    if (fill) fill.style.width = "100%";
    if (preloader) preloader.classList.add("oculto");
  };
  cargas.onProgress = (_url, cargado, total) => {
    if (fill && total) fill.style.width = `${Math.round((cargado / total) * 100)}%`;
  };
  cargas.onLoad = ocultarPreloader;
  cargas.onError = ocultarPreloader;
  setTimeout(ocultarPreloader, 7000); // red de seguridad

  // — Nave (modelo .glb con fallback; guía la cámara) —
  const nave = crearNave(cargas);
  escena.add(nave.grupo);

  // — Galaxia (vista final): estrella central + órbitas —
  const centroGalaxia = new THREE.Vector3();
  rig.posicionesPlanetas.forEach((p) => centroGalaxia.add(p));
  centroGalaxia.multiplyScalar(1 / rig.posicionesPlanetas.length);
  const galaxia = crearGalaxia(escena, projects, centroGalaxia);

  // Etiquetas HTML de cada planeta (se proyectan en la vista de galaxia).
  const contEtiquetas = document.getElementById("etiquetas");
  const etiquetas = projects.map((p, i) => {
    const et = document.createElement("div");
    et.className = "etiqueta";
    et.innerHTML = `<span class="punto" style="background:${p.planeta?.acento || "#fff"}"></span>${p.nombre}<span class="tagline">${p.tagline || ""}</span>`;
    et.addEventListener("click", () => irAProyecto(i));
    contEtiquetas.appendChild(et);
    return et;
  });

  // Filtros del CTA final.
  let filtro = "todos";
  const cta = document.getElementById("cta-final");
  cta.querySelectorAll(".filtros button").forEach((b) => {
    b.addEventListener("click", () => {
      filtro = b.dataset.filtro;
      cta.querySelectorAll(".filtros button").forEach((x) => x.classList.toggle("activo", x === b));
    });
  });
  const _proj = new THREE.Vector3();

  // — Scroll —
  const scroll = new Scroll(rig.snaps);
  rig.actualizar(0);

  // — Interfaz (Fase 3) —
  const hud = crearHUD();

  // Estado de la interacción cámara/HUD.
  const modo = { enHUD: false, transicion: false, indice: -1, orbita: null, vistaRapida: false };

  // ── Aterrizaje: la cámara (y la nave que la precede) descienden al
  //    planeta y se abre el caso de estudio ─────────────────────────
  function aterrizar(i) {
    if (modo.transicion || modo.enHUD) return;
    modo.transicion = true;
    modo.indice = i;
    scroll.lenis.stop();
    hud.ocultarPanel();

    // Guardamos la pose de órbita para volver exactamente.
    modo.orbita = {
      pos: camara.position.clone(),
      quat: camara.quaternion.clone(),
      fov: camara.fov,
    };

    const P = planetas[i].grupo.position;
    const dir = camara.position.clone().sub(P).normalize();
    const posTo = P.clone().addScaledVector(dir, 19).add(new THREE.Vector3(0, 3, 0));
    const dummy = new THREE.Object3D();
    dummy.position.copy(posTo);
    dummy.lookAt(P);
    const quatTo = dummy.quaternion.clone();

    tweenCamara(posTo, quatTo, 66, 1.2, "power3.in", () => {
      modo.transicion = false;
      modo.enHUD = true;
      hud.abrirCaso(projects[i], () => regresar());
    });
    // Desenfoque al "cruzar la atmósfera".
    gsap.delayedCall(0.85, () => document.body.classList.add("enfoque-hud"));
  }

  function regresar() {
    if (!modo.orbita) return;
    modo.transicion = true;
    modo.enHUD = false;
    document.body.classList.remove("enfoque-hud");
    const o = modo.orbita;
    tweenCamara(o.pos, o.quat, o.fov, 0.9, "power2.inOut", () => {
      modo.transicion = false;
      modo.indice = -1;
      scroll.lenis.start();
    });
  }

  // Tween de cámara (posición + orientación por slerp + FOV).
  function tweenCamara(posTo, quatTo, fovTo, dur, ease, onDone) {
    const posFrom = camara.position.clone();
    const quatFrom = camara.quaternion.clone();
    const fovFrom = camara.fov;
    const st = { k: 0 };
    gsap.to(st, {
      k: 1,
      duration: dur,
      ease,
      onUpdate() {
        camara.position.lerpVectors(posFrom, posTo, st.k);
        camara.quaternion.slerpQuaternions(quatFrom, quatTo, st.k);
        camara.fov = fovFrom + (fovTo - fovFrom) * st.k;
        camara.updateProjectionMatrix();
      },
      onComplete: onDone,
    });
  }

  // ── Ruteo (#slug) + botón atrás ────────────────────────────────
  function irAProyecto(i) {
    dispararSaltoWarp(1.2);
    router.abrir(projects[i].slug); // crea entrada en el historial
    aterrizar(i);
  }
  router.alCambiar((slug) => {
    const i = slug ? projects.findIndex((p) => p.slug === slug) : -1;
    if (i >= 0 && !modo.enHUD && !modo.transicion) aterrizar(i);
    else if (i < 0 && (modo.enHUD || modo.transicion)) hud.cerrarCaso();
  });
  // Cerrar (botón "Volver a órbita" o ESC) = retroceder en el historial,
  // así el cierre por UI y por botón-atrás usan EL MISMO camino (popstate).
  function cerrarUI() {
    if (router.slug()) history.back();
    else hud.cerrarCaso();
  }
  hud.pedirCerrar = cerrarUI;

  // ── Navegación superior y helpers de scroll ────────────────────
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  // ── Sistema de Sobrecarga / Salto Hiperespacial (Warp Drive) ──
  const warpState = { boost: 0 };
  const dispararSaltoWarp = (duracion = 1.35) => {
    gsap.killTweensOf(warpState);
    warpState.boost = 1.0;
    gsap.to(warpState, {
      boost: 0,
      duration: duracion,
      ease: "power2.out",
    });
  };

  const irA = (prog, conWarp = true) => {
    if (conWarp) dispararSaltoWarp(1.4);
    scroll.lenis.scrollTo(maxScroll() * prog, { duration: 1.4 });
  };

  // ── Navegación por teclado (Flechas, PageUp/Down, Space, Home, End) ───
  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;

    if (e.key === "Escape") {
      if (hud.estaAbierto()) {
        cerrarUI();
        return;
      }
    }

    // Si el caso de estudio está abierto o la cámara está en transición, no interferir con scroll modal
    if (modo.enHUD || modo.transicion) return;

    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      scroll.lenis.scrollTo(scroll.lenis.scroll + window.innerHeight * 0.75, { duration: 0.8 });
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      scroll.lenis.scrollTo(scroll.lenis.scroll - window.innerHeight * 0.75, { duration: 0.8 });
    } else if (e.key === " ") {
      e.preventDefault();
      const delta = e.shiftKey ? -window.innerHeight * 0.75 : window.innerHeight * 0.75;
      scroll.lenis.scrollTo(scroll.lenis.scroll + delta, { duration: 0.8 });
    } else if (e.key === "Home") {
      e.preventDefault();
      scroll.lenis.scrollTo(0, { duration: 1.2 });
    } else if (e.key === "End") {
      e.preventDefault();
      scroll.lenis.scrollTo(maxScroll(), { duration: 1.4 });
    } else if (e.key === "ArrowRight") {
      // Salto al siguiente planeta u órbita
      e.preventDefault();
      const siguiente = rig.snaps.find((s) => s > scroll.progreso + 0.025);
      if (siguiente !== undefined) irA(siguiente);
    } else if (e.key === "ArrowLeft") {
      // Salto al planeta u órbita anterior
      e.preventDefault();
      const anterior = [...rig.snaps].reverse().find((s) => s < scroll.progreso - 0.025);
      if (anterior !== undefined) irA(anterior);
    }
  });

  // ── Raycaster & Pointer Interaction ───────────────────────────
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const mouseNorm = { x: 0, y: 0 };
  let hoveredPlanetIndex = -1;
  const targetLockEl = document.getElementById("target-lock");
  const targetLockNombre = targetLockEl?.querySelector(".tl-nombre");

  window.addEventListener("pointermove", (e) => {
    mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (modo.enHUD || modo.transicion || modo.vistaRapida) {
      if (hoveredPlanetIndex !== -1) {
        hoveredPlanetIndex = -1;
        targetLockEl?.classList.remove("visible");
        document.body.style.cursor = "";
      }
      return;
    }

    // Raycaster para detectar si el cursor está sobre un planeta
    ndc.x = mouseNorm.x;
    ndc.y = mouseNorm.y;
    ray.setFromCamera(ndc, camara);
    const hits = ray.intersectObjects(planetas.map((p) => p.grupo), true);
    if (hits.length && scroll.progreso > 0.02) {
      let o = hits[0].object;
      while (o && o.userData.indice === undefined) o = o.parent;
      if (o && o.userData.indice !== undefined) {
        hoveredPlanetIndex = o.userData.indice;
        document.body.style.cursor = "pointer";
      } else {
        hoveredPlanetIndex = -1;
        document.body.style.cursor = "";
      }
    } else {
      hoveredPlanetIndex = -1;
      document.body.style.cursor = "";
    }
  });

  window.addEventListener("click", (e) => {
    if (modo.enHUD || modo.transicion) return;
    if (e.target.closest("#panel-orbita") || e.target.closest("#hud") || e.target.closest("#nav") || e.target.closest("#etiquetas") || e.target.closest("#cta-final") || e.target.closest("#hero-3d")) return;
    ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(ndc, camara);
    const hits = ray.intersectObjects(planetas.map((p) => p.grupo), true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && o.userData.indice === undefined) o = o.parent;
      if (o) irAProyecto(o.userData.indice);
    }
  });

  // — Modal de contacto profesional y captura de leads —
  const modalContacto = crearModalContacto(site);

  // Delegar apertura del modal de contacto en cualquier botón de la interfaz
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".btn-trigger-contacto");
    if (trigger) {
      e.preventDefault();
      const tipo = trigger.dataset.tipo;
      const mensaje = trigger.dataset.mensaje;
      modalContacto.abrir({ tipo, mensaje });
    }
  });

  // — Radar de navegación estelar —
  const radar = crearRadar(projects, rig, (targetProgreso) => {
    irA(targetProgreso);
  });

  // Botón directo para explorar en el hero
  document.querySelector(".hero-btn-explorar")?.addEventListener("click", (e) => {
    e.preventDefault();
    irA(rig.rangos[0].centro);
  });

  document.querySelectorAll("#nav .enlaces a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const t = a.getAttribute("href");
      if (t === "#proyectos") irA(rig.rangos[0].centro);
      else if (t === "#sobre-mi") irA(0.985);
      else if (t === "#contacto") {
        if (modo.vistaRapida) {
          modalContacto.abrir();
        } else {
          irA(1);
          setTimeout(() => modalContacto.abrir(), 500);
        }
      }
    });
  });

  // — Vista rápida (cuadrícula) + switch persistente —
  const gridInstance = crearGrid(projects, site, (idx) => {
    setVista("viaje", true);
    setTimeout(() => {
      irAProyecto(idx);
    }, 100);
  });
  function setVista(v, persistir = true) {
    modo.vistaRapida = v === "rapida";
    document.body.classList.toggle("modo-rapida", modo.vistaRapida);
    document.querySelectorAll("#switch-vista button").forEach((b) =>
      b.classList.toggle("activo", b.dataset.vista === v)
    );
    if (modo.vistaRapida) {
      scroll.lenis.stop();
      gridInstance.activar?.();
    } else {
      scroll.lenis.start();
    }
    if (persistir) { try { localStorage.setItem("ea-vista", v); } catch (e) {} }
  }
  document.querySelectorAll("#switch-vista button").forEach((b) =>
    b.addEventListener("click", () => setVista(b.dataset.vista))
  );
  let vistaGuardada = "3d";
  try { vistaGuardada = localStorage.getItem("ea-vista") || "3d"; } catch (e) {}
  if (vistaGuardada === "rapida") setVista("rapida", false);

  // Hero overlay (nombre) que se desvanece al empezar a navegar.
  const hero = document.getElementById("hero-3d");

  // Panel de órbita: se muestra cuando estamos en la ventana de un planeta.
  let panelActual = -1;

  // ── ÚNICO BUCLE DE RENDER ──────────────────────────────────────
  gsap.ticker.add((_t, deltaMs) => {
    const dt = Math.min((deltaMs || 16.7) / 1000, 0.1);
    // En Vista rápida pausamos todo el 3D (ahorra CPU/GPU).
    if (modo.vistaRapida) return;
    if (!rzd.pausado) calidad.actualizar(dt);

    // Cálculo de factor de warp instantáneo (scroll continuo + sobrecarga por saltos estelares)
    const scrollWarp = THREE.MathUtils.clamp(Math.abs(scroll.velocidad) / 220, 0, 1);
    const warpFactor = Math.max(scrollWarp, warpState.boost);

    // Micro-shake de cabina y dilatación relativista de FOV durante hiperespacio
    const camShake = !modo.enHUD && !modo.transicion ? warpFactor * 0.16 : 0;
    const fovBoost = !modo.enHUD && !modo.transicion ? warpFactor * 5.5 : 0;

    // La cámara sigue al scroll salvo durante aterrizaje/HUD.
    if (!modo.transicion && !modo.enHUD) {
      rig.actualizar(scroll.progreso);
      rig.aplicarSuavizado(camara, camShake, fovBoost);
    }

    // "Entrada": al inicio (hero) solo se ve el nombre sobre negro; al
    // empezar a bajar, la nave y los planetas aparecen y arranca el viaje.
    const entrada = suave(0.02, 0.09, scroll.progreso);

    // La nave precede a la cámara. Durante el recorrido esquiva los planetas;
    // solo al "Explorar" (transición/HUD) se le permite descender al planeta.
    const obstaculos = planetas.map((pl, j) => ({
      centro: pl.grupo.position,
      radio: 8 * (projects[j].planeta?.tamaño ?? 1) * (pl.grupo.scale.x || 1) + 6,
    }));
    nave.actualizar(dt, camara, entrada, obstaculos, modo.transicion || modo.enHUD, mouseNorm, scroll.velocidad, warpFactor);

    // Cielo + warp relativista (estrellas estiradas en velocidad luz).
    starfield.actualizar(dt, scroll.velocidad, camara, warpFactor);

    // Viñeta óptica de velocidad luz
    const warpVignette = document.getElementById("warp-vignette");
    if (warpVignette) {
      const vOp = (!modo.enHUD && !modo.transicion) ? warpFactor * 0.75 : 0;
      warpVignette.style.opacity = vOp.toFixed(3);
    }

    // Planetas vivos.
    for (const pl of planetas) pl.actualizar(dt, solDir);

    // — Galaxia (vista final): interpola planetas a sus órbitas + etiquetas —
    const gP = suave(0.86, 1.0, scroll.progreso);
    galaxia.actualizar(dt, gP);
    for (let j = 0; j < planetas.length; j++) {
      const pathPos = rig.posicionesPlanetas[j];
      if (gP > 0.0001) planetas[j].grupo.position.lerpVectors(pathPos, galaxia.posicionOrbital(j), gP);
      else planetas[j].grupo.position.copy(pathPos);
      // Escala = filtro (galaxia) × entrada (aparición en el hero).
      const activo = filtro === "todos" || projects[j].categoria === filtro;
      const objetivo = (activo ? 1 : 0.5) * entrada;
      const s = planetas[j].grupo.scale.x + (objetivo - planetas[j].grupo.scale.x) * 0.15;
      planetas[j].grupo.scale.setScalar(s);
      planetas[j].grupo.visible = entrada > 0.004; // hero: planetas ocultos
      // Etiqueta proyectada (solo en la vista de galaxia).
      const et = etiquetas[j];
      if (gP > 0.25 && !modo.enHUD && !modo.transicion) {
        _proj.copy(planetas[j].grupo.position).project(camara);
        const enFrente = _proj.z < 1;
        et.style.left = `${(_proj.x * 0.5 + 0.5) * window.innerWidth}px`;
        et.style.top = `${(-_proj.y * 0.5 + 0.5) * window.innerHeight - 44}px`;
        et.style.opacity = String(enFrente ? (activo ? 1 : 0.25) * gP : 0);
        et.style.pointerEvents = enFrente && activo ? "auto" : "none";
      } else {
        et.style.opacity = "0";
        et.style.pointerEvents = "none";
      }
    }
    // CTA final.
    const cVis = suave(0.95, 0.99, scroll.progreso) * (modo.enHUD ? 0 : 1);
    cta.style.opacity = String(cVis);
    cta.style.transform = `translateY(${Math.max(0, (1 - cVis) * 32)}px)`;
    cta.style.pointerEvents = cVis > 0.5 ? "auto" : "none";

    // Hero: se desvanece en el primer 5% del scroll (y se oculta en HUD).
    if (hero)
      hero.style.opacity =
        modo.enHUD || modo.transicion
          ? "0"
          : String(Math.max(1 - scroll.progreso / 0.05, 0));

    // Panel de órbita según la ventana del planeta.
    if (!modo.enHUD && !modo.transicion) {
      let idx = -1;
      for (let j = 0; j < rig.rangos.length; j++) {
        const r = rig.rangos[j];
        if (scroll.progreso >= r.aproximacion && scroll.progreso <= r.fin) { idx = j; break; }
      }
      if (idx !== panelActual) {
        panelActual = idx;
        if (idx === -1) hud.ocultarPanel();
        else {
          const lado = idx % 2 === 0 ? "der" : "izq"; // alterna
          hud.mostrarPanel(projects[idx], lado, (p) => {
            const i = projects.indexOf(p);
            irAProyecto(i);
          });
        }
      }
    }

    // Retícula táctica de Target Lock sobre planetas
    if (targetLockEl) {
      const lockIdx = hoveredPlanetIndex !== -1 ? hoveredPlanetIndex : (panelActual !== -1 ? panelActual : -1);
      if (lockIdx !== -1 && !modo.enHUD && !modo.transicion && entrada > 0.04 && gP < 0.35) {
        _proj.copy(planetas[lockIdx].grupo.position).project(camara);
        if (_proj.z < 1) {
          const sx = (_proj.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-_proj.y * 0.5 + 0.5) * window.innerHeight;
          targetLockEl.style.left = `${sx}px`;
          targetLockEl.style.top = `${sy}px`;
          if (targetLockNombre) targetLockNombre.textContent = projects[lockIdx].nombre.toUpperCase();
          const acc = projects[lockIdx].planeta?.acento || "#38bdf8";
          targetLockEl.style.setProperty("--accent", acc);
          targetLockEl.classList.add("visible");
        } else {
          targetLockEl.classList.remove("visible");
        }
      } else {
        targetLockEl.classList.remove("visible");
      }
    }

    // Actualizar telemetría de radar y posición de nave
    radar.actualizar(scroll.progreso);

    rzd.render();
  });

  // Apertura por URL directa (#slug).
  const slugInicial = router.slug();
  if (slugInicial) {
    const i = projects.findIndex((p) => p.slug === slugInicial);
    if (i >= 0) {
      irA(rig.rangos[i].centro);
      gsap.delayedCall(1.2, () => aterrizar(i));
    }
  }

  window.__portafolio = { rzd, rig, scroll, calidad, modo, aterrizar };
  console.info(`[main] Modo 3D · nivel "${calidad.nivel}" · ${projects.length} planeta(s).`);
}

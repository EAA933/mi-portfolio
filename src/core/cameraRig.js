/**
 * cameraRig.js — trayectoria de cámara sobre una CatmullRomCurve3
 * ------------------------------------------------------------------
 * La cámara NO se mueve solo en Z: recorre una curva suave con puntos
 * de control generados por proyecto, y su lookAt y su FOV interpolan
 * entre keyframes. La posición real "persigue" a la posición objetivo
 * con lerp 0.08 para que nada se sienta rígido.
 *
 * Todo se deriva de projects.js: si agregas un proyecto, aparecen su
 * planeta y su tramo de scroll sin tocar este archivo.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";

// Rango de la línea de tiempo dedicado a los planetas (ver contexto maestro:
// 0.18 al inicio del primer planeta, 0.88 al final del último; antes va el
// despegue y después la galaxia).
const PLANETAS_INICIO = 0.18;
const PLANETAS_FIN = 0.88;

// ── Rangos de scroll por planeta (dinámicos según el nº de proyectos) ──
export function calcularRangosPlanetas(n) {
  const span = PLANETAS_FIN - PLANETAS_INICIO;
  const cada = span / n;
  const rangos = [];
  for (let j = 0; j < n; j++) {
    const inicio = PLANETAS_INICIO + cada * j;
    const fin = PLANETAS_INICIO + cada * (j + 1);
    rangos.push({
      inicio,
      // 18% inicial del tramo es "aproximación" (tránsito de entrada)
      aproximacion: inicio + cada * 0.18,
      centro: inicio + cada * 0.5,
      fin,
    });
  }
  return rangos;
}

// ── Posición 3D de cada planeta ─────────────────────────────────
// Se distribuyen alejándose en -Z, alternando lado y variando altura,
// para que la curva de cámara serpentee en vez de ir recta.
export function posicionPlaneta(j) {
  const lado = j % 2 === 0 ? -1 : 1;
  return new THREE.Vector3(lado * 16, 5 - (j % 3) * 3, -80 - j * 90);
}

function v(x, y, z) {
  return new THREE.Vector3(x, y, z);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function suave(t) {
  // smoothstep para que el lookAt y el FOV entren y salgan sin tirones.
  return t * t * (3 - 2 * t);
}

export class RigCamara {
  constructor(proyectos) {
    this.rangos = calcularRangosPlanetas(proyectos.length);
    this.posicionesPlanetas = proyectos.map((_, j) => posicionPlaneta(j));

    // — Construcción de keyframes { t, pos, look, fov } —
    const kf = [];

    // — INTRO EN EL ESPACIO (0.00–0.12) — la nave deriva entre las
    // estrellas y luego acelera hacia el campo de planetas.
    kf.push({ t: 0.0, pos: v(0, 3, 42), look: v(0, 0, -20), fov: 50 });  // hero: deriva
    kf.push({ t: 0.06, pos: v(2, 4, 20), look: v(-4, 2, -30), fov: 52 }); // gira y encara el rumbo
    kf.push({ t: 0.12, pos: v(0, 6, 2), look: v(-8, 3, -48), fov: 54 });  // acelera hacia el 1er planeta

    this.posicionesPlanetas.forEach((P, j) => {
      const r = this.rangos[j];
      const siguiente = this.posicionesPlanetas[j + 1] || P;

      // Aproximación: llegamos de frente, un poco por encima.
      kf.push({
        t: r.aproximacion,
        pos: P.clone().add(v(0, 6, 26)),
        look: P.clone(),
        fov: 50,
      });
      // Órbita: nos hacemos a un lado para ver el terminador día/noche.
      kf.push({
        t: r.centro,
        pos: P.clone().add(v(22, 3, 6)),
        look: P.clone(),
        fov: 45,
      });
      // Partida: salimos por detrás mirando ya hacia el siguiente.
      kf.push({
        t: r.fin,
        pos: P.clone().add(v(-8, 8, -22)),
        look: siguiente.clone(),
        fov: 52,
      });
    });

    // Galaxia: nos alejamos arriba para ver todo el sistema orbitando.
    const centroGalaxia = this._promedio(this.posicionesPlanetas);
    this.centroGalaxia = centroGalaxia.clone();
    kf.push({
      t: 1.0,
      pos: v(centroGalaxia.x, centroGalaxia.y + 145, centroGalaxia.z + 310),
      look: centroGalaxia,
      fov: 62,
    });

    // Aseguramos orden estricto por t.
    kf.sort((a, b) => a.t - b.t);
    this.keyframes = kf;

    // Curva suave de posición a partir de los puntos de los keyframes.
    this.curva = new THREE.CatmullRomCurve3(
      kf.map((k) => k.pos),
      false,
      "catmullrom",
      0.5
    );

    // Objetivos que el bucle perseguirá con lerp.
    this._posObjetivo = kf[0].pos.clone();
    this._lookObjetivo = kf[0].look.clone();
    this._fovObjetivo = kf[0].fov;

    // Estado actual suavizado.
    this._lookActual = kf[0].look.clone();
  }

  _promedio(vs) {
    const c = new THREE.Vector3();
    vs.forEach((p) => c.add(p));
    if (vs.length) c.multiplyScalar(1 / vs.length);
    return c;
  }

  // Array de puntos de snap: centro de cada planeta (+ extremos).
  get snaps() {
    return [0, ...this.rangos.map((r) => r.centro), 1];
  }

  // Calcula los objetivos (pos/look/fov) para un progreso 0→1.
  actualizar(progreso) {
    const kf = this.keyframes;
    const p = Math.min(Math.max(progreso, 0), 1);

    // Buscamos el tramo [i, i+1] donde cae el progreso.
    let i = 0;
    while (i < kf.length - 2 && p > kf[i + 1].t) i++;

    const t0 = kf[i].t;
    const t1 = kf[i + 1].t;
    const f = t1 > t0 ? (p - t0) / (t1 - t0) : 0;

    // Posición: muestreamos la curva Catmull-Rom. El parámetro u respeta
    // el índice del tramo para que el "tempo" siga a la línea de tiempo.
    const u = (i + f) / (kf.length - 1);
    this._posObjetivo = this.curva.getPoint(u);

    // lookAt y FOV: interpolación suavizada entre keyframes.
    const fs = suave(f);
    this._lookObjetivo.lerpVectors(kf[i].look, kf[i + 1].look, fs);
    this._fovObjetivo = lerp(kf[i].fov, kf[i + 1].fov, fs);
  }

  // Aplica el suavizado (lerp 0.08) sobre la cámara real. Se llama cada frame.
  aplicarSuavizado(camara) {
    camara.position.lerp(this._posObjetivo, 0.08);
    this._lookActual.lerp(this._lookObjetivo, 0.08);
    camara.lookAt(this._lookActual);

    const nuevoFov = lerp(camara.fov, this._fovObjetivo, 0.08);
    if (Math.abs(nuevoFov - camara.fov) > 0.001) {
      camara.fov = nuevoFov;
      camara.updateProjectionMatrix();
    }
  }
}

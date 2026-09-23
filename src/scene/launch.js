/**
 * launch.js — secuencia de despegue (Parte B de la Fase 2)
 * ------------------------------------------------------------------
 * Set completo, todo con geometría/shaders (sin imágenes externas):
 *   - Tierra procedural (reusa el planeta terrestre con atmósfera azul).
 *   - Cohete blanco mate con LatheGeometry + juntas metálicas.
 *   - Plataforma minimalista y niebla baja (fog exponencial).
 *   - Ignición: luz de propulsores + partículas blancas-cálidas aditivas.
 *   - Capa de nubes que la cámara atraviesa.
 *   - Transición de cielo azul amanecer → negro del espacio.
 *
 * Todo se maneja con el progreso LOCAL del despegue pL (0→1), que main.js
 * calcula a partir del progreso global (rango 0.03–0.12).
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { NOISE } from "../shaders/lib/noise.glsl.js";
import { crearTerrestre } from "./planets/terrestre.js";

const COLOR_AMANECER = new THREE.Color(0x7fa7d9);
const COLOR_ESPACIO = new THREE.Color(0x000000);

// ── Cohete: perfil revolucionado con LatheGeometry ──────────────
function crearCohete() {
  const grupo = new THREE.Group();

  // Perfil (x = radio, y = altura) de abajo hacia arriba.
  const perfil = [
    [0.0, 0.0],
    [1.0, 0.0],
    [1.0, 1.2],
    [1.0, 8.0],
    [0.92, 9.2],
    [0.6, 11.6],
    [0.25, 13.4],
    [0.0, 14.0],
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const cuerpo = new THREE.Mesh(
    new THREE.LatheGeometry(perfil, 48),
    new THREE.MeshStandardMaterial({
      color: 0xf2f2f0,
      roughness: 0.65,
      metalness: 0.1,
    })
  );
  grupo.add(cuerpo);

  // Juntas metálicas (anillos oscuros pulidos).
  const matJunta = new THREE.MeshStandardMaterial({
    color: 0x8a8f98,
    roughness: 0.3,
    metalness: 0.9,
  });
  [1.2, 8.0].forEach((y) => {
    const anillo = new THREE.Mesh(new THREE.CylinderGeometry(1.03, 1.03, 0.25, 48), matJunta);
    anillo.position.y = y;
    grupo.add(anillo);
  });

  // Aletas.
  const matAleta = new THREE.MeshStandardMaterial({ color: 0xe6e6e4, roughness: 0.7 });
  for (let i = 0; i < 3; i++) {
    const aleta = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 1.4), matAleta);
    const a = (i / 3) * Math.PI * 2;
    aleta.position.set(Math.cos(a) * 1.0, 1.1, Math.sin(a) * 1.0);
    aleta.lookAt(0, 1.1, 0);
    grupo.add(aleta);
  }

  return grupo;
}

// ── Partículas de ignición (exhausto blanco-cálido, aditivo) ────
function crearIgnicion(cantidad = 900) {
  const pos = new Float32Array(cantidad * 3);
  const dir = new Float32Array(cantidad * 3);
  const dat = new Float32Array(cantidad * 2); // seed, speed
  for (let i = 0; i < cantidad; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * 0.6;
    pos[i * 3 + 1] = 0.2;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    // Se expande hacia afuera y un poco hacia abajo (humo desde la base).
    const a = Math.random() * Math.PI * 2;
    const rad = 0.4 + Math.random() * 0.8;
    dir[i * 3 + 0] = Math.cos(a) * rad;
    dir[i * 3 + 1] = -0.2 - Math.random() * 0.5;
    dir[i * 3 + 2] = Math.sin(a) * rad;
    dat[i * 2 + 0] = Math.random();
    dat[i * 2 + 1] = 0.25 + Math.random() * 0.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
  geo.setAttribute("aDat", new THREE.BufferAttribute(dat, 2));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIgnicion: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uIgnicion;
      attribute vec3 aDir;
      attribute vec2 aDat;
      varying float vVida;
      void main(){
        float t = fract(uTime * aDat.y + aDat.x);
        vVida = t;
        vec3 p = position + aDir * t * 6.0;
        p.xz *= 1.0 + t * 1.6;           // se ensancha al alejarse
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.0 + t * 10.0) * uIgnicion * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uIgnicion;
      varying float vVida;
      void main(){
        float d = length(gl_PointCoord * 2.0 - 1.0);
        float a = smoothstep(1.0, 0.0, d);
        // Del núcleo cálido al humo que se apaga.
        vec3 calido = mix(vec3(1.0, 0.85, 0.6), vec3(0.5, 0.5, 0.52), vVida);
        gl_FragColor = vec4(calido, a * (1.0 - vVida) * uIgnicion * 0.9);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const puntos = new THREE.Points(geo, mat);
  puntos.frustumCulled = false;
  puntos.userData.mat = mat;
  return puntos;
}

// ── Capa de nubes (planos con ruido que la cámara cruza) ────────
function crearNubes() {
  const grupo = new THREE.Group();
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacidad: { value: 0 },
      uColor: { value: COLOR_AMANECER.clone() },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacidad;
      uniform vec3 uColor;
      varying vec2 vUv;
      ${NOISE}
      void main(){
        vec3 p = vec3(vUv * 4.0 + vec2(uTime * 0.03, 0.0), 0.0);
        float n = fbm(p);
        float alfa = smoothstep(0.1, 0.7, n);
        // Se desvanece hacia los bordes del plano.
        float borde = smoothstep(0.5, 0.15, length(vUv - 0.5));
        gl_FragColor = vec4(uColor, alfa * borde * uOpacidad);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 6; i++) {
    const plano = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), mat);
    plano.rotation.x = -Math.PI / 2;
    plano.position.set((Math.random() - 0.5) * 20, 22 + i * 4, (Math.random() - 0.5) * 20);
    grupo.add(plano);
  }
  grupo.userData.mat = mat;
  return grupo;
}

export function crearDespegue(escena) {
  // Niebla baja de amanecer (solo afecta materiales estándar: cohete/plataforma).
  escena.fog = new THREE.FogExp2(COLOR_AMANECER.clone(), 0.006);
  escena.background = COLOR_AMANECER.clone();

  const grupo = new THREE.Group();

  // — Tierra (reusamos el planeta terrestre con atmósfera azul) —
  const tierra = crearTerrestre({ radio: 170, acento: "#6ab0ff", velocidad: 0.004 });
  tierra.grupo.position.set(0, -190, -250);
  grupo.add(tierra.grupo);

  // — Plataforma minimalista —
  const plataforma = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 4.5, 0.5, 64),
    new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.8, metalness: 0.2 })
  );
  plataforma.position.y = -0.25;
  grupo.add(plataforma);

  // Suelo tenue que la niebla difumina.
  const suelo = new THREE.Mesh(
    new THREE.CircleGeometry(400, 64),
    new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 1.0 })
  );
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = -0.5;
  grupo.add(suelo);

  // — Cohete —
  const cohete = crearCohete();
  grupo.add(cohete);

  // — Ignición: partículas + luz —
  const ignicion = crearIgnicion();
  cohete.add(ignicion); // sigue al cohete
  const luzProp = new THREE.PointLight(0xffd9a0, 0, 30, 2);
  luzProp.position.set(0, 0.4, 0);
  cohete.add(luzProp);

  // — Nubes —
  const nubes = crearNubes();
  grupo.add(nubes);

  escena.add(grupo);

  return {
    grupo,
    tierra,
    /**
     * @param {number} pL  progreso local del despegue (0→1)
     * @param {number} dt  delta en segundos
     */
    actualizar(pL, dt) {
      // Tiempo de shaders siempre corre (nubes/partículas/Tierra vivos).
      ignicion.userData.mat.uniforms.uTime.value += dt;
      nubes.userData.mat.uniforms.uTime.value += dt;
      tierra.actualizar(dt, new THREE.Vector3(-1, 0.4, 0.6));

      // Ascenso del cohete: quieto hasta la ignición, luego acelera.
      const a = Math.max((pL - 0.15) / 0.85, 0);
      cohete.position.y = a * a * 62;

      // Ignición: sube ~0.08–0.18, se mantiene, y se apaga al salir del aire.
      const ign =
        smoothstep(0.08, 0.18, pL) * (1.0 - smoothstep(0.62, 0.85, pL));
      ignicion.userData.mat.uniforms.uIgnicion.value = ign;
      luzProp.intensity = ign * 3.0;

      // Nubes: visibles en el cruce (~0.45–0.9).
      nubes.userData.mat.uniforms.uOpacidad.value =
        smoothstep(0.4, 0.6, pL) * (1.0 - smoothstep(0.85, 1.0, pL));

      // Cielo y niebla: de amanecer a espacio conforme ascendemos.
      const kEspacio = smoothstep(0.15, 0.8, pL);
      escena.background.copy(COLOR_AMANECER).lerp(COLOR_ESPACIO, kEspacio);
      escena.fog.color.copy(escena.background);
      escena.fog.density = 0.006 * (1.0 - smoothstep(0.1, 0.65, pL));
    },
  };
}

// smoothstep en JS (para el lado del CPU).
function smoothstep(a, b, x) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

export default crearDespegue;

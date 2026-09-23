/**
 * starfield.js — cielo estrellado de 3 capas + túnel warp relativista
 * ------------------------------------------------------------------
 * - Tres capas de partículas esféricas con parallax para navegación normal.
 * - Túnel de trazas relativistas (LineSegments / streaking stars) acoplado a la cámara:
 *   al acelerar el scroll o al hacer un salto estelar (radar / navegación),
 *   las estrellas se estiran formando haces de velocidad luz tipo Star Wars / Interstellar,
 *   con degradado de blanco-cian a violeta hiperespacial.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";

const VERT = /* glsl */ `
  uniform float uVelocidad;   // 0..1 aprox (magnitud de scroll normalizada)
  uniform float uParallax;    // cuánto responde esta capa al warp
  uniform float uWarpBoost;   // sobrecarga por salto hiperespacial
  attribute float aTam;       // tamaño base por estrella
  attribute float aBrillo;    // brillo base por estrella
  varying float vBrillo;
  varying float vWarp;

  void main() {
    vBrillo = aBrillo;
    vWarp = (uVelocidad + uWarpBoost * 1.5) * uParallax;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // El tamaño crece con la velocidad (sensación de aceleración).
    float tam = aTam * (1.0 + vWarp * 5.0);
    // Atenuación por distancia (perspectiva).
    gl_PointSize = tam * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uColorWarp;
  varying float vBrillo;
  varying float vWarp;

  void main() {
    // Coordenada centrada [-1,1].
    vec2 c = gl_PointCoord * 2.0 - 1.0;

    // En reposo: punto redondo. Con warp: elipse vertical (se estira en Y).
    float estiramientoY = 1.0 + vWarp * 6.0;
    vec2 e = vec2(c.x, c.y / estiramientoY);
    float d = length(e);

    // Núcleo suave con halo.
    float alfa = smoothstep(1.0, 0.0, d);
    alfa *= alfa;

    // Cambio hacia tonalidad violeta/blanco en sobrecarga warp
    vec3 colFinal = mix(uColor, uColorWarp, clamp(vWarp * 0.8, 0.0, 1.0));
    gl_FragColor = vec4(colFinal * (vBrillo + vWarp * 0.4), alfa * vBrillo);
  }
`;

function crearCapa({ cantidad, radio, tamMin, tamMax, brilloMin, brilloMax, color, parallax }) {
  const posiciones = new Float32Array(cantidad * 3);
  const tams = new Float32Array(cantidad);
  const brillos = new Float32Array(cantidad);

  for (let i = 0; i < cantidad; i++) {
    const r = radio * (0.6 + Math.random() * 0.4);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    posiciones[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    posiciones[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    posiciones[i * 3 + 2] = r * Math.cos(phi);

    tams[i] = tamMin + Math.random() * (tamMax - tamMin);
    brillos[i] = brilloMin + Math.random() * (brilloMax - brilloMin);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
  geo.setAttribute("aTam", new THREE.BufferAttribute(tams, 1));
  geo.setAttribute("aBrillo", new THREE.BufferAttribute(brillos, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uVelocidad: { value: 0 },
      uWarpBoost: { value: 0 },
      uParallax: { value: parallax },
      uColor: { value: new THREE.Color(color) },
      uColorWarp: { value: new THREE.Color(0xd8b4fe) },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const puntos = new THREE.Points(geo, mat);
  puntos.frustumCulled = false;
  return puntos;
}

// ── Sistema de Trazas de Velocidad Luz (Relativistic Streaks) ──
function crearTunelWarp(camara) {
  const NUM_STREAKS = 320;
  const positions = new Float32Array(NUM_STREAKS * 2 * 3);
  const colors = new Float32Array(NUM_STREAKS * 2 * 3);

  const colHead = new THREE.Color(0xffffff);
  const colTailWarp = new THREE.Color(0x9333ea); // Violeta hiperespacial

  const streaks = [];
  for (let i = 0; i < NUM_STREAKS; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Anillo alrededor de la nave, dejando libre el centro visual
    const radius = 3.5 + Math.pow(Math.random(), 0.75) * 55.0;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = -Math.random() * 220 - 10;
    const speed = 1.0 + Math.random() * 1.6;
    streaks.push({ x, y, z, speed, radius, angle });

    const idx = i * 6;
    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
    colors[idx] = colHead.r;
    colors[idx + 1] = colHead.g;
    colors[idx + 2] = colHead.b;

    positions[idx + 3] = x;
    positions[idx + 4] = y;
    positions[idx + 5] = z + 1;
    colors[idx + 3] = colTailWarp.r;
    colors[idx + 4] = colTailWarp.g;
    colors[idx + 5] = colTailWarp.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    linewidth: 1.5,
  });

  const mesh = new THREE.LineSegments(geo, mat);
  mesh.frustumCulled = false;
  mesh.visible = false;

  // Se añade como hijo de la cámara para moverse y orientarse idéntico al visor
  if (camara) camara.add(mesh);

  return {
    mesh,
    streaks,
    geo,
    mat,
    actualizar(dt, warpFactor) {
      if (warpFactor < 0.01) {
        if (mesh.visible) mesh.visible = false;
        return;
      }
      mesh.visible = true;

      const pArr = geo.attributes.position.array;
      const cArr = geo.attributes.color.array;
      const streakLength = warpFactor * 36.0;
      const flightSpeed = dt * (180.0 + warpFactor * 320.0);

      mat.opacity = Math.min(warpFactor * 1.15, 0.95);

      for (let i = 0; i < NUM_STREAKS; i++) {
        const s = streaks[i];
        // En coordenadas locales de cámara: -Z es hacia adelante, las trazas viajan hacia atrás (+Z)
        s.z += flightSpeed * s.speed;

        // Si sobrepasan la cámara (+Z > 15), reciclar en el horizonte profundo (-Z)
        if (s.z > 20) {
          s.z = -220 - Math.random() * 40;
          const newAngle = Math.random() * Math.PI * 2;
          s.x = Math.cos(newAngle) * s.radius;
          s.y = Math.sin(newAngle) * s.radius;
        }

        const idx = i * 6;
        // Cabeza de la traza (adelante)
        pArr[idx] = s.x;
        pArr[idx + 1] = s.y;
        pArr[idx + 2] = s.z;

        // Cola de la traza (hacia atrás, +Z)
        pArr[idx + 3] = s.x;
        pArr[idx + 4] = s.y;
        pArr[idx + 5] = s.z + streakLength * s.speed;

        // Color más brillante conforme mayor sea la aceleración
        const blendVioleta = Math.min(warpFactor * 1.2, 1.0);
        cArr[idx + 3] = 0.58 + blendVioleta * 0.35; // R
        cArr[idx + 4] = 0.20 + (1.0 - blendVioleta) * 0.5; // G
        cArr[idx + 5] = 0.98; // B
      }

      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    },
  };
}

export class Starfield {
  /**
   * @param {THREE.Scene} escena
   * @param {number} totalEstrellas  presupuesto de partículas (de quality)
   * @param {THREE.Camera} [camara]
   */
  constructor(escena, totalEstrellas, camara = null) {
    this.grupo = new THREE.Group();

    // Repartimos el presupuesto entre las 3 capas.
    const lejana = Math.round(totalEstrellas * 0.55);
    const media = Math.round(totalEstrellas * 0.3);
    const cercana = totalEstrellas - lejana - media;

    this.capaLejana = crearCapa({
      cantidad: lejana, radio: 1200, tamMin: 0.6, tamMax: 1.6,
      brilloMin: 0.3, brilloMax: 0.9, color: 0xbcd0ff, parallax: 0.15,
    });
    this.capaMedia = crearCapa({
      cantidad: media, radio: 600, tamMin: 1.0, tamMax: 2.6,
      brilloMin: 0.4, brilloMax: 1.0, color: 0xdfe8ff, parallax: 0.5,
    });
    this.capaCercana = crearCapa({
      cantidad: cercana, radio: 260, tamMin: 1.4, tamMax: 3.4,
      brilloMin: 0.2, brilloMax: 0.7, color: 0xffffff, parallax: 1.0,
    });

    this.grupo.add(this.capaLejana, this.capaMedia, this.capaCercana);
    escena.add(this.grupo);

    // Sistema de trazas warp
    this.tunelWarp = crearTunelWarp(camara);

    this._velSuavizada = 0;
    this._warpSuavizado = 0;
  }

  /**
   * Conecta la cámara al túnel si no se pasó en el constructor
   */
  conectarCamara(camara) {
    if (this.tunelWarp && this.tunelWarp.mesh && camara) {
      if (!camara.children.includes(this.tunelWarp.mesh)) {
        camara.add(this.tunelWarp.mesh);
      }
    }
  }

  /**
   * @param {number} dt delta en segundos
   * @param {number} velocidad velocidad de scroll (Lenis)
   * @param {THREE.Camera} camara
   * @param {number} [warpBoost] sobrecarga adicional (0..1) por salto estelar
   */
  actualizar(dt, velocidad, camara, warpBoost = 0) {
    // El starfield sigue a la cámara para que nunca se "acabe" el cielo.
    if (camara) this.grupo.position.copy(camara.position);

    // Normalizamos y suavizamos la velocidad para el warp continuo (lerp 0.12).
    const velNorm = Math.min(Math.abs(velocidad) / 180, 1);
    const warpTarget = Math.max(velNorm, warpBoost);
    this._velSuavizada += (velNorm - this._velSuavizada) * 0.12;
    this._warpSuavizado += (warpTarget - this._warpSuavizado) * 0.14;

    for (const capa of [this.capaLejana, this.capaMedia, this.capaCercana]) {
      capa.material.uniforms.uVelocidad.value = this._velSuavizada;
      capa.material.uniforms.uWarpBoost.value = this._warpSuavizado;
    }

    // Actualiza trazas de estrellas estiradas
    if (this.tunelWarp) {
      this.tunelWarp.actualizar(dt, this._warpSuavizado);
    }

    // Deriva ambiental muy lenta para que el cielo nunca esté 100% muerto.
    this.grupo.rotation.y += dt * 0.005;
  }
}

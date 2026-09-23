/**
 * starfield.js — cielo estrellado de 3 capas + warp por velocidad
 * ------------------------------------------------------------------
 * Tres capas para dar profundidad por parallax:
 *   - lejana: casi fija, estrellas diminutas.
 *   - media:  polvo que se mueve un poco.
 *   - cercana: partículas que casi no se ven quietas y que "estallan"
 *              (warp) solo cuando el scroll acelera.
 *
 * El warp vive en el shader: cada estrella se estira en una vertical
 * suave (gl_PointCoord) y crece de tamaño en función de uVelocidad.
 * uVelocidad se suaviza con lerp para que el efecto no parpadee.
 *
 * NOTA: el estiramiento real "en línea" (streaks direccionales) se
 * refinará con quads instanciados en la fase de tránsitos; aquí se
 * aproxima con tamaño + elipse vertical, suficiente para que el warp
 * "se note solo al acelerar" como pide la validación de la Fase 1.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";

const VERT = /* glsl */ `
  uniform float uVelocidad;   // 0..1 aprox (magnitud de scroll normalizada)
  uniform float uParallax;    // cuánto responde esta capa al warp
  attribute float aTam;       // tamaño base por estrella
  attribute float aBrillo;    // brillo base por estrella
  varying float vBrillo;
  varying float vWarp;

  void main() {
    vBrillo = aBrillo;
    vWarp = uVelocidad * uParallax;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // El tamaño crece con la velocidad (sensación de acercarse/warp).
    float tam = aTam * (1.0 + vWarp * 6.0);
    // Atenuación por distancia (perspectiva).
    gl_PointSize = tam * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vBrillo;
  varying float vWarp;

  void main() {
    // Coordenada centrada [-1,1].
    vec2 c = gl_PointCoord * 2.0 - 1.0;

    // En reposo: punto redondo. Con warp: elipse vertical (se estira en Y).
    float estiramientoY = 1.0 + vWarp * 5.0;
    vec2 e = vec2(c.x, c.y / estiramientoY);
    float d = length(e);

    // Núcleo suave con halo.
    float alfa = smoothstep(1.0, 0.0, d);
    alfa *= alfa;

    gl_FragColor = vec4(uColor * vBrillo, alfa * vBrillo);
  }
`;

function crearCapa({ cantidad, radio, tamMin, tamMax, brilloMin, brilloMax, color, parallax }) {
  const posiciones = new Float32Array(cantidad * 3);
  const tams = new Float32Array(cantidad);
  const brillos = new Float32Array(cantidad);

  for (let i = 0; i < cantidad; i++) {
    // Distribución en una cáscara esférica alrededor del origen.
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
      uParallax: { value: parallax },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const puntos = new THREE.Points(geo, mat);
  puntos.frustumCulled = false; // envuelve la cámara; nunca lo recortamos
  return puntos;
}

export class Starfield {
  /**
   * @param {THREE.Scene} escena
   * @param {number} totalEstrellas  presupuesto de partículas (de quality)
   */
  constructor(escena, totalEstrellas) {
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

    this._velSuavizada = 0;
  }

  /**
   * @param {number} dt         delta en segundos
   * @param {number} velocidad  velocidad de scroll (Lenis)
   * @param {THREE.Camera} camara
   */
  actualizar(dt, velocidad, camara) {
    // El starfield sigue a la cámara para que nunca se "acabe" el cielo.
    if (camara) this.grupo.position.copy(camara.position);

    // Normalizamos y suavizamos la velocidad para el warp (lerp 0.1).
    const objetivo = Math.min(Math.abs(velocidad) / 40, 1);
    this._velSuavizada += (objetivo - this._velSuavizada) * 0.1;

    for (const capa of [this.capaLejana, this.capaMedia, this.capaCercana]) {
      capa.material.uniforms.uVelocidad.value = this._velSuavizada;
    }

    // Deriva ambiental muy lenta para que el cielo nunca esté 100% muerto.
    this.grupo.rotation.y += dt * 0.005;
  }
}

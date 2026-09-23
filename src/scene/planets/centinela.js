/**
 * centinela.js — planeta tipo "centinela" (Gestor de Incidentes)
 * ------------------------------------------------------------------
 * Mundo grafito con retícula hexagonal tenue y balizas que laten en la
 * superficie con los colores de estado de la app: rojo (abierto), ámbar
 * (en progreso) y verde (completado). Un disco de radar rodea el planeta
 * con un barrido giratorio que "vigila" los incidentes.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { NOISE, VERT_PLANETA } from "../../shaders/lib/noise.glsl.js";
import { crearAtmosfera } from "./atmosphere.js";

// Balizas: dirección en la esfera + estado (0 abierto, 1 en progreso, 2 completado).
const BALIZAS = [
  [0.55, 0.62, 0.56, 0], [-0.7, 0.3, 0.64, 1], [0.1, -0.35, 0.93, 2],
  [-0.2, 0.85, -0.48, 1], [0.82, -0.2, -0.53, 0], [-0.6, -0.62, -0.5, 2],
  [0.3, 0.1, -0.95, 1], [-0.95, 0.05, -0.2, 0], [0.62, -0.72, 0.3, 2],
];

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSol;
  uniform vec3 uAcento;
  uniform vec4 uBalizas[${BALIZAS.length}];
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  ${NOISE}

  // Distancia a borde de celda hexagonal (retícula en coordenadas esféricas).
  float hexBorde(vec2 p){
    p.x *= 1.1547; p.y += mod(floor(p.x), 2.0) * 0.5;
    vec2 f = abs(fract(p) - 0.5);
    return abs(max(f.x * 1.5 + f.y, f.y * 2.0) - 1.0);
  }

  void main(){
    vec3 N = normalize(vWorldNormal);
    float dia = smoothstep(-0.1, 0.4, dot(N, normalize(uSol)));

    // Grafito con vetas.
    float vetas = fbm(vPos * 3.0);
    vec3 base = mix(vec3(0.10, 0.11, 0.14), vec3(0.24, 0.25, 0.30), smoothstep(-0.4, 0.5, vetas));

    // Retícula hexagonal tenue.
    vec2 uv = vec2(atan(vPos.z, vPos.x) * 3.0, asin(clamp(vPos.y, -1.0, 1.0)) * 3.0);
    float hex = smoothstep(0.08, 0.0, hexBorde(uv * 2.2));

    vec3 color = base * (0.12 + dia) + uAcento * hex * 0.10;

    // Balizas de estado que laten.
    for (int i = 0; i < ${BALIZAS.length}; i++) {
      vec4 b = uBalizas[i];
      float d = distance(vPos, normalize(b.xyz));
      vec3 c = b.w < 0.5 ? vec3(1.0, 0.25, 0.3) : (b.w < 1.5 ? vec3(1.0, 0.7, 0.15) : vec3(0.2, 0.9, 0.5));
      float fase = uTime * 2.2 + float(i) * 1.7;
      float nucleo = smoothstep(0.045, 0.0, d);
      float onda = smoothstep(0.02, 0.0, abs(d - fract(fase * 0.25) * 0.28)) * (1.0 - fract(fase * 0.25));
      color += c * (nucleo * 1.8 + onda * 0.9);
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Disco de radar: barrido angular que gira y anillos concéntricos tenues.
const RADAR_VERT = /* glsl */ `
  varying vec2 vUv2;
  void main(){
    vUv2 = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const RADAR_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uAcento;
  uniform float uRin;
  uniform float uRout;
  varying vec2 vUv2;
  void main(){
    float r = length(vUv2);
    float t = (r - uRin) / (uRout - uRin);
    float ang = atan(vUv2.y, vUv2.x);
    // Ángulo relativo al barrido (0 = frente del haz, crece hacia atrás).
    float rel = mod(uTime * 0.9 - ang, 6.28318) / 6.28318;
    float haz = pow(1.0 - rel, 7.0);
    float anillos = smoothstep(0.03, 0.0, abs(fract(t * 3.0) - 0.5) - 0.47);
    float fade = smoothstep(0.0, 0.15, t) * smoothstep(1.0, 0.7, t);
    float a = (haz * 0.55 + anillos * 0.12) * fade;
    gl_FragColor = vec4(uAcento * (0.6 + haz), a);
  }
`;

export function crearCentinela(opts) {
  const { radio = 8, acento = "#fb7185", velocidad = 0.012,
    inclinacion = THREE.MathUtils.degToRad(16) } = opts;

  const grupo = new THREE.Group();
  grupo.rotation.z = inclinacion;

  const giro = new THREE.Group();
  grupo.add(giro);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSol: { value: new THREE.Vector3(-1, 0.4, 0.6).normalize() },
      uAcento: { value: new THREE.Color(acento) },
      uBalizas: { value: BALIZAS.map((b) => new THREE.Vector4(...b)) },
    },
    vertexShader: VERT_PLANETA,
    fragmentShader: FRAG,
  });
  const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(radio, 96, 96), mat);
  giro.add(cuerpo);

  // Disco de radar en el plano ecuatorial.
  const rIn = radio * 1.25, rOut = radio * 2.1;
  const radarMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAcento: { value: new THREE.Color(acento) },
      uRin: { value: rIn },
      uRout: { value: rOut },
    },
    vertexShader: RADAR_VERT,
    fragmentShader: RADAR_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const radar = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 128, 1), radarMat);
  radar.rotation.x = -Math.PI / 2 + THREE.MathUtils.degToRad(12);
  grupo.add(radar);

  const atmosfera = crearAtmosfera(radio, acento, { pow: 2.8, escala: 1.07, intensidad: 0.5 });
  grupo.add(atmosfera);

  let t = 0;
  return {
    grupo,
    actualizar(dt, solDir) {
      t += dt;
      mat.uniforms.uTime.value = t;
      radarMat.uniforms.uTime.value = t;
      atmosfera.userData.mat.uniforms.uTime.value = t;
      if (solDir) mat.uniforms.uSol.value.copy(solDir).normalize();
      cuerpo.rotation.y += velocidad * dt * 60 * 0.016;
    },
  };
}

export default crearCentinela;

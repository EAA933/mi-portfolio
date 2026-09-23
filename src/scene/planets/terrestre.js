/**
 * terrestre.js — planeta tipo "terrestre" (Cosecha Hidalguense)
 * ------------------------------------------------------------------
 * Capas (todo procedural, sin texturas todavía):
 *   1. Superficie: continentes por ruido con umbral, biomas dorado/olivo/
 *      terracota, nieve en los polos, océano con especular del sol.
 *   2. Terminador día/noche suave (smoothstep sobre dot(normal, sol)).
 *   3. Luces de ciudad tenues SOLO en el lado nocturno y sobre tierra,
 *      con parpadeo por ruido.
 *   4. Nubes: esfera aparte a 1.01x que rota más rápido y se desvanece
 *      en el terminador.
 *   5. Atmósfera Fresnel del color de acento.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { NOISE, VERT_PLANETA } from "../../shaders/lib/noise.glsl.js";
import { crearAtmosfera } from "./atmosphere.js";

const FRAG_SUP = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSol;      // dirección hacia el sol (mundo)
  uniform vec3 uAcento;
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  ${NOISE}
  void main(){
    vec3 N = normalize(vWorldNormal);
    vec3 S = normalize(uSol);
    float diff = dot(N, S);
    float dia = smoothstep(-0.05, 0.28, diff);   // terminador suave
    float noche = smoothstep(0.10, -0.18, diff);

    // — Continentes —
    float c = fbm(vPos * 1.9);
    float land = smoothstep(0.0, 0.12, c);
    float bioma = fbm(vPos * 3.3 + 10.0);

    vec3 oceano = mix(vec3(0.02,0.08,0.20), vec3(0.05,0.22,0.45),
                      smoothstep(-0.3, 0.2, c));
    vec3 trigo = vec3(0.62, 0.50, 0.24);
    vec3 olivo = vec3(0.30, 0.36, 0.16);
    vec3 terra = vec3(0.50, 0.28, 0.16);
    vec3 tierra = mix(olivo, trigo, smoothstep(0.0, 0.6, bioma));
    tierra = mix(tierra, terra, smoothstep(0.5, 1.0, bioma) * 0.6);

    // Nieve en los polos.
    float polo = smoothstep(0.72, 0.92, abs(vPos.y));
    tierra = mix(tierra, vec3(0.92), polo);

    vec3 base = mix(oceano, tierra, land);

    // — Especular del océano —
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 H = normalize(S + V);
    float spec = pow(max(dot(N, H), 0.0), 80.0) * (1.0 - land) * dia;

    // — Luces de ciudad (lado noche, en tierra) —
    float ciudades = smoothstep(0.76, 0.96, fbm(vPos * 8.0 + 2.0)) * land;
    float parpadeo = 0.6 + 0.4 * sin(uTime * 2.0 + c * 40.0);
    vec3 luces = vec3(1.0, 0.8, 0.45) * ciudades * noche * parpadeo;

    // — Composición —
    vec3 color = base * (0.05 + dia) + spec * vec3(1.0) + luces;

    // Tinte cálido de acento en la luz rasante (atardecer sobre tierra).
    float rasante = smoothstep(0.0, 0.35, diff) * (1.0 - smoothstep(0.35, 0.7, diff));
    color += uAcento * rasante * 0.12 * land;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const FRAG_NUBES = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSol;
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  ${NOISE}
  void main(){
    float n = fbm(vPos * 2.3 + vec3(uTime * 0.01, 0.0, 0.0));
    float alfa = smoothstep(0.18, 0.6, n);
    float diff = dot(normalize(vWorldNormal), normalize(uSol));
    float dia = smoothstep(-0.1, 0.32, diff);
    gl_FragColor = vec4(vec3(1.0) * (0.25 + dia), alfa * dia * 0.9);
  }
`;

export function crearTerrestre(opts) {
  const {
    radio = 8,
    acento = "#d8a94b",
    velocidad = 0.02,
    inclinacion = THREE.MathUtils.degToRad(18),
  } = opts;

  const grupo = new THREE.Group();
  grupo.rotation.z = inclinacion; // inclinación axial

  // Nodo que rota (planeta + nubes). La atmósfera no rota.
  const giro = new THREE.Group();
  grupo.add(giro);

  // — Superficie —
  const matSup = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSol: { value: new THREE.Vector3(-1, 0.4, 0.6).normalize() },
      uAcento: { value: new THREE.Color(acento) },
    },
    vertexShader: VERT_PLANETA,
    fragmentShader: FRAG_SUP,
  });
  const superficie = new THREE.Mesh(new THREE.SphereGeometry(radio, 96, 96), matSup);
  giro.add(superficie);

  // — Nubes —
  const matNubes = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSol: { value: matSup.uniforms.uSol.value },
    },
    vertexShader: VERT_PLANETA,
    fragmentShader: FRAG_NUBES,
    transparent: true,
    depthWrite: false,
  });
  const nubes = new THREE.Mesh(new THREE.SphereGeometry(radio * 1.012, 64, 64), matNubes);
  giro.add(nubes);

  // — Atmósfera — (halo tenue: intensidad baja y rim cerrado)
  const atmosfera = crearAtmosfera(radio, acento, {
    pow: 4.6,
    escala: 1.055,
    intensidad: 0.28,
  });
  grupo.add(atmosfera);

  return {
    grupo,
    actualizar(dt, solDir) {
      matSup.uniforms.uTime.value += dt;
      matNubes.uniforms.uTime.value += dt;
      if (solDir) matSup.uniforms.uSol.value.copy(solDir).normalize();
      atmosfera.userData.mat.uniforms.uTime.value += dt;

      // Rotación propia; las nubes van 1.3x más rápido.
      superficie.rotation.y += velocidad * dt * 60 * 0.016;
      nubes.rotation.y += velocidad * 1.3 * dt * 60 * 0.016;
    },
  };
}

export default crearTerrestre;

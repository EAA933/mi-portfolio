/**
 * hielo.js — planeta tipo "hielo"
 * ------------------------------------------------------------------
 * Superficie glacial azul/blanca con una red de líneas cian brillantes
 * (tipo circuito de datos) que pulsan como un escaneo. Una luna pequeña
 * en órbita inclinada.
 *
 * NOTA: base funcional. Se afina cuando exista un proyecto de este tipo.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { NOISE, VERT_PLANETA } from "../../shaders/lib/noise.glsl.js";
import { crearAtmosfera } from "./atmosphere.js";

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSol;
  uniform vec3 uAcento;
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  ${NOISE}
  void main(){
    vec3 N = normalize(vWorldNormal);
    float diff = dot(N, normalize(uSol));
    float dia = smoothstep(-0.05, 0.3, diff);

    // Hielo base.
    float grieta = fbm(vPos * 3.0);
    vec3 hielo = mix(vec3(0.70,0.80,0.92), vec3(0.90,0.95,1.0),
                     smoothstep(-0.2, 0.4, grieta));

    // Red de líneas: cresta de ruido (ridged) → líneas finas.
    float ridged = 1.0 - abs(fbm(vPos * 5.0));
    float lineas = smoothstep(0.92, 1.0, ridged);
    // Pulso tipo escaneo que recorre la superficie (onda seno de ~4s).
    float escaneo = 0.5 + 0.5 * sin(uTime * 1.57 + vPos.y * 6.0);
    vec3 cian = uAcento * (1.0 + escaneo * 1.5);

    vec3 color = hielo * (0.08 + dia) + cian * lineas * (0.4 + escaneo);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function crearHielo(opts) {
  const { radio = 8, acento = "#7fd4ff", velocidad = 0.018,
    inclinacion = THREE.MathUtils.degToRad(15) } = opts;

  const grupo = new THREE.Group();
  grupo.rotation.z = inclinacion;

  const giro = new THREE.Group();
  grupo.add(giro);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSol: { value: new THREE.Vector3(-1, 0.4, 0.6).normalize() },
      uAcento: { value: new THREE.Color(acento) },
    },
    vertexShader: VERT_PLANETA,
    fragmentShader: FRAG,
  });
  const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(radio, 96, 96), mat);
  giro.add(cuerpo);

  // Luna en órbita inclinada.
  const luna = new THREE.Mesh(
    new THREE.SphereGeometry(radio * 0.14, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xcfd8e6, roughness: 0.9 })
  );
  const orbitaLuna = new THREE.Group();
  orbitaLuna.rotation.x = THREE.MathUtils.degToRad(20);
  luna.position.set(radio * 2.2, 0, 0);
  orbitaLuna.add(luna);
  grupo.add(orbitaLuna);

  const atmosfera = crearAtmosfera(radio, acento, { pow: 3.0, escala: 1.07 });
  grupo.add(atmosfera);

  return {
    grupo,
    actualizar(dt, solDir) {
      mat.uniforms.uTime.value += dt;
      atmosfera.userData.mat.uniforms.uTime.value += dt;
      if (solDir) mat.uniforms.uSol.value.copy(solDir).normalize();
      cuerpo.rotation.y += velocidad * dt * 60 * 0.016;
      orbitaLuna.rotation.y += 0.25 * dt;
    },
  };
}

export default crearHielo;

/**
 * atardecer.js — planeta tipo "atardecer" (MIRAR, tienda de lentes de sol)
 * ------------------------------------------------------------------
 * Un mundo de hora dorada: dunas color arena y mares turquesa que
 * destellan con el sol, con el horizonte (terminador) encendido en
 * ámbar y coral. A su alrededor giran cuatro micas de cristal, una por
 * modelo de la tienda: Brisa (obsidiana), Duna (ámbar), Marea (salvia)
 * y Ocaso (azul) — como el simulador de micas LightLab.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { NOISE, VERT_PLANETA } from "../../shaders/lib/noise.glsl.js";
import { crearAtmosfera } from "./atmosphere.js";

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSol;
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  ${NOISE}
  void main(){
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSol);
    float ndl = dot(N, L);
    float dia = smoothstep(-0.12, 0.45, ndl);

    // Dunas: bandas onduladas que siguen la latitud, deformadas por ruido.
    float ondas = sin(vPos.y * 28.0 + vPos.x * 6.0 + fbm(vPos * 2.2) * 7.0);
    float dunas = smoothstep(-0.6, 0.9, ondas) * 0.75 + fbm(vPos * 5.0) * 0.25;
    vec3 arenaClara = vec3(0.98, 0.70, 0.38);
    vec3 arenaSombra = vec3(0.62, 0.27, 0.14);
    vec3 arena = mix(arenaSombra, arenaClara, dunas);
    // Polos más rosados, como cielo de atardecer reflejado.
    arena = mix(arena, vec3(0.85, 0.42, 0.45), smoothstep(0.55, 0.95, abs(vPos.y)) * 0.6);

    // Mares turquesa en las zonas bajas.
    float relieve = fbm(vPos * 1.7 + 3.0);
    float mar = smoothstep(-0.16, -0.24, relieve);
    vec3 agua = mix(vec3(0.02, 0.24, 0.32), vec3(0.08, 0.50, 0.52), fbm(vPos * 8.0 + uTime * 0.05) * 0.5 + 0.5);
    vec3 base = mix(arena, agua, mar);

    // Destello del sol sobre el agua (especular).
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 H = normalize(L + V);
    float brillo = pow(max(dot(N, H), 0.0), 60.0) * mar;

    // Horizonte dorado: el terminador se enciende en ámbar y coral.
    float franja = smoothstep(-0.12, 0.08, ndl) * (1.0 - smoothstep(0.08, 0.42, ndl));
    vec3 oro = mix(vec3(1.0, 0.45, 0.25), vec3(1.0, 0.72, 0.3), smoothstep(-0.05, 0.2, ndl));

    vec3 color = base * (0.04 + dia * 0.85);
    color += oro * franja * 0.55;
    color += vec3(1.0, 0.85, 0.6) * brillo * 1.4;
    // Lado nocturno: un violeta muy tenue, como el cielo después del ocaso.
    color += vec3(0.16, 0.08, 0.22) * (1.0 - dia) * 0.35;
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Una mica: lente de cristal tintado con un aro fino de armazón.
function crearMica(radio, tinte) {
  const g = new THREE.Group();
  const cristal = new THREE.Mesh(
    new THREE.SphereGeometry(radio, 48, 24),
    new THREE.MeshPhysicalMaterial({
      color: tinte,
      metalness: 0.1,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.8,
      emissive: tinte,
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: 0.78,
    })
  );
  cristal.scale.set(1.18, 0.92, 0.16); // forma de mica, casi plana
  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(radio, radio * 0.07, 12, 64),
    new THREE.MeshStandardMaterial({ color: 0x14110f, roughness: 0.25, metalness: 0.4 })
  );
  aro.scale.set(1.18, 0.92, 1);
  g.add(cristal, aro);
  return g;
}

// Tintes de los cuatro modelos de MIRAR.
const MICAS = [
  { nombre: "Brisa", tinte: 0x3a3f4a },
  { nombre: "Duna", tinte: 0xd98a2b },
  { nombre: "Marea", tinte: 0x6f9a7a },
  { nombre: "Ocaso", tinte: 0x3f6fd8 },
];

export function crearAtardecer(opts) {
  const { radio = 8, acento = "#f2994a", velocidad = 0.012,
    inclinacion = THREE.MathUtils.degToRad(14) } = opts;

  const grupo = new THREE.Group();
  grupo.rotation.z = inclinacion;

  const giro = new THREE.Group();
  grupo.add(giro);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSol: { value: new THREE.Vector3(-1, 0.4, 0.6).normalize() },
    },
    vertexShader: VERT_PLANETA,
    fragmentShader: FRAG,
  });
  const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(radio, 128, 128), mat);
  giro.add(cuerpo);

  // Órbita de las cuatro micas, levemente inclinada, con una estela fina.
  const orbita = new THREE.Group();
  orbita.rotation.x = THREE.MathUtils.degToRad(70);
  grupo.add(orbita);

  const radioOrbita = radio * 1.62;
  const estela = new THREE.Mesh(
    new THREE.TorusGeometry(radioOrbita, radio * 0.006, 8, 256),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(acento), transparent: true, opacity: 0.35 })
  );
  orbita.add(estela);

  const micas = MICAS.map((m, i) => {
    const mica = crearMica(radio * 0.2, m.tinte);
    const a = (i / MICAS.length) * Math.PI * 2;
    mica.userData.angulo = a;
    mica.position.set(Math.cos(a) * radioOrbita, Math.sin(a) * radioOrbita, 0);
    orbita.add(mica);
    return mica;
  });

  const atmosfera = crearAtmosfera(radio, acento, { pow: 2.4, escala: 1.09, intensidad: 0.7 });
  grupo.add(atmosfera);

  let t = 0;
  return {
    grupo,
    actualizar(dt, solDir) {
      t += dt;
      mat.uniforms.uTime.value = t;
      atmosfera.userData.mat.uniforms.uTime.value = t;
      if (solDir) mat.uniforms.uSol.value.copy(solDir).normalize();
      cuerpo.rotation.y += velocidad * dt * 60 * 0.016;
      micas.forEach((mica, i) => {
        const a = mica.userData.angulo + t * 0.16;
        mica.position.set(Math.cos(a) * radioOrbita, Math.sin(a) * radioOrbita, Math.sin(t * 0.9 + i) * radio * 0.06);
        // Cada mica gira suave para "atrapar" la luz, como un lente al sol.
        mica.rotation.set(Math.sin(t * 0.7 + i) * 0.5, t * 0.6 + i, 0);
      });
    },
  };
}

export default crearAtardecer;

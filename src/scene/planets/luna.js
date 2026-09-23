/**
 * luna.js — planeta tipo "luna" (LUNA, tienda de lentes)
 * ------------------------------------------------------------------
 * Una luna plateada con mares oscuros y cráteres, y un par de lentes de
 * sol en órbita que giran sobre sí mismos como en un exhibidor de tienda:
 * armazón negro brillante y micas ámbar con reflejo del entorno.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { NOISE, VERT_PLANETA } from "../../shaders/lib/noise.glsl.js";
import { crearAtmosfera } from "./atmosphere.js";

const FRAG = /* glsl */ `
  uniform vec3 uSol;
  uniform vec3 uAcento;
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  ${NOISE}
  void main(){
    vec3 N = normalize(vWorldNormal);
    float dia = smoothstep(-0.08, 0.4, dot(N, normalize(uSol)));

    // Mares lunares: manchas grandes y oscuras.
    float mares = smoothstep(0.05, 0.35, fbm(vPos * 1.6));
    vec3 roca = mix(vec3(0.78, 0.78, 0.80), vec3(0.42, 0.43, 0.47), mares);

    // Cráteres: celdas de ruido convertidas en cuencos con borde claro.
    float c = snoise(vPos * 9.0);
    float cuenco = smoothstep(0.55, 0.75, c);
    float borde = smoothstep(0.45, 0.55, c) - smoothstep(0.55, 0.62, c);
    roca *= 1.0 - cuenco * 0.35;
    roca += borde * 0.12;

    // Polvo fino.
    roca *= 0.9 + 0.1 * fbm(vPos * 24.0);

    // Terminador cálido: el borde día/noche toma el tono ámbar de las micas.
    float terminador = smoothstep(0.0, 0.25, dia) * (1.0 - smoothstep(0.25, 0.6, dia));
    vec3 color = roca * (0.05 + dia) + uAcento * terminador * 0.18;
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Lentes de sol: dos micas redondeadas, armazón, puente y varillas.
function crearLentes(escala, acento) {
  const lentes = new THREE.Group();

  const matArmazon = new THREE.MeshStandardMaterial({
    color: 0x0b0d12, roughness: 0.18, metalness: 0.35,
  });
  const matMica = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(acento).lerp(new THREE.Color(0x3b1d05), 0.25),
    emissive: new THREE.Color(acento), emissiveIntensity: 0.18,
    roughness: 0.04, metalness: 0.15,
    clearcoat: 1, clearcoatRoughness: 0.02,
    envMapIntensity: 1.6,
    transparent: true, opacity: 0.82,
    side: THREE.DoubleSide,
  });

  const rMica = 1.0 * escala;
  const separacion = 1.18 * escala;
  const geoMica = new THREE.CircleGeometry(rMica, 48);
  const geoAro = new THREE.TorusGeometry(rMica, 0.1 * escala, 12, 56);

  for (const lado of [-1, 1]) {
    const mica = new THREE.Mesh(geoMica, matMica);
    mica.scale.set(1.12, 0.9, 1); // forma "wayfarer" suave
    mica.position.x = lado * separacion;
    const aro = new THREE.Mesh(geoAro, matArmazon);
    aro.scale.copy(mica.scale);
    aro.position.copy(mica.position);
    lentes.add(mica, aro);

    // Varilla: sale del extremo exterior hacia atrás.
    const varilla = new THREE.Mesh(
      new THREE.BoxGeometry(0.1 * escala, 0.12 * escala, 2.4 * escala),
      matArmazon
    );
    varilla.position.set(lado * (separacion + rMica * 1.1), 0.25 * escala, -1.2 * escala);
    lentes.add(varilla);
  }

  // Puente entre micas.
  const puente = new THREE.Mesh(
    new THREE.TorusGeometry(0.28 * escala, 0.08 * escala, 10, 24, Math.PI),
    matArmazon
  );
  puente.position.y = 0.32 * escala;
  lentes.add(puente);

  return lentes;
}

export function crearLuna(opts) {
  const { radio = 8, acento = "#f4b860", velocidad = 0.01,
    inclinacion = THREE.MathUtils.degToRad(12) } = opts;

  const grupo = new THREE.Group();
  grupo.rotation.z = inclinacion;

  const giro = new THREE.Group();
  grupo.add(giro);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uSol: { value: new THREE.Vector3(-1, 0.4, 0.6).normalize() },
      uAcento: { value: new THREE.Color(acento) },
    },
    vertexShader: VERT_PLANETA,
    fragmentShader: FRAG,
  });
  const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(radio, 96, 96), mat);
  giro.add(cuerpo);

  // Órbita inclinada con los lentes girando sobre su eje (exhibidor).
  const orbita = new THREE.Group();
  orbita.rotation.x = THREE.MathUtils.degToRad(14);
  grupo.add(orbita);

  const lentes = crearLentes(radio * 0.26, acento);
  const soporte = new THREE.Group(); // separa el giro propio de la órbita
  soporte.position.set(radio * 1.55, radio * 0.6, 0);
  soporte.add(lentes);
  orbita.add(soporte);

  const atmosfera = crearAtmosfera(radio, acento, { pow: 3.2, escala: 1.06, intensidad: 0.4 });
  grupo.add(atmosfera);

  let t = 0;
  return {
    grupo,
    actualizar(dt, solDir) {
      t += dt;
      atmosfera.userData.mat.uniforms.uTime.value = t;
      if (solDir) mat.uniforms.uSol.value.copy(solDir).normalize();
      cuerpo.rotation.y += velocidad * dt * 60 * 0.016;
      orbita.rotation.y += 0.18 * dt;
      lentes.rotation.y += 0.7 * dt;                 // giro de exhibidor
      lentes.position.y = Math.sin(t * 1.3) * radio * 0.05; // flota suave
    },
  };
}

export default crearLuna;

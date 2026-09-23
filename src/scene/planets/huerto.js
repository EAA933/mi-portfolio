/**
 * huerto.js — terreno campesino tipo "huerto" (Cosecha Hidalguense)
 * ------------------------------------------------------------------
 * Estética 100% natural, botánica y artesanal:
 *   1. Superficie de cultivo orgánico: parcelas de hortalizas frescas (salvia,
 *      romero, albahaca, cilantro y acelga), surcos de tierra negra fértil
 *      (humus y arcilla de siembra), espigas de trigo y milpa de maíz.
 *   2. Textura de surcos arados campesinos y canales de agua de manantial.
 *   3. Sin auras alienígenas, sin escudos de ciencia ficción ni colores neón.
 *   4. Bruma matutina translúcida que flota a ras del suelo agrícola.
 *   5. Semillas de diente de león y motas botánicas flotando en la brisa.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { NOISE, VERT_PLANETA } from "../../shaders/lib/noise.glsl.js";

const FRAG_HUERTO = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSol;
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  ${NOISE}

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 S = normalize(uSol);
    float diff = dot(N, S);
    float dia = smoothstep(-0.08, 0.32, diff);

    // — Relieve geográfico: 82% parcelas y tierra cultivable, 18% canales de riego —
    float elev = fbm(vPos * 2.2);
    float esTierra = smoothstep(-0.15, 0.05, elev);

    // — Canales de irrigación campesina y agua fresca de manantial cristalino —
    vec3 aguaManantial = vec3(0.10, 0.52, 0.48);
    vec3 aguaPura = vec3(0.22, 0.68, 0.62);
    vec3 rio = mix(aguaManantial, aguaPura, smoothstep(-0.4, 0.1, elev));

    // — Biomas de huerto orgánico fresco y vivo —
    float varBioma = fbm(vPos * 3.8 + 7.5);
    float varDetalle = fbm(vPos * 8.2);

    // 1. Tierra negra fértil y rica (humus de compost y suelo nutrido de siembra)
    vec3 humus = vec3(0.16, 0.10, 0.06);
    vec3 tierraRica = vec3(0.28, 0.17, 0.10);
    vec3 tierraFertil = mix(humus, tierraRica, smoothstep(0.15, 0.65, varDetalle));

    // 2. Cultivo de hortalizas y verduras frescas (lechugas vivas, espinacas, albahaca y acelga)
    vec3 verdeEspinaca = vec3(0.14, 0.48, 0.18);
    vec3 verdeLechuga = vec3(0.22, 0.68, 0.25);
    vec3 verdeBrotes = vec3(0.42, 0.82, 0.28);
    vec3 hortalizas = mix(verdeEspinaca, verdeLechuga, smoothstep(0.2, 0.7, varDetalle));
    hortalizas = mix(hortalizas, verdeBrotes, smoothstep(0.5, 0.85, fbm(vPos * 12.0)));

    // 3. Sembradíos dorados de maíz maduro y trigo bajo el sol de Hidalgo
    vec3 maizDorado = vec3(0.94, 0.76, 0.22);
    vec3 milpaViva = vec3(0.58, 0.68, 0.26);
    vec3 doradosCosecha = mix(milpaViva, maizDorado, smoothstep(0.15, 0.85, varDetalle));

    // 4. Frutos vivos del huerto: jitomates rojos maduros y zanahorias de campo
    vec3 jitomateHuerto = vec3(0.88, 0.26, 0.14);
    vec3 florCalabaza = vec3(0.96, 0.58, 0.16);
    vec3 frutoVivo = mix(jitomateHuerto, florCalabaza, smoothstep(0.2, 0.8, varDetalle));

    // — Surcos de siembra campesina y parcelas aradas —
    float surcos = sin(vPos.y * 68.0 + fbm(vPos * 4.5) * 5.0);
    float relieveSurco = smoothstep(-0.25, 0.25, surcos) * 0.16;

    // Mosaico de parcelas de hortalizas, verduras, maíz y tierra fértil
    vec3 cultivo = mix(hortalizas, doradosCosecha, smoothstep(0.30, 0.65, varBioma));
    cultivo = mix(cultivo, tierraFertil, smoothstep(0.65, 0.88, varBioma));
    cultivo = mix(cultivo, frutoVivo, smoothstep(0.86, 0.98, varDetalle) * 0.55);

    // Modulación natural de luz sobre los surcos de arado
    cultivo *= (0.94 + relieveSurco);

    // Unión entre canales de agua cristalina y huerto cultivado
    vec3 superficie = mix(rio, cultivo, esTierra);

    // Reflejo solar sobre los canales de riego y rocío
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 H = normalize(S + V);
    float specAgua = pow(max(dot(N, H), 0.0), 55.0) * (1.0 - esTierra) * dia * 0.65;

    // Luz cálida y radiante del sol matutino sobre las verduras
    vec3 solCampesino = vec3(1.0, 0.98, 0.90) * dia * 0.24;

    // Color final: fresco, lleno de vida, jugoso y fértil
    vec3 color = superficie * (0.26 + dia * 0.92) + specAgua * vec3(0.95, 1.0, 0.98) + solCampesino;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const FRAG_BRUMA = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSol;
  varying vec3 vPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  ${NOISE}

  void main() {
    // Niebla matutina delgada y vaporosa sobre las parcelas
    float n = fbm(vPos * 2.6 + vec3(uTime * 0.010, uTime * 0.004, 0.0));
    float alfa = smoothstep(0.24, 0.68, n) * 0.42;
    float diff = dot(normalize(vWorldNormal), normalize(uSol));
    float dia = smoothstep(-0.15, 0.35, diff);
    // Tinte blanco marfil suave de bruma campesina
    vec3 colorBruma = mix(vec3(0.86, 0.90, 0.86), vec3(0.96, 0.94, 0.88), dia);
    gl_FragColor = vec4(colorBruma * (0.4 + dia * 0.6), alfa * (0.2 + dia * 0.6));
  }
`;

export function crearHuerto(opts) {
  const {
    radio = 8,
    acento = "#6b8e62",
    velocidad = 0.014,
    inclinacion = THREE.MathUtils.degToRad(12),
  } = opts;

  const grupo = new THREE.Group();
  grupo.rotation.z = inclinacion;

  const giro = new THREE.Group();
  grupo.add(giro);

  // — Superficie del Huerto —
  const matSup = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSol: { value: new THREE.Vector3(-1, 0.4, 0.6).normalize() },
      uAcento: { value: new THREE.Color(acento) },
    },
    vertexShader: VERT_PLANETA,
    fragmentShader: FRAG_HUERTO,
  });
  const superficie = new THREE.Mesh(new THREE.SphereGeometry(radio, 96, 96), matSup);
  giro.add(superficie);

  // — Bruma matutina natural sobre los cultivos —
  const matBruma = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSol: { value: matSup.uniforms.uSol.value },
    },
    vertexShader: VERT_PLANETA,
    fragmentShader: FRAG_BRUMA,
    transparent: true,
    depthWrite: false,
  });
  const bruma = new THREE.Mesh(new THREE.SphereGeometry(radio * 1.014, 64, 64), matBruma);
  giro.add(bruma);

  // — Mota botánica natural: semillas de diente de león y polen silvestre —
  const cantidadPolen = 200;
  const geoPolen = new THREE.BufferGeometry();
  const posPolen = new Float32Array(cantidadPolen * 3);
  const coloresPolen = new Float32Array(cantidadPolen * 3);

  // Tonos vivos del huerto: brotes verdes frescos, sol dorado y flor de calabaza
  const colBrotes = new THREE.Color("#4ade80");
  const colSolDorado = new THREE.Color("#fde047");
  const colFlorCalabaza = new THREE.Color("#fb923c");

  for (let i = 0; i < cantidadPolen; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = radio * (1.03 + Math.random() * 0.22);

    posPolen[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    posPolen[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    posPolen[i * 3 + 2] = r * Math.cos(phi);

    const rnd = Math.random();
    const mez = rnd < 0.45 ? colBrotes.clone().lerp(colSolDorado, rnd / 0.45) : colSolDorado.clone().lerp(colFlorCalabaza, (rnd - 0.45) / 0.55);
    coloresPolen[i * 3 + 0] = mez.r;
    coloresPolen[i * 3 + 1] = mez.g;
    coloresPolen[i * 3 + 2] = mez.b;
  }

  geoPolen.setAttribute("position", new THREE.BufferAttribute(posPolen, 3));
  geoPolen.setAttribute("color", new THREE.BufferAttribute(coloresPolen, 3));

  // Material mate botánico (sin AdditiveBlending para evitar brillo neón)
  const matPolen = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.70,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  const nubePolen = new THREE.Points(geoPolen, matPolen);
  giro.add(nubePolen);

  return {
    grupo,
    actualizar: (dt, solDir) => {
      giro.rotation.y += velocidad * dt;
      nubePolen.rotation.y += velocidad * 1.1 * dt;
      nubePolen.rotation.x += velocidad * 0.2 * dt;

      if (solDir) {
        matSup.uniforms.uSol.value.copy(solDir);
        matBruma.uniforms.uSol.value.copy(solDir);
      }
      matSup.uniforms.uTime.value += dt;
      matBruma.uniforms.uTime.value += dt;
      bruma.rotation.y += velocidad * 0.4 * dt;
    },
  };
}

export default crearHuerto;

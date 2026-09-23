/**
 * gaseoso.js — planeta tipo "gaseoso" (gigante de gas)
 * ------------------------------------------------------------------
 * Bandas por latitud animadas con fbm (fluyen como Júpiter), en tonos
 * del acento. Anillo de partículas (Points) con velocidad kepleriana
 * aproximada (r^-1.5): las internas van más rápido. Un 5% brilla más
 * y viaja 3x más rápido (evoca "mensajes" para Vyntra Flow).
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
    float dia = smoothstep(-0.1, 0.3, diff);

    // Deformación tipo flujo que se desplaza en el tiempo.
    float flujo = fbm(vec3(vPos.x*0.6, vPos.y*2.5, vPos.z*0.6) + vec3(uTime*0.03, 0.0, 0.0));
    float bandas = sin(vPos.y * 11.0 + flujo * 2.5);
    float m = bandas * 0.5 + 0.5;

    vec3 claro = uAcento * 1.15;
    vec3 oscuro = uAcento * 0.35;
    vec3 base = mix(oscuro, claro, m);
    // Vórtice sutil.
    base += uAcento * smoothstep(0.7, 1.0, fbm(vPos*4.0 + 5.0)) * 0.3;

    gl_FragColor = vec4(base * (0.08 + dia), 1.0);
  }
`;

function crearAnillo(radioPlaneta, acento, cantidad = 4000) {
  const pos = new Float32Array(cantidad * 3);
  const dat = new Float32Array(cantidad * 3); // radio, velocidad, brillo
  const rInt = radioPlaneta * 1.5;
  const rExt = radioPlaneta * 2.4;
  for (let i = 0; i < cantidad; i++) {
    const r = rInt + Math.random() * (rExt - rInt);
    const a = Math.random() * Math.PI * 2;
    pos[i * 3 + 0] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * radioPlaneta * 0.04;
    pos[i * 3 + 2] = Math.sin(a) * r;
    const kepler = Math.pow(rInt / r, 1.5); // internas más rápidas
    const mensajero = Math.random() < 0.05; // 5% "mensajes"
    dat[i * 3 + 0] = a;
    dat[i * 3 + 1] = kepler * (mensajero ? 3.0 : 1.0);
    dat[i * 3 + 2] = mensajero ? 2.2 : 0.5 + Math.random() * 0.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aDato", new THREE.BufferAttribute(dat, 3));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(acento) },
      uRadioInt: { value: rInt },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uRadioInt;
      attribute vec3 aDato; // ang, velocidad, brillo
      varying float vBrillo;
      void main(){
        vBrillo = aDato.z;
        float r = length(position.xz);
        float ang = aDato.x + uTime * aDato.y * 0.3;
        vec3 p = vec3(cos(ang) * r, position.y, sin(ang) * r);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (aDato.z > 1.5 ? 3.0 : 1.6) * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vBrillo;
      void main(){
        float d = length(gl_PointCoord * 2.0 - 1.0);
        float a = smoothstep(1.0, 0.0, d);
        gl_FragColor = vec4(uColor * vBrillo, a * vBrillo);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const puntos = new THREE.Points(geo, mat);
  puntos.userData.mat = mat;
  return puntos;
}

export function crearGaseoso(opts) {
  const { radio = 8, acento = "#3ad29a", velocidad = 0.025,
    inclinacion = THREE.MathUtils.degToRad(12) } = opts;

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

  const anillo = crearAnillo(radio, acento);
  grupo.add(anillo);

  const atmosfera = crearAtmosfera(radio, acento, { pow: 3.2, escala: 1.06 });
  grupo.add(atmosfera);

  return {
    grupo,
    actualizar(dt, solDir) {
      mat.uniforms.uTime.value += dt;
      anillo.userData.mat.uniforms.uTime.value += dt;
      atmosfera.userData.mat.uniforms.uTime.value += dt;
      if (solDir) mat.uniforms.uSol.value.copy(solDir).normalize();
      cuerpo.rotation.y += velocidad * dt * 60 * 0.016;
    },
  };
}

export default crearGaseoso;

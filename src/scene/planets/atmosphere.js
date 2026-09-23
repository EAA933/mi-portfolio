/**
 * atmosphere.js — atmósfera Fresnel (glow del color de acento)
 * ------------------------------------------------------------------
 * Cáscara ligeramente mayor que el planeta, dibujada por la cara interna
 * (BackSide) con blending aditivo. El clásico "glow de rim": la intensidad
 * crece hacia el borde visible. "Respira" ±5% con el tiempo.
 * La comparten todos los tipos de planeta.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";

const VERT = /* glsl */ `
  varying vec3 vNormalVista;
  void main(){
    // Normal en espacio de vista: su componente Z apunta a la cámara,
    // así el borde (rim) es donde el dot con (0,0,1) es pequeño.
    vNormalVista = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uCoef;   // desplaza el rim
  uniform float uPow;    // dureza del rim
  uniform float uTime;
  varying vec3 vNormalVista;
  void main(){
    float rim = pow(max(uCoef - dot(vNormalVista, vec3(0.0, 0.0, 1.0)), 0.0), uPow);
    // Respiración sutil.
    float resp = 0.95 + 0.05 * sin(uTime * 1.0);
    gl_FragColor = vec4(uColor * rim * resp, rim);
  }
`;

export function crearAtmosfera(radio, colorHex, opciones = {}) {
  const { coef = 0.9, pow = 3.0, escala = 1.08, intensidad = 0.55 } = opciones;
  const geo = new THREE.SphereGeometry(radio * escala, 48, 48);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(colorHex).multiplyScalar(intensidad) },
      uCoef: { value: coef },
      uPow: { value: pow },
      uTime: { value: 0 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const malla = new THREE.Mesh(geo, mat);
  malla.userData.mat = mat;
  return malla;
}

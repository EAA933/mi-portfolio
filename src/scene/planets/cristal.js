/**
 * cristal.js — planeta tipo "cristal"
 * ------------------------------------------------------------------
 * Geometría facetada (icosaedro de bajo detalle) con MeshPhysicalMaterial:
 * transmission + iridescence + clearcoat. Tres lunas a distintas
 * velocidades (periodos 8/13/21s). Rota lento (peso y precisión).
 *
 * NOTA: la transmisión luce mejor con un entorno que refractar; al no
 * tener envMap aún, apoyamos el look con iridiscencia + un poco de
 * emisión del acento. Base funcional para afinar en su fase.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { crearAtmosfera } from "./atmosphere.js";

export function crearCristal(opts) {
  const { radio = 8, acento = "#c9b6ff", velocidad = 0.01,
    inclinacion = THREE.MathUtils.degToRad(22) } = opts;

  const grupo = new THREE.Group();
  grupo.rotation.z = inclinacion;

  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(acento),
    metalness: 0.0,
    roughness: 0.12,
    transmission: 0.9,
    thickness: radio * 0.8,
    ior: 1.5,
    iridescence: 1.0,
    iridescenceIOR: 1.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    emissive: new THREE.Color(acento),
    emissiveIntensity: 0.12,
    transparent: true,
  });
  const cuerpo = new THREE.Mesh(new THREE.IcosahedronGeometry(radio, 1), mat);
  grupo.add(cuerpo);

  // Tres lunas con estelas sutiles (periodos 8/13/21 s).
  const periodos = [8, 13, 21];
  const orbitas = periodos.map((T, i) => {
    const o = new THREE.Group();
    o.rotation.x = THREE.MathUtils.degToRad(15 + i * 12);
    const luna = new THREE.Mesh(
      new THREE.SphereGeometry(radio * 0.08, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(acento),
        emissiveIntensity: 0.4,
        roughness: 0.5,
      })
    );
    luna.position.set(radio * (1.8 + i * 0.5), 0, 0);
    o.add(luna);
    grupo.add(o);
    return { o, w: (Math.PI * 2) / T };
  });

  const atmosfera = crearAtmosfera(radio, acento, { pow: 2.6, escala: 1.05 });
  grupo.add(atmosfera);

  return {
    grupo,
    actualizar(dt, _solDir) {
      atmosfera.userData.mat.uniforms.uTime.value += dt;
      cuerpo.rotation.y += velocidad * dt * 60 * 0.016;
      orbitas.forEach(({ o, w }) => (o.rotation.y += w * dt));
    },
  };
}

export default crearCristal;

/**
 * galaxy.js — vista final: sistema solar (Fase 4)
 * ------------------------------------------------------------------
 * Al final del scroll (0.88–1.00) la cámara se aleja y los planetas
 * pasan de su posición en el recorrido a orbitar, en planos inclinados,
 * alrededor de una estrella central con glow. Líneas de órbita hairline.
 *
 * Este módulo aporta la estrella, las órbitas y la posición orbital de
 * cada planeta en el tiempo; main.js interpola cada planeta entre su
 * posición de recorrido y su órbita según el progreso de galaxia (gP).
 * ------------------------------------------------------------------
 */
import * as THREE from "three";

export function crearGalaxia(escena, projects, centro) {
  const grupo = new THREE.Group();
  grupo.position.copy(centro);
  grupo.visible = false;
  escena.add(grupo);

  // — Estrella central (representa al autor) —
  const estrella = new THREE.Mesh(
    new THREE.SphereGeometry(6, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xfff1d6 })
  );
  grupo.add(estrella);

  // Halo de la estrella (Fresnel aditivo).
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(11, 32, 32),
    new THREE.ShaderMaterial({
      uniforms: { uInt: { value: 0 } },
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform float uInt; varying vec3 vN;
        void main(){ float r = pow(max(0.82 - dot(vN, vec3(0.0,0.0,1.0)), 0.0), 3.0);
        gl_FragColor = vec4(vec3(1.0,0.93,0.78) * r * uInt, r * uInt); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    })
  );
  grupo.add(glow);

  const luz = new THREE.PointLight(0xfff0d8, 0, 900, 1.4);
  grupo.add(luz);

  // — Órbitas por planeta —
  const orbitas = [];
  const lineas = [];
  const n = projects.length;
  for (let j = 0; j < n; j++) {
    const radio = 46 + j * 28;
    const incl = THREE.MathUtils.degToRad(9 + j * 9);
    const yaw = j * 0.9;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(incl, yaw, 0));
    const periodo = 55 + j * 16; // segundos por vuelta (calmado)
    orbitas.push({ radio, q, fase: j * 1.7, vel: (Math.PI * 2) / periodo });

    // Línea de órbita (hairline).
    const pts = [];
    for (let a = 0; a <= 96; a++) {
      const ang = (a / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(ang) * radio, 0, Math.sin(ang) * radio).applyQuaternion(q));
    }
    const linea = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    );
    grupo.add(linea);
    lineas.push(linea);
  }

  let tOrbe = 0;
  const _v = new THREE.Vector3();

  return {
    grupo,
    // Posición ORBITAL (mundo) del planeta j en el tiempo actual.
    posicionOrbital(j) {
      const o = orbitas[j];
      const ang = o.fase + tOrbe * o.vel;
      _v.set(Math.cos(ang) * o.radio, 0, Math.sin(ang) * o.radio).applyQuaternion(o.q).add(centro);
      return _v;
    },
    actualizar(dt, gP) {
      tOrbe += dt;
      grupo.visible = gP > 0.001;
      estrella.scale.setScalar(0.25 + gP * 0.75);
      glow.material.uniforms.uInt.value = gP;
      luz.intensity = gP * 2.4;
      for (const l of lineas) l.material.opacity = gP * 0.16;
    },
  };
}

export default crearGalaxia;

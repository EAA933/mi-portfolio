/**
 * medico.js — planeta tipo "medico" (MedScan)
 * ------------------------------------------------------------------
 * Superficie clínica (blanco perla con celdas suaves tipo blíster) que
 * recorre una BANDA DE ESCANEO: al pasar revela una retícula de datos en
 * el color de acento, como un lector que compara precios. Lo rodea un
 * anillo de 12 cápsulas bicolor — una por farmacia comparada.
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
  ${NOISE}
  void main(){
    vec3 N = normalize(vWorldNormal);
    float dia = smoothstep(-0.05, 0.35, dot(N, normalize(uSol)));

    // Base clínica: blanco perla con celdas suaves.
    float celdas = fbm(vPos * 4.0);
    vec3 base = mix(vec3(0.78, 0.82, 0.90), vec3(0.95, 0.96, 1.0),
                    smoothstep(-0.3, 0.5, celdas));
    // Tinte sutil del acento en las zonas bajas.
    base = mix(base, uAcento * 0.9, smoothstep(0.1, -0.5, celdas) * 0.25);

    // Retícula de datos (latitud/longitud).
    float lat = asin(clamp(vPos.y, -1.0, 1.0));
    float lon = atan(vPos.z, vPos.x);
    // Distancia a la línea más cercana: 1.0 sobre la línea, 0.0 entre líneas.
    float gLat = smoothstep(0.9, 0.97, abs(fract(lat * 6.0) - 0.5) * 2.0);
    float gLon = smoothstep(0.9, 0.97, abs(fract(lon * 4.0) - 0.5) * 2.0);
    float reticula = max(gLat, gLon);

    // Banda de escaneo: sube y baja por el planeta (~6 s por ciclo).
    float yScan = sin(uTime * 1.05);
    float d = abs(vPos.y - yScan);
    float linea = smoothstep(0.035, 0.0, d);          // línea brillante
    float estela = smoothstep(0.35, 0.0, d);          // zona revelada

    vec3 color = base * (0.08 + dia);
    color += uAcento * reticula * (0.06 + estela * 0.9);
    color += mix(uAcento, vec3(1.0), 0.4) * linea * 1.6;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function crearMedico(opts) {
  const { radio = 8, acento = "#818cf8", velocidad = 0.014,
    inclinacion = THREE.MathUtils.degToRad(14) } = opts;

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

  // Anillo de 12 cápsulas (una por farmacia). Cada cápsula = dos mitades
  // (blanca + acento) instanciadas, para 2 draw calls en total.
  const N = 12;
  const r = radio * 0.045;
  const largo = radio * 0.11;
  const mitad = new THREE.CapsuleGeometry(r, largo / 2, 6, 12);
  mitad.translate(0, largo / 4, 0);
  const matBlanco = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.05 });
  const matAcento = new THREE.MeshStandardMaterial({
    color: acento, roughness: 0.3, metalness: 0.1,
    emissive: acento, emissiveIntensity: 0.25,
  });
  const blancas = new THREE.InstancedMesh(mitad, matBlanco, N);
  const colores = new THREE.InstancedMesh(mitad, matAcento, N);

  const anillo = new THREE.Group();
  anillo.rotation.x = THREE.MathUtils.degToRad(72);
  anillo.add(blancas, colores);
  grupo.add(anillo);

  const radioAnillo = radio * 1.6;
  const dummy = new THREE.Object3D();
  const giroCapsulas = Array.from({ length: N }, (_, i) => i * 0.7);
  function colocarCapsulas(t) {
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const tumbo = giroCapsulas[i] + t * 0.8;
      dummy.position.set(Math.cos(a) * radioAnillo, Math.sin(a) * radioAnillo, 0);
      dummy.rotation.set(tumbo, 0, a);
      dummy.updateMatrix();
      blancas.setMatrixAt(i, dummy.matrix);
      // La mitad de color es la misma cápsula volteada 180°.
      dummy.rotateX(Math.PI);
      dummy.updateMatrix();
      colores.setMatrixAt(i, dummy.matrix);
    }
    blancas.instanceMatrix.needsUpdate = true;
    colores.instanceMatrix.needsUpdate = true;
  }
  colocarCapsulas(0);

  const atmosfera = crearAtmosfera(radio, acento, { pow: 2.6, escala: 1.08, intensidad: 0.6 });
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
      anillo.rotation.z += 0.12 * dt;
      colocarCapsulas(t);
    },
  };
}

export default crearMedico;

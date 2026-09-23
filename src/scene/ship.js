/**
 * ship.js — nave: modelo .glb real (con fallback procedural)
 * ------------------------------------------------------------------
 * Carga /models/nave.glb (un modelo 3D real). Mientras carga —o si falla—
 * muestra una nave procedural para que la escena nunca se quede sin nave.
 * El "controlador" (seguir a la cámara, aparición con `entrada`, estela)
 * es el mismo para ambos.
 *
 * Para CAMBIAR de nave: reemplaza public/models/nave.glb por otro .glb.
 * Si se ve mal orientada o de tamaño, ajusta MODELO_* aquí abajo.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const MOTOR = 0x9fd4ff;

// Ajustes del modelo (afínalos si hace falta):
const MODELO_URL = "/models/nave.glb";
const MODELO_TAM = 5.0;                 // dimensión máxima deseada (unidades)
const MODELO_ROT = { x: 0, y: Math.PI / 2, z: 0 }; // orientación que te gustó

// ── Nave procedural (fallback): transbordador con góndolas ──────
// Fuselaje con volumen + cabina + dos motores que sobresalen y brillan.
function construirProcedural(g) {
  const hull = new THREE.MeshPhysicalMaterial({
    color: 0xeef1f4, roughness: 0.3, metalness: 0.12,
    clearcoat: 1.0, clearcoatRoughness: 0.18, envMapIntensity: 1.25,
  });
  const gris = new THREE.MeshStandardMaterial({ color: 0x565b63, roughness: 0.45, metalness: 0.75, envMapIntensity: 1.0 });
  const vidrio = new THREE.MeshPhysicalMaterial({
    color: 0x08121c, roughness: 0.06, metalness: 0.15,
    emissive: new THREE.Color(0x1d3a52), emissiveIntensity: 0.4, clearcoat: 1.0,
  });
  const glow = new THREE.MeshBasicMaterial({ color: MOTOR });

  // Fuselaje (cápsula con volumen, ligeramente aplanado).
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 2.1, 12, 22), hull);
  fus.rotation.x = Math.PI / 2; fus.scale.set(0.92, 0.72, 1.0);
  g.add(fus);

  // Nariz.
  const nariz = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.15, 22), hull);
  nariz.rotation.x = -Math.PI / 2; nariz.position.z = -2.05; nariz.scale.set(0.92, 0.72, 1);
  g.add(nariz);

  // Cabina de vidrio (dorsal, delantera).
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 18), vidrio);
  cab.scale.set(0.72, 0.46, 1.5); cab.position.set(0, 0.4, -1.15);
  g.add(cab);

  // Góndolas de motor + pilones + glow.
  [1, -1].forEach((sg) => {
    const nac = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.5, 10, 18), hull);
    nac.rotation.x = Math.PI / 2; nac.position.set(sg * 1.2, -0.02, 0.55);
    g.add(nac);
    // Pilón que une fuselaje y góndola.
    const pyl = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.09, 0.55), gris);
    pyl.position.set(sg * 0.62, -0.02, 0.5); pyl.rotation.z = sg * 0.04;
    g.add(pyl);
    // Glow trasero (motor) y toma delantera.
    const rear = new THREE.Mesh(new THREE.CircleGeometry(0.19, 20), glow);
    rear.position.set(sg * 1.2, -0.02, 1.38); rear.rotation.y = Math.PI;
    g.add(rear);
    const front = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), glow);
    front.position.set(sg * 1.2, -0.02, -0.3);
    g.add(front);
  });

  // Aleta vertical + línea de luz dorsal.
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 0.75), hull);
  fin.position.set(0, 0.42, 1.35); fin.rotation.x = 0.16;
  g.add(fin);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 2.4), glow);
  strip.position.set(0, 0.36, -0.3);
  g.add(strip);
}

export function crearNave(manager) {
  const externo = new THREE.Group();
  const interno = new THREE.Group();
  externo.add(interno);

  // Contenido visual (procedural primero; se reemplaza por el .glb al cargar).
  let contenido = new THREE.Group();
  interno.add(contenido);
  construirProcedural(contenido);

  // (Sin estela ni luz azul añadida: el X-Wing usa sus propios motores.)

  const raiz = new THREE.Group();
  raiz.add(externo);

  // — Carga del modelo .glb (asíncrona; swap cuando llega) —
  let mixer = null;
  const loader = new GLTFLoader(manager);
  try {
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(draco);
  } catch (e) {}
  loader.load(
    MODELO_URL,
    (gltf) => {
      const modelo = gltf.scene;
      // Normalizar tamaño y centrar.
      const box = new THREE.Box3().setFromObject(modelo);
      const size = new THREE.Vector3(); box.getSize(size);
      const esc = MODELO_TAM / Math.max(size.x, size.y, size.z || 1);
      modelo.scale.setScalar(esc);
      const c = new THREE.Vector3(); box.getCenter(c);
      modelo.position.copy(c.multiplyScalar(-esc));
      modelo.rotation.set(MODELO_ROT.x, MODELO_ROT.y, MODELO_ROT.z);
      // Reemplazar la nave procedural.
      interno.remove(contenido);
      contenido = modelo;
      interno.add(modelo);
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(modelo);
        mixer.clipAction(gltf.animations[0]).play();
      }
      console.info("[ship] modelo .glb cargado");
    },
    undefined,
    (err) => console.warn("[ship] no se pudo cargar /models/nave.glb; se usa la nave procedural.", err)
  );

  const _fwdPrev = new THREE.Vector3(0, 0, -1);
  const _tmp = new THREE.Vector3();
  const _obj = new THREE.Vector3();
  const _off = new THREE.Vector3(0, -2.2, 0);
  let t = 0;

  return {
    grupo: raiz,
    /**
     * @param {Array<{centro:THREE.Vector3, radio:number}>} obstaculos  planetas a esquivar
     * @param {boolean} aterrizando  si true, se permite entrar al planeta (animación de Explorar)
     */
    actualizar(dt, camara, entrada = 1, obstaculos = null, aterrizando = false) {
      t += dt;
      if (mixer) mixer.update(dt);

      const fwd = camara.getWorldDirection(_tmp).clone();
      _obj.copy(camara.position).addScaledVector(fwd, 10).add(_off);

      // En el recorrido, no dejar que la nave se meta en un planeta:
      // si el objetivo cae dentro de la esfera de seguridad, lo empujamos afuera.
      if (!aterrizando && obstaculos) {
        for (const o of obstaculos) {
          if (_obj.distanceTo(o.centro) < o.radio) {
            _obj.sub(o.centro).setLength(o.radio).add(o.centro);
          }
        }
      }

      externo.position.lerp(_obj, 0.15);
      externo.lookAt(externo.position.clone().addScaledVector(fwd, 5));

      const e = Math.max(Math.min(entrada, 1), 0);
      interno.scale.setScalar(e);
      interno.position.y = Math.sin(t * 1.3) * 0.12;
      const giro = fwd.x - _fwdPrev.x;
      interno.rotation.z += (THREE.MathUtils.clamp(-giro * 12, -0.5, 0.5) - interno.rotation.z) * 0.08;
      _fwdPrev.copy(fwd);

    },
  };
}

export default crearNave;

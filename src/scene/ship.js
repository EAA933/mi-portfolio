/**
 * ship.js — nave: modelo .glb real (con fallback procedural)
 * ------------------------------------------------------------------
 * Carga /models/nave.glb (un modelo 3D real). Mientras carga —o si falla—
 * muestra una nave procedural para que la escena nunca se quede sin nave.
 * El "controlador" (seguir a la cámara, aparición con `entrada`, propulsores)
 * es el mismo para ambos.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const MOTOR = 0x9fd4ff;

// Ajustes del modelo GLB:
const MODELO_URL = import.meta.env.BASE_URL + "models/nave.glb";
const MODELO_TAM = 5.0; // dimensión máxima deseada (unidades)
const MODELO_ROT = { x: 0, y: Math.PI / 2, z: 0 }; // Orienta nariz a +Z (adelante) y motores a -Z (atrás)

// ── Nave procedural (fallback): transbordador espacial ─────────
// Nariz hacia +Z (frente), motores hacia -Z (trasera).
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

  // Fuselaje
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 2.1, 12, 22), hull);
  fus.rotation.x = Math.PI / 2; fus.scale.set(0.92, 0.72, 1.0);
  g.add(fus);

  // Nariz (delante hacia +Z)
  const nariz = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.15, 22), hull);
  nariz.rotation.x = Math.PI / 2; nariz.position.z = 2.05; nariz.scale.set(0.92, 0.72, 1);
  g.add(nariz);

  // Cabina de vidrio (dorsal, delantera hacia +Z)
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 18), vidrio);
  cab.scale.set(0.72, 0.46, 1.5); cab.position.set(0, 0.4, 1.15);
  g.add(cab);

  // Góndolas de motor + pilones + glow (hacia -Z, trasera)
  [1, -1].forEach((sg) => {
    const nac = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.5, 10, 18), hull);
    nac.rotation.x = Math.PI / 2; nac.position.set(sg * 1.2, -0.02, -0.55);
    g.add(nac);
    // Pilón que une fuselaje y góndola
    const pyl = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.09, 0.55), gris);
    pyl.position.set(sg * 0.62, -0.02, -0.5); pyl.rotation.z = sg * 0.04;
    g.add(pyl);
    // Glow trasero (motor hacia -Z) y toma delantera (hacia +Z)
    const rear = new THREE.Mesh(new THREE.CircleGeometry(0.19, 20), glow);
    rear.position.set(sg * 1.2, -0.02, -1.38);
    g.add(rear);
    const front = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), glow);
    front.position.set(sg * 1.2, -0.02, 0.3); front.rotation.y = Math.PI;
    g.add(front);
  });

  // Aleta vertical
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 0.75), hull);
  fin.position.set(0, 0.42, -1.35); fin.rotation.x = -0.16;
  g.add(fin);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 2.4), glow);
  strip.position.set(0, 0.36, 0.3);
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

  // ── Sistema de propulsores de plasma (Afterburner FX) ───────────
  // Los motores están en la parte trasera de la nave (Z negativo, apuntando hacia atrás/cámara)
  const propulsores = new THREE.Group();
  interno.add(propulsores);

  // Material del núcleo de plasma caliente (blanco-cian hiper-brillante)
  const matCore = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // Material de la llama exterior de plasma (cian eléctrico)
  const matPluma = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // Material de destello / halo de tobera
  const matHalo = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // Geometrías de llama: base en z=0 (tobera), punta disparada hacia atrás (-Z, hacia la cámara)
  const geomCore = new THREE.ConeGeometry(0.07, 1.3, 12);
  geomCore.translate(0, 0.65, 0); // base en 0, punta en +1.3
  geomCore.rotateX(-Math.PI / 2); // rota +Y hacia -Z (punta hacia atrás)

  const geomPluma = new THREE.ConeGeometry(0.14, 2.2, 12);
  geomPluma.translate(0, 1.1, 0); // base en 0, punta en +2.2
  geomPluma.rotateX(-Math.PI / 2); // punta hacia -Z (punta hacia atrás)

  const geomHalo = new THREE.RingGeometry(0.05, 0.22, 16);

  // Coordenadas reales de las 4 toberas de escape traseras (alas X-Wing)
  const toberas = [
    { x: -0.60, y: 0.46, z: -2.33 },
    { x: -0.62, y: -0.27, z: -2.33 },
    { x: 0.62, y: 0.47, z: -2.33 },
    { x: 0.60, y: -0.26, z: -2.33 },
  ];

  const escapes = toberas.map((pos) => {
    const gEscape = new THREE.Group();
    gEscape.position.set(pos.x, pos.y, pos.z);

    const mPluma = new THREE.Mesh(geomPluma, matPluma);
    const mCore = new THREE.Mesh(geomCore, matCore);
    const mHalo = new THREE.Mesh(geomHalo, matHalo);
    mHalo.position.z = -0.01;

    gEscape.add(mPluma);
    gEscape.add(mCore);
    gEscape.add(mHalo);
    propulsores.add(gEscape);

    return { grupo: gEscape, pluma: mPluma, core: mCore, halo: mHalo };
  });

  // Luz dinámica de plasma en la bahía de motores traseros
  const luzPlasma = new THREE.PointLight(0x00d4ff, 2.2, 7);
  luzPlasma.position.set(0, 0.1, -2.4);
  propulsores.add(luzPlasma);

  // Estela de chispas / partículas que salen expulsadas hacia atrás (-Z)
  const NUM_CHISPAS = 32;
  const geomChispas = new THREE.BufferGeometry();
  const posChispas = new Float32Array(NUM_CHISPAS * 3);
  const velChispas = new Float32Array(NUM_CHISPAS * 3);

  for (let i = 0; i < NUM_CHISPAS; i++) {
    const idx = i * 3;
    const tob = toberas[i % toberas.length];
    posChispas[idx] = tob.x + (Math.random() - 0.5) * 0.08;
    posChispas[idx + 1] = tob.y + (Math.random() - 0.5) * 0.08;
    posChispas[idx + 2] = tob.z - Math.random() * 2.0;

    velChispas[idx] = (Math.random() - 0.5) * 0.2;
    velChispas[idx + 1] = (Math.random() - 0.5) * 0.2;
    velChispas[idx + 2] = -(3.0 + Math.random() * 7.0); // Velocidad negativa hacia -Z (atrás)
  }
  geomChispas.setAttribute("position", new THREE.BufferAttribute(posChispas, 3));

  const matChispas = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.12,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const chispasMesh = new THREE.Points(geomChispas, matChispas);
  propulsores.add(chispasMesh);

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
      // Normalizar tamaño y centrar en un contenedor wrapper
      const contenedorModelo = new THREE.Group();
      const box = new THREE.Box3().setFromObject(modelo);
      const size = new THREE.Vector3(); box.getSize(size);
      const esc = MODELO_TAM / Math.max(size.x, size.y, size.z || 1);
      modelo.scale.setScalar(esc);
      const c = new THREE.Vector3(); box.getCenter(c);
      modelo.position.copy(c.multiplyScalar(-esc));
      contenedorModelo.add(modelo);
      contenedorModelo.rotation.set(MODELO_ROT.x, MODELO_ROT.y, MODELO_ROT.z);

      // Reemplazar la nave procedural
      interno.remove(contenido);
      contenido = contenedorModelo;
      interno.add(contenedorModelo);

      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(modelo);
        mixer.clipAction(gltf.animations[0]).play();
      }
      console.info("[ship] modelo .glb cargado y alineado con propulsores");
    },
    undefined,
    (err) => console.warn("[ship] no se pudo cargar /models/nave.glb; se usa la nave procedural.", err)
  );

  const _fwdPrev = new THREE.Vector3(0, 0, -1);
  const _tmp = new THREE.Vector3();
  const _obj = new THREE.Vector3();
  const _off = new THREE.Vector3(0, -2.2, 0);
  let t = 0;

  const colCyan = new THREE.Color(0x00d4ff);
  const colVioleta = new THREE.Color(0xd946ef); // Magenta-violeta hiperespacial
  const colHaloCyan = new THREE.Color(0x38bdf8);
  const colHaloSobrecarga = new THREE.Color(0xf472b6);
  const colLuzCyan = new THREE.Color(0x00d4ff);
  const colLuzVioleta = new THREE.Color(0xa855f7);
  const colChispaCyan = new THREE.Color(0x38bdf8);
  const colChispaWarp = new THREE.Color(0xf0abfc);

  return {
    grupo: raiz,
    /**
     * @param {Array<{centro:THREE.Vector3, radio:number}>} obstaculos  planetas a esquivar
     * @param {boolean} aterrizando  si true, se permite entrar al planeta (animación de Explorar)
     * @param {{x:number, y:number}} mouse  coordenadas normalizadas del puntero (-1..1)
     * @param {number} velocidad  velocidad instantánea de scroll (warp/inercia)
     * @param {number} warpFactor sobrecarga hiperespacial (0..1)
     */
    actualizar(dt, camara, entrada = 1, obstaculos = null, aterrizando = false, mouse = { x: 0, y: 0 }, velocidad = 0, warpFactor = 0) {
      if (mixer) mixer.update(dt);
      t += dt;

      const fwd = camara.getWorldDirection(_tmp).clone();
      _obj.copy(camara.position).addScaledVector(fwd, 10).add(_off);

      // En el recorrido, no dejar que la nave se meta en un planeta:
      if (!aterrizando && obstaculos) {
        for (const o of obstaculos) {
          if (_obj.distanceTo(o.centro) < o.radio) {
            _obj.sub(o.centro).setLength(o.radio).add(o.centro);
          }
        }
      }

      externo.position.lerp(_obj, 0.15);
      // La nave apunta en la dirección en la que vuela (hacia adelante, alejándose de la cámara)
      externo.lookAt(externo.position.clone().addScaledVector(fwd, 5));

      const e = Math.max(Math.min(entrada, 1), 0);
      interno.scale.setScalar(e);

      // Interacción viva con el mouse y aceleración de vuelo
      const mx = mouse ? mouse.x || 0 : 0;
      const my = mouse ? mouse.y || 0 : 0;
      const velAcel = THREE.MathUtils.clamp(velocidad * 0.04, -0.3, 0.3);

      const giro = fwd.x - _fwdPrev.x;

      // Inclinación lateral (bank roll) combinando giro de cámara y movimiento horizontal del puntero:
      const targetRoll = THREE.MathUtils.clamp(-giro * 14 - mx * 0.35, -0.6, 0.6);
      interno.rotation.z += (targetRoll - interno.rotation.z) * 0.1;

      // Inclinación vertical (pitch) según puntero Y y aceleración de scroll:
      const targetPitch = THREE.MathUtils.clamp(my * 0.22 - velAcel, -0.35, 0.35);
      interno.rotation.x += (targetPitch - interno.rotation.x) * 0.1;

      // Leve guiñada (yaw) hacia el mouse:
      const targetYaw = THREE.MathUtils.clamp(-mx * 0.22, -0.3, 0.3);
      interno.rotation.y += (targetYaw - interno.rotation.y) * 0.1;

      // Desplazamiento orgánico suave: flotación en Y + respuesta al mouse:
      interno.position.y = Math.sin(t * 1.5) * 0.14 - my * 0.25;
      interno.position.x += (mx * 0.35 - interno.position.x) * 0.08;

      // ── Sobrecarga hiperespacial / Warp reactivo ───────────────
      const velAbs = Math.abs(velocidad);
      const velNorm = THREE.MathUtils.clamp(velAbs / 260, 0, 1);
      const totalWarp = THREE.MathUtils.clamp(Math.max(velNorm, warpFactor), 0, 1);

      // Los propulsores pasan de cian a violeta/blanco en sobrecarga momentánea
      matPluma.color.lerpColors(colCyan, colVioleta, totalWarp);
      matHalo.color.lerpColors(colHaloCyan, colHaloSobrecarga, totalWarp);
      luzPlasma.color.lerpColors(colLuzCyan, colLuzVioleta, totalWarp);
      matChispas.color.lerpColors(colChispaCyan, colChispaWarp, totalWarp);

      // Micro-shake de cabina / turbulencia estelar en el fuselaje
      if (totalWarp > 0.04) {
        const shakeNave = totalWarp * 0.14;
        interno.position.x += (Math.random() - 0.5) * shakeNave;
        interno.position.y += (Math.random() - 0.5) * shakeNave;
        interno.position.z += (Math.random() - 0.5) * shakeNave;
      }

      const pulsoTurbulencia = 1 + Math.sin(t * 35) * 0.08 + Math.cos(t * 53) * 0.05;
      const boostLongitud = 1.0 + velNorm * 2.2 + totalWarp * 2.6;
      const boostGrosor = 1.0 + velNorm * 0.5 + totalWarp * 0.55;

      escapes.forEach((esc, i) => {
        const offsetFase = Math.sin(t * 28 + i * 1.5) * 0.05;
        const lScale = (boostLongitud + offsetFase) * pulsoTurbulencia;

        // La llama se elonga hacia atrás (-Z) con la velocidad
        esc.pluma.scale.set(boostGrosor, boostGrosor, lScale);
        esc.core.scale.set(boostGrosor * 0.95, boostGrosor * 0.95, lScale * 0.88);

        const haloScale = 1.0 + velNorm * 0.7 + totalWarp * 1.2 + Math.sin(t * 20 + i) * 0.06;
        esc.halo.scale.setScalar(haloScale);
      });

      luzPlasma.intensity = (1.5 + velNorm * 3.5 + totalWarp * 6.5 + Math.sin(t * 30) * 0.4) * e;

      // Actualizar chispas disparadas hacia atrás (-Z)
      const pArr = geomChispas.attributes.position.array;
      const boostSpeedMult = 1.0 + velNorm * 2.5 + totalWarp * 6.5;
      for (let i = 0; i < NUM_CHISPAS; i++) {
        const idx = i * 3;
        pArr[idx] += velChispas[idx] * dt;
        pArr[idx + 1] += velChispas[idx + 1] * dt;
        pArr[idx + 2] += velChispas[idx + 2] * dt * boostSpeedMult;

        // Si se aleja demasiado hacia atrás (-Z < -6.5), reiniciar en la tobera
        if (pArr[idx + 2] < -6.5) {
          const tob = toberas[i % toberas.length];
          pArr[idx] = tob.x + (Math.random() - 0.5) * 0.06;
          pArr[idx + 1] = tob.y + (Math.random() - 0.5) * 0.06;
          pArr[idx + 2] = tob.z - Math.random() * 0.15;
        }
      }
      geomChispas.attributes.position.needsUpdate = true;
      matChispas.opacity = (0.85 + totalWarp * 0.15) * e;

      _fwdPrev.copy(fwd);
    },
  };
}

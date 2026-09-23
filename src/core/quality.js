/**
 * quality.js — detección de capacidades y calidad adaptativa
 * ------------------------------------------------------------------
 * 1) Detecta si el dispositivo puede correr la experiencia 3D.
 * 2) Elige un nivel inicial (alto/medio/bajo) según hardware.
 * 3) Mide fps en vivo y BAJA de nivel si el promedio cae de 45fps
 *    durante 2s (nunca sube solo, para evitar oscilaciones).
 * ------------------------------------------------------------------
 */

// ── Detección de capacidades ────────────────────────────────────
export function detectarCapacidades() {
  const movil = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const reducirMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ¿Hay WebGL? (probamos WebGL2 y caemos a WebGL1)
  let webgl = false;
  let webgl2 = false;
  try {
    const c = document.createElement("canvas");
    webgl2 = !!c.getContext("webgl2");
    webgl = webgl2 || !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch (e) {
    webgl = false;
  }

  const nucleos = navigator.hardwareConcurrency || 4;
  const memoria = navigator.deviceMemory || 4; // GB aproximados (no en todos los navegadores)

  return { movil, reducirMovimiento, webgl, webgl2, nucleos, memoria };
}

// ── Parámetros por nivel ────────────────────────────────────────
// dprMax: tope de devicePixelRatio; estrellas: total del starfield;
// bloom: fuerza del bloom. Los planetas leerán más adelante estos valores.
function tablaNiveles(movil) {
  return {
    alto: { dprMax: movil ? 1.5 : 2, estrellas: 20000, particulasMax: 20000, bloom: 0.22 },
    medio: { dprMax: movil ? 1.25 : 1.5, estrellas: 8000, particulasMax: 8000, bloom: 0.16 },
    bajo: { dprMax: 1, estrellas: 3000, particulasMax: 3000, bloom: 0.12 },
  };
}

const ORDEN = ["alto", "medio", "bajo"];

export class GestorCalidad {
  constructor(capacidades) {
    this.cap = capacidades;
    this.niveles = tablaNiveles(capacidades.movil);

    // Nivel inicial según hardware.
    let inicial = "alto";
    if (capacidades.movil || capacidades.nucleos <= 4 || capacidades.memoria <= 4) {
      inicial = "medio";
    }
    if (capacidades.nucleos <= 2 || capacidades.memoria <= 2) {
      inicial = "bajo";
    }
    this.nivel = inicial;

    // Medición de fps (ventana deslizante) y ventana "en rojo".
    this._acumTiempo = 0;
    this._acumFrames = 0;
    this._fps = 60;
    this._tiempoEnRojo = 0; // segundos consecutivos por debajo del umbral
    this._suscriptores = [];

    // Calentamiento: ignoramos los primeros 1.5s (compilación de shaders,
    // parseo de módulos, primer layout) para no degradar por jank de arranque.
    this._calentamiento = 1.5;
  }

  get params() {
    return this.niveles[this.nivel];
  }

  get fps() {
    return this._fps;
  }

  // Se llama a cada frame con el delta en segundos.
  // main.js NO la llama mientras el render está en pausa (pestaña oculta).
  actualizar(dt) {
    if (dt <= 0) return;

    // Durante el calentamiento solo dejamos correr el reloj, sin medir.
    if (this._calentamiento > 0) {
      this._calentamiento -= dt;
      return;
    }

    this._acumTiempo += dt;
    this._acumFrames += 1;

    // Recalcula el fps promedio ~2 veces por segundo.
    if (this._acumTiempo >= 0.5) {
      this._fps = this._acumFrames / this._acumTiempo;
      this._acumTiempo = 0;
      this._acumFrames = 0;

      // Regla: si el promedio baja de 45fps durante 2s, baja un nivel.
      if (this._fps < 45) {
        this._tiempoEnRojo += 0.5;
        if (this._tiempoEnRojo >= 2) {
          this._bajarNivel();
          this._tiempoEnRojo = 0;
        }
      } else {
        this._tiempoEnRojo = 0;
      }
    }
  }

  _bajarNivel() {
    const i = ORDEN.indexOf(this.nivel);
    if (i < ORDEN.length - 1) {
      this.nivel = ORDEN[i + 1];
      console.info(`[calidad] Bajando a nivel "${this.nivel}" (fps ~${this._fps.toFixed(0)})`);
      this._suscriptores.forEach((fn) => fn(this.nivel, this.params));
    }
  }

  // Permite que renderer/starfield reaccionen a un cambio de nivel.
  alCambiar(fn) {
    this._suscriptores.push(fn);
  }
}

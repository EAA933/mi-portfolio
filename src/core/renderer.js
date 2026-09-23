/**
 * renderer.js — WebGLRenderer + escena + cámara + post-procesado
 * ------------------------------------------------------------------
 * Centraliza todo lo relacionado con el pintado:
 *  - WebGLRenderer con antialias, ACES Filmic, salida sRGB y DPR limitado.
 *  - EffectComposer: RenderPass → Bloom sutil → OutputPass (tone map +
 *    sRGB) → FilmPass (grano de película muy fino).
 *  - Resize responsivo y PAUSA cuando la pestaña está oculta.
 * El bucle de render NO vive aquí: lo dispara main.js dentro de
 * gsap.ticker para tener un único loop en toda la app.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";

export class Renderizador {
  constructor(canvas, gestorCalidad) {
    this.calidad = gestorCalidad;
    this.pausado = false; // se activa si la pestaña se oculta

    const params = gestorCalidad.params;

    // — Renderer —
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this._aplicarDPR(params.dprMax);
    // ACES + sRGB: el look "cine". OutputPass aplicará el tone mapping al
    // final de la cadena leyendo estas dos propiedades del renderer.
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // — Escena y cámara —
    this.escena = new THREE.Scene();
    this.escena.background = new THREE.Color(0x000000);

    this.camara = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camara.position.set(0, 2, 14);

    // — Post-procesado —
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.escena, this.camara));

    // Bloom sutil (no un glow de videojuego): threshold alto para que solo
    // brillen las zonas realmente luminosas (soles, atmósferas, estrellas).
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      params.bloom, // strength (sutil)
      0.4, // radius
      0.9 // threshold (solo brilla lo muy luminoso)
    );
    this.composer.addPass(this.bloom);

    // OutputPass: convierte de lineal-HDR a sRGB aplicando ACES. Debe ir
    // después del bloom para que el bloom trabaje en espacio lineal.
    this.composer.addPass(new OutputPass());

    // Grano de película muy fino, encima de todo. Intensidad baja a propósito.
    this.film = new FilmPass(0.18);
    this.composer.addPass(this.film);

    this.composer.setSize(window.innerWidth, window.innerHeight);
    this._aplicarPixelRatioComposer(params.dprMax);

    // — Eventos —
    this._onResize = this._resize.bind(this);
    window.addEventListener("resize", this._onResize);

    // Pausa por visibilidad: si la pestaña se oculta, dejamos de pintar.
    this._onVisibilidad = () => {
      this.pausado = document.hidden;
    };
    document.addEventListener("visibilitychange", this._onVisibilidad);

    // Si la calidad baja en runtime, ajustamos DPR y fuerza del bloom.
    gestorCalidad.alCambiar((_nivel, p) => {
      this._aplicarDPR(p.dprMax);
      this._aplicarPixelRatioComposer(p.dprMax);
      this.bloom.strength = p.bloom;
    });
  }

  _aplicarDPR(dprMax) {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprMax));
  }

  _aplicarPixelRatioComposer(dprMax) {
    // El composer debe usar el mismo pixel ratio que el renderer.
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, dprMax));
  }

  _resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camara.aspect = w / h;
    this.camara.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
  }

  // Pinta un frame. main.js decide si llamarlo (respeta this.pausado y
  // otros estados como HUD abierto o Vista rápida en fases posteriores).
  render() {
    if (this.pausado) return;
    this.composer.render();
  }

  dispose() {
    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("visibilitychange", this._onVisibilidad);
    this.composer.dispose();
    this.renderer.dispose();
  }
}

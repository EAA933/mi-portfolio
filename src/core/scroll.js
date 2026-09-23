/**
 * scroll.js — Lenis + ScrollTrigger + timeline maestra
 * ------------------------------------------------------------------
 * Integración correcta (esto es lo que suele salir mal):
 *  - Lenis dispara ScrollTrigger.update en cada scroll.
 *  - Lenis se ejecuta DENTRO de gsap.ticker (un solo loop en la app).
 *  - gsap.ticker.lagSmoothing(0) para que no "invente" tiempo tras un lag.
 *
 * Expone un estado { progreso } suavizado por el scrub y la velocidad
 * de scroll (para el warp del starfield).
 * ------------------------------------------------------------------
 */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export class Scroll {
  /**
   * @param {number[]} snaps  puntos de anclaje (0..1) hacia el centro de cada planeta
   */
  constructor(snaps) {
    this.estado = { progreso: 0 };
    this.lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    // 1) Lenis avisa a ScrollTrigger en cada scroll.
    this.lenis.on("scroll", ScrollTrigger.update);

    // 2) Lenis corre dentro del ticker de GSAP (un único bucle).
    this._tick = (time) => this.lenis.raf(time * 1000);
    gsap.ticker.add(this._tick);

    // 3) Sin lag smoothing: el tiempo lo manda el ticker real.
    gsap.ticker.lagSmoothing(0);

    // Timeline maestra: un tween lineal 0→1 con scrub ligado al scroll.
    // Leemos this.estado.progreso cada frame desde main.js.
    this.tween = gsap.to(this.estado, {
      progreso: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#escena-scroll",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2, // inercia: el progreso persigue al scroll con suavidad
        snap: {
          snapTo: snaps,
          duration: { min: 0.8, max: 1.2 },
          ease: "power2.inOut",
        },
      },
    });
  }

  get progreso() {
    return this.estado.progreso;
  }

  // Velocidad instantánea del scroll (Lenis). La usa el warp del starfield.
  get velocidad() {
    return this.lenis.velocity || 0;
  }

  destruir() {
    gsap.ticker.remove(this._tick);
    this.tween.scrollTrigger && this.tween.scrollTrigger.kill();
    this.tween.kill();
    this.lenis.destroy();
  }
}

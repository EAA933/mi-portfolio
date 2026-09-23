/**
 * factory.js — crea el planeta correcto según projects.js
 * ------------------------------------------------------------------
 * Cada proyecto trae planeta.tipo ("huerto"|"medico"|"terrestre"|"gaseoso"|"hielo"|"cristal").
 * El factory devuelve un objeto uniforme { grupo, actualizar(dt, solDir) }
 * sin que main.js tenga que saber de qué tipo es cada uno.
 * ------------------------------------------------------------------
 */
import * as THREE from "three";
import { crearHuerto } from "./huerto.js";
import { crearTerrestre } from "./terrestre.js";
import { crearGaseoso } from "./gaseoso.js";
import { crearHielo } from "./hielo.js";
import { crearCristal } from "./cristal.js";
import { crearMedico } from "./medico.js";

const CREADORES = {
  huerto: crearHuerto,
  terrestre: crearTerrestre,
  gaseoso: crearGaseoso,
  hielo: crearHielo,
  cristal: crearCristal,
  medico: crearMedico,
};

export function crearPlaneta(proyecto, radioBase = 8) {
  const p = proyecto.planeta || {};
  const opts = {
    radio: radioBase * (p.tamaño ?? 1),
    acento: p.acento ?? "#8899aa",
    velocidad: p.velocidadRotacion ?? 0.02,
    // Inclinación axial pseudo-aleatoria pero estable por slug.
    inclinacion: THREE.MathUtils.degToRad(10 + (hash(proyecto.slug) % 15)),
  };
  const crear = CREADORES[p.tipo] || crearTerrestre;
  return crear(opts);
}

// Hash simple y estable para variar la inclinación sin aleatoriedad por frame.
function hash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default crearPlaneta;

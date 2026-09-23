# Portafolio 3D — Eduardo Aranda

Un portafolio interactivo: un **viaje espacial controlado por scroll**. Pilotas una
nave entre las estrellas, pasas junto a planetas (cada uno es un proyecto) y al elegir
uno la nave desciende y se abre su caso de estudio. Termina en una vista de galaxia con
todos los proyectos orbitando.

Incluye una **Vista rápida** (cuadrícula estilo Apple) para quien prefiere leer directo,
y arranca ahí automáticamente si no hay WebGL o si el sistema pide movimiento reducido.

## Stack
- **Vite** + JavaScript (ES modules), sin frameworks de UI
- **Three.js** (render, shaders procedurales, glTF)
- **GSAP** + ScrollTrigger · **Lenis** (smooth scroll)
- Post-procesado: bloom sutil + ACES + grano

## Correr en local
```bash
npm install
npm run dev
```
Abre `http://localhost:5173`.

## Build
```bash
npm run build      # genera /dist (estático)
npm run preview
```

## Estructura
```
src/
  main.js              arranque + bucle
  data/                projects.js (proyectos) · site.js (identidad)
  core/                renderer · cameraRig · scroll · quality
  scene/               ship (nave) · starfield · galaxy · planets/*
  ui/                  hud · grid · router
  styles/              tokens · base · hud · grid
public/
  models/nave.glb      modelo de la nave
  captures/            capturas de los proyectos
```

## Créditos
- Nave: **T-65 X-Wing Starfighter** por *Ti Kawamoto* (X-Wing © Lucasfilm).

Ver [`DEPLOY.md`](DEPLOY.md) para el despliegue.

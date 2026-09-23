# Despliegue — Portafolio 3D

## Build
```bash
npm install
npm run build      # genera /dist (estático)
npm run preview    # previsualiza el build local
```
`vite.config.js` usa `base: "./"`, así que funciona en cualquier host/subruta.

## Opción A — Vercel (recomendado)
1. Sube el repo a GitHub (o usa la CLI de Vercel).
2. En vercel.com → New Project → importa el repo.
3. Framework: **Vite**. Build: `npm run build`. Output: `dist`.
4. Deploy. Listo.

## Opción B — Netlify
1. Build command: `npm run build` · Publish directory: `dist`.
2. O arrastra la carpeta `dist/` a app.netlify.com/drop.

## Antes de publicar (checklist)
- [ ] **Formulario de contacto**: crea una access key gratis en web3forms.com (con tu correo)
      y pégala en `contacto.web3formsKey` de `src/data/site.js`. Sin key, el formulario abre el cliente de correo.
- [ ] **CV**: coloca tu PDF en `public/cv.pdf` (el botón "Descargar CV" ya lo usa).
- [ ] **Imagen Open Graph**: añade `public/og.jpg` (1200×630). Ya está referenciada en `index.html`.
- [ ] **Peso**: `public/references/` (~6 MB del storyboard) se sirve pero **no lo usa la app**.
      Muévela fuera de `public/` antes del build para no subir peso de más.
      (`STORYBOARD.md` vive en la raíz, no se publica.)
- [ ] **Dominio**: actualiza `meta.url` en `src/data/site.js`.
- [ ] **Modelo**: `public/models/nave.glb` (5.8 MB). Si quieres otra nave, reemplaza el archivo.
- [ ] Nota: el decodificador Draco se carga desde `gstatic.com` en runtime (dependencia externa).

## Rendimiento (medido en "alto")
- **Triángulos:** ~143k · **Meshes:** 21 · **Puntos:** ~24k (starfield + estelas)
- **Texturas:** 2 (entorno IBL) · **Shaders:** 4 · **Draw calls:** ~pocos (todo procedural)
- **Optimizaciones aplicadas:**
  - DPR limitado (2 desktop / 1.5 móvil) y **calidad adaptativa** (baja de nivel si <45fps 2s).
  - Planetas **procedurales** (sin texturas): casi todo el peso es el `.glb` y el entorno.
  - Render **en pausa** cuando la pestaña está oculta o en **Vista rápida**.
  - Bloom sutil (0.22) con umbral alto; grano fino.
- **Presupuesto:** 60fps en laptop media; ≥30fps en móvil medio (verificar en dispositivo real).

## Accesibilidad
- Contenido semántico completo en `index.html`; el `<canvas>` es `aria-hidden`.
- **Sin WebGL / prefers-reduced-motion → arranca en Vista rápida** (usable en <1s).
- Objetivos táctiles ≥44px en móvil; navegación por teclado; foco visible del navegador.
- Pendiente fino: recorrer con lector de pantalla y verificar contraste AA en cada texto.

## Pendientes de contenido (`// TODO` en el código)
- Métricas reales de cada proyecto, capturas reales (hoy son degradados por acento).
- Confirmar **Vyntra Flow** (marca propia o de cliente) y su enlace.

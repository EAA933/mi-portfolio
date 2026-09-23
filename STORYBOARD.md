# Storyboard visual — Portafolio 3D

Set de referencia para fijar *look*, luz y atmósfera **antes** de programar.
Estas imágenes NO se usan como texturas en el código: son la guía de color, luz y
composición que se le pasa al modelo/dev junto con el prompt (ver Bloque A del contexto).

- Formato: 16:9, generadas con `gpt_image_2_5`.
- Estilo base común: negro real, luz lateral de un solo sol, alto contraste, mucho
  espacio negativo, estética keynote de Apple, sin texto ni UI.
- Ubicación: `public/references/`.

---

## 01 · HERO — `references/01-hero.png`
**Scroll:** 0.00–0.03
**Qué muestra:** campo de estrellas delicado sobre negro, susurro de nebulosa
indigo/violeta en la esquina superior derecha, curva de la Tierra con atmósfera azul
en el borde inferior. Vacío arriba-izquierda reservado para el nombre.
**Animación (ver Biblia §3):**
- Estrellas: opacidad 0→1 en 2000 ms, escalonadas por partícula (uniform `uReveal` + ruido).
- Nombre + subtítulo: revelado por línea con máscara (translateY 100%→0), stagger 80 ms.
- Ambiental: parallax de mouse (cámara ±0.3, lerp 0.05; estrellas lejanas al 10%).
- Al primer scroll los textos salen con fade + translateY -30px (scrub).

## 02 · DESPEGUE — `references/02-launch.png`
**Scroll:** 0.03–0.12
**Qué muestra:** plataforma minimalista a hora azul, niebla baja, cohete blanco mate
al centro, luz cálida en el horizonte. Composición cinematográfica 35 mm.
**Técnica clave:** esta escena es **2.5D** — plano con esta imagen desplazado por su
mapa de profundidad (`launch/pad_depth.webp`) + partículas 3D reales encima (humo,
fuego, chispas) + el cohete como objeto 3D en primer plano.
**Animación (ver Biblia §4):**
- Ignición a p=0.10: camera shake 0.02 con decaimiento exp. 600 ms (una sola vez).
- Ascenso p 0.20–0.60 con curva `power2.in`; cámara sigue con lerp 0.06; FOV 45→50.
- Cruce de nubes p 0.60–0.80; fondo de `#7FA7D9` → `#000000`.
- p 0.80–1.00: pitch −25°, se revela la curva de la Tierra con atmósfera Fresnel.

## 03 · PLANETA GASEOSO — `references/03-planet-gaseoso.png` · acento esmeralda
**Qué muestra:** gigante gaseoso, bandas esmeralda/teal/menta, tormenta central,
anillo fino inclinado con sombra sobre la superficie, terminador día/noche.
**Animación (ver Biblia §7):**
- Flowmap sobre las bandas; desplazamiento en U por latitud (ecuador más rápido) con
  ruido fbm (`uTime*0.02`).
- Anillo: `InstancedMesh`/`Points`; velocidad angular ∝ r^-1.5; 5% de partículas más
  brillantes viajan 3x más rápido (evocan mensajes).
- Sombra del anillo **falsa**, calculada en el shader del planeta.

## 04 · PLANETA TERRESTRE — `references/04-planet-terrestre.png` · acento dorado
**Qué muestra:** mundo fértil, continentes dorado/olivo/terracota, océanos con glint
especular, nubes, atmósfera Fresnel cian, luces de ciudad tenues en el lado nocturno.
**Animación (ver Biblia §7):**
- Capa de nubes 1.3x más rápida que la superficie; se desvanece en el terminador.
- Luces nocturnas solo donde `dot(normal, sol) < 0`, parpadeo por ruido (2–5 s).
- Especular del océano que se desplaza con la luz.

## 05 · PLANETA DE HIELO — `references/05-planet-hielo.png` · acento azul hielo
**Qué muestra:** mundo glacial azul/blanco, red de líneas cian brillantes tipo
circuito de datos, luna pequeña con estela.
**Animación (ver Biblia §7):**
- Las líneas pulsan con onda seno de 4 s que recorre la superficie (escaneo de datos).
- Luna en órbita inclinada 20° con estela (trail de 40 puntos que se desvanece).

## 06 · PLANETA DE CRISTAL — `references/06-planet-cristal.png` · acento iridiscente
**Qué muestra:** planeta facetado (icosaedro), vidrio con transmission/refracción,
iridiscencia violeta-perla-oro, tres lunas con estela.
**Animación (ver Biblia §7):**
- `MeshPhysicalMaterial`: transmission + iridescence + clearcoat.
- Iridiscencia cambia con el ángulo de vista (emerge al orbitar).
- Tres lunas con periodos 8/13/21 s; el planeta rota lento (0.01 rad/s) = peso y precisión.

## 07 · GALAXIA — `references/07-galaxy.png`
**Scroll:** 0.88–1.00
**Qué muestra:** vista lejana; los 4 planetas orbitan en planos inclinados alrededor
de una estrella central con glow/bloom; líneas de órbita hairline; mucho negro.
**Animación (ver Biblia §11):**
- Cámara se aleja a 12x con picada de 30°; planetas interpolan a su órbita final.
- Líneas de órbita se "dibujan" (drawRange/dashOffset) p 0.20–0.50.
- Estrella central se enciende con pulso de halo único p 0.40–0.70.
- Etiquetas con stagger 100 ms; CTA final revelado por línea.

---

## Notas de producción
- **Costura del meridiano / polos:** estas son referencias de composición. Las texturas
  *envolventes* reales (albedo/clouds/night 2:1) se generan aparte, con `seamless` y
  corrección de costura, y la atmósfera + nubes disimulan los polos.
- **Paleta confirmada:** funciona el negro real con acentos puntuales. Nada de bloques
  de color; el acento vive en el glow de la atmósfera y en detalles de UI.
- **Siguiente paso de assets:** aprobado el look → generar skybox 360° 4096×2048 y el
  primer planeta terrestre completo (albedo + clouds + night) para validar en Fase 1.

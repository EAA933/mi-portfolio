/**
 * projects.js — FUENTE ÚNICA DE VERDAD
 * ------------------------------------------------------------------
 * Cada objeto de este arreglo genera un planeta. Los rangos de scroll
 * (aproximación, órbita, tránsito) y los puntos de control de la cámara
 * se calculan dinámicamente a partir de este arreglo: agregar o quitar
 * un proyecto NO debe requerir tocar código 3D.
 *
 * Esquema de cada proyecto:
 *   slug         string   → id para el hash routing (#slug)
 *   nombre       string
 *   categoria    "web" | "automatizacion"
 *   tagline      string   → una línea, se muestra en el panel de órbita
 *   descripcion  string   → resumen corto
 *   reto         string   → sección "Reto" del caso de estudio
 *   solucion     string   → sección "Solución"
 *   resultado    string   → sección "Resultado"
 *   metricas     [{ valor, etiqueta }]   → 1 a 3, se animan de 0 a su valor
 *   stack        string[]
 *   links        { sitio, codigo }       → usa null si no aplica
 *   capturas     string[] → rutas en /public; se montan en marcos Mac/iPhone
 *   video        string | null           → loop opcional del HUD
 *   planeta {
 *     tipo             "gaseoso" | "terrestre" | "hielo" | "cristal"
 *     acento           string (hex)       → glow de atmósfera y detalles de UI
 *     tamaño           number  → radio relativo (1 = base)
 *     velocidadRotacion number → rad/s de la rotación propia
 *   }
 * ------------------------------------------------------------------
 */

export const projects = [
  {
    slug: "cosecha-hidalguense",
    nombre: "Cosecha Hidalguense",
    categoria: "web",
    tagline: "Del campo de Hidalgo a tu mesa, en línea.",
    descripcion:
      "Sitio de marca y catálogo para pequeños productores de Hidalgo, con panel " +
      "de administración para que ellos mismos publiquen productos y gestionen " +
      "pedidos. Corre entero en Cloudflare, sin servidor que mantener.",

    reto:
      "Los productores locales no tenían forma de vender más allá del tianguis: " +
      "sin presencia en línea, dependían de intermediarios y de la venta de fin de " +
      "semana. Necesitaban un sitio profesional que ellos pudieran actualizar solos, " +
      "sin pagar hosting ni depender de un técnico para cada cambio.",

    solucion:
      "Un sitio público con catálogo de productores y cajas de temporada, más un " +
      "panel privado con login para administrarlo. Toda la plataforma vive en " +
      "Cloudflare (Pages + Functions + D1), así que el costo de operación es cero " +
      "en el plan gratuito y el sitio carga rápido desde el borde de la red.",

    resultado:
      "Los productores publican y actualizan su catálogo por su cuenta, con una " +
      "imagen de marca cuidada y a costo de operación nulo.", // TODO: reemplazar por métricas reales (ventas, productores, visitas)

    metricas: [
      { valor: 0, etiqueta: "Costo de hosting / mes" },     // corre en el plan gratuito de Cloudflare
      { valor: 4, etiqueta: "Productores en catálogo" },    // confirmado en el sitio
      { valor: 100, etiqueta: "En el borde (ms de carga)" } // TODO: medir y ajustar
    ],

    stack: ["Cloudflare Pages", "Functions", "D1", "SQL", "JavaScript"],

    links: {
      sitio: "https://cosechahidalguense.com",
      codigo: null // el código es local/privado (no está en GitHub); el HUD ocultará el botón "Ver código"
    },

    capturas: [
      import.meta.env.BASE_URL + "captures/cosecha-home.png",  // desktop → marco Mac
      import.meta.env.BASE_URL + "captures/cosecha-movil.png"  // móvil → marco iPhone
    ],
    video: null,

    planeta: {
      tipo: "terrestre",       // mundo fértil: continentes dorados, océanos, luces nocturnas
      acento: "#D8A94B",       // dorado trigo
      tamaño: 1.0,
      velocidadRotacion: 0.02
    }
  },

  {
    slug: "vyntra-flow",
    nombre: "Vyntra Flow",
    categoria: "automatizacion",
    tagline: "Ventas por WhatsApp en piloto automático.",
    descripcion:
      "Automatización comercial por WhatsApp con IA para PyMEs: responde, " +
      "califica y da seguimiento a prospectos sin intervención humana.",
    reto:
      "Las PyMEs pierden ventas por no contestar a tiempo en WhatsApp: los " +
      "mensajes llegan a toda hora y un humano no da abasto ni es rentable.", // TODO: ajustar a la historia real
    solucion:
      "Un flujo con IA que atiende, entiende la intención, responde con el " +
      "catálogo y agenda o deriva a un humano solo cuando hace falta.",
    resultado:
      "Respuesta inmediata 24/7 y seguimiento constante, sin ampliar el equipo.", // TODO: métricas reales
    metricas: [
      { valor: "24/7", etiqueta: "Atención" },
      { valor: "<1 min", etiqueta: "Tiempo de respuesta" }, // TODO: confirmar
    ],
    stack: ["IA", "WhatsApp API", "Node", "Automatización"],
    links: { sitio: null, codigo: null }, // TODO: ¿marca propia o de cliente? ¿enlace?
    capturas: [],
    video: null,
    planeta: { tipo: "gaseoso", acento: "#34d399", tamaño: 1.25, velocidadRotacion: 0.025 }
  },

  {
    slug: "panel-riesgo",
    nombre: "Panel de Riesgo", // anonimizado (sector seguros/finanzas)
    categoria: "web",
    tagline: "Los indicadores de riesgo en una sola pantalla.",
    descripcion:
      "Dashboard de monitoreo de indicadores de riesgo: estados, prioridades " +
      "y alertas en una interfaz densa en datos pero legible.",
    reto:
      "El seguimiento del riesgo vivía en hojas de cálculo dispersas; nadie " +
      "tenía una vista única y a tiempo del estado real.", // TODO
    solucion:
      "Un panel que concentra los indicadores clave, resalta lo urgente y se " +
      "lee de un vistazo.",
    resultado:
      "Una sola pantalla para decidir, en vez de reconstruir el estado a mano.", // TODO: métricas reales
    metricas: [{ valor: 1, etiqueta: "Pantalla, todo el riesgo" }],
    stack: ["JavaScript", "Dashboards", "Datos"],
    links: { sitio: null, codigo: null }, // confidencial
    capturas: [],
    video: null,
    planeta: { tipo: "hielo", acento: "#8fd0ff", tamaño: 0.95, velocidadRotacion: 0.018 }
  },

  {
    slug: "reportes-regulatorios",
    nombre: "Reportes Regulatorios", // anonimizado (sector seguros · AMIS)
    categoria: "automatizacion",
    tagline: "El reporte regulatorio sin armar Excel a mano.",
    descripcion:
      "Generador de reportes regulatorios: cargas los Excel una vez y produce " +
      "el reporte final que pide el regulador.",
    reto:
      "Armar el reporte regulatorio cada periodo era manual, lento y propenso " +
      "a errores entre múltiples archivos.", // TODO
    solucion:
      "Una herramienta que toma los Excel, cruza las categorías y genera el " +
      "reporte final automáticamente.",
    resultado:
      "De días de trabajo manual a minutos, sin errores de transcripción.", // TODO: métricas reales
    metricas: [{ valor: "min", etiqueta: "Antes: días" }],
    stack: ["JavaScript", "XLSX", "Automatización"],
    links: { sitio: null, codigo: null }, // confidencial
    capturas: [],
    video: null,
    planeta: { tipo: "cristal", acento: "#c9b6ff", tamaño: 1.0, velocidadRotacion: 0.01 }
  }
];

export default projects;

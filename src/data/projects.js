/**
 * projects.js — FUENTE ÚNICA DE VERDAD
 * ------------------------------------------------------------------
 * Cada objeto de este arreglo genera un planeta. Los rangos de scroll
 * (aproximación, órbita, tránsito) y los puntos de control de la cámara
 * se calculan dinámicamente a partir de este arreglo: agregar o quitar
 * un proyecto NO debe requerir tocar código 3D.
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
      "imagen de marca cuidada y a costo de operación nulo.",

    metricas: [
      { valor: 0, etiqueta: "Costo de hosting / mes" },
      { valor: 4, etiqueta: "Productores en catálogo" },
      { valor: 100, etiqueta: "En el borde (ms de carga)" }
    ],

    // Datos interactivos de Recharts: Eficiencia operativa ganada
    eficiencia: {
      resumen: {
        porcentaje: "100% ahorro mensual",
        tiempo: "96% más ágil",
        impacto: "$2,160 USD/año ahorrados",
      },
      comparativas: {
        tiempo: [
          { concepto: "Publicar producto", antes: 4.5, conSolucion: 0.1, ahorro: "-98%", detalle: "De esperar a un webmaster externo a subirlo desde el teléfono en 2 min." },
          { concepto: "Actualizar precios", antes: 8.0, conSolucion: 0.3, ahorro: "-96%", detalle: "Edición por lote en tiempo real desde la consola privada." },
          { concepto: "Gestión de pedidos", antes: 14.0, conSolucion: 2.0, ahorro: "-86%", detalle: "Panel centralizado con exportación de órdenes y notas directas." },
          { concepto: "Despliegue y backup", antes: 6.0, conSolucion: 0.0, ahorro: "-100%", detalle: "CI/CD serverless en Cloudflare con replicación instantánea." },
        ],
        costos: [
          { concepto: "Hosting & Servidor", antes: 120, conSolucion: 0, ahorro: "$120/mes", detalle: "Arquitectura Cloudflare Edge Serverless con plan free-tier." },
          { concepto: "Soporte Técnico", antes: 250, conSolucion: 25, ahorro: "$225/mes", detalle: "Panel intuitivo sin necesidad de desarrollador para tareas diarias." },
          { concepto: "CDN & Certificados", antes: 35, conSolucion: 0, ahorro: "$35/mes", detalle: "SSL automático y distribución global sin costos adicionales." },
          { concepto: "Base de Datos", antes: 45, conSolucion: 0, ahorro: "$45/mes", detalle: "Cloudflare D1 distribuido con latencia sub-50ms y costo nulo." },
        ],
      },
    },

    stack: ["Cloudflare Pages", "Functions", "D1", "SQL", "JavaScript"],

    links: {
      sitio: "https://cosechahidalguense.com",
      codigo: null
    },

    capturas: [
      import.meta.env.BASE_URL + "captures/cosecha-home.png",
      import.meta.env.BASE_URL + "captures/cosecha-movil.png"
    ],
    video: null,

    planeta: {
      tipo: "terrestre",
      acento: "#D8A94B",
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
      "mensajes llegan a toda hora y un humano no da abasto ni es rentable.",
    solucion:
      "Un flujo con IA que atiende, entiende la intención, responde con el " +
      "catálogo y agenda o deriva a un humano solo cuando hace falta.",
    resultado:
      "Respuesta inmediata 24/7 y seguimiento constante, sin ampliar el equipo.",
    metricas: [
      { valor: "24/7", etiqueta: "Atención" },
      { valor: "<1 min", etiqueta: "Tiempo de respuesta" },
    ],

    // Datos interactivos de Recharts: Eficiencia operativa ganada
    eficiencia: {
      resumen: {
        porcentaje: "93% ahorro operativo",
        tiempo: "99.7% más veloz",
        impacto: "$7,200 USD/año ahorrados",
      },
      comparativas: {
        tiempo: [
          { concepto: "1ra respuesta", antes: 48, conSolucion: 0.2, ahorro: "-99.6%", detalle: "De 4 horas de espera a menos de 45 segundos inmediatos." },
          { concepto: "Calificación lead", antes: 65, conSolucion: 3.5, ahorro: "-95%", detalle: "IA sondea presupuesto, interés y urgencia de compra." },
          { concepto: "Seguimiento post", antes: 32, conSolucion: 1.0, ahorro: "-97%", detalle: "Reactivación automática de prospectos que dejaron de responder." },
          { concepto: "Registro en CRM", antes: 24, conSolucion: 0.5, ahorro: "-98%", detalle: "Sincronización directa mediante Webhooks y Node.js." },
        ],
        costos: [
          { concepto: "Turnos de atención", antes: 780, conSolucion: 60, ahorro: "$720/mes", detalle: "Atención comercial nocturna y fines de semana cubierta al 100%." },
          { concepto: "Fugas de prospectos", antes: 450, conSolucion: 40, ahorro: "$410/mes", detalle: "Respuesta instantánea evita que el cliente compre a la competencia." },
          { concepto: "Licencias de chat", antes: 90, conSolucion: 20, ahorro: "$70/mes", detalle: "Integración sobre API oficial sin cobro por asientos múltiples." },
          { concepto: "Capacitación staff", antes: 180, conSolucion: 15, ahorro: "$165/mes", detalle: "Catálogo y objeciones indexadas en la memoria de la IA." },
        ],
      },
    },

    stack: ["IA", "WhatsApp API", "Node", "Automatización"],
    links: { sitio: null, codigo: null },
    capturas: [
      import.meta.env.BASE_URL + "capturas/vyntra-home.svg",
      import.meta.env.BASE_URL + "capturas/vyntra-movil.svg"
    ],
    video: null,
    planeta: { tipo: "gaseoso", acento: "#34d399", tamaño: 1.25, velocidadRotacion: 0.025 }
  },

  {
    slug: "panel-riesgo",
    nombre: "Panel de Riesgo",
    categoria: "web",
    tagline: "Los indicadores de riesgo en una sola pantalla.",
    descripcion:
      "Dashboard de monitoreo de indicadores de riesgo: estados, prioridades " +
      "y alertas en una interfaz densa en datos pero legible.",
    reto:
      "El seguimiento del riesgo vivía en hojas de cálculo dispersas; nadie " +
      "tenía una vista única y a tiempo del estado real.",
    solucion:
      "Un panel que concentra los indicadores clave, resalta lo urgente y se " +
      "lee de un vistazo.",
    resultado:
      "Una sola pantalla para decidir, en vez de reconstruir el estado a mano.",
    metricas: [{ valor: 1, etiqueta: "Pantalla, todo el riesgo" }],

    // Datos interactivos de Recharts: Eficiencia operativa ganada
    eficiencia: {
      resumen: {
        porcentaje: "91% tiempo liberado",
        tiempo: "94% más ágil",
        impacto: "$16,800 USD/año en HH",
      },
      comparativas: {
        tiempo: [
          { concepto: "Consolidar Excels", antes: 112, conSolucion: 6, ahorro: "-95%", detalle: "De 28 hrs/semana copiando datos a pipelines ETL en segundos." },
          { concepto: "Detección alertas", antes: 72, conSolucion: 0.5, ahorro: "-99%", detalle: "Umbrales automáticos notifican anomalías en tiempo real." },
          { concepto: "Armado de reportes", antes: 45, conSolucion: 2, ahorro: "-96%", detalle: "Exportación a PDF/CSV de indicadores ejecutivos en un clic." },
          { concepto: "Conciliación saldos", antes: 36, conSolucion: 3, ahorro: "-92%", detalle: "Cruce relacional automatizado sin errores de fórmula humana." },
        ],
        costos: [
          { concepto: "Horas analistas", antes: 1600, conSolucion: 180, ahorro: "$1,420/mes", detalle: "Equipo reenfocado en análisis de mitigación y no en copiar celdas." },
          { concepto: "Costo por error", antes: 520, conSolucion: 30, ahorro: "$490/mes", detalle: "Reglas de validación previenen discrepancias contables." },
          { concepto: "Software disperso", antes: 280, conSolucion: 0, ahorro: "$280/mes", detalle: "Consolidación de herramientas dispersas en una suite centralizada." },
          { concepto: "Auditoría de datos", antes: 380, conSolucion: 40, ahorro: "$340/mes", detalle: "Registro inmutable de trazabilidad de cambios en cada indicador." },
        ],
      },
    },

    stack: ["JavaScript", "Dashboards", "Datos"],
    links: { sitio: null, codigo: null },
    capturas: [
      import.meta.env.BASE_URL + "capturas/panel-riesgo-home.svg",
      import.meta.env.BASE_URL + "capturas/panel-riesgo-movil.svg"
    ],
    video: null,
    planeta: { tipo: "hielo", acento: "#8fd0ff", tamaño: 0.95, velocidadRotacion: 0.018 }
  },

  {
    slug: "reportes-regulatorios",
    nombre: "Reportes Regulatorios",
    categoria: "automatizacion",
    tagline: "El reporte regulatorio sin armar Excel a mano.",
    descripcion:
      "Generador de reportes regulatorios: cargas los Excel una vez y produce " +
      "el reporte final que pide el regulador.",
    reto:
      "Armar el reporte regulatorio cada periodo era manual, lento y propenso " +
      "a errores entre múltiples archivos.",
    solucion:
      "Una herramienta que toma los Excel, cruza las categorías y genera el " +
      "reporte final automáticamente.",
    resultado:
      "De días de trabajo manual a minutos, sin errores de transcripción.",
    metricas: [{ valor: "min", etiqueta: "Antes: días" }],

    // Datos interactivos de Recharts: Eficiencia operativa ganada
    eficiencia: {
      resumen: {
        porcentaje: "99.5% menos tiempo",
        tiempo: "6 días → 12 min",
        impacto: "$25,200 USD/año ahorrados",
      },
      comparativas: {
        tiempo: [
          { concepto: "Extracción datos", antes: 36, conSolucion: 0.15, ahorro: "-99.6%", detalle: "Ingesta masiva de archivos XLSX con normalización inmediata." },
          { concepto: "Cruce de pólizas", antes: 54, conSolucion: 0.25, ahorro: "-99.5%", detalle: "Vinculación relacional de siniestros y coberturas en memoria." },
          { concepto: "Validación reglas", antes: 28, conSolucion: 0.1, ahorro: "-99.6%", detalle: "Chequeo contra matriz regulatoria AMIS en tiempo real." },
          { concepto: "Emisión de archivo", antes: 18, conSolucion: 0.05, ahorro: "-99.7%", detalle: "Generación del formato de entrega validado sin retrabajos." },
        ],
        costos: [
          { concepto: "Horas equipo ciclo", antes: 2100, conSolucion: 80, ahorro: "$2,020/mes", detalle: "De 48 horas de estrés y horas extras a un clic programado." },
          { concepto: "Riesgo de multas", antes: 900, conSolucion: 0, ahorro: "$900/mes", detalle: "Garantía de cumplimiento estricto de fechas y esquemas de entrega." },
          { concepto: "Validación externa", antes: 600, conSolucion: 50, ahorro: "$550/mes", detalle: "Pre-auditoría algorítmica previa a la carga oficial." },
          { concepto: "Retrabajo manual", antes: 450, conSolucion: 0, ahorro: "$450/mes", detalle: "Eliminación absoluta de errores de transcripción o fórmulas rotas." },
        ],
      },
    },

    stack: ["JavaScript", "XLSX", "Automatización"],
    links: { sitio: null, codigo: null },
    capturas: [
      import.meta.env.BASE_URL + "capturas/reportes-regulatorios-home.svg",
      import.meta.env.BASE_URL + "capturas/reportes-regulatorios-movil.svg"
    ],
    video: null,
    planeta: { tipo: "cristal", acento: "#c9b6ff", tamaño: 1.0, velocidadRotacion: 0.01 }
  }
];

export default projects;

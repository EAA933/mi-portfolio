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
    tagline: "Del campo hidalguense para tu mesa — Catálogo de productores y venta de cajas agrícolas.",
    descripcion:
      "Plataforma digital y solución de empaque sustentable para productores agrícolas de invernadero en Tasquillo y el Valle del Mezquital, Hidalgo. Conecta a productores de pimiento morrón y hortalizas de alta especialidad directamente con distribuidores, restaurantes y familias vía WhatsApp, suprimiendo intermediarios abusivos. Integra la venta de cajas agrícolas ventiladas con código QR impreso para trazabilidad directa ('Quién sembró tu caja'), y un panel de administración autónomo desplegado sobre Cloudflare Pages + Workers + D1 con $0 USD/mes de costo de hosting.",

    // Storytelling completo del proceso creativo y de ingeniería: El Reto, Diagramas de Flujo y La Solución
    storytelling: {
      reto: {
        etiqueta: "01. El Reto",
        titulo: "El Abuso del Intermediario y la Invisibilidad del Productor",
        subtitulo: "Por qué los agricultores de invernadero en Hidalgo perdían hasta el 70% de su margen y cómo la tecnología debía resolverlo sin barreras de entrada.",
        problemaContexto:
          "En Tasquillo y municipios del Valle del Mezquital, decenas de familias campesinas invirtieron sus ahorros y esfuerzo en construir invernaderos de alta tecnología para cosechar hortalizas de calidad exportación (principalmente pimiento morrón en sus cuatro colores, pepino y jitomate). A pesar de cumplir con estrictas normas fitosanitarias y de inocuidad como SENASICA y PrimusGFS, estaban atrapados en una cadena de suministro injusta:",
        puntosDolor: [
          {
            icono: "📉",
            titulo: "Intermediarismo Abusivo ('Coyotaje')",
            desc: "Los acopiadores e intermediarios imponían precios de remate en la parcela y se quedaban con hasta el 70% del valor final en Centrales de Abasto, mientras el productor asumía todo el costo de fertilización, riego y riesgo de plagas."
          },
          {
            icono: "🏷️",
            titulo: "Producto Vendido a Granel y sin Identidad",
            desc: "Las hortalizas se empacaban en cajas de madera usadas o de desecho. Al llegar al consumidor o chef de restaurante, nadie sabía quién había sembrado ese pimiento ni qué certificaciones de inocuidad respaldaban el cultivo."
          },
          {
            icono: "📱",
            titulo: "Brecha Digital en Campo",
            desc: "Un e-commerce tradicional con carritos de compra, registros de usuario con contraseña y pasarelas de pago con comisiones del 4-5% fracasa en el campo: el productor necesita negociar volúmenes y entregas por el canal que ya domina a diario: WhatsApp."
          },
          {
            icono: "📦",
            titulo: "Falta de Empaque Agrícola Especializado",
            desc: "Inexistencia de cajas corrugadas resistentes a la humedad del invernadero que al mismo tiempo sirvieran de vehículo de marca para que el agricultor pudiera fidelizar a sus propios compradores."
          }
        ]
      },

      flujos: {
        etiqueta: "02. Flujos de Diagramas: De la Parcela a la Solución",
        titulo: "Arquitectura de Flujos: Cómo Llegamos a la Solución Integral",
        subtitulo: "El puente entre el empaque físico en invernadero y la red digital de compradores transparentes.",
        diagramas: [
          {
            id: "flujo-comprador",
            titulo: "1. Flujo del Comprador & Catálogo Directo",
            lead: "Navegación sin fricción, filtrado visual por cultivo y enlace 1-a-1 por WhatsApp sin comisiones.",
            pasos: [
              {
                paso: "1",
                titulo: "Exploración & Filtros por Cultivo",
                desc: "El comprador explora el catálogo interactivo filtrando por cultivo (Pimiento morrón [Rojo, Amarillo, Naranja, Verde], Pepino, Chiles o Jitomate) y municipio de origen.",
                tech: "Vanilla JS Reactivo + Píldoras Orgánicas"
              },
              {
                paso: "2",
                titulo: "Ficha de Confianza & Certificaciones",
                desc: "Revisión del perfil del productor: fotografía de invernadero, temporada de corte activa (ej. Agosto-Enero) y sellos de inocuidad oficial (SENASICA, PrimusGFS).",
                tech: "Validación de Sellos & Metadatos D1"
              },
              {
                paso: "3",
                titulo: "Conexión 1 a 1 por WhatsApp",
                desc: "Un clic abre el chat de WhatsApp con el número personal del agricultor, con mensaje preformateado indicando el cultivo y volumen requerido.",
                tech: "WhatsApp Deep Linking (Direct Deal)"
              },
              {
                paso: "4",
                titulo: "Cierre de Trato Justo y Despacho",
                desc: "Acuerdo comercial directo sin comisiones retenidas por plataformas intermediarias. El 100% del pago va íntegro a la mano del campesino.",
                tech: "Cero Comisión de Pasarela"
              }
            ]
          },
          {
            id: "flujo-empaque",
            titulo: "2. Flujo de Empaque & Trazabilidad QR ('Quién sembró tu caja')",
            lead: "La caja física de cartón corrugado se convierte en el enlace digital directo al agricultor.",
            pasos: [
              {
                paso: "1",
                titulo: "Venta & Selección de Cajas Agrícolas",
                desc: "Los productores adquieren cajas agrícolas ventiladas, troqueladas y resistentes a la humedad, diseñadas especialmente para pimiento morrón y hortalizas.",
                tech: "Catálogo de Cajas Agrícolas /cajas"
              },
              {
                paso: "2",
                titulo: "Impresión de Marca & Código QR Único",
                desc: "Cada modelo de caja lleva impreso el logotipo del productor y un código QR que apunta directamente a su ficha digital en cosechahidalguense.com.",
                tech: "Vector QR Dinámico de Trazabilidad"
              },
              {
                paso: "3",
                titulo: "Corte, Clasificación y Empaque en Campo",
                desc: "La verdura recién cortada del invernadero se empaca protegida en cajas resistentes al estibado y traslados largos hacia bodegas o restaurantes.",
                tech: "Protección Física & Humedad"
              },
              {
                paso: "4",
                titulo: "Escaneo del QR en Destino Final",
                desc: "El chef, distribuidor o comensal escanea el código en la caja con su teléfono y conoce la historia, fotos y certificaciones de quien sembró su caja.",
                tech: "Trazabilidad con Rostro Campesino"
              }
            ]
          },
          {
            id: "flujo-arquitectura",
            titulo: "3. Arquitectura Técnica Serverless Edge ($0 Costo)",
            lead: "Infraestructura perimetral distribuida que no genera costos fijos y vuela en redes 3G rurales.",
            pasos: [
              {
                paso: "1",
                titulo: "PWA Admin Móvil (/admin.html)",
                desc: "Panel de administración táctil con pestañas de Productores, Cajas y Mensajes. Diseñado con botones de alto contraste para usarse bajo el sol.",
                tech: "PWA Ultraligera + Upload Optimizado"
              },
              {
                paso: "2",
                titulo: "Cloudflare Workers (Edge Functions)",
                desc: "Endpoints API (/api/productores, /api/cajas) ejecutados en los centros de datos perimetrales de Cloudflare en México con latencia <35ms.",
                tech: "Serverless Edge Computing"
              },
              {
                paso: "3",
                titulo: "Base de Datos SQL Distribuida D1",
                desc: "Persistencia transaccional ACID en Cloudflare D1. Sin servidores dedicados ni cuotas mensuales de base de datos.",
                tech: "Cloudflare D1 SQL Serverless"
              },
              {
                paso: "4",
                titulo: "Entrega Global & SEO #1 en Google",
                desc: "Caché perimetral instantánea en Cloudflare Pages, tiempos de carga <300ms y primer lugar orgánico nacional para búsquedas agrícolas de Hidalgo.",
                tech: "Cloudflare Pages CDN ($0 USD/mes)"
              }
            ]
          }
        ]
      },

      solucion: {
        etiqueta: "03. La Solución",
        titulo: "La Plataforma Cosecha Hidalguense & Sistema de Empaque",
        subtitulo: "Un ecosistema doble que combina presencia digital de alta velocidad con empaque agrícola trazable.",
        pilares: [
          {
            icono: "🌶️",
            titulo: "Catálogo Especializado de Cultivos",
            desc: "Enfoque en hortalizas de invernadero: Pimiento morrón (rojo, amarillo, naranja y verde), pepino, chiles (jalapeño y serrano), berenjena y jitomates bola y saladette."
          },
          {
            icono: "📦",
            titulo: "Venta de Cajas con QR Integrado",
            desc: "Cajas agrícolas ventiladas, resistentes al estibado y humedad. Cada caja lleva impreso el logo y el QR que conecta a quien la recibe con quien la llenó."
          },
          {
            icono: "👨‍🌾",
            titulo: "Productores Reales de Tasquillo",
            desc: "Fichas con rostros reales (Hermanos Arteaga Trejo, Agroindustrias Terramex, Invernaderos de Tasquillo), temporadas de corte y sellos SENASICA y PrimusGFS."
          },
          {
            icono: "📱",
            titulo: "Panel de Control /admin.html",
            desc: "Consola de administración autónoma con pestañas para gestionar el catálogo de Productores, la oferta de Cajas y la bandeja de Mensajes de contacto."
          }
        ]
      },

      impacto: {
        etiqueta: "04. Impacto & Métricas Reales",
        titulo: "Comercio Justo, $0 Costo Fijo y Soberanía Tecnológica",
        subtitulo: "Resultados comerciales tangibles y eficiencia técnica tras sustituir el intermediarismo tradicional.",
        comparativa: {
          antes: "Pérdida de hasta el 70% del margen con intermediarios; cajas de madera usadas sin marca; cosechas vendidas a ciegas sin trazabilidad; $0 posicionamiento digital.",
          ahora: "Trato directo 1 a 1 por WhatsApp con 100% de ingreso para el productor; cajas agrícolas con QR de trazabilidad ('Quién sembró tu caja'); catálogo posicionado #1 en Google con $0 USD de costo de hosting."
        },
        kpis: [
          {
            valor: "$0",
            unidad: "USD/mes",
            titulo: "Costo de Servidores",
            desc: "Operación completa en Cloudflare Pages, Workers y D1 dentro de los tiers gratuitos perpetuos."
          },
          {
            valor: "+1,000",
            unidad: "visitas/mes",
            titulo: "Tráfico Orgánico",
            desc: "Compradores mayoristas, distribuidores y chefs contactando directamente a los invernaderos de Hidalgo."
          },
          {
            valor: "#1",
            unidad: "en Google",
            titulo: "Posicionamiento SEO",
            desc: "Primer resultado nacional para 'cosecha hidalgo' y 'productores pimiento hidalgo' con $0 de pauta publicitaria."
          },
          {
            valor: "Directo",
            unidad: "WhatsApp",
            titulo: "Sin Comisiones",
            desc: "Contacto 1 a 1 sin retenciones de pago ni cobros porcentuales por venta para los agricultores."
          }
        ]
      }
    },

    // Resumen en métricas para headers y cards
    metricas: [
      { valor: "$0", etiqueta: "Costo de hosting / mes", badge: "Cloudflare Free Tier" },
      { valor: "1 a 1", etiqueta: "Vía WhatsApp Directo", badge: "Cero Comisiones" },
      { valor: "#1", etiqueta: "Lugar en Google Orgánico", badge: "SEO Nacional" },
      { valor: "QR", etiqueta: "Trazabilidad en Caja", badge: "Quién Sembró tu Caja" }
    ],

    // Puntos de interés arquitectónicos para el Modo Inspección 360° en el Planeta Huerto
    hotspots: [
      {
        id: "ch-catalogo",
        titulo: "Catálogo de Productores Hidalguenses",
        categoria: "Comercio Agrícola Directo",
        icono: "🫑",
        pos: [0.35, 0.72, 0.58],
        descripcion: "Directorio transparente de agricultores de pimiento morrón y hortalizas con contacto directo 1-a-1 por WhatsApp.",
        impacto: "Cero intermediarios abusivos"
      },
      {
        id: "ch-cajas",
        titulo: "Venta de Cajas & Trazabilidad QR",
        categoria: "Empaque Sustentable",
        icono: "📦",
        pos: [0.78, 0.22, 0.58],
        descripcion: "Empaque agrícola ventilado y resistente a humedad con QR que conecta al comprador con quien sembró su caja.",
        impacto: "Trazabilidad física a digital"
      },
      {
        id: "ch-admin",
        titulo: "Panel Autónomo /admin.html",
        categoria: "Gestión en Campo",
        icono: "📱",
        pos: [-0.68, 0.44, 0.58],
        descripcion: "Consola web táctil optimizada para que los agricultores administren productores, cajas y mensajes.",
        impacto: "100% autogestión sin soporte técnico"
      },
      {
        id: "ch-edge",
        titulo: "Cloudflare Pages & Workers API",
        categoria: "Arquitectura Serverless",
        icono: "🌐",
        pos: [-0.35, -0.65, 0.67],
        descripcion: "Frontend y endpoints API en el borde de la red con tiempos de respuesta sub-35ms en todo México.",
        impacto: "Latencia ultra-baja en redes rurales"
      },
      {
        id: "ch-d1",
        titulo: "SQL Serverless en Cloudflare D1",
        categoria: "SQL en el Borde",
        icono: "🗄️",
        pos: [0.22, -0.78, -0.58],
        descripcion: "Base de datos SQL transaccional distribuida sin servidores dedicados ni costos fijos de mantenimiento.",
        impacto: "$0 USD/mes de costo de infraestructura"
      }
    ],

    // Para este proyecto no se usa el gráfico de barras de Recharts,
    // se usan las métricas cualitativas y de negocio solicitadas.
    eficiencia: null,

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
      tipo: "huerto",
      acento: "#22c55e",
      tamaño: 1.06,
      velocidadRotacion: 0.016
    }
  },

  {
    slug: "medscan",
    nombre: "MedScan",
    categoria: "web",
    tagline: "Compara el precio de tus medicamentos en 12 farmacias de México.",
    descripcion:
      "Comparador de precios de medicamentos: buscas una sustancia o marca y " +
      "consulta en vivo las farmacias, agrupa por dosis y te dice cuál es la " +
      "opción más barata por tableta.",
    reto:
      "El mismo medicamento puede costar varias veces más según la farmacia, y " +
      "comparar a mano significa abrir cada sitio, buscar la misma dosis y " +
      "calcular el precio por pieza de presentaciones distintas.",
    solucion:
      "Un backend en Node que consulta 9 farmacias en paralelo (APIs VTEX y " +
      "scrapers), normaliza dosis y piezas, calcula el precio unitario y " +
      "transmite el progreso en tiempo real al frontend en React (PWA).",
    resultado:
      "Una búsqueda muestra en segundos la opción más barata por tableta. " +
      "Ejemplo real: paracetamol 500 mg desde $8.00 en Similares, 71% menos " +
      "que la opción más cara.",
    resultadoTag: "Precio por tableta en segundos",
    metricas: [
      { valor: 12, etiqueta: "Farmacias comparadas" },
      { valor: "+90", etiqueta: "Sustancias en catálogo" },
    ],

    // Puntos de interés arquitectónicos para el Modo Inspección 360°
    hotspots: [
      {
        id: "ms-scrapers",
        titulo: "Consulta Paralela a Farmacias",
        categoria: "Scraping & APIs",
        icono: "🔎",
        pos: [0.74, 0.55, 0.38],
        descripcion: "9 farmacias con precio en vivo (catálogos VTEX y scrapers HTML) consultadas en paralelo con timeout por tienda; las demás se ofrecen como enlace directo.",
        impacto: "Una tienda caída no frena la búsqueda"
      },
      {
        id: "ms-normalizacion",
        titulo: "Normalización de Dosis y Precio Unitario",
        categoria: "Procesamiento de Datos",
        icono: "💊",
        pos: [-0.8, 0.35, 0.48],
        descripcion: "Extrae dosis, piezas y forma del nombre del producto, agrupa \"1 g\" con \"1000 mg\", separa genéricos de marcas y calcula el precio por tableta.",
        impacto: "Compara presentaciones distintas"
      },
      {
        id: "ms-sse",
        titulo: "Progreso en Tiempo Real (SSE)",
        categoria: "Experiencia de Usuario",
        icono: "⚡",
        pos: [0.2, -0.82, 0.54],
        descripcion: "Server-Sent Events avisan farmacia por farmacia mientras llegan los precios, con caché para búsquedas repetidas y rate limiting.",
        impacto: "El usuario ve avance, no una espera"
      },
      {
        id: "ms-alertas",
        titulo: "Historial y Alertas de Precio",
        categoria: "Automatización",
        icono: "🔔",
        pos: [-0.42, -0.45, -0.79],
        descripcion: "Un cron diario recorre el catálogo, guarda historial de precios y monitorea la salud de cada scraper; con Supabase avisa por correo o push cuando baja un precio.",
        impacto: "Avisos aunque la app esté cerrada"
      }
    ],

    // Sin gráfico de Recharts: las métricas de este proyecto son medibles
    // directo en la app, no estimaciones de ahorro operativo.
    eficiencia: null,

    stack: ["React", "Node.js", "Express", "Supabase", "PWA"],
    links: {
      sitio: "https://medscan-gamma.vercel.app",
      codigo: null, // https://github.com/EAA933/medscan — agregar cuando el repo sea público
    },
    // Tema visual del caso de estudio (hud.js): clínico en vez de espacial.
    tema: "hospital",
    capturas: [
      import.meta.env.BASE_URL + "captures/medscan-home.png",
      import.meta.env.BASE_URL + "captures/medscan-movil.png"
    ],
    video: null,
    planeta: { tipo: "medico", acento: "#818cf8", tamaño: 1.12, velocidadRotacion: 0.014 }
  },

  {
    slug: "mirar",
    nombre: "MIRAR",
    categoria: "web",
    tagline: "Tienda de lentes de sol con simulador de micas y guía de calce.",
    descripcion:
      "E-commerce de lentes de sol para México: hero interactivo por modelo, " +
      "simulador de tintes de mica, guía de calce por rostro, catálogo con " +
      "búsqueda predictiva y carrito persistente, hecho en Next.js.",
    reto:
      "Comprar lentes de sol en línea genera dudas que en tienda se resuelven " +
      "probándolos: cómo se ve la luz con cada mica, si el armazón le queda a " +
      "tu rostro y cuál modelo elegir entre varios parecidos.",
    solucion:
      "Storefront en Next.js 14 con un hero que cambia de escena por modelo, " +
      "un simulador que aplica el tinte de cada mica sobre una escena al " +
      "atardecer, una guía de calibre según el ancho del rostro y un catálogo " +
      "con búsqueda predictiva navegable con teclado.",
    resultado:
      "Una tienda publicada en Vercel donde el cliente explora, compara micas " +
      "y calce, y agrega al carrito sin salir del flujo; con modo claro y " +
      "oscuro e historial de modelos vistos.",
    resultadoTag: "Publicada en Vercel",
    metricas: [
      { valor: 8, etiqueta: "Modelos en catálogo" },
      { valor: 4, etiqueta: "Escenas en el hero" },
    ],

    // Puntos de interés arquitectónicos para el Modo Inspección 360°
    hotspots: [
      {
        id: "mi-hero",
        titulo: "Hero Interactivo por Modelo",
        categoria: "Experiencia de Compra",
        icono: "🕶️",
        pos: [0.72, 0.56, 0.4],
        descripcion: "Selector de Brisa, Duna, Marea y Ocaso: cada uno cambia escena, especificaciones y precio con transiciones de Framer Motion, y se compra desde ahí.",
        impacto: "Del vistazo a la compra en un clic"
      },
      {
        id: "mi-lightlab",
        titulo: "LightLab: Simulador de Micas",
        categoria: "Interactividad",
        icono: "🌅",
        pos: [-0.78, 0.38, 0.5],
        descripcion: "Aplica el tinte, el porcentaje de luz visible (VLT) y la polarización de cada mica sobre una escena al atardecer para comparar cómo se ve.",
        impacto: "Probar la mica sin tenerla"
      },
      {
        id: "mi-busqueda",
        titulo: "Búsqueda Predictiva",
        categoria: "Catálogo",
        icono: "🔎",
        pos: [0.22, -0.8, 0.56],
        descripcion: "Sugerencias de modelos y filtros mientras escribes, navegables con flechas y Enter, sobre un catálogo filtrable por forma y mica.",
        impacto: "Encuentra el modelo al teclear"
      },
      {
        id: "mi-calce",
        titulo: "Guía de Calce y Vistos Recientes",
        categoria: "Personalización",
        icono: "📏",
        pos: [-0.4, -0.48, -0.78],
        descripcion: "Recomienda calibre según el ancho del rostro y recuerda los modelos que viste (localStorage) para retomarlos después.",
        impacto: "Menos dudas antes de comprar"
      }
    ],

    eficiencia: null,

    // Tema visual del caso de estudio (hud.js): maquetado de revista editorial.
    tema: "revista",
    revista: {
      numero: "03",
      seccion: "Diseño de producto · E-commerce",
      titular: ["Ver la luz", "antes de", "comprarla."],
      cita: "Probar la mica sin tenerla.",
      rol: "Diseño y desarrollo",
    },

    stack: ["Next.js", "TypeScript", "Tailwind", "Framer Motion", "Zustand"],
    links: {
      sitio: "https://mirar-lentes.vercel.app",
      codigo: "https://github.com/EAA933/mirar",
    },
    capturas: [
      import.meta.env.BASE_URL + "captures/mirar-home.png",
      import.meta.env.BASE_URL + "captures/mirar-movil.png"
    ],
    video: null,
    planeta: { tipo: "atardecer", acento: "#f2994a", tamaño: 1.02, velocidadRotacion: 0.012 }
  },

  {
    slug: "gestor-incidentes",
    nombre: "Gestor de Incidentes",
    categoria: "web",
    tagline: "Seguimiento de incidentes de riesgo operativo, del reporte al cierre.",
    descripcion:
      "Aplicación web para registrar incidentes de riesgo operativo, dar " +
      "seguimiento a sus sesiones y reportarlos por trimestre, con login y " +
      "datos en la nube.",
    reto:
      "El seguimiento de incidentes de riesgo vivía en correos y hojas de " +
      "cálculo: era difícil saber qué seguía abierto, qué sesión estaba " +
      "vencida y cuánto sumaban los incidentes financieros de cada trimestre.",
    solucion:
      "Una app en Next.js con login y Supabase (RLS por usuario): cada " +
      "incidente guarda área, corresponsal, causa raíz, monto y bitácora de " +
      "sesiones, con filtros por estado y por trimestre de registro en SCALA.",
    resultado:
      "Todo el seguimiento en una sola pantalla: abiertos, vencidos y monto " +
      "financiero por moneda de un vistazo, y exportación a CSV/JSON para " +
      "los reportes.",
    resultadoTag: "Activa en Vercel",
    metricas: [
      { valor: "4", etiqueta: "Indicadores en tablero" },
      { valor: "CSV", etiqueta: "Exportación de reportes" },
    ],

    // Puntos de interés arquitectónicos para el Modo Inspección 360°
    hotspots: [
      {
        id: "gi-tablero",
        titulo: "Tablero de Estado",
        categoria: "Monitoreo",
        icono: "🚨",
        pos: [0.7, 0.58, 0.42],
        descripcion: "Total de incidentes, abiertos, monto financiero sumado por moneda y sesiones de seguimiento vencidas, calculados al momento.",
        impacto: "Lo urgente salta a la vista"
      },
      {
        id: "gi-trimestre",
        titulo: "Filtro Trimestral por SCALA",
        categoria: "Reporte Regulatorio",
        icono: "🗓️",
        pos: [-0.78, 0.36, 0.5],
        descripcion: "Agrupa incidentes por el trimestre en que se registraron en SCALA, combinable con filtros de estado, búsqueda y orden.",
        impacto: "Cierre trimestral sin armar Excel"
      },
      {
        id: "gi-supabase",
        titulo: "Login y Datos en la Nube",
        categoria: "Seguridad",
        icono: "🔐",
        pos: [0.2, -0.82, 0.54],
        descripcion: "Autenticación con Supabase y Row Level Security: cada usuario solo ve sus incidentes. Opción de cerrar sesión al cerrar la pestaña.",
        impacto: "Datos protegidos por usuario"
      },
      {
        id: "gi-puente",
        titulo: "Puente para Redes Corporativas",
        categoria: "Infraestructura",
        icono: "🌉",
        pos: [-0.42, -0.46, -0.78],
        descripcion: "El navegador habla con /sb en el mismo dominio y Vercel lo reenvía a Supabase, así funciona en redes que bloquean *.supabase.co.",
        impacto: "Funciona dentro de la oficina"
      }
    ],

    eficiencia: null,

    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind", "Vercel"],
    links: {
      sitio: "https://incident-self.vercel.app",
      codigo: "https://github.com/EAA933/IncidentManager",
    },
    capturas: [
      import.meta.env.BASE_URL + "captures/incident-home.png",
      import.meta.env.BASE_URL + "captures/incident-movil.png"
    ],
    video: null,
    planeta: { tipo: "centinela", acento: "#fb7185", tamaño: 1.02, velocidadRotacion: 0.012 }
  }
];

export default projects;

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
        ],
        simulador: {
          cultivos: [
            { id: "pimiento", nombre: "Pimiento morrón", colores: ["Rojo", "Amarillo", "Naranja", "Verde"], icon: "🫑" },
            { id: "pepino", nombre: "Pepino", colores: ["Verde"], icon: "🥒" },
            { id: "chile-jalapeno", nombre: "Chile Jalapeño", colores: ["Verde"], icon: "🌶️" },
            { id: "chile-serrano", nombre: "Chile Serrano", colores: ["Verde"], icon: "🌶️" },
            { id: "berenjena", nombre: "Berenjena", colores: ["Morado"], icon: "🍆" },
            { id: "jitomate", nombre: "Jitomate Bola", colores: ["Rojo"], icon: "🍅" }
          ],
          productores: [
            {
              id: 1,
              nombre: "Hermanos Arteaga Trejo",
              cultivo: "Pimiento morrón",
              colores: ["Amarillo", "Naranja", "Rojo", "Verde"],
              municipio: "Tasquillo, Hidalgo",
              temporada: "Agosto - Enero",
              whatsapp: "771 118 9043",
              certificaciones: ["SENASICA"],
              destacado: true
            },
            {
              id: 2,
              nombre: "Agroindustrias Terramex",
              cultivo: "Pimiento morrón",
              colores: ["Amarillo", "Naranja", "Rojo", "Verde"],
              municipio: "Tasquillo, Hidalgo",
              temporada: "Junio - Noviembre",
              whatsapp: "771 712 9511",
              certificaciones: ["PrimusGFS"],
              destacado: true
            },
            {
              id: 3,
              nombre: "Invernaderos de Tasquillo",
              cultivo: "Pimiento morrón",
              colores: ["Amarillo", "Naranja", "Rojo", "Verde"],
              municipio: "Tasquillo, Hidalgo",
              temporada: "Agosto - Enero",
              whatsapp: "55 3207 3065",
              certificaciones: ["SENASICA"],
              destacado: true
            }
          ],
          cajas: [
            {
              id: "caja-morron",
              nombre: "Caja Ventilada para Pimiento Morrón",
              medidas: "50 × 30 × 28 cm",
              capacidad: "5 kg a 10 kg",
              precioUnitario: 24.50,
              resistencia: "Doble corrugado resistente a condensación y estiba en tarima"
            },
            {
              id: "caja-pepino",
              nombre: "Caja Agrícola Multiusos con Asas",
              medidas: "60 × 40 × 22 cm",
              capacidad: "12 kg a 15 kg",
              precioUnitario: 28.00,
              resistencia: "Ventilada con troquel ergonómico de fácil estibado"
            }
          ]
        }
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

    // Puntos de interés arquitectónicos para el Modo Inspección 360°
    hotspots: [
      {
        id: "vf-ia",
        titulo: "Motor de IA Conversacional",
        categoria: "Inteligencia Artificial",
        icono: "🤖",
        pos: [0.72, 0.62, 0.3],
        descripcion: "Modelo semántico adaptado al tono comercial de la empresa: analiza intenciones, responde objeciones y recomienda productos.",
        impacto: "88% de resolución autónoma"
      },
      {
        id: "vf-api",
        titulo: "WhatsApp Cloud API Oficial",
        categoria: "Mensajería Empresarial",
        icono: "💬",
        pos: [-0.8, 0.2, 0.56],
        descripcion: "Infraestructura directa sobre la API en la nube de Meta sin emuladores ni riesgo de suspensión de línea.",
        impacto: ">1,000 chats en simultáneo"
      },
      {
        id: "vf-scoring",
        titulo: "Scoring y Calificación de Leads",
        categoria: "Filtro Comercial",
        icono: "⚡",
        pos: [0.15, -0.85, 0.5],
        descripcion: "Evaluación en tiempo real del presupuesto y necesidad del prospecto antes de transferir la conversación a un cerrador.",
        impacto: "3x mayor efectividad comercial"
      },
      {
        id: "vf-crm",
        titulo: "Sincronización Webhook & Node.js",
        categoria: "Backend de Integración",
        icono: "🔄",
        pos: [-0.4, -0.4, -0.82],
        descripcion: "Event loop asíncrono que inserta prospectos calificados en CRMs y hojas de cálculo al instante.",
        impacto: "Cero pérdida de datos"
      }
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

    // Puntos de interés arquitectónicos para el Modo Inspección 360°
    hotspots: [
      {
        id: "pr-var",
        titulo: "Motor de Cálculo de VaR & Liquidez",
        categoria: "Finanzas Cuantitativas",
        icono: "📊",
        pos: [0.82, 0.45, 0.35],
        descripcion: "Algoritmos vectorizados en el cliente que calculan escenarios de estrés y exposición patrimonial en milisegundos.",
        impacto: "Cálculo instantáneo en navegador"
      },
      {
        id: "pr-alertas",
        titulo: "Matriz de Alertas Tempranas",
        categoria: "Monitoreo Activo",
        icono: "🚨",
        pos: [-0.65, 0.7, 0.29],
        descripcion: "Sistema de centinela visual con umbrales configurables que resalta desviaciones de solvencia antes de que sean críticas.",
        impacto: "Mitigación inmediata de riesgo"
      },
      {
        id: "pr-etl",
        titulo: "Consolidador de Libros Contables",
        categoria: "Ingesta de Datos",
        icono: "📑",
        pos: [0.3, -0.6, 0.74],
        descripcion: "Fusión de archivos dispersos de múltiples sucursales con normalización de esquemas y validación relacional.",
        impacto: "28 horas/semana ahorradas"
      },
      {
        id: "pr-ui",
        titulo: "Diseño Ejecutivo de Alta Densidad",
        categoria: "UX / Visualización",
        icono: "🎯",
        pos: [-0.5, -0.55, -0.67],
        descripcion: "Jerarquía inspirada en consolas de misión aeroespacial: información crítica legible sin desplazamientos confusos.",
        impacto: "Decisiones en <3 minutos"
      }
    ],

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

    // Puntos de interés arquitectónicos para el Modo Inspección 360°
    hotspots: [
      {
        id: "rr-parser",
        titulo: "Parser XLSX Ultrarrápido",
        categoria: "Ingesta de Archivos",
        icono: "⚡",
        pos: [0.75, 0.55, 0.36],
        descripcion: "Motor de streaming que procesa matrices de millones de celdas en memoria sin colapsar el explorador.",
        impacto: "De 6 días a 12 minutos"
      },
      {
        id: "rr-reglas",
        titulo: "Validador de Normativa AMIS / CNSF",
        categoria: "Cumplimiento Regulatorio",
        icono: "⚖️",
        pos: [-0.85, 0.3, 0.43],
        descripcion: "Matriz algorítmica de más de 60 reglas de coherencia contable y ramos de seguros que previene multas.",
        impacto: "0% error de transcripción"
      },
      {
        id: "rr-layout",
        titulo: "Generador de Layout Oficial",
        categoria: "Entrega Normativa",
        icono: "📦",
        pos: [0.25, -0.75, 0.61],
        descripcion: "Ensamblador que produce el archivo plano final con la codificación y estructura que exige el regulador.",
        impacto: "Aprobación al 1er intento"
      },
      {
        id: "rr-auditoria",
        titulo: "Trazabilidad & Logs de Cruce",
        categoria: "Gobernanza",
        icono: "🔒",
        pos: [-0.45, -0.5, -0.74],
        descripcion: "Pistas de auditoría completas que permiten inspeccionar el origen exacto de cada celda consolidada.",
        impacto: "Auditorías 100% transparentes"
      }
    ],

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

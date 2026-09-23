import fs from "fs";

// 1. Vyntra Flow - Desktop (Home)
const vyntraHome = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="vbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a101d"/>
      <stop offset="100%" stop-color="#05080e"/>
    </linearGradient>
    <linearGradient id="vcard" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#162235"/>
      <stop offset="100%" stop-color="#0d1522"/>
    </linearGradient>
    <linearGradient id="vgreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#vbg)"/>
  
  <!-- Sidebar -->
  <rect x="0" y="0" width="220" height="750" fill="#0b1320" stroke="#1e293b" stroke-width="1"/>
  <circle cx="45" cy="45" r="14" fill="url(#vgreen)"/>
  <text x="70" y="50" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="16">Vyntra Flow</text>
  
  <rect x="20" y="90" width="180" height="36" rx="8" fill="#1e293b"/>
  <text x="50" y="113" fill="#34d399" font-family="system-ui, sans-serif" font-size="13" font-weight="600">Conversaciones</text>
  <text x="50" y="155" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">Filtros de IA</text>
  <text x="50" y="195" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">Catalogo Sync</text>
  <text x="50" y="235" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">Metricas &amp; CRM</text>
  
  <!-- Header -->
  <rect x="220" y="0" width="980" height="70" fill="#0b1320" stroke="#1e293b" stroke-width="1"/>
  <text x="250" y="42" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="600" font-size="20">Bandeja de Entrada Inteligente (WhatsApp Business)</text>
  <rect x="1030" y="20" width="130" height="32" rx="16" fill="#064e3b" stroke="#059669" stroke-width="1"/>
  <circle cx="1048" cy="36" r="4" fill="#34d399"/>
  <text x="1060" y="41" fill="#34d399" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Agente Activo</text>
  
  <!-- KPI Metrics -->
  <g transform="translate(250, 95)">
    <rect width="210" height="90" rx="10" fill="url(#vcard)" stroke="#1e293b"/>
    <text x="20" y="32" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Tiempo de respuesta</text>
    <text x="20" y="65" fill="#34d399" font-family="system-ui, sans-serif" font-size="26" font-weight="700">42 seg</text>
    <text x="125" y="65" fill="#10b981" font-family="system-ui, sans-serif" font-size="12">-88% vs humano</text>

    <rect x="235" width="210" height="90" rx="10" fill="url(#vcard)" stroke="#1e293b"/>
    <text x="255" y="32" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Conversaciones 24/7</text>
    <text x="255" y="65" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="26" font-weight="700">1,840</text>
    <text x="340" y="65" fill="#34d399" font-family="system-ui, sans-serif" font-size="12">+34% este mes</text>

    <rect x="470" width="210" height="90" rx="10" fill="url(#vcard)" stroke="#1e293b"/>
    <text x="490" y="32" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Tasa de conversion</text>
    <text x="490" y="65" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="26" font-weight="700">28.4%</text>

    <rect x="705" width="215" height="90" rx="10" fill="url(#vcard)" stroke="#1e293b"/>
    <text x="725" y="32" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Derivaciones a Humano</text>
    <text x="725" y="65" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="26" font-weight="700">6.2%</text>
  </g>

  <!-- Live chat mock inside panel -->
  <g transform="translate(250, 210)">
    <rect width="440" height="500" rx="12" fill="#0f172a" stroke="#1e293b"/>
    <text x="24" y="36" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="15">Conversaciones Recientes</text>
    
    <rect x="16" y="55" width="408" height="68" rx="8" fill="#1e293b"/>
    <text x="32" y="82" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="13">+52 55 4910 **** · Mariana G.</text>
    <text x="32" y="103" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">"Me interesa el paquete industrial, ¿tienen disponibilidad?"</text>
    <rect x="340" y="70" width="70" height="20" rx="10" fill="#065f46"/>
    <text x="352" y="84" fill="#34d399" font-family="system-ui, sans-serif" font-size="10" font-weight="600">Calificado</text>

    <rect x="16" y="132" width="408" height="68" rx="8" fill="#141e30"/>
    <text x="32" y="159" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="13">+52 81 1204 **** · Carlos M.</text>
    <text x="32" y="180" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">"Pago confirmado vía enlace STP #49921"</text>
    <rect x="340" y="147" width="70" height="20" rx="10" fill="#1e3a8a"/>
    <text x="352" y="161" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="10" font-weight="600">Comprado</text>

    <rect x="16" y="209" width="408" height="68" rx="8" fill="#141e30"/>
    <text x="32" y="236" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="13">+52 33 2891 **** · Distribuidora Sol</text>
    <text x="32" y="257" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">"Derivado a soporte comercial con agente Juan P."</text>
    <rect x="340" y="224" width="70" height="20" rx="10" fill="#78350f"/>
    <text x="352" y="238" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="10" font-weight="600">Humano</text>
  </g>

  <!-- Interactive thread view -->
  <g transform="translate(710, 210)">
    <rect width="460" height="500" rx="12" fill="#0b1320" stroke="#1e293b"/>
    <rect x="0" y="0" width="460" height="50" rx="12" fill="#162235"/>
    <text x="24" y="32" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="14">Detalle de Chat: Mariana G. (Vyntra AI Bot)</text>

    <!-- Client message -->
    <rect x="20" y="80" width="320" height="55" rx="10" fill="#1e293b"/>
    <text x="35" y="102" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">Hola, me interesa el paquete para 50 usuarios.</text>
    <text x="35" y="120" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">¿Hacen factura para empresa en México?</text>

    <!-- Bot AI message -->
    <rect x="120" y="150" width="320" height="75" rx="10" fill="#064e3b" stroke="#059669" stroke-width="1"/>
    <text x="135" y="172" fill="#34d399" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Vyntra Flow AI (Respuesta instantánea):</text>
    <text x="135" y="192" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">¡Hola Mariana! Sí, emitimos factura CFDI 4.0.</text>
    <text x="135" y="210" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">El paquete Pro 50 incluye onboarding sin costo.</text>

    <!-- Interactive suggestion -->
    <rect x="120" y="240" width="320" height="95" rx="10" fill="#132337" stroke="#2563eb" stroke-width="1"/>
    <text x="135" y="265" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Acción Ejecutada por el Flujo:</text>
    <text x="135" y="287" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">✓ Catálogo PDF enviado (1.8MB)</text>
    <text x="135" y="307" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">✓ Prospecto calificado &gt; $20k MXN transferido a CRM</text>
  </g>
</svg>`;

// 2. Vyntra Flow - Mobile
const vyntraMovil = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 800" width="450" height="800">
  <defs>
    <linearGradient id="vmbg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b141b"/>
      <stop offset="100%" stop-color="#080e14"/>
    </linearGradient>
  </defs>
  <rect width="450" height="800" fill="url(#vmbg)"/>
  
  <!-- WhatsApp Header -->
  <rect x="0" y="0" width="450" height="80" fill="#1f2c34"/>
  <circle cx="45" cy="45" r="18" fill="#00a884"/>
  <text x="75" y="42" fill="#e9edef" font-family="system-ui, sans-serif" font-weight="600" font-size="16">Vyntra Flow Bot</text>
  <text x="75" y="60" fill="#00a884" font-family="system-ui, sans-serif" font-size="12">En línea 24/7 (IA Comercial)</text>

  <!-- Messages -->
  <rect x="20" y="110" width="320" height="60" rx="10" fill="#202c33"/>
  <text x="35" y="135" fill="#e9edef" font-family="system-ui, sans-serif" font-size="13">Hola, ¿cuánto cuesta el plan anual?</text>
  <text x="290" y="160" fill="#8696a0" font-family="system-ui, sans-serif" font-size="10">10:42 am</text>

  <rect x="90" y="185" width="340" height="110" rx="10" fill="#005c4b"/>
  <text x="105" y="210" fill="#e9edef" font-family="system-ui, sans-serif" font-size="13">¡Hola! El plan anual tiene 20% de</text>
  <text x="105" y="230" fill="#e9edef" font-family="system-ui, sans-serif" font-size="13">descuento. Incluye respuestas automáticas</text>
  <text x="105" y="250" fill="#e9edef" font-family="system-ui, sans-serif" font-size="13">ilimitadas y sincronización de catálogo.</text>
  <text x="375" y="285" fill="#aebac1" font-family="system-ui, sans-serif" font-size="10">10:42 am ✓✓</text>

  <!-- Bot Card -->
  <rect x="90" y="310" width="340" height="140" rx="12" fill="#182229" stroke="#00a884" stroke-width="1.5"/>
  <text x="110" y="340" fill="#00a884" font-family="system-ui, sans-serif" font-weight="700" font-size="13">Catálogo Recomendado</text>
  <text x="110" y="365" fill="#e9edef" font-family="system-ui, sans-serif" font-size="13">Plan PyME Automatizado</text>
  <text x="110" y="388" fill="#8696a0" font-family="system-ui, sans-serif" font-size="12">$3,499 MXN / año</text>
  <rect x="110" y="405" width="300" height="32" rx="6" fill="#00a884"/>
  <text x="210" y="426" fill="#111b21" font-family="system-ui, sans-serif" font-weight="700" font-size="13">Pagar en línea →</text>
</svg>`;

// 3. Panel de Riesgo - Desktop
const riesgoHome = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="rbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070c14"/>
      <stop offset="100%" stop-color="#0b121e"/>
    </linearGradient>
    <linearGradient id="rcard" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#111c2d"/>
      <stop offset="100%" stop-color="#0a121f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#rbg)"/>

  <!-- Top Bar -->
  <rect x="0" y="0" width="1200" height="65" fill="#0d1726" stroke="#1e293b" stroke-width="1"/>
  <text x="35" y="40" fill="#8fd0ff" font-family="system-ui, sans-serif" font-weight="700" font-size="18">Panel Central de Riesgo &amp; Solvencia</text>
  <rect x="1000" y="18" width="165" height="30" rx="6" fill="#1e293b"/>
  <text x="1015" y="38" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Periodo: En Vivo (Q3)</text>

  <!-- 4 Key Gauges / KPIs -->
  <g transform="translate(35, 90)">
    <rect width="265" height="110" rx="10" fill="url(#rcard)" stroke="#1e293b"/>
    <text x="20" y="32" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Índice de Cobertura de Capital</text>
    <text x="20" y="72" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="30" font-weight="800">184.2%</text>
    <text x="160" y="72" fill="#22c55e" font-family="system-ui, sans-serif" font-size="12">✓ Holgado (&gt;120%)</text>

    <rect x="295" width="265" height="110" rx="10" fill="url(#rcard)" stroke="#1e293b"/>
    <text x="315" y="32" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">VaR 99% (Value at Risk)</text>
    <text x="315" y="72" fill="#f87171" font-family="system-ui, sans-serif" font-size="30" font-weight="800">$4.12 M</text>
    <text x="455" y="72" fill="#ef4444" font-family="system-ui, sans-serif" font-size="12">Límite: $5.0M</text>

    <rect x="590" width="265" height="110" rx="10" fill="url(#rcard)" stroke="#1e293b"/>
    <text x="610" y="32" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Liquidez Inmediata</text>
    <text x="610" y="72" fill="#4ade80" font-family="system-ui, sans-serif" font-size="30" font-weight="800">1.48x</text>
    <text x="750" y="72" fill="#22c55e" font-family="system-ui, sans-serif" font-size="12">Óptimo</text>

    <rect x="885" width="280" height="110" rx="10" fill="url(#rcard)" stroke="#1e293b"/>
    <text x="905" y="32" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Alertas Activas</text>
    <text x="905" y="72" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="30" font-weight="800">2 Precaución</text>
    <text x="1055" y="72" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">0 Críticas</text>
  </g>

  <!-- Big Risk Chart & Matrix -->
  <g transform="translate(35, 230)">
    <!-- Chart area -->
    <rect width="680" height="480" rx="10" fill="url(#rcard)" stroke="#1e293b"/>
    <text x="25" y="38" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="16">Evolución de Exposición y Requerimiento de Capital</text>
    
    <!-- Grid lines -->
    <line x1="60" y1="90" x2="630" y2="90" stroke="#1e293b" stroke-dasharray="4"/>
    <line x1="60" y1="180" x2="630" y2="180" stroke="#1e293b" stroke-dasharray="4"/>
    <line x1="60" y1="270" x2="630" y2="270" stroke="#1e293b" stroke-dasharray="4"/>
    <line x1="60" y1="360" x2="630" y2="360" stroke="#1e293b" stroke-dasharray="4"/>
    
    <!-- Path graph -->
    <path d="M 80 340 Q 180 290, 260 300 T 400 210 T 520 160 T 620 130" fill="none" stroke="#38bdf8" stroke-width="3"/>
    <path d="M 80 340 Q 180 290, 260 300 T 400 210 T 520 160 T 620 130 L 620 400 L 80 400 Z" fill="#38bdf8" fill-opacity="0.08"/>

    <path d="M 80 280 Q 180 270, 260 260 T 400 250 T 520 240 T 620 235" fill="none" stroke="#f87171" stroke-width="2" stroke-dasharray="6"/>
    <text x="500" y="225" fill="#f87171" font-family="system-ui, sans-serif" font-size="11">Requerimiento Regulatorio</text>
  </g>

  <!-- Risk Matrix on the right -->
  <g transform="translate(740, 230)">
    <rect width="425" height="480" rx="10" fill="url(#rcard)" stroke="#1e293b"/>
    <text x="25" y="38" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="16">Matriz de Concentración y Portafolio</text>

    <rect x="25" y="70" width="375" height="65" rx="8" fill="#1e293b"/>
    <text x="40" y="96" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="13">Riesgo de Crédito Contraparte</text>
    <text x="40" y="118" fill="#4ade80" font-family="system-ui, sans-serif" font-size="12">Calificación promedio: AAA / AA+</text>

    <rect x="25" y="150" width="375" height="65" rx="8" fill="#1e293b"/>
    <text x="40" y="176" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="13">Sensibilidad a Tasas (+100 bps)</text>
    <text x="40" y="198" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="12">Impacto patrimonial: -$1.2M (-0.4%)</text>

    <rect x="25" y="230" width="375" height="65" rx="8" fill="#1e293b"/>
    <text x="40" y="256" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="13">Concentración por Emisor Top 5</text>
    <text x="40" y="278" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">14.8% del portafolio (dentro de norma)</text>
  </g>
</svg>`;

// 4. Panel de Riesgo - Mobile
const riesgoMovil = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 800" width="450" height="800">
  <rect width="450" height="800" fill="#080e18"/>
  <rect x="0" y="0" width="450" height="60" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <text x="25" y="38" fill="#8fd0ff" font-family="system-ui, sans-serif" font-weight="700" font-size="16">Monitor de Riesgo Móvil</text>

  <!-- Metric 1 -->
  <rect x="20" y="85" width="410" height="120" rx="12" fill="#111c2d" stroke="#1e293b"/>
  <text x="40" y="115" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">Cobertura de Capital</text>
  <text x="40" y="160" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="34" font-weight="800">184.2%</text>
  <text x="260" y="160" fill="#22c55e" font-family="system-ui, sans-serif" font-size="13">✓ Cumplimiento</text>

  <!-- Metric 2 -->
  <rect x="20" y="225" width="410" height="120" rx="12" fill="#111c2d" stroke="#1e293b"/>
  <text x="40" y="255" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">VaR Diario 99%</text>
  <text x="40" y="300" fill="#f87171" font-family="system-ui, sans-serif" font-size="34" font-weight="800">$4.12 M</text>
  <text x="260" y="300" fill="#ef4444" font-family="system-ui, sans-serif" font-size="13">Máx: $5.0M</text>

  <!-- Urgent alert cards -->
  <rect x="20" y="365" width="410" height="180" rx="12" fill="#1e293b"/>
  <text x="40" y="398" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="15">Alertas Regulatorias</text>
  
  <rect x="35" y="420" width="380" height="50" rx="6" fill="#132337"/>
  <text x="50" y="450" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="12">⚠️ Vencimiento de cobertura de divisas en 48 hrs</text>

  <rect x="35" y="480" width="380" height="50" rx="6" fill="#132337"/>
  <text x="50" y="510" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="12">ℹ️ Cierre de mes procesado sin anomalías de spread</text>
</svg>`;

// 5. Reportes Regulatorios - Desktop
const reportesHome = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="rpbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e0a1a"/>
      <stop offset="100%" stop-color="#080612"/>
    </linearGradient>
    <linearGradient id="rpcard" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#191330"/>
      <stop offset="100%" stop-color="#0f0c1d"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#rpbg)"/>

  <!-- Top bar -->
  <rect x="0" y="0" width="1200" height="65" fill="#140f26" stroke="#2e2154" stroke-width="1"/>
  <text x="35" y="40" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="700" font-size="18">Automatización de Reportes Regulatorios (AMIS / CNSF)</text>
  <rect x="990" y="16" width="175" height="32" rx="8" fill="#2e2154"/>
  <text x="1010" y="37" fill="#c9b6ff" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Exportar Oficial XLSX</text>

  <!-- Ingestion steps -->
  <g transform="translate(35, 90)">
    <rect width="350" height="180" rx="10" fill="url(#rpcard)" stroke="#2e2154"/>
    <text x="25" y="35" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="700" font-size="14">Paso 1: Ingestión de Hojas Fuente</text>
    <text x="25" y="65" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">14 libros Excel detectados</text>
    <rect x="25" y="80" width="300" height="35" rx="6" fill="#241b3d"/>
    <text x="35" y="102" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="12">✓ Cartera_Polizas_2026.xlsx (42k filas)</text>
    <rect x="25" y="125" width="300" height="35" rx="6" fill="#241b3d"/>
    <text x="35" y="147" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="12">✓ Siniestralidad_Acumulada.xlsx (18k filas)</text>

    <rect x="385" width="350" height="180" rx="10" fill="url(#rpcard)" stroke="#2e2154"/>
    <text x="410" y="35" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="700" font-size="14">Paso 2: Validación &amp; Conciliación</text>
    <text x="410" y="65" fill="#34d399" font-family="system-ui, sans-serif" font-weight="600" font-size="12">✓ 0 discrepancias de sumas de control</text>
    <text x="410" y="90" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Cruce de catálogo de ramos AMIS: 100%</text>
    <rect x="410" y="115" width="300" height="12" rx="6" fill="#241b3d"/>
    <rect x="410" y="115" width="300" height="12" rx="6" fill="#8b5cf6"/>

    <rect x="770" width="395" height="180" rx="10" fill="url(#rpcard)" stroke="#2e2154"/>
    <text x="795" y="35" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="700" font-size="14">Paso 3: Generación del Formato Final</text>
    <text x="795" y="70" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="28" font-weight="800">4 minutos</text>
    <text x="940" y="70" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="12">Antes: 3 a 5 días hábiles</text>
    <text x="795" y="115" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Fórmulas dinámicas y tablas formateadas según especificación</text>
  </g>

  <!-- Data table preview -->
  <g transform="translate(35, 300)">
    <rect width="1130" height="410" rx="10" fill="url(#rpcard)" stroke="#2e2154"/>
    <text x="25" y="40" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="15">Previsualización de Cuadros Regulatorios Consolidados</text>
    
    <!-- Table Header -->
    <rect x="25" y="65" width="1080" height="40" fill="#241b3d"/>
    <text x="45" y="90" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="600" font-size="12">Código Ramo</text>
    <text x="200" y="90" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="600" font-size="12">Descripción Oficial</text>
    <text x="480" y="90" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="600" font-size="12">Prima Emitida Directa</text>
    <text x="720" y="90" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="600" font-size="12">Siniestros Pagados</text>
    <text x="960" y="90" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="600" font-size="12">Índice Siniestr.</text>

    <!-- Table Rows -->
    <rect x="25" y="115" width="1080" height="40" fill="#140f24"/>
    <text x="45" y="140" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">01.01</text>
    <text x="200" y="140" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">Vida Individual y Colectivo</text>
    <text x="480" y="140" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">$ 84,291,040 MXN</text>
    <text x="720" y="140" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">$ 49,102,400 MXN</text>
    <text x="960" y="140" fill="#34d399" font-family="system-ui, sans-serif" font-size="12">58.2%</text>

    <rect x="25" y="165" width="1080" height="40" fill="#1b1430"/>
    <text x="45" y="190" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">02.04</text>
    <text x="200" y="190" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">Gastos Médicos Mayores</text>
    <text x="480" y="190" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">$ 128,450,110 MXN</text>
    <text x="720" y="190" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">$ 84,200,900 MXN</text>
    <text x="960" y="190" fill="#34d399" font-family="system-ui, sans-serif" font-size="12">65.5%</text>

    <rect x="25" y="215" width="1080" height="40" fill="#140f24"/>
    <text x="45" y="240" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">05.02</text>
    <text x="200" y="240" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">Automóviles Residentes</text>
    <text x="480" y="240" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">$ 62,110,800 MXN</text>
    <text x="720" y="240" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">$ 41,890,200 MXN</text>
    <text x="960" y="240" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="12">67.4%</text>
  </g>
</svg>`;

// 6. Reportes Regulatorios - Mobile
const reportesMovil = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 800" width="450" height="800">
  <rect width="450" height="800" fill="#090614"/>
  <rect x="0" y="0" width="450" height="60" fill="#140f26" stroke="#2e2154" stroke-width="1"/>
  <text x="25" y="38" fill="#c9b6ff" font-family="system-ui, sans-serif" font-weight="700" font-size="16">Reportes Regulatorios</text>

  <rect x="20" y="85" width="410" height="140" rx="12" fill="#191330" stroke="#2e2154"/>
  <text x="40" y="115" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="13">Estado del Proceso</text>
  <text x="40" y="155" fill="#34d399" font-family="system-ui, sans-serif" font-size="28" font-weight="800">Listo para Entrega</text>
  <text x="40" y="195" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">14 archivos integrados · 0 errores</text>

  <rect x="20" y="245" width="410" height="150" rx="12" fill="#191330" stroke="#2e2154"/>
  <text x="40" y="275" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="13">Ahorro de Tiempo</text>
  <text x="40" y="325" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="36" font-weight="800">minutos</text>
  <text x="210" y="325" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="13">antes: 3-5 días</text>

  <rect x="20" y="420" width="410" height="50" rx="10" fill="#8b5cf6"/>
  <text x="145" y="452" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="14">Descargar AMIS_Q3.xlsx</text>
</svg>`;

fs.writeFileSync("public/captures/vyntra-home.svg", vyntraHome);
fs.writeFileSync("public/captures/vyntra-movil.svg", vyntraMovil);
fs.writeFileSync("public/captures/panel-riesgo-home.svg", riesgoHome);
fs.writeFileSync("public/captures/panel-riesgo-movil.svg", riesgoMovil);
fs.writeFileSync("public/captures/reportes-regulatorios-home.svg", reportesHome);
fs.writeFileSync("public/captures/reportes-regulatorios-movil.svg", reportesMovil);

console.log("All 6 captures generated successfully!");

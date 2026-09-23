import fs from "fs";

function generatePDF() {
  const lines = [
    "BT",
    "/F1 20 Tf",
    "50 780 Td",
    "(Eduardo Aranda Arteaga) Tj",
    "0 -24 Td",
    "/F1 12 Tf",
    "(Desarrollador de Producto y Web | Riesgo y Automatizacion) Tj",
    "0 -16 Td",
    "/F1 10 Tf",
    "(Email: earandaa933@gmail.com  |  GitHub: github.com/EAA933  |  LinkedIn: linkedin.com/in/eduardoaranda-risk) Tj",
    "0 -28 Td",
    "/F1 13 Tf",
    "(RESUMEN PROFESIONAL) Tj",
    "0 -16 Td",
    "/F1 10 Tf",
    "(Desarrollador enfocado en resolver problemas reales mediante productos web de alto rendimiento,) Tj",
    "0 -14 Td",
    "(dashboards de monitoreo de riesgo y herramientas de automatizacion de flujos complejos. Experiencia) Tj",
    "0 -14 Td",
    "(tanto en frontend interactivo como en arquitecturas serverless edge y procesamiento de datos.) Tj",
    "0 -24 Td",
    "/F1 13 Tf",
    "(HABILIDADES Y TECNOLOGIAS) Tj",
    "0 -16 Td",
    "/F1 10 Tf",
    "(- Frontend: JavaScript / TypeScript, Three.js, WebGL, GSAP, Lenis, Next.js, HTML5 semantico, CSS3.) Tj",
    "0 -14 Td",
    "(- Backend & Cloud: Node.js, Cloudflare Pages, Cloudflare Workers & Functions, D1 SQL, REST APIs.) Tj",
    "0 -14 Td",
    "(- Automatizacion & Datos: Procesamiento XLSX, APIs comerciales (WhatsApp), IA aplicada a flujos.) Tj",
    "0 -24 Td",
    "/F1 13 Tf",
    "(PROYECTOS DESTACADOS) Tj",
    "0 -16 Td",
    "/F1 11 Tf",
    "(1. Cosecha Hidalguense  -  Plataforma Web y Catalogo de Productores) Tj",
    "0 -14 Td",
    "/F1 10 Tf",
    "(   - Plataforma integral en el borde de la red (Cloudflare Pages + Functions + D1 SQL).) Tj",
    "0 -13 Td",
    "(   - Panel privado de administracion para catalogos y pedidos a costo de operacion cero.) Tj",
    "0 -18 Td",
    "/F1 11 Tf",
    "(2. Vyntra Flow  -  Automatizacion Comercial con IA por WhatsApp) Tj",
    "0 -14 Td",
    "/F1 10 Tf",
    "(   - Atencion y calificacion automatica de prospectos 24/7 con tiempo de respuesta < 1 min.) Tj",
    "0 -13 Td",
    "(   - Integracion de APIs de mensajeria y canalizacion inteligente a equipo humano.) Tj",
    "0 -18 Td",
    "/F1 11 Tf",
    "(3. Panel de Monitoreo de Riesgo  -  Sector Seguros / Finanzas) Tj",
    "0 -14 Td",
    "/F1 10 Tf",
    "(   - Dashboard unificado para consolidar indicadores dispersos en multiples hojas de calculo.) Tj",
    "0 -13 Td",
    "(   - Visualizacion reactiva para toma de decisiones y priorizacion de alertas criticas.) Tj",
    "0 -18 Td",
    "/F1 11 Tf",
    "(4. Generador de Reportes Regulatorios  -  Automatizacion AMIS) Tj",
    "0 -14 Td",
    "/F1 10 Tf",
    "(   - Reduccion de dias de procesamiento manual a minutos con validacion de formulas y cruce XLSX.) Tj",
    "0 -24 Td",
    "/F1 13 Tf",
    "(ENFOQUE DE DISENO E INGENIERIA) Tj",
    "0 -16 Td",
    "/F1 10 Tf",
    "(- Enfoque dual de accesibilidad: experiencia 3D inmersiva con soporte nativo de fallback accesible.) Tj",
    "0 -14 Td",
    "(- Rendimiento estricto: optimizacion de shaders procedurales y bajo consumo de memoria.) Tj",
    "ET"
  ].join("\n");

  const streamLength = Buffer.byteLength(lines);

  const objects = [
    `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${lines}\nendstream\nendobj\n`
  ];

  let offset = 0;
  const offsets = [];
  let pdf = objects[0];
  offsets.push(pdf.length); // obj 1
  for (let i = 1; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += objects[i];
  }

  const xrefOffset = pdf.length;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    xref += String(off).padStart(10, "0") + " 00000 n \n";
  });

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  pdf += xref + trailer;

  fs.writeFileSync("public/cv.pdf", pdf);
  console.log("public/cv.pdf created successfully (" + pdf.length + " bytes)");
}

generatePDF();

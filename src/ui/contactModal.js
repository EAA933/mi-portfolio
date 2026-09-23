/**
 * contactModal.js — Formulario de contacto profesional y captura de leads
 * ------------------------------------------------------------------
 * Reemplaza los enlaces directos 'mailto' por un modal de conversión
 * con validación de campos en tiempo real, selección de tipo de proyecto,
 * feedback visual accesible y confirmación inmediata.
 * ------------------------------------------------------------------
 */

export function crearModalContacto(site) {
  const modal = document.createElement("div");
  modal.id = "modal-contacto";
  modal.className = "modal-backdrop";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("data-lenis-prevent", "");

  modal.innerHTML = `
    <div class="contacto-wrap">
      <div class="contacto-card">
        <button type="button" class="btn-cerrar-contacto" aria-label="Cerrar formulario">✕</button>

        <div id="contacto-cuerpo">
          <header class="contacto-header">
            <span class="contacto-badge">⚡ DISPONIBILIDAD INMEDIATA · RESPUESTA EN &lt; 24H</span>
            <h2>Hablemos de tu proyecto</h2>
            <p>Cuéntame el reto o idea que deseas construir. Te responderé con una propuesta técnica clara y cotización sin compromiso.</p>
          </header>

          <form id="formulario-contacto" novalidate>
            <div class="grupo-campo">
              <label for="cf-nombre">Tu nombre o empresa <span class="req">*</span></label>
              <input type="text" id="cf-nombre" name="nombre" placeholder="Ej. Carlos Mendoza" autocomplete="name" required />
              <span class="msg-error" id="err-nombre"></span>
            </div>

            <div class="grupo-campo">
              <label for="cf-email">Correo electrónico <span class="req">*</span></label>
              <input type="email" id="cf-email" name="email" placeholder="carlos@empresa.com" autocomplete="email" required />
              <span class="msg-error" id="err-email"></span>
            </div>

            <div class="grupo-campo">
              <label>Tipo de proyecto o servicio</label>
              <div class="pills-servicios" role="group" aria-label="Tipo de proyecto">
                <button type="button" class="pill-btn activo" data-tipo="Automatización con IA">🤖 Automatización con IA</button>
                <button type="button" class="pill-btn" data-tipo="Plataforma Web / 3D">🌐 Plataforma Web / 3D</button>
                <button type="button" class="pill-btn" data-tipo="Dashboard &amp; Métricas">📊 Dashboard &amp; Métricas</button>
                <button type="button" class="pill-btn" data-tipo="Consultoría / Otro">💼 Consultoría Técnica</button>
              </div>
              <input type="hidden" id="cf-tipo" name="tipo" value="Automatización con IA" />
            </div>

            <div class="grupo-campo">
              <label for="cf-plazo">Plazo estimado / Urgencia</label>
              <select id="cf-plazo" name="plazo">
                <option value="Flexible / Por definir">Flexible / Por definir</option>
                <option value="Urgente (< 2 semanas)">Urgente (&lt; 2 semanas)</option>
                <option value="Estándar (3 a 6 semanas)">Estándar (3 a 6 semanas)</option>
                <option value="Proyecto continuo / Largo plazo">Proyecto continuo / Largo plazo</option>
              </select>
            </div>

            <div class="grupo-campo">
              <label for="cf-mensaje">Detalles del reto o requerimiento <span class="req">*</span></label>
              <textarea id="cf-mensaje" name="mensaje" rows="4" placeholder="¿Qué proceso necesitas optimizar o qué producto deseas desarrollar? (Problema actual, plazos o tecnologías deseadas...)" required></textarea>
              <span class="msg-error" id="err-mensaje"></span>
            </div>

            <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none" />
            <span class="msg-error" id="err-envio" role="alert"></span>

            <div class="contacto-acciones">
              <button type="submit" class="btn btn-primario btn-submit">
                <span class="txt-btn">Enviar mensaje →</span>
                <span class="spinner-btn" aria-hidden="true"></span>
              </button>
              <span class="contacto-directo">
                ¿Prefieres email? <a href="mailto:${site.contacto.email}">${site.contacto.email}</a>
              </span>
            </div>
          </form>
        </div>

        <div id="contacto-exito" class="contacto-exito oculto" aria-live="polite">
          <div class="icono-exito">✓</div>
          <h3>¡Propuesta enviada con éxito!</h3>
          <p id="exito-detalle">Gracias por contactarme. He recibido los detalles de tu proyecto y te responderé en menos de 24 horas.</p>
          <div class="exito-acciones">
            <button type="button" class="btn btn-primario" id="btn-cerrar-exito">Volver al viaje espacial</button>
            <button type="button" class="btn btn-secundario" id="btn-nuevo-mensaje">Enviar otro mensaje</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector("#formulario-contacto");
  const btnCerrar = modal.querySelector(".btn-cerrar-contacto");
  const cuerpo = modal.querySelector("#contacto-cuerpo");
  const exito = modal.querySelector("#contacto-exito");
  const btnCerrarExito = modal.querySelector("#btn-cerrar-exito");
  const btnNuevoMensaje = modal.querySelector("#btn-nuevo-mensaje");
  const exitoDetalle = modal.querySelector("#exito-detalle");

  const inputNombre = modal.querySelector("#cf-nombre");
  const inputEmail = modal.querySelector("#cf-email");
  const inputMensaje = modal.querySelector("#cf-mensaje");
  const inputTipo = modal.querySelector("#cf-tipo");
  const inputPlazo = modal.querySelector("#cf-plazo");
  const pills = modal.querySelectorAll(".pill-btn");

  const errNombre = modal.querySelector("#err-nombre");
  const errEmail = modal.querySelector("#err-email");
  const errMensaje = modal.querySelector("#err-mensaje");
  const errEnvio = modal.querySelector("#err-envio");

  // Selección de tipo de servicio con pills
  pills.forEach((btn) => {
    btn.addEventListener("click", () => {
      pills.forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      inputTipo.value = btn.dataset.tipo;
    });
  });

  // Validaciones
  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function validarCampo(input, errSpan, fnValidar, mensajeError) {
    const valido = fnValidar(input.value);
    if (!valido) {
      input.classList.add("invalido");
      input.classList.remove("valido");
      errSpan.textContent = mensajeError;
      return false;
    } else {
      input.classList.remove("invalido");
      input.classList.add("valido");
      errSpan.textContent = "";
      return true;
    }
  }

  inputNombre.addEventListener("input", () => {
    validarCampo(inputNombre, errNombre, (v) => v.trim().length >= 2, "Por favor ingresa tu nombre (mínimo 2 letras).");
  });

  inputEmail.addEventListener("input", () => {
    validarCampo(inputEmail, errEmail, validarEmail, "Ingresa un correo electrónico válido (ej. tu@empresa.com).");
  });

  inputMensaje.addEventListener("input", () => {
    validarCampo(inputMensaje, errMensaje, (v) => v.trim().length >= 10, "Cuéntame un poco más sobre el reto (mínimo 10 caracteres).");
  });

  // Envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const okNombre = validarCampo(inputNombre, errNombre, (v) => v.trim().length >= 2, "Por favor ingresa tu nombre (mínimo 2 letras).");
    const okEmail = validarCampo(inputEmail, errEmail, validarEmail, "Ingresa un correo electrónico válido.");
    const okMensaje = validarCampo(inputMensaje, errMensaje, (v) => v.trim().length >= 10, "Cuéntame un poco más sobre el reto (mínimo 10 caracteres).");

    if (!okNombre || !okEmail || !okMensaje) {
      const primerError = modal.querySelector(".invalido");
      if (primerError) primerError.focus();
      return;
    }

    const submitBtn = form.querySelector(".btn-submit");
    submitBtn.classList.add("cargando");
    submitBtn.disabled = true;

    const lead = {
      nombre: inputNombre.value.trim(),
      email: inputEmail.value.trim(),
      tipo: inputTipo.value,
      plazo: inputPlazo.value,
      mensaje: inputMensaje.value.trim(),
      fecha: new Date().toISOString(),
    };

    errEnvio.textContent = "";

    enviarLead(lead)
      .then((via) => {
        cuerpo.classList.add("oculto");
        exito.classList.remove("oculto");
        mostrarExito(lead, via);
      })
      .catch(() => {
        errEnvio.innerHTML = `No se pudo enviar el mensaje. Escríbeme directo a <a href="${mailtoDe(lead)}">${site.contacto.email}</a>.`;
      })
      .finally(() => {
        submitBtn.classList.remove("cargando");
        submitBtn.disabled = false;
      });
  });

  function mailtoDe(lead) {
    const asunto = `Proyecto: ${lead.tipo} — ${lead.nombre}`;
    const cuerpoCorreo = `${lead.mensaje}\n\nTipo: ${lead.tipo}\nPlazo: ${lead.plazo}\nNombre: ${lead.nombre}\nCorreo: ${lead.email}`;
    return `mailto:${site.contacto.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpoCorreo)}`;
  }

  // Envía por Web3Forms; sin access key, abre el cliente de correo del visitante.
  async function enviarLead(lead) {
    const key = site.contacto.web3formsKey;
    if (!key) {
      window.location.href = mailtoDe(lead);
      return "mailto";
    }
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: key,
        subject: `Portafolio · ${lead.tipo} — ${lead.nombre}`,
        from_name: "Portafolio Eduardo Aranda",
        replyto: lead.email,
        botcheck: form.querySelector('[name="botcheck"]').checked,
        ...lead,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`);
    return "web3forms";
  }

  function mostrarExito(lead, via) {
    const titulo = exito.querySelector("h3");
    exitoDetalle.textContent = "";
    const nombre = document.createElement("strong");
    nombre.textContent = lead.nombre;
    const correo = document.createElement("strong");
    correo.textContent = lead.email;
    if (via === "mailto") {
      titulo.textContent = "Se abrió tu correo";
      exitoDetalle.append("Gracias, ", nombre, ". Revisa tu cliente de correo y presiona Enviar para que me llegue tu mensaje.");
    } else {
      titulo.textContent = "¡Mensaje enviado!";
      exitoDetalle.append("Gracias, ", nombre, ". Recibí los detalles de tu proyecto y te responderé a ", correo, " en menos de 24 horas.");
    }
  }

  function abrirModal(prellenado = {}) {
    if (prellenado.tipo) {
      const match = Array.from(pills).find((b) => b.dataset.tipo.toLowerCase().includes(prellenado.tipo.toLowerCase()));
      if (match) match.click();
    }
    if (prellenado.mensaje && !inputMensaje.value) {
      inputMensaje.value = prellenado.mensaje;
    }
    modal.classList.add("activo");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-abierto");
    setTimeout(() => inputNombre.focus(), 250);
  }

  function cerrarModal() {
    modal.classList.remove("activo");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-abierto");
  }

  btnCerrar.addEventListener("click", cerrarModal);
  btnCerrarExito.addEventListener("click", cerrarModal);

  btnNuevoMensaje.addEventListener("click", () => {
    form.reset();
    inputNombre.classList.remove("valido", "invalido");
    inputEmail.classList.remove("valido", "invalido");
    inputMensaje.classList.remove("valido", "invalido");
    errNombre.textContent = "";
    errEmail.textContent = "";
    errMensaje.textContent = "";
    errEnvio.textContent = "";
    pills[0].click();
    exito.classList.add("oculto");
    cuerpo.classList.remove("oculto");
  });

  // Cerrar con Escape o clic fuera de la tarjeta
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("contacto-wrap")) {
      cerrarModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("activo")) {
      cerrarModal();
    }
  });

  return {
    abrir: abrirModal,
    cerrar: cerrarModal,
    estaAbierto: () => modal.classList.contains("activo"),
  };
}

export default crearModalContacto;

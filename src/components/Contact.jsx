import { useState } from "react";
import { WHATSAPP_DISPLAY, whatsappLink } from "../data/products.js";
import {
  WhatsAppIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  SparklesIcon,
  SendIcon,
  CheckIcon,
  UserIcon,
  BoltIcon
} from "./Icons.jsx";

const SKIN_TYPES = [
  "Piel Seca",
  "Piel Grasa",
  "Piel Mixta",
  "Sensible / Rojeces",
  "Anti-edad / Manchas",
  "Consulta General",
];

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  skinType: "Piel Mixta",
  message: "",
};

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(next) {
    const nextErrors = {};
    if (!next.name.trim()) nextErrors.name = "Por favor ingresa tu nombre.";
    if (next.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email.trim())) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }
    if (!next.phone.trim() && !next.email.trim()) {
      nextErrors.phone = "Ingresa un teléfono o correo para responderte.";
    }
    if (next.message.trim().length < 6) {
      nextErrors.message = "Cuéntanos brevemente qué deseas consultar.";
    }
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSent(true);
  }

  const consultationWhatsappMsg = `Hola Mialys Skin! Mi nombre es ${values.name || "Cliente"}.
Tipo de piel: ${values.skinType}.
${values.email ? `Correo: ${values.email}\n` : ""}${values.phone ? `Teléfono: ${values.phone}\n` : ""}
Consulta: ${values.message}`;

  return (
    <section id="contacto" className="contact">
      <div className="wrap">
        <div className="contact-header-wrap">
          <span className="contact-badge">
            <SparklesIcon size={14} /> Asesoría Dermo-Cosmética
          </span>
          <h2 className="contact-title">Escríbenos sobre tu piel</h2>
          <p className="contact-intro">
            Cuéntanos tus necesidades, rutina actual o dudas sobre productos. Nuestras asesoras
            especializadas te guiarán con una recomendación personalizada y sin compromiso.
          </p>
        </div>

        <div className="contact-grid-modern">
          {/* COLUMNA IZQUIERDA: FORMULARIO ELEGANTE */}
          <div className="contact-card contact-form-card">
            {sent ? (
              <div className="contact-success-state" role="status">
                <div className="contact-success-icon">
                  <CheckIcon size={28} />
                </div>
                <h3>Mensaje enviado con éxito</h3>
                <p>
                  Gracias <strong>{values.name.trim().split(" ")[0]}</strong>. Hemos recibido tu
                  consulta y una asesora se comunicará contigo muy pronto.
                </p>

                <div className="contact-success-actions">
                  <a
                    className="btn btn-whatsapp-direct"
                    href={whatsappLink(consultationWhatsappMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon size={18} />
                    Continuar por WhatsApp ahora
                  </a>

                  <button
                    type="button"
                    className="btn btn-outline-soft"
                    onClick={() => {
                      setSent(false);
                      setValues(EMPTY);
                    }}
                  >
                    Enviar otra consulta
                  </button>
                </div>
              </div>
            ) : (
              <form className="contact-form-modern" onSubmit={handleSubmit} noValidate>
                <div className="form-row-2col">
                  <div className="form-field-group">
                    <label htmlFor="contact-name">
                      <UserIcon size={14} /> Nombre Completo *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Ej. Valeria Mendoza"
                      value={values.name}
                      aria-invalid={Boolean(errors.name)}
                      onChange={(e) => update("name", e.target.value)}
                    />
                    {errors.name && <p className="field-error-modern">{errors.name}</p>}
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="contact-phone">
                      <PhoneIcon size={14} /> Teléfono / WhatsApp *
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Ej. 098 765 4321"
                      value={values.phone}
                      aria-invalid={Boolean(errors.phone)}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                    {errors.phone && <p className="field-error-modern">{errors.phone}</p>}
                  </div>
                </div>

                <div className="form-field-group">
                  <label htmlFor="contact-email">
                    <MailIcon size={14} /> Correo Electrónico (opcional)
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@ejemplo.com"
                    value={values.email}
                    aria-invalid={Boolean(errors.email)}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  {errors.email && <p className="field-error-modern">{errors.email}</p>}
                </div>

                {/* SELECTOR DE TIPO DE PIEL / TIPO DE CONSULTA */}
                <div className="form-field-group">
                  <label>
                    <SparklesIcon size={14} /> Tipo de piel o interés principal
                  </label>
                  <div className="skin-chips-group">
                    {SKIN_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={
                          values.skinType === type
                            ? "skin-chip-btn is-selected"
                            : "skin-chip-btn"
                        }
                        onClick={() => update("skinType", type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-field-group">
                  <label htmlFor="contact-message">
                    Consulta o detalles de tu piel *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="4"
                    placeholder="Cuéntanos qué productos buscas, si tu piel presenta resequedad, acné, manchas o si necesitas una recomendación para regalar..."
                    value={values.message}
                    aria-invalid={Boolean(errors.message)}
                    onChange={(e) => update("message", e.target.value)}
                  />
                  {errors.message && <p className="field-error-modern">{errors.message}</p>}
                </div>

                <div className="form-actions-modern">
                  <button type="submit" className="btn btn-contact-submit">
                    <SendIcon size={16} /> Enviar Mensaje
                  </button>
                  <a
                    className="btn btn-whatsapp-pill"
                    href={whatsappLink(
                      values.message
                        ? `Hola Mialys Skin, me gustaría consultar: ${values.message}`
                        : "Hola Mialys Skin, deseo asesoría personalizada sobre productos de belleza."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon size={16} /> O consultar por WhatsApp
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* COLUMNA DERECHA: CANALES DE ATENCIÓN DIRECTA */}
          <aside className="contact-card contact-direct-card">
            <div className="direct-header">
              <div className="live-status-pill">
                <span className="live-pulse-dot" />
                <span>Atención en Vivo (Ecuador)</span>
              </div>
              <h3>Canales Directos</h3>
              <p>
                ¿Quieres una respuesta al instante? Puedes escribirnos o llamarnos directamente.
                Estamos listos para orientarte.
              </p>
            </div>

            {/* BOTÓN DESTACADO DE WHATSAPP */}
            <div className="direct-whatsapp-box">
              <div className="whatsapp-box-meta">
                <span className="whatsapp-box-label">Canal Oficial WhatsApp</span>
                <span className="whatsapp-box-number">{WHATSAPP_DISPLAY}</span>
              </div>
              <a
                className="btn btn-whatsapp-large"
                href={whatsappLink("Hola Mialys Skin, deseo asesoría personalizada.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={20} />
                <span>Chatear por WhatsApp</span>
              </a>
            </div>

            {/* LISTA DE CONTACTOS DIRECTOS */}
            <div className="direct-channels-list">
              <a href="tel:+593984444418" className="direct-channel-item">
                <div className="direct-item-icon">
                  <PhoneIcon size={18} />
                </div>
                <div className="direct-item-content">
                  <span className="direct-item-title">Llamada Telefónica</span>
                  <span className="direct-item-val">+593 99 844 4418</span>
                </div>
              </a>

              <a href="mailto:contacto@mialysskin.com" className="direct-channel-item">
                <div className="direct-item-icon">
                  <MailIcon size={18} />
                </div>
                <div className="direct-item-content">
                  <span className="direct-item-title">Correo Electrónico</span>
                  <span className="direct-item-val">contacto@mialysskin.com</span>
                </div>
              </a>

              <div className="direct-channel-item is-static">
                <div className="direct-item-icon">
                  <ClockIcon size={18} />
                </div>
                <div className="direct-item-content">
                  <span className="direct-item-title">Horario de Atención</span>
                  <span className="direct-item-val">Lunes a Sábado: 09:00 - 19:00</span>
                </div>
              </div>

              <div className="direct-channel-item is-static">
                <div className="direct-item-icon">
                  <MapPinIcon size={18} />
                </div>
                <div className="direct-item-content">
                  <span className="direct-item-title">Ubicación y Entregas</span>
                  <span className="direct-item-val">Samborondón & Guayaquil, Ecuador</span>
                </div>
              </div>
            </div>

            {/* BENEFICIOS DE ATENCIÓN */}
            <div className="direct-perks">
              <div className="perk-item">
                <BoltIcon size={15} />
                <span>Respuesta en menos de 15 minutos</span>
              </div>
              <div className="perk-item">
                <SparklesIcon size={15} />
                <span>Asesoría 100% personalizada</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

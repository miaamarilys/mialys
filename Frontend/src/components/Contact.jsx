import { useState } from "react";
import { WHATSAPP_DISPLAY, whatsappLink } from "../data/products.js";
import { WhatsAppIcon, SendIcon, CheckIcon, UserIcon, MailIcon } from "./Icons.jsx";

const EMPTY = { name: "", email: "", message: "" };

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
    if (!next.name.trim()) nextErrors.name = "Escribe tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email.trim())) {
      nextErrors.email = "Ingresa un correo válido.";
    }
    if (next.message.trim().length < 8) nextErrors.message = "Cuéntanos un poco más.";
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSent(true);
  }

  return (
    <section id="contacto" className="contact">
      <div className="wrap contact-grid">
        <div className="contact-main-col">
          <p className="eyebrow">Contacto</p>
          <h2 className="contact-heading">Escríbenos sobre tu piel.</h2>
          <p className="contact-intro">
            Cuéntanos tu tipo de piel, lo que estás usando y qué te gustaría mejorar. Te
            respondemos con una recomendación clara.
          </p>

          {sent ? (
            <div className="form-success" role="status">
              <div className="form-success-icon">
                <CheckIcon size={24} />
              </div>
              <h3>Mensaje listo.</h3>
              <p>
                Recibimos tu nota, {values.name.trim().split(" ")[0]}. Si prefieres una
                respuesta inmediata, escríbenos por WhatsApp.
              </p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setSent(false);
                  setValues(EMPTY);
                }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="contact-name">
                <span className="field-label-text">
                  <UserIcon size={14} /> Nombre
                </span>
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Tu nombre completo"
                  value={values.name}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  onChange={(event) => update("name", event.target.value)}
                />
              </label>
              {errors.name && (
                <p id="contact-name-error" className="field-error">
                  {errors.name}
                </p>
              )}

              <label htmlFor="contact-email">
                <span className="field-label-text">
                  <MailIcon size={14} /> Correo
                </span>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={values.email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  onChange={(event) => update("email", event.target.value)}
                />
              </label>
              {errors.email && (
                <p id="contact-email-error" className="field-error">
                  {errors.email}
                </p>
              )}

              <label htmlFor="contact-message">
                <span className="field-label-text">Mensaje</span>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="5"
                  placeholder="¿Cómo es tu piel y qué objetivo deseas alcanzar?"
                  value={values.message}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  onChange={(event) => update("message", event.target.value)}
                />
              </label>
              {errors.message && (
                <p id="contact-message-error" className="field-error">
                  {errors.message}
                </p>
              )}

              <button type="submit" className="btn btn-submit-message">
                <SendIcon size={15} />
                <span>Enviar mensaje</span>
              </button>
            </form>
          )}
        </div>

        <aside className="contact-panel">
          <div className="contact-panel-content">
            <p className="eyebrow">Pago por WhatsApp</p>
            <h3>
              Al pagar te conectamos al{" "}
              <span className="contact-phone-highlight">{WHATSAPP_DISPLAY}</span>
            </h3>
            <p>El pedido se abre en un chat con ese número para confirmar el pago.</p>
            <a
              className="btn btn-light btn-whatsapp-action"
              href={whatsappLink("Hola, quiero pagar mi pedido de Mialys Skin.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={18} />
              <span>Pagar por WhatsApp</span>
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

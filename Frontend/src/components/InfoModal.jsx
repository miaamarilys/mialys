import { useEffect, useState } from "react";
import { formatPrice, whatsappLink } from "../data/products.js";
import About from "./About.jsx";

const NAME = { name: "nombre", label: "Nombre completo", autoComplete: "name" };
const PHONE = { name: "telefono", label: "Teléfono / WhatsApp", type: "tel", autoComplete: "tel" };
const EMAIL = { name: "correo", label: "Correo electrónico", type: "email", autoComplete: "email" };
const ID_DOC = { name: "cedula", label: "Cédula o RUC", inputMode: "numeric" };

const BANK_ACCOUNT = [
  ["Banco", "Banco Pichincha"],
  ["Tipo de cuenta", "Ahorros"],
  ["Número de cuenta", "2200000000"],
  ["Titular", "Mialys Skin"],
  ["Cédula / RUC", "0900000000001"],
];

const BANKS = ["Banco Pichincha", "Banco Guayaquil", "Banco del Pacífico", "Produbanco", "Banco Bolivariano", "Banco Internacional", "Cooperativa u otro"];

const PAYMENTS = [
  {
    id: "tarjeta",
    label: "Tarjeta de crédito y débito",
    title: "Paga con tu tarjeta",
    note: "Por seguridad no pedimos el número ni el código de tu tarjeta: los ingresas en el enlace de pago seguro que te enviamos.",
    submit: "Solicitar enlace de pago",
    fields: [
      { name: "marca", label: "Tipo de tarjeta", type: "chips", options: ["Visa", "Mastercard", "Diners", "American Express"], full: true },
      { ...NAME, label: "Nombre como aparece en la tarjeta", autoComplete: "cc-name" },
      ID_DOC,
      { name: "modalidad", label: "Forma de pago", type: "select", options: ["Pago corriente", "Diferido a 3 meses", "Diferido a 6 meses", "Diferido a 12 meses"] },
      EMAIL,
      { ...PHONE, full: true },
    ],
    Icon: CardIcon,
  },
  {
    id: "transferencia",
    label: "Transferencia bancaria",
    title: "Transfiere a nuestra cuenta",
    note: "Haz la transferencia con estos datos y luego llena el formulario para confirmar tu pedido.",
    submit: "Confirmar transferencia",
    fields: [
      NAME,
      ID_DOC,
      { name: "banco", label: "Banco desde el que transfieres", type: "select", options: BANKS },
      PHONE,
      { name: "comprobante", label: "Número de comprobante (opcional)", optional: true, full: true },
    ],
    Icon: PhoneIcon,
  },
  {
    id: "contraentrega",
    label: "Pago contra entrega",
    title: "Paga cuando lo recibas",
    note: "Pagas en efectivo al recibir tu pedido. Confirmamos la cobertura de tu ciudad por WhatsApp.",
    submit: "Confirmar pedido",
    fields: [
      NAME,
      PHONE,
      { name: "ciudad", label: "Ciudad", autoComplete: "address-level2" },
      { name: "direccion", label: "Dirección de entrega", autoComplete: "street-address" },
      { name: "referencia", label: "Referencia (opcional)", optional: true, full: true },
      { name: "horario", label: "Horario de entrega", type: "chips", options: ["Mañana (9:00 - 12:00)", "Tarde (14:00 - 18:00)"], full: true },
      { name: "efectivo", label: "¿Con cuánto vas a pagar? (opcional, para tu cambio)", optional: true, inputMode: "decimal", full: true },
    ],
    Icon: WalletIcon,
  },
  {
    id: "paypal",
    label: "PayPal",
    title: "Paga con PayPal",
    note: "Te enviamos una solicitud de pago al correo de tu cuenta PayPal. Puedes pagar con tu saldo o con las tarjetas guardadas en PayPal.",
    submit: "Solicitar pago por PayPal",
    fields: [
      { name: "paypal", label: "Correo de tu cuenta PayPal", type: "email", autoComplete: "email", full: true },
      NAME,
      PHONE,
    ],
    Icon: PaypalIcon,
  },
];

const FAQS = [
  ["¿Cuánto tarda mi pedido?", "Entre 2 y 5 días hábiles, según tu ciudad."],
  ["¿Los productos son originales?", "Sí, todos nuestros productos son 100% originales."],
  ["¿Puedo cambiar un producto?", "Sí, dentro de los 7 días siguientes si está sellado y sin uso."],
  ["¿Cómo sé qué crema elegir?", "Escríbenos con tu tipo de piel y te recomendamos la mejor opción."],
];

export default function InfoModal({ type, onClose, cart = [] }) {
  useEffect(() => {
    if (!type) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`info-modal info-${type}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="info-close" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>
        {type === "negocio" && <Business onClose={onClose} />}
        {type === "pagos" && <Payments cart={cart} />}
        {type === "envios" && <Shipping onClose={onClose} />}
        {type === "faq" && <Faq onClose={onClose} />}
        {type === "nosotros" && <About />}
      </div>
    </div>
  );
}

function Business({ onClose }) {
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/photos")
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => setPhoto(data.negocio || null))
      .catch(() => setPhoto(null));
  }, []);

  async function upload(file) {
    if (!file || uploading) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("photo", file);
    try {
      const response = await fetch("/api/photos/negocio", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No se pudo subir la foto.");
      setPhoto(data.url);
    } catch (uploadError) {
      setError(
        uploadError.message === "Failed to fetch"
          ? "No se pudo subir la foto. Revisa que el backend esté en marcha."
          : uploadError.message
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <h2 className="info-title">Información del negocio</h2>
      <div className="business-grid">
        <div className={photo ? "business-photo has-photo" : "business-photo"}>
          {photo ? <img src={photo} alt="Nuestro espacio" /> : null}
          <label className={photo ? "spot-upload is-change" : "spot-upload"}>
            {uploading ? "Subiendo…" : photo ? "Cambiar imagen" : "Agregar imagen"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) upload(file);
              }}
            />
          </label>
        </div>

        <div className="business-col">
          <h3>Nos encontramos en:</h3>
          <ul className="business-list">
            <li>
              <ChatIcon /> Atención online
            </li>
            <li>
              <TruckIcon /> Envíos a todo el país
            </li>
            <li>
              <CheckIcon /> Productos 100% originales
            </li>
          </ul>
        </div>

        <div className="business-col business-hours">
          <h3>Horario de atención</h3>
          <div className="hours-row">
            <CalendarIcon />
            <p>
              <strong>Lunes a Sábado</strong>
              <br />
              9:00 a.m. - 7:00 p.m.
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="field-error info-error" role="alert">
          {error}
        </p>
      )}
      <button type="button" className="info-cta" onClick={onClose}>
        Cerrar
      </button>
    </>
  );
}

function Payments({ cart }) {
  const [selected, setSelected] = useState(null);
  const current = PAYMENTS.find((item) => item.id === selected) || PAYMENTS[0];

  return (
    <>
      <div className="payments-top">
        <div className="payments-copy">
          <h2 className="payments-title">Métodos de pago</h2>
          <p className="payments-sub">
            Tu compra, más fácil y segura <HeartLine />
          </p>
          <p className="payments-text">
            Aceptamos diferentes formas de pago para que elijas la que mejor se adapte a ti.
          </p>
          <a
            className="info-cta payments-more"
            href={whatsappLink(`Hola, quiero pagar con ${current.label}. ¿Me ayudas?`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver más <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="payments-grid" role="radiogroup" aria-label="Métodos de pago">
          {PAYMENTS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected === id}
              className={selected === id ? "pay-card is-selected" : "pay-card"}
              onClick={() => setSelected(id)}
            >
              <span className="pay-check" aria-hidden="true">
                ✓
              </span>
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <PaymentForm key={current.id} method={current} cart={cart} onCancel={() => setSelected(null)} />
      ) : (
        <p className="pay-detail" aria-live="polite">
          Toca un método de pago para ingresar tus datos.
        </p>
      )}

      <div className="payments-trust">
        <span>
          <ShieldIcon /> Pagos seguros
        </span>
        <span>
          <CartIcon /> Compra fácil
        </span>
        <span>
          <LockIcon /> Tu seguridad es primero
        </span>
      </div>
    </>
  );
}

function PaymentForm({ method, cart, onCancel }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function validate() {
    const next = {};
    method.fields.forEach(({ name, label, type, optional }) => {
      const value = (values[name] || "").trim();
      if (!value && !optional) next[name] = type === "chips" || type === "select" ? "Elige una opción." : "Completa este campo.";
      else if (value && type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        next[name] = "Escribe un correo válido.";
      } else if (value && type === "tel" && value.replace(/\D/g, "").length < 7) {
        next[name] = "Escribe un teléfono válido.";
      } else if (value && name === "cedula" && !/^\d{10}(\d{3})?$/.test(value.replace(/\D/g, ""))) {
        next[name] = "La cédula tiene 10 dígitos y el RUC 13.";
      }
      if (next[name]) next[name] = `${label}: ${next[name]}`;
    });
    return next;
  }

  function submit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    const lines = [`Hola, quiero pagar con ${method.label}.`, "", "Mis datos:"];
    method.fields.forEach(({ name, label }) => {
      const value = (values[name] || "").trim();
      if (value) lines.push(`- ${label.replace(/ \(opcional.*\)/, "")}: ${value}`);
    });
    if (method.id === "transferencia") lines.push("", "Adjunto la foto del comprobante en este chat.");
    if (cart.length) {
      lines.push("", "Mi pedido:");
      cart.forEach((item) => lines.push(`- ${item.qty} x ${item.name} (${formatPrice(item.price * item.qty)})`));
      lines.push(`Total: ${formatPrice(total)}`);
    }

    window.open(whatsappLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  if (sent) {
    return (
      <div className={`pay-form pay-sent is-${method.id}`} role="status">
        <h3>¡Listo! Recibimos tus datos</h3>
        <p>{SENT_TEXT[method.id]}</p>
        <button type="button" className="pay-link" onClick={() => setSent(false)}>
          Editar mis datos
        </button>
      </div>
    );
  }

  return (
    <form className={`pay-form is-${method.id}`} noValidate onSubmit={submit}>
      <div className="pay-form-head">
        <span className="pay-form-icon" aria-hidden="true">
          <method.Icon />
        </span>
        <div>
          <h3>{method.title}</h3>
          <p>{method.note}</p>
        </div>
      </div>

      <div className="pay-layout">
        {method.id === "tarjeta" && <CardPreview name={values.nombre} brand={values.marca} />}
        {method.id === "transferencia" && <BankBox total={total} />}
        {method.id === "contraentrega" && <CashBox total={total} paying={values.efectivo} />}
        {method.id === "paypal" && <PaypalBox total={total} />}

        <div className="pay-fields">
          {method.fields.map((field) => (
            <PayField key={field.name} field={field} value={values[field.name] || ""} error={errors[field.name]} onChange={setValue} />
          ))}
        </div>
      </div>

      {Object.values(errors).some(Boolean) && (
        <p className="field-error pay-errors" role="alert">
          {Object.values(errors).filter(Boolean)[0]}
        </p>
      )}

      <div className="pay-form-foot">
        <p className="pay-total">
          {cart.length ? (
            <>
              Total del pedido: <strong>{formatPrice(total)}</strong>
            </>
          ) : (
            "Tu carrito está vacío; te ayudamos a armar el pedido por WhatsApp."
          )}
        </p>
        <button type="button" className="pay-link" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="info-cta pay-submit">
          {method.submit} <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}

const SENT_TEXT = {
  tarjeta: "Se abrió WhatsApp con tus datos. En unos minutos te enviamos el enlace de pago seguro para tu tarjeta.",
  transferencia: "Se abrió WhatsApp con tus datos. Envía la foto del comprobante en ese chat y confirmamos tu pedido.",
  contraentrega: "Se abrió WhatsApp con tu dirección. Te confirmamos la cobertura y el día de entrega.",
  paypal: "Se abrió WhatsApp con tus datos. Te enviaremos la solicitud de pago a tu correo de PayPal.",
};

function PayField({ field, value, error, onChange }) {
  const { name, label, type = "text", options, full } = field;
  const className = [full && "is-full", error && "has-error"].filter(Boolean).join(" ") || undefined;

  if (type === "chips") {
    return (
      <fieldset className={className}>
        <legend>{label}</legend>
        <div className="pay-chips">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={value === option}
              className={value === option ? "pay-chip is-active" : "pay-chip"}
              onClick={() => onChange(name, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className={className}>
      {label}
      {type === "select" ? (
        <select name={name} value={value} aria-invalid={Boolean(error)} onChange={(event) => onChange(name, event.target.value)}>
          <option value="">Selecciona…</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete || "off"}
          value={value}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(name, event.target.value)}
        />
      )}
    </label>
  );
}

function CardPreview({ name, brand }) {
  return (
    <div className="pay-aside">
      <div className="card-mock" aria-hidden="true">
        <div className="card-mock-top">
          <span className="card-chip" />
          <span className="card-brand">{brand || "Mialys Skin"}</span>
        </div>
        <p className="card-number">•••• •••• •••• ••••</p>
        <div className="card-mock-bottom">
          <span>
            <small>Titular</small>
            {name?.trim() || "TU NOMBRE"}
          </span>
          <span>
            <small>Vence</small>
            ••/••
          </span>
        </div>
      </div>
      <p className="pay-aside-note">
        <LockIcon /> El número de la tarjeta lo escribes solo en el enlace seguro.
      </p>
    </div>
  );
}

function BankBox({ total }) {
  const [copied, setCopied] = useState("");

  function copy(label, value) {
    navigator.clipboard?.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className="pay-aside bank-box">
      <ol className="bank-steps">
        <li>Transfiere{total ? ` ${formatPrice(total)}` : ""} a esta cuenta.</li>
        <li>Llena tus datos.</li>
        <li>Envía el comprobante por WhatsApp.</li>
      </ol>
      <dl className="bank-data">
        {BANK_ACCOUNT.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {value}
              <button type="button" className="bank-copy" onClick={() => copy(label, value)}>
                {copied === label ? "¡Copiado!" : "Copiar"}
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CashBox({ total, paying }) {
  const amount = Number(String(paying || "").replace(",", ".").replace(/[^\d.]/g, "")) || 0;
  const change = total && amount > total ? amount - total : 0;

  return (
    <div className="pay-aside cash-box">
      <p className="cash-label">Pagas al recibir</p>
      <p className="cash-amount">{total ? formatPrice(total) : "—"}</p>
      {change > 0 && <p className="cash-change">Te llevamos {formatPrice(change)} de cambio</p>}
      <ul>
        <li>
          <TruckIcon /> Entrega de 2 a 5 días hábiles
        </li>
        <li>
          <WalletIcon /> Solo efectivo
        </li>
        <li>
          <CheckIcon /> Revisa tu pedido antes de pagar
        </li>
      </ul>
    </div>
  );
}

function PaypalBox({ total }) {
  return (
    <div className="pay-aside paypal-box">
      <p className="paypal-logo">
        <span>Pay</span>
        <span>Pal</span>
      </p>
      <p className="paypal-amount">{total ? formatPrice(total) : "Monto según tu pedido"}</p>
      <p className="pay-aside-note">
        <ShieldIcon /> Protección al comprador de PayPal
      </p>
    </div>
  );
}

function Shipping({ onClose }) {
  return (
    <>
      <h2 className="info-title">Envíos y entregas</h2>
      <ul className="business-list info-plain">
        <li>
          <TruckIcon /> Envíos a todo el país, de 2 a 5 días hábiles.
        </li>
        <li>
          <CalendarIcon /> Despachamos de lunes a sábado.
        </li>
        <li>
          <ChatIcon /> Te compartimos la guía de seguimiento por WhatsApp.
        </li>
      </ul>
      <button type="button" className="info-cta" onClick={onClose}>
        Cerrar
      </button>
    </>
  );
}

function Faq({ onClose }) {
  const [open, setOpen] = useState(0);

  return (
    <>
      <h2 className="info-title">Preguntas frecuentes</h2>
      <div className="faq-list">
        {FAQS.map(([question, answer], index) => (
          <div key={question} className={open === index ? "faq-item is-open" : "faq-item"}>
            <button
              type="button"
              aria-expanded={open === index}
              onClick={() => setOpen((current) => (current === index ? -1 : index))}
            >
              {question}
              <span aria-hidden="true">{open === index ? "−" : "+"}</span>
            </button>
            {open === index && <p>{answer}</p>}
          </div>
        ))}
      </div>
      <button type="button" className="info-cta" onClick={onClose}>
        Cerrar
      </button>
    </>
  );
}

function Svg({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function ChatIcon() {
  return (
    <Svg>
      <path d="M5 5.5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
      <path d="M8 10h8M8 13h5" />
    </Svg>
  );
}

function TruckIcon() {
  return (
    <Svg>
      <path d="M3.5 7h11v9h-11zM14.5 10h3.8l2.2 2.8V16h-6" />
      <circle cx="7.5" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.4 2.4 4.6-4.8" />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg>
      <rect x="4" y="5.5" width="16" height="14" rx="1.6" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M8 13.5h2M12 13.5h2M8 16.5h2" />
    </Svg>
  );
}

function CardIcon() {
  return (
    <Svg>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M6.5 14.5h4" />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </Svg>
  );
}

function WalletIcon() {
  return (
    <Svg>
      <path d="M4 8.5a2 2 0 0 1 2-2h11.5v3" />
      <rect x="4" y="8.5" width="16" height="10.5" rx="2" />
      <path d="M16 13.8h1.5" />
    </Svg>
  );
}

function PaypalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#253b80"
        d="M9.2 20.5H5.6a.5.5 0 0 1-.5-.6L7.6 4a.7.7 0 0 1 .7-.5h5.4c2.9 0 4.7 1.5 4.2 4.3-.6 3.4-2.9 4.9-6 4.9H10l-.8 7.8Z"
      />
      <path
        fill="#179bd7"
        d="M18.9 8.3c-.6 3.4-2.9 5-6 5h-1.6l-.9 6.4a.5.5 0 0 1-.5.4H7.6l.3-1.6h1.3l.8-5.8h1.9c3.1 0 5.4-1.5 6-4.9.1-.4.1-.8.1-1.1.6.4 1 .9.9 1.6Z"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <Svg>
      <path d="M12 3.5 19 6v5.5c0 4.4-3 7.3-7 8.9-4-1.6-7-4.5-7-8.9V6l7-2.5Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </Svg>
  );
}

function CartIcon() {
  return (
    <Svg>
      <path d="M3.5 4.5h2l2 10.5h10l2-7.5H7" />
      <circle cx="9" cy="19" r="1.3" />
      <circle cx="16.5" cy="19" r="1.3" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg>
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.8" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" />
    </Svg>
  );
}

function HeartLine() {
  return (
    <svg className="heart-line" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 19s-6.2-3.8-8-7.4C2.6 8.6 3.6 5.6 6.4 5.1 8.4 4.7 10 5.7 12 8c2-2.3 3.6-3.3 5.6-2.9 2.8.5 3.8 3.5 2.4 6.5-1.8 3.6-8 7.4-8 7.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

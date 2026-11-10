import { whatsappLink } from "../data/products.js";

const SOCIAL = {
  instagram: "https://www.instagram.com/mialysskin",
  facebook: "https://www.facebook.com/mialysskin",
  tiktok: "https://www.tiktok.com/@mialysskin",
  pinterest: "https://www.pinterest.com/mialysskin",
};

const LINKS = [
  ["inicio", "Inicio"],
  ["catalogo", "Catálogo"],
  ["servicios", "Estética integral"],
  ["novedades", "Novedades"],
  ["nosotros", "Sobre nosotros"],
  ["contacto", "Contacto"],
  ["faq", "Preguntas frecuentes"],
];

export default function Footer({ onNavigate, onOpenInfo, onOpenCatalog }) {
  function go(event, id) {
    if (id === "faq" || id === "nosotros") {
      event.preventDefault();
      onOpenInfo?.(id);
      return;
    }
    if (onNavigate) {
      if (onNavigate(id) === false) event.preventDefault();
      return;
    }
    if (id === "catalogo" || id === "novedades") {
      event.preventDefault();
      onOpenCatalog?.("Todos");
    }
  }

  function openInfo(event, id) {
    event.preventDefault();
    onOpenInfo?.(id);
  }

  function toTop(event) {
    const panel = event.currentTarget.closest(".category-modal");
    (panel || window).scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-col">
          <h3>Enlaces rápidos</h3>
          <nav className="footer-links" aria-label="Pie de página">
            {LINKS.map(([id, label]) => (
              <a key={id} href={id === "faq" || id === "novedades" || id === "nosotros" ? "#" : `#${id}`} onClick={(event) => go(event, id)}>
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer-col">
          <h3>Contáctanos</h3>
          <ul className="footer-contact">
            <li>
              <PhoneIcon />
              <a href={whatsappLink("Hola, quiero más información.")} target="_blank" rel="noopener noreferrer">
                +593 99 844 4418
              </a>
            </li>
            <li>
              <InstagramIcon />
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">
                @mialysskin
              </a>
            </li>
            <li>
              <FacebookIcon />
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer">
                Mialys Skin
              </a>
            </li>
            <li>
              <ClockIcon />
              <span>
                Lun - Sáb
                <br />
                9:00 a.m. - 7:00 p.m.
              </span>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Formas de pago</h3>
          <a href="#" className="footer-pay" onClick={(event) => openInfo(event, "pagos")} aria-label="Ver métodos de pago">
            <span className="pay-logo is-visa">VISA</span>
            <span className="pay-logo is-master" aria-hidden="true">
              <i />
              <i />
            </span>
            <span className="pay-logo is-paypal">
              <b>P</b> PayPal
            </span>
          </a>
          <p className="footer-note">
            Pagos seguros
            <br />y confiables
          </p>
        </div>

        <div className="footer-col footer-ship">
          <h3>Envíos</h3>
          <TruckIcon />
          <p className="footer-note">
            Envíos a
            <br />
            todo el país
          </p>
          <a href="#" className="footer-more" onClick={(event) => openInfo(event, "envios")}>
            Ver más <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="wrap footer-bottom-bar">
          <p>© {new Date().getFullYear()} Mialys Skin. Todos los derechos reservados.</p>
          <div className="footer-social">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon solid />
            </a>
            <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TiktokIcon />
            </a>
            <a href={SOCIAL.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <PinterestIcon />
            </a>
            <button type="button" className="footer-top" aria-label="Volver arriba" onClick={toTop}>
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 15 6-6 6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Svg({ children }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function PhoneIcon() {
  return (
    <Svg>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M8 9.5c.4 2.6 2.4 4.6 5 5l1.3-1.3 2 1-.6 1.8c-4.3.2-8.6-4.1-8.4-8.4L9 7l1 2-1.3 1.3" />
    </Svg>
  );
}

function InstagramIcon() {
  return (
    <Svg>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.6" cy="7.4" r="0.6" fill="currentColor" />
    </Svg>
  );
}

function FacebookIcon({ solid = false }) {
  if (solid) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M12 3a9 9 0 0 0-1.4 17.9v-6.3H8.3V12h2.3V10c0-2.3 1.4-3.5 3.4-3.5 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4V12h2.6l-.4 2.6h-2.2v6.3A9 9 0 0 0 12 3Z" />
      </svg>
    );
  }
  return (
    <Svg>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M14.5 8.5h-1.3c-.9 0-1.4.5-1.4 1.4V20M10 13h4.5" />
    </Svg>
  );
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M14.6 3h-2.9v11.6a2.5 2.5 0 1 1-2.5-2.5c.3 0 .5 0 .8.1V9.2a5.4 5.4 0 1 0 4.6 5.4V8.7a7 7 0 0 0 4.1 1.3V7.1a4.2 4.2 0 0 1-4.1-4.1Z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.8-.1-1.9 0-2.7l1.1-4.6s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.3 0 .8-.5 2-.8 3.1-.2.9.5 1.7 1.4 1.7 1.7 0 3-1.8 3-4.4 0-2.3-1.6-3.9-4-3.9-2.7 0-4.3 2-4.3 4.2 0 .8.3 1.7.7 2.2.1.1.1.2.1.3l-.3 1.1c0 .2-.2.2-.4.1-1.2-.6-2-2.4-2-3.8 0-3.1 2.3-6 6.5-6 3.4 0 6.1 2.4 6.1 5.7 0 3.4-2.1 6.1-5.1 6.1-1 0-1.9-.5-2.2-1.1l-.6 2.3c-.2.9-.8 1.9-1.2 2.6A9 9 0 1 0 12 3Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  );
}

function TruckIcon() {
  return (
    <svg className="footer-truck" viewBox="0 0 48 36" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h24v20H4zM28 13h8l6 7v6H28" />
      <circle cx="12" cy="28" r="3.5" fill="#fff" />
      <circle cx="35" cy="28" r="3.5" fill="#fff" />
      <path d="M1 12h7M2 17h6" />
    </svg>
  );
}

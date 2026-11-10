import { useEffect, useState } from "react";
import { BagIcon, BrandMark } from "./Icons.jsx";
import SearchBar from "./SearchBar.jsx";

const CONTACT_TABS = [
  ["negocio", "Información del negocio", StoreIcon],
  ["envios", "Envíos y entregas", TruckLineIcon],
  ["pagos", "Métodos de pago", CardLineIcon],
  ["faq", "Preguntas frecuentes", HelpIcon],
  ["escribenos", "Escríbenos", MailIcon],
];

export default function Header({ count, onOpenCart, onOpenModal, onOpenInfo, onNavigate, catalogOpen = false, aboutOpen = false, linkBase = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    const sections = ["inicio", "catalogo", "contacto"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen && !contactOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setContactOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, contactOpen]);

  function chooseContact(id) {
    setContactOpen(false);
    setMenuOpen(false);
    if (id === "escribenos") onNavigate?.();
    else onOpenInfo(id);
  }

  const current = aboutOpen ? "nosotros" : catalogOpen ? "catalogo" : active;

  function leave() {
    setMenuOpen(false);
    onNavigate?.();
  }

  return (
    <header className="header">
      <div className="wrap header-bar">
        <a className="logo" href={`${linkBase}#inicio`} onClick={leave}>
          <BrandMark />
          <span className="logo-word">Mialys Skin</span>
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Cerrar" : "Menú"}
        </button>

        <nav id="site-nav" className={menuOpen ? "nav is-open" : "nav"}>
          <a
            href={`${linkBase}#inicio`}
            className={current === "inicio" ? "is-active" : undefined}
            aria-current={current === "inicio" ? "true" : undefined}
            onClick={leave}
          >
            <HomeIcon />
            Inicio
          </a>

          <button
            type="button"
            className={current === "catalogo" ? "nav-drop is-active" : "nav-drop"}
            aria-current={current === "catalogo" ? "true" : undefined}
            onClick={() => {
              setContactOpen(false);
              setMenuOpen(false);
              onOpenModal("Todos");
            }}
          >
            <GridIcon />
            Catálogo
          </button>

          <button
            type="button"
            className={current === "nosotros" ? "nav-drop is-active" : "nav-drop"}
            aria-current={current === "nosotros" ? "true" : undefined}
            onClick={() => {
              setContactOpen(false);
              setMenuOpen(false);
              onOpenInfo("nosotros");
            }}
          >
            <AboutIcon />
            Sobre Nosotros
          </button>

          <div className={contactOpen ? "nav-catalog is-open" : "nav-catalog"}>
            <button
              type="button"
              className={current === "contacto" ? "nav-drop is-active" : "nav-drop"}
              aria-expanded={contactOpen}
              aria-controls="contact-menu"
              onClick={() => setContactOpen((open) => !open)}
            >
              <MailIcon />
              Contacto
              <ChevronIcon />
            </button>
            <div id="contact-menu" className="catalog-menu contact-menu" role="menu">
              {CONTACT_TABS.map(([id, label, Icon]) => (
                <a
                  key={id}
                  role="menuitem"
                  href={id === "escribenos" ? `${linkBase}#contacto` : "#"}
                  onClick={(event) => {
                    if (id !== "escribenos") event.preventDefault();
                    chooseContact(id);
                  }}
                >
                  <Icon />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </nav>

        <SearchBar
          onPick={(next) => {
            setMenuOpen(false);
            onOpenModal(next);
          }}
        />

        <button
          type="button"
          className="cart-btn"
          aria-label={`Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
          onClick={() => {
            setMenuOpen(false);
            onOpenCart();
          }}
        >
          <BagIcon />
          {count > 0 && <span className="cart-count">{count}</span>}
        </button>
      </div>
    </header>
  );
}

function HomeIcon() {
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5 10.5 12 4.5l7.5 6V19a1 1 0 0 1-1 1h-4.2v-5.2H9.7V20H5.5a1 1 0 0 1-1-1v-8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 19.2c1.2-2.6 3.4-3.9 6.5-3.9s5.3 1.3 6.5 3.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M4 9.5 5.5 4.5h13L20 9.5M4 9.5h16M4 9.5c0 1.4 1.1 2.3 2.7 2.3S9.3 10.9 9.3 9.5c0 1.4 1.1 2.3 2.7 2.3s2.7-.9 2.7-2.3c0 1.4 1 2.3 2.6 2.3S20 10.9 20 9.5" />
      <path d="M5.5 11.7V19.5h13v-7.8M10 19.5v-4.5h4v4.5" />
    </svg>
  );
}

function TruckLineIcon() {
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M3.5 7h11v9h-11zM14.5 10h3.8l2.2 2.8V16h-6" />
      <circle cx="7.5" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  );
}

function CardLineIcon() {
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M6.5 14.5h4" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 5.5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
      <path d="M10.2 9.4a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1v.3M12 14.6h.01" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4.5 7 7.5 6L19.5 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="nav-chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

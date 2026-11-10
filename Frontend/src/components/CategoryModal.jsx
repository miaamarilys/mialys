import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Catalog from "./Catalog.jsx";
import Footer from "./Footer.jsx";

export default function CategoryModal({ category, onClose, onAdd, onOpenInfo }) {
  const panelRef = useRef(null);
  const [top, setTop] = useState(0);

  useLayoutEffect(() => {
    if (!category) return undefined;
    const header = document.querySelector(".header");
    if (!header) return undefined;
    const measure = () => setTop(header.getBoundingClientRect().bottom);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [category]);

  useEffect(() => {
    if (!category) return undefined;
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
  }, [category, onClose]);

  if (!category) return null;

  return (
    <div
      ref={panelRef}
      className="category-modal is-full"
      style={{ top, "--modal-top": `${top}px` }}
      role="dialog"
      aria-label="Catálogo"
    >
      <button type="button" className="modal-close" aria-label="Cerrar catálogo" onClick={onClose}>
        ×
      </button>
      <Catalog key={category} onAdd={onAdd} category={category} onClose={onClose} />
      <Footer
        onOpenInfo={onOpenInfo}
        onNavigate={(id) => {
          if (id === "catalogo" || id === "novedades") {
            panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            return false;
          }
          onClose();
          return true;
        }}
      />
    </div>
  );
}

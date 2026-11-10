import { useEffect, useRef, useState } from "react";
import { formatPrice, products } from "../data/products.js";

const CATEGORY_LABELS = {
  Cremas: "Cremas",
  Perfumes: "Perfumes",
  Desodorantes: "Desodorantes",
  Maquillaje: "Maquillaje",
  Capilar: "Cuidado capilar",
  Skincare: "Skincare",
  Sets: "Sets y más",
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function SearchBar({ onPick }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const term = normalize(query.trim());
  const results = term
    ? products
        .filter((product) => {
          const group = CATEGORY_LABELS[product.category || "Cremas"];
          return normalize(`${product.name} ${product.variant || ""} ${product.brand || ""} ${product.description} ${group}`).includes(term);
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function pick(product) {
    onPick(product.category || "Cremas");
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="search" ref={rootRef}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) pick(results[0]);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        />
      </form>

      {open && term && (
        <div className="search-results" role="listbox">
          {results.length === 0 ? (
            <p className="search-empty">No encontramos productos para “{query.trim()}”.</p>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => pick(product)}
              >
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.variant || CATEGORY_LABELS[product.category || "Cremas"]}</small>
                </span>
                <em>{formatPrice(product.price)}</em>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { formatPrice, products } from "../data/products.js";
import { usePhotos } from "../hooks/usePhotos.js";
import { SparklesIcon } from "./Icons.jsx";

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

export default function SearchBar({ onPick, onSelectProduct }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const { photos } = usePhotos();

  const term = normalize(query.trim());
  const results = term
    ? products
        .filter((product) => {
          const group = CATEGORY_LABELS[product.category || "Cremas"] || "";
          const brand = product.brand || "";
          const line = product.line || "";
          const label = product.label || "";
          const variant = product.variant || "";
          return normalize(
            `${product.name} ${variant} ${brand} ${line} ${label} ${product.description} ${group}`
          ).includes(term);
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
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onPick) {
      onPick(product.category || "Cremas", product.id);
    }
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
          placeholder="Buscar crema, serum, perfume..."
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
        {query && (
          <button
            type="button"
            className="search-clear-btn"
            aria-label="Borrar búsqueda"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
          >
            ×
          </button>
        )}
      </form>

      {open && term && (
        <div className="search-results has-thumbs" role="listbox">
          <div className="search-head-hint">
            <span>Resultados para “{query.trim()}” ({results.length})</span>
          </div>
          {results.length === 0 ? (
            <p className="search-empty">No encontramos productos con ese nombre o término.</p>
          ) : (
            results.map((product) => {
              const photo = photos[product.id] || product.image;
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock <= 3;

              return (
                <button
                  key={product.id}
                  type="button"
                  className="search-item-btn"
                  role="option"
                  aria-selected="false"
                  onClick={() => pick(product)}
                >
                  <div className="search-thumb">
                    {photo ? (
                      <img src={photo} alt={product.name} />
                    ) : (
                      <div className="search-thumb-fallback"><SparklesIcon size={16} /></div>
                    )}
                  </div>
                  <div className="search-info">
                    <span className="search-name">{product.name}</span>
                    <span className="search-meta">
                      <span className="search-brand-tag">{product.line ? `${product.brand} ${product.line}` : product.brand}</span>
                      {product.variant ? <span className="search-variant">{product.variant}</span> : null}
                    </span>
                    {isOutOfStock ? (
                      <span className="search-stock-tag is-out">Agotado</span>
                    ) : isLowStock ? (
                      <span className="search-stock-tag is-low">¡Últimas {product.stock} unid.!</span>
                    ) : null}
                  </div>
                  <div className="search-side">
                    <em className="search-price">{formatPrice(product.price)}</em>
                    <span className="search-category-pill">
                      {CATEGORY_LABELS[product.category || "Cremas"]}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

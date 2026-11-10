import { useEffect, useMemo, useRef, useState } from "react";
import CreamJar from "./CreamJar.jsx";
import { formatPrice, products, SKIN_TYPES, whatsappLink } from "../data/products.js";

const CATEGORIES = [
  ["Cremas", "Cremas"],
  ["Perfumes", "Perfumes"],
  ["Desodorantes", "Desodorantes"],
  ["Maquillaje", "Maquillaje"],
  ["Capilar", "Cuidado capilar"],
  ["Skincare", "Skincare"],
  ["Sets", "Sets y más"],
];

const PRICES = [
  ["bajo", "Hasta $15.00", (price) => price <= 15],
  ["medio", "$15.00 - $30.00", (price) => price > 15 && price <= 30],
  ["alto", "Más de $30.00", (price) => price > 30],
];

const SORTS = [
  ["populares", "Más populares"],
  ["menor", "Menor precio"],
  ["mayor", "Mayor precio"],
  ["nombre", "Nombre (A - Z)"],
];

const groupOf = (product) => product.category || "Cremas";
const brandOf = (product) => (product.line ? `${product.brand} ${product.line}` : product.brand);
const fullName = (product) => (product.variant ? `${product.name} - ${product.variant}` : product.name);

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function Catalog({ onAdd, category = "Todos", onClose }) {
  const [categories, setCategories] = useState(category === "Todos" ? [] : [category]);
  const [skins, setSkins] = useState([]);
  const [prices, setPrices] = useState([]);
  const [sort, setSort] = useState("populares");
  const [view, setView] = useState("grid");
  const [open, setOpen] = useState({ categoria: true, piel: true, precio: false });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [photos, setPhotos] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [addedId, setAddedId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const detail = products.find((product) => product.id === detailId);

  const showSkins = categories.includes("Cremas");

  const visible = useMemo(() => {
    const list = products.filter((product) => {
      if (categories.length && !categories.includes(groupOf(product))) return false;
      if (showSkins && skins.length && product.skin && !skins.includes(product.skin)) return false;
      if (prices.length && !PRICES.some(([id, , test]) => prices.includes(id) && test(product.price))) return false;
      return true;
    });
    if (sort === "menor") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "mayor") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "nombre") return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
    return list;
  }, [categories, skins, prices, sort, showSkins]);

  const activeCount = categories.length + (showSkins ? skins.length : 0) + prices.length;

  useEffect(() => {
    fetch("/api/photos")
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => setPhotos(data))
      .catch(() => setPhotos({}));
  }, []);

  function clearAll() {
    setCategories([]);
    setSkins([]);
    setPrices([]);
  }

  async function handlePhoto(productId, file) {
    if (!file || uploadingId) return;

    setUploadingId(productId);
    setUploadError("");
    const body = new FormData();
    body.append("photo", file);

    try {
      const response = await fetch(`/api/photos/${productId}`, { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "No se pudo subir la foto.");
      }
      setPhotos((current) => ({ ...current, [productId]: data.url }));
    } catch (error) {
      setUploadError(
        error.message === "Failed to fetch"
          ? "No se pudo subir la foto. Revisa que el backend esté en marcha."
          : error.message
      );
    } finally {
      setUploadingId(null);
      setDragId(null);
    }
  }

  function handleAdd(product) {
    onAdd({ ...product, name: fullName(product) });
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((current) => (current === product.id ? null : current));
    }, 1400);
  }

  function countFor(test) {
    return products.filter(test).length;
  }

  return (
    <section id={onClose ? undefined : "catalogo"} className="shop">
      <div className="shop-hero">
        <div className="shop-wrap shop-hero-inner">
          <div>
            <h2>Catálogo</h2>
            <p>Encuentra tus productos favoritos</p>
          </div>
          <nav className="shop-crumbs" aria-label="Ruta">
            <a
              href="/#inicio"
              onClick={(event) => {
                if (!onClose) return;
                event.preventDefault();
                onClose();
              }}
            >
              Inicio
            </a>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Catálogo</span>
          </nav>
        </div>
      </div>

      <div className="shop-wrap shop-body">
        <aside className={filtersOpen ? "shop-filters is-open" : "shop-filters"} aria-label="Filtros">
          <div className="shop-filters-head">
            <h3>Filtros</h3>
            <button type="button" className="shop-clear" onClick={clearAll} disabled={!activeCount}>
              Limpiar todo
            </button>
          </div>

          <FilterGroup id="categoria" title="Categoría" open={open} setOpen={setOpen}>
            {CATEGORIES.map(([id, label]) => (
              <Check
                key={id}
                label={label}
                count={countFor((product) => groupOf(product) === id)}
                checked={categories.includes(id)}
                onChange={() => setCategories((current) => toggle(current, id))}
              />
            ))}
          </FilterGroup>

          {showSkins && (
            <FilterGroup id="piel" title="Tipo de piel" open={open} setOpen={setOpen}>
              {SKIN_TYPES.map((skin) => (
                <Check
                  key={skin}
                  label={skin}
                  count={countFor((product) => product.skin === skin)}
                  checked={skins.includes(skin)}
                  onChange={() => setSkins((current) => toggle(current, skin))}
                />
              ))}
            </FilterGroup>
          )}

          <FilterGroup id="precio" title="Precio" open={open} setOpen={setOpen}>
            {PRICES.map(([id, label, test]) => (
              <Check
                key={id}
                label={label}
                count={countFor((product) => test(product.price))}
                checked={prices.includes(id)}
                onChange={() => setPrices((current) => toggle(current, id))}
              />
            ))}
          </FilterGroup>
        </aside>

        <div className="shop-main">
          <div className="shop-toolbar">
            <button
              type="button"
              className="shop-filter-toggle"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((value) => !value)}
            >
              Filtros{activeCount ? ` (${activeCount})` : ""}
            </button>
            <label className="shop-sort">
              Ordenar por:
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                {SORTS.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <p className="shop-count">
              {visible.length} {visible.length === 1 ? "producto" : "productos"}
            </p>
            <div className="shop-views" role="group" aria-label="Vista">
              <button
                type="button"
                className={view === "grid" ? "is-active" : undefined}
                aria-pressed={view === "grid"}
                aria-label="Ver en cuadrícula"
                onClick={() => setView("grid")}
              >
                <GridIcon />
              </button>
              <button
                type="button"
                className={view === "list" ? "is-active" : undefined}
                aria-pressed={view === "list"}
                aria-label="Ver en lista"
                onClick={() => setView("list")}
              >
                <ListIcon />
              </button>
            </div>
          </div>

          {uploadError && (
            <p className="field-error catalog-error" role="alert">
              {uploadError}
            </p>
          )}

          {visible.length === 0 ? (
            <div className="shop-empty">
              <p>No encontramos productos con esos filtros.</p>
              <button type="button" className="shop-clear" onClick={clearAll}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className={view === "list" ? "shop-grid is-list" : "shop-grid"}>
              {visible.map((product) => {
                const photo = photos[product.id];
                const uploading = uploadingId === product.id;

                return (
                  <article className="shop-card" key={product.id}>
                    <div
                      className={`shop-photo${photo ? " has-photo" : ""}${dragId === product.id ? " is-dragover" : ""}`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragId(product.id);
                      }}
                      onDragLeave={() => setDragId((current) => (current === product.id ? null : current))}
                      onDrop={(event) => {
                        event.preventDefault();
                        const file = event.dataTransfer.files?.[0];
                        if (file) handlePhoto(product.id, file);
                      }}
                    >
                      {photo ? (
                        <img src={photo} alt={product.name} />
                      ) : product.skin ? (
                        <CreamJar body={product.body} cap={product.cap} label={product.label} />
                      ) : null}
                      {product.badge && <span className="shop-badge">{product.badge}</span>}
                      <button
                        type="button"
                        className="shop-photo-open"
                        aria-label={`Ver detalles de ${fullName(product)}`}
                        onClick={() => setDetailId(product.id)}
                      />
                      <label className={photo || product.skin ? "shop-upload" : "shop-upload is-empty"}>
                        {uploading ? "Subiendo…" : photo ? "Cambiar imagen" : "Agregar imagen"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          disabled={Boolean(uploadingId)}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (file) handlePhoto(product.id, file);
                          }}
                        />
                      </label>
                    </div>
                    <div className="shop-card-body">
                      <p className="shop-brand">{brandOf(product)}</p>
                      {!product.hideName && (
                        <h3>
                          <button type="button" className="shop-name" onClick={() => setDetailId(product.id)}>
                            {product.name}
                          </button>
                        </h3>
                      )}
                      {(product.variant || product.skin) && (
                        <p className={product.hideName ? "shop-skin is-plain" : "shop-skin"}>{product.variant || product.skin}</p>
                      )}
                      <p className="shop-desc">{product.description}</p>
                      <div className="shop-card-foot">
                        <p className="shop-price">{formatPrice(product.price)}</p>
                        <a
                          className="shop-wa"
                          href={whatsappLink(`Hola, quiero pedir ${fullName(product)} de ${product.brand} (${formatPrice(product.price)}).`)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Pedir por WhatsApp
                        </a>
                        <button
                          type="button"
                          className={addedId === product.id ? "shop-add is-added" : "shop-add"}
                          aria-label={`Añadir ${product.name} al carrito`}
                          onClick={() => handleAdd(product)}
                        >
                          {addedId === product.id ? "✓" : <CartIcon />}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {detail && (
        <ProductDetail
          product={detail}
          photo={photos[detail.id]}
          onAdd={(qty) => {
            for (let i = 0; i < qty; i += 1) onAdd({ ...detail, name: fullName(detail) });
          }}
          onClose={() => setDetailId(null)}
        />
      )}
    </section>
  );
}

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES);

function ProductDetail({ product, photo, onAdd, onClose }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      if (zoom) setZoom(false);
      else onClose();
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose, zoom]);

  const name = fullName(product);

  return (
    <div className="detail-backdrop" onClick={onClose}>
      <div
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-label={name}
        onClick={(event) => event.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="detail-close" aria-label="Cerrar detalles" onClick={onClose}>
          ×
        </button>

        <div className={photo ? "detail-photo has-photo" : "detail-photo"}>
          {photo ? (
            <button type="button" className="detail-zoom" aria-label="Ampliar foto" onClick={() => setZoom(true)}>
              <img src={photo} alt={name} />
            </button>
          ) : product.skin ? (
            <CreamJar body={product.body} cap={product.cap} label={product.label} />
          ) : (
            <p className="detail-nophoto">Sin foto todavía</p>
          )}
          {product.badge && <span className="shop-badge">{product.badge}</span>}
          {photo && <span className="detail-hint">Toca la foto para ampliarla</span>}
        </div>

        <div className="detail-info">
          <p className="shop-brand">
            {brandOf(product)} · {CATEGORY_LABELS[groupOf(product)]}
          </p>
          <h3>{product.name}</h3>
          {product.variant && <p className="detail-variant">{product.variant}</p>}
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p className="detail-desc">{product.description}</p>

          <dl className="detail-specs">
            <div>
              <dt>Marca</dt>
              <dd>{brandOf(product)}</dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>{CATEGORY_LABELS[groupOf(product)]}</dd>
            </div>
            {product.variant && (
              <div>
                <dt>{product.variantLabel || "Aroma"}</dt>
                <dd>{product.variant}</dd>
              </div>
            )}
            {product.skin && (
              <div>
                <dt>Tipo de piel</dt>
                <dd>{product.skin.replace("Piel ", "")}</dd>
              </div>
            )}
          </dl>

          <div className="detail-buy">
            <div className="detail-qty" role="group" aria-label="Cantidad">
              <button type="button" aria-label="Quitar uno" onClick={() => setQty((value) => Math.max(1, value - 1))}>
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="Agregar uno" onClick={() => setQty((value) => value + 1)}>
                +
              </button>
            </div>
            <button
              type="button"
              className="detail-add"
              onClick={() => {
                onAdd(qty);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1400);
              }}
            >
              <CartIcon /> {added ? "¡Añadido!" : "Añadir al carrito"}
            </button>
          </div>
          <a
            className="detail-wa"
            href={whatsappLink(`Hola, quiero pedir ${qty} x ${name} de ${product.brand} (${formatPrice(product.price * qty)}).`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pedir por WhatsApp
          </a>
        </div>
      </div>

      {zoom && photo && (
        <div
          className="detail-lightbox"
          onClick={(event) => {
            event.stopPropagation();
            setZoom(false);
          }}
        >
          <img src={photo} alt={name} />
          <button type="button" className="detail-close" aria-label="Cerrar foto ampliada">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ id, title, open, setOpen, children }) {
  const isOpen = open[id];
  return (
    <div className="shop-group">
      <button
        type="button"
        className="shop-group-head"
        aria-expanded={isOpen}
        onClick={() => setOpen((current) => ({ ...current, [id]: !current[id] }))}
      >
        {title}
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="shop-group-body">{children}</div>}
    </div>
  );
}

function Check({ label, count, checked, onChange }) {
  return (
    <label className="shop-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
      <small>{count}</small>
    </label>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <circle cx="5" cy="6.5" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="5" cy="17.5" r="1" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 4.5h2.2l2 10.2h10.1l1.9-7.2H6.6" />
      <circle cx="9.5" cy="18.8" r="1.3" />
      <circle cx="16.5" cy="18.8" r="1.3" />
    </svg>
  );
}

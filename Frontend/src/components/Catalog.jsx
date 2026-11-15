import { useEffect, useMemo, useRef, useState } from "react";
import CreamJar from "./CreamJar.jsx";
import {
  formatPrice,
  products,
  SKIN_TYPES,
  whatsappLink,
  BRAND_FILTERS,
  productMatchesBrand,
} from "../data/products.js";
import { usePhotos } from "../hooks/usePhotos.js";
import { getProducts } from "../services/productService.js";
import { FlameIcon, CheckIcon, AlertTriangleIcon, CloseIcon } from "./Icons.jsx";

const CATEGORIES = [
  ["Cremas", "Cremas"],
  ["Perfumes", "Perfumes"],
  ["Desodorantes", "Desodorantes"],
  ["Maquillaje", "Maquillaje"],
  ["Capilar", "Cuidado capilar"],
  ["Skincare", "Skincare"],
  ["Sets", "Sets y más"],
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

export default function Catalog({
  onAdd,
  category = "Todos",
  onClose,
  cart = [],
  onUpdateQty,
  initialProductId = null,
}) {
  const [productList, setProductList] = useState(products);
  const [categories, setCategories] = useState(category === "Todos" ? [] : [category]);
  const [brands, setBrands] = useState([]);
  const [skins, setSkins] = useState([]);
  const [maxPrice, setMaxPrice] = useState(55);
  const [sort, setSort] = useState("populares");
  const [view, setView] = useState("grid");
  const [open, setOpen] = useState({ categoria: true, marca: true, piel: false, precio: true });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { photos } = usePhotos();
  const [addedId, setAddedId] = useState(null);
  const [detailId, setDetailId] = useState(initialProductId);
  const detail = productList.find((product) => product.id === detailId);

  useEffect(() => {
    async function sync() {
      const live = await getProducts(false);
      setProductList(live);
    }
    sync();
    window.addEventListener("mialys-catalog-updated", sync);
    return () => window.removeEventListener("mialys-catalog-updated", sync);
  }, []);

  useEffect(() => {
    if (initialProductId) setDetailId(initialProductId);
  }, [initialProductId]);

  const showSkins = categories.includes("Cremas");

  const visible = useMemo(() => {
    const list = productList.filter((product) => {
      if (categories.length && !categories.includes(groupOf(product))) return false;
      if (brands.length && !brands.some((b) => productMatchesBrand(product, b))) return false;
      if (showSkins && skins.length && product.skin && !skins.includes(product.skin)) return false;
      if (product.price > maxPrice) return false;
      return true;
    });
    if (sort === "menor") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "mayor") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "nombre") return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
    return list;
  }, [productList, categories, brands, skins, maxPrice, sort, showSkins]);

  const activeCount =
    categories.length +
    brands.length +
    (showSkins ? skins.length : 0) +
    (maxPrice < 55 ? 1 : 0);

  function clearAll() {
    setCategories([]);
    setBrands([]);
    setSkins([]);
    setMaxPrice(55);
  }

  function handleAdd(product) {
    if (product.stock === 0) return;
    onAdd({ ...product, name: fullName(product) });
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((current) => (current === product.id ? null : current));
    }, 1400);
  }

  function countFor(test) {
    return productList.filter(test).length;
  }

  return (
    <section id={onClose ? undefined : "catalogo"} className="shop">
      <div className="shop-hero">
        <div className="shop-wrap shop-hero-inner">
          <div>
            <h2>Catálogo</h2>
            <p>Encuentra tus productos favoritos y aprovecha envío gratis en compras mayores a $35</p>
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

          <FilterGroup id="marca" title="Marca / Línea" open={open} setOpen={setOpen}>
            {BRAND_FILTERS.map((brandName) => (
              <Check
                key={brandName}
                label={brandName}
                count={countFor((p) => productMatchesBrand(p, brandName))}
                checked={brands.includes(brandName)}
                onChange={() => setBrands((current) => toggle(current, brandName))}
              />
            ))}
          </FilterGroup>

          <FilterGroup id="precio" title="Precio máximo" open={open} setOpen={setOpen}>
            <div className="price-slider-box">
              <div className="price-slider-header">
                <span>Presupuesto:</span>
                <strong className="price-slider-value">Hasta {formatPrice(maxPrice)}</strong>
              </div>
              <input
                type="range"
                min="6"
                max="55"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="price-range-input"
                aria-label="Precio máximo"
              />
              <div className="price-slider-ticks">
                <span>$6</span>
                <span>$30</span>
                <span>$55</span>
              </div>
              <div className="price-quick-tags">
                <button
                  type="button"
                  className={maxPrice === 15 ? "price-tag is-active" : "price-tag"}
                  onClick={() => setMaxPrice(15)}
                >
                  ≤ $15
                </button>
                <button
                  type="button"
                  className={maxPrice === 25 ? "price-tag is-active" : "price-tag"}
                  onClick={() => setMaxPrice(25)}
                >
                  ≤ $25
                </button>
                <button
                  type="button"
                  className={maxPrice === 35 ? "price-tag is-active" : "price-tag"}
                  onClick={() => setMaxPrice(35)}
                >
                  ≤ $35
                </button>
                <button
                  type="button"
                  className={maxPrice >= 55 ? "price-tag is-active" : "price-tag"}
                  onClick={() => setMaxPrice(55)}
                >
                  Todos
                </button>
              </div>
            </div>
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

          {visible.length === 0 ? (
            <div className="shop-empty">
              <p>No encontramos productos con esos filtros o rango de precio.</p>
              <button type="button" className="shop-clear" onClick={clearAll}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className={view === "list" ? "shop-grid is-list" : "shop-grid"}>
              {visible.map((product) => {
                const photo = photos[product.id] || product.image;
                const inCartItem = cart.find((item) => item.id === product.id);
                const cartQty = inCartItem ? inCartItem.qty : 0;
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= 3;
                const reachedLimit = Boolean(product.stock && cartQty >= product.stock);

                // Clasificación de badge
                let badgeClass = "shop-badge";
                let badgeLabel = product.badge;

                if (isOutOfStock) {
                  badgeLabel = "Agotado";
                  badgeClass = "shop-badge is-out";
                } else if (isLowStock) {
                  badgeLabel = "Pocas unidades";
                  badgeClass = "shop-badge is-low";
                } else if (product.badge === "Más vendido") {
                  badgeClass = "shop-badge is-hot";
                } else if (product.badge === "Nuevo aroma" || product.badge === "Nuevo") {
                  badgeClass = "shop-badge is-new";
                } else if (
                  product.badge === "Descuento por tiempo limitado" ||
                  product.badge === "Oferta"
                ) {
                  badgeClass = "shop-badge is-sale";
                }

                return (
                  <article
                    className={`shop-card${cartQty > 0 ? " is-in-cart" : ""}${isOutOfStock ? " is-out-of-stock" : ""}`}
                    key={product.id}
                  >
                    <div className={photo ? "shop-photo has-photo" : "shop-photo"}>
                      {photo ? (
                        <img src={photo} alt={product.name} />
                      ) : product.skin ? (
                        <CreamJar body={product.body} cap={product.cap} label={product.label} />
                      ) : null}
                      {badgeLabel && <span className={badgeClass}>{badgeLabel}</span>}
                      {cartQty > 0 && <span className="shop-cart-pill">En carrito ({cartQty})</span>}
                      <button
                        type="button"
                        className="shop-photo-open"
                        aria-label={`Ver detalles de ${fullName(product)}`}
                        onClick={() => setDetailId(product.id)}
                      />
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
                        <p className={product.hideName ? "shop-skin is-plain" : "shop-skin"}>
                          {product.variant || product.skin}
                        </p>
                      )}
                      <p className="shop-desc">{product.description}</p>

                      {/* Notificación de urgencia si queda poco stock */}
                      {isLowStock && (
                        <div className="shop-stock-pill is-low">
                          <FlameIcon size={13} /> ¡Solo {product.stock === 1 ? "queda 1 unidad" : `quedan ${product.stock} unidades`}!
                        </div>
                      )}

                      <div className="shop-card-foot">
                        <p className="shop-price">{formatPrice(product.price)}</p>
                        <a
                          className="shop-wa"
                          href={whatsappLink(
                            `Hola, quiero pedir ${fullName(product)} de ${product.brand} (${formatPrice(product.price)}).`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>

                        {isOutOfStock ? (
                          <button
                            type="button"
                            className="shop-add is-out"
                            disabled
                            title="Producto temporalmente agotado"
                          >
                            Agotado
                          </button>
                        ) : cartQty > 0 ? (
                          <div className="shop-qty-box" title={`${cartQty} en el carrito`}>
                            <button
                              type="button"
                              className="shop-qty-btn"
                              aria-label={`Quitar uno de ${product.name}`}
                              onClick={() => (onUpdateQty ? onUpdateQty(product.id, cartQty - 1) : null)}
                            >
                              −
                            </button>
                            <span className="shop-qty-val">{cartQty}</span>
                            <button
                              type="button"
                              className={`shop-qty-btn${reachedLimit ? " is-disabled" : ""}`}
                              disabled={reachedLimit}
                              title={reachedLimit ? "Límite de stock disponible alcanzado" : "Agregar uno más"}
                              aria-label={`Agregar otro ${product.name}`}
                              onClick={() => {
                                if (!reachedLimit) {
                                  if (onUpdateQty) onUpdateQty(product.id, cartQty + 1);
                                  else handleAdd(product);
                                }
                              }}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={addedId === product.id ? "shop-add is-added" : "shop-add"}
                            aria-label={`Añadir ${product.name} al carrito`}
                            onClick={() => handleAdd(product)}
                          >
                            {addedId === product.id ? <CheckIcon size={14} /> : <CartIcon />}
                          </button>
                        )}
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
          photo={photos[detail.id] || detail.image}
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

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const maxAvailable = product.stock || 1;

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

          {/* Estado de stock en el detalle */}
          <div className="detail-stock-indicator">
            {isOutOfStock ? (
              <span className="stock-pill is-out"><CloseIcon size={13} /> Producto agotado</span>
            ) : isLowStock ? (
              <span className="stock-pill is-low">
                <FlameIcon size={13} /> ¡Pocas unidades! Solo {product.stock === 1 ? "queda 1 unidad" : `quedan ${product.stock} disponibles`}
              </span>
            ) : (
              <span className="stock-pill is-ok"><CheckIcon size={13} /> En stock ({product.stock} disponibles)</span>
            )}
          </div>

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
              <button
                type="button"
                aria-label="Quitar uno"
                disabled={isOutOfStock || qty <= 1}
                onClick={() => setQty((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                aria-label="Agregar uno"
                disabled={isOutOfStock || qty >= maxAvailable}
                onClick={() => setQty((value) => Math.min(maxAvailable, value + 1))}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={`detail-add${isOutOfStock ? " is-out" : ""}`}
              disabled={isOutOfStock}
              onClick={() => {
                if (isOutOfStock) return;
                onAdd(qty);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1400);
              }}
            >
              <CartIcon /> {isOutOfStock ? "Agotado" : added ? "¡Añadido!" : "Añadir al carrito"}
            </button>
          </div>
          <a
            className="detail-wa"
            href={whatsappLink(
              `Hola, quiero pedir ${qty} x ${name} de ${product.brand} (${formatPrice(product.price * qty)}).`
            )}
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

import { useEffect, useState } from "react";
import { getFeaturedProducts } from "../services/productService.js";
import { formatPrice } from "../data/products.js";
import { usePhotos } from "../hooks/usePhotos.js";
import { SparklesIcon, FlameIcon, CheckIcon, LockIcon } from "./Icons.jsx";

export default function Featured({ onAdd, onOpenCatalog, onSelectProduct }) {
  const { photos } = usePhotos();
  const [featuredList, setFeaturedList] = useState([]);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadFeatured() {
      const list = await getFeaturedProducts();
      if (active) setFeaturedList(list);
    }

    loadFeatured();

    function handleCatalogUpdate() {
      loadFeatured();
    }

    window.addEventListener("mialys-catalog-updated", handleCatalogUpdate);
    return () => {
      active = false;
      window.removeEventListener("mialys-catalog-updated", handleCatalogUpdate);
    };
  }, []);

  function handleAdd(product, e) {
    e?.stopPropagation?.();
    onAdd(product);
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((current) => (current === product.id ? null : current));
    }, 1500);
  }

  function handleCardClick(product) {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onOpenCatalog) {
      onOpenCatalog(product.category || "Todos");
    }
  }

  return (
    <section className="featured-section" aria-label="Productos destacados">
      <div className="wrap">
        {/* Cabecera elegante y amplia */}
        <div className="featured-header">
          <div className="featured-header-text">
            <span className="featured-eyebrow"><SparklesIcon size={14} /> Selección Exclusiva</span>
            <h2>
              Productos Destacados
              <svg className="featured-heart" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 19s-6.2-3.8-8-7.4C2.6 8.6 3.6 5.6 6.4 5.1 8.4 4.7 10 5.7 12 8c2-2.3 3.6-3.3 5.6-2.9 2.8.5 3.8 3.5 2.4 6.5-1.8 3.6-8 7.4-8 7.4Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </h2>
            <p className="featured-subtitle">
              Los favoritos de nuestra comunidad para el cuidado diario, nutrición y bienestar de tu piel.
            </p>
          </div>
          <button
            type="button"
            className="featured-view-all-btn"
            onClick={() => onOpenCatalog ? onOpenCatalog("Todos") : null}
          >
            Explorar catálogo completo <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* Grid de 4 columnas en desktop */}
        <div className="featured-grid-modern">
          {featuredList.map((product) => {
            const photo = photos[product.id] || product.image;
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock > 0 && product.stock <= 3;

            // Badges
            let badgeClass = "featured-badge";
            let badgeLabel = product.badge;

            if (isOutOfStock) {
              badgeLabel = "Agotado";
              badgeClass = "featured-badge is-out";
            } else if (isLowStock) {
              badgeLabel = "Pocas unidades";
              badgeClass = "featured-badge is-low";
            } else if (product.badge === "Más vendido") {
              badgeClass = "featured-badge is-hot";
            } else if (product.badge === "Nuevo aroma" || product.badge === "Nuevo") {
              badgeClass = "featured-badge is-new";
            } else if (
              product.badge === "Descuento por tiempo limitado" ||
              product.badge === "Oferta"
            ) {
              badgeClass = "featured-badge is-sale";
            }

            return (
              <article
                className={`featured-card-item${isOutOfStock ? " is-out-of-stock" : ""}`}
                key={product.id}
                onClick={() => handleCardClick(product)}
              >
                {/* Contenedor de Imagen con efecto Zoom */}
                <div className="featured-photo-wrap">
                  {photo ? (
                    <img src={photo} alt={product.name} loading="lazy" />
                  ) : null}

                  {badgeLabel && <span className={badgeClass}>{badgeLabel}</span>}

                  <span className="featured-brand-pill">
                    {product.line ? `${product.brand} ${product.line}` : product.brand}
                  </span>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="featured-card-content">
                  {product.skin && (
                    <span className="featured-skin-tag">{product.skin}</span>
                  )}

                  <h3 className="featured-card-title">{product.name}</h3>

                  {product.variant && (
                    <p className="featured-card-variant">{product.variant}</p>
                  )}

                  {isLowStock && (
                    <p className="featured-stock-urgency">
                      <FlameIcon size={14} /> ¡Solo quedan {product.stock} unidades!
                    </p>
                  )}

                  <div className="featured-card-bottom">
                    <div className="featured-price-box">
                      <span className="featured-price-label">Precio</span>
                      <strong className="featured-price-value">
                        {formatPrice(product.price)}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className={`featured-add-btn${addedId === product.id ? " is-added" : ""}`}
                      disabled={isOutOfStock}
                      onClick={(e) => handleAdd(product, e)}
                      aria-label={`Añadir ${product.name} al carrito`}
                    >
                      {isOutOfStock ? (
                        "Agotado"
                      ) : addedId === product.id ? (
                        <>¡Añadido! <CheckIcon size={14} /></>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M6.5 8.5h11l-.7 9.2a1.4 1.4 0 0 1-1.4 1.3H8.6a1.4 1.4 0 0 1-1.4-1.3L6.5 8.5Z" />
                            <path d="M9 8.5V7.4A3 3 0 0 1 12 4.4a3 3 0 0 1 3 3v1.1" strokeLinecap="round" />
                          </svg>
                          Agregar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Banner Promocional de Alto Impacto */}
        <div className="featured-promo-banner">
          <div className="promo-banner-text">
            <span className="promo-banner-tag">Promoción Especial de Temporada</span>
            <h3>
              Descubre nuestras mejores ofertas y rituales de belleza
            </h3>
            <p>
              Productos 100% originales Natura y Avon. Aprovecha <strong>Envío Gratis</strong> en compras superiores a $35 y <strong>10% de descuento</strong> con el cupón <code>BIENVENIDA10</code>.
            </p>
            <div className="promo-banner-actions">
              <button
                type="button"
                className="promo-btn-primary"
                onClick={() => onOpenCatalog ? onOpenCatalog("Todos") : null}
              >
                Ver Todas las Ofertas <span aria-hidden="true">→</span>
              </button>
              <span className="promo-guarantee-note"><LockIcon size={14} /> Garantía de satisfacción y pago seguro</span>
            </div>
          </div>

          <div className="promo-banner-media">
            <img
              src="/productos/natura-set-avellana-cassis.png"
              alt="Set de Cuidado Diario Natura"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

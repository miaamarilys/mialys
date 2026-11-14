import { useState, useEffect } from "react";
import { formatPrice, WHATSAPP_DISPLAY, whatsappLink, buildOrderMessage } from "../services/cartService.js";
import { calculateCartSummary, COUPONS } from "../data/products.js";
import {
  TrashIcon,
  SparklesIcon,
  TruckIcon,
  TicketIcon,
  CloseIcon,
  CreditCardIcon,
  WhatsAppIcon,
} from "./Icons.jsx";

export default function CartDrawer({ open, items, onClose, onQty, onOpenCardPay }) {
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponFeedback, setCouponFeedback] = useState({ type: "", text: "" });

  const summary = calculateCartSummary(items, appliedCoupon);
  const message = buildOrderMessage(items, summary.total);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleApplyCoupon(e) {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (!COUPONS[code]) {
      setCouponFeedback({ type: "error", text: "Cupón no válido o no reconocido." });
      return;
    }

    const coupon = COUPONS[code];
    if (summary.subtotal < coupon.minSubtotal) {
      setCouponFeedback({
        type: "error",
        text: `Este cupón requiere una compra mínima de ${formatPrice(coupon.minSubtotal)}.`,
      });
      return;
    }

    setAppliedCoupon(code);
    setCouponFeedback({ type: "success", text: `¡Cupón ${code} aplicado correctamente!` });
    setCouponInput("");
  }

  function handleRemoveCoupon() {
    setAppliedCoupon("");
    setCouponFeedback({ type: "", text: "" });
  }

  return (
    <div className="drawer-root">
      <button type="button" className="drawer-backdrop" aria-label="Cerrar carrito" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="drawer-head">
          <h2 id="cart-title">Carrito ({items.reduce((s, i) => s + i.qty, 0)})</h2>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Cerrar carrito" title="Cerrar carrito">
            <CloseIcon size={20} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Tu carrito está vacío.</p>
            <a className="btn" href="#catalogo" onClick={onClose}>
              Ver Catálogo
            </a>
          </div>
        ) : (
          <>
            {/* Barra de progreso de envío gratis */}
            <div className="free-shipping-card">
              <div className="free-shipping-info">
                {summary.isFreeShipping ? (
                  <span className="free-shipping-msg is-success">
                    <SparklesIcon size={16} /> ¡Felicidades! Tienes <strong>ENVÍO GRATIS</strong> a todo el país
                  </span>
                ) : (
                  <span className="free-shipping-msg">
                    <TruckIcon size={16} /> Agrega <strong>{formatPrice(summary.neededForFreeShipping)}</strong> más para obtener <strong>ENVÍO GRATIS</strong>
                  </span>
                )}
              </div>
              <div className="free-shipping-track">
                <div
                  className={`free-shipping-fill${summary.isFreeShipping ? " is-completed" : ""}`}
                  style={{ width: `${summary.progressPercent}%` }}
                />
              </div>
            </div>

            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{formatPrice(item.price)}</p>
                  </div>
                  <div className="qty">
                    <button
                      type="button"
                      onClick={() => onQty(item.id, item.qty - 1)}
                      aria-label={`Quitar una unidad de ${item.name}`}
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => onQty(item.id, item.qty + 1)}
                      aria-label={`Agregar una unidad de ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart-delete-btn"
                    onClick={() => onQty(item.id, 0)}
                    aria-label={`Eliminar ${item.name} del carrito`}
                    title="Eliminar producto"
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>

            {/* Sección de Cupones */}
            <div className="cart-coupon-section">
              {appliedCoupon ? (
                <div className="coupon-active-badge">
                  <span><TicketIcon size={16} /> Cupón <strong>{appliedCoupon}</strong> aplicado ({summary.couponApplied?.description})</span>
                  <button type="button" className="coupon-remove-btn" onClick={handleRemoveCoupon} title="Quitar cupón" aria-label="Quitar cupón">
                    <CloseIcon size={14} />
                  </button>
                </div>
              ) : (
                <form className="coupon-form" onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    placeholder="Código de cupón (ej: BIENVENIDA10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="coupon-input"
                    aria-label="Código de cupón"
                  />
                  <button type="submit" className="coupon-apply-btn" disabled={!couponInput.trim()}>
                    Aplicar
                  </button>
                </form>
              )}

              {couponFeedback.text && (
                <p className={`coupon-feedback is-${couponFeedback.type}`}>
                  {couponFeedback.text}
                </p>
              )}

              <div className="coupon-hints">
                <small>Prueba: <code>BIENVENIDA10</code> (10% OFF) o <code>ENVIOGRATIS</code></small>
              </div>
            </div>

            <footer className="drawer-foot">
              <div className="cart-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="breakdown-row is-discount">
                    <span>Descuento cupón</span>
                    <span>-{formatPrice(summary.discount)}</span>
                  </div>
                )}
                <div className="breakdown-row">
                  <span>Envío</span>
                  <span className={summary.shipping === 0 ? "shipping-free-tag" : undefined}>
                    {summary.shipping === 0 ? "¡GRATIS!" : formatPrice(summary.shipping)}
                  </span>
                </div>
                <div className="breakdown-row is-total">
                  <span>Total</span>
                  <strong>{formatPrice(summary.total)}</strong>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-card-pay"
                onClick={() => {
                  onClose();
                  onOpenCardPay?.(summary);
                }}
              >
                <CreditCardIcon size={18} /> Pagar con Tarjeta ({formatPrice(summary.total)})
              </button>
              <a
                className="btn btn-wa-secondary"
                href={whatsappLink(message)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={18} /> O coordinar por WhatsApp
              </a>
              <p className="pay-note">Atención directa con {WHATSAPP_DISPLAY}</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

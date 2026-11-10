import { useEffect } from "react";
import { formatPrice, WHATSAPP_DISPLAY, whatsappLink } from "../data/products.js";

export default function CartDrawer({ open, items, onClose, onQty }) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const message = [
    "Hola, quiero hacer este pedido de Mialys Skin:",
    ...items.map((item) => `• ${item.name} x${item.qty} — ${formatPrice(item.price * item.qty)}`),
    `Total: ${formatPrice(total)}`,
  ].join("\n");

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

  return (
    <div className="drawer-root">
      <button type="button" className="drawer-backdrop" aria-label="Cerrar carrito" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="drawer-head">
          <h2 id="cart-title">Carrito</h2>
          <button type="button" className="text-btn" onClick={onClose}>
            Cerrar
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
                  <button type="button" className="text-btn" onClick={() => onQty(item.id, 0)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
            <footer className="drawer-foot">
              <p>
                Total <strong>{formatPrice(total)}</strong>
              </p>
              <a
                className="btn"
                href={whatsappLink(message)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pagar por WhatsApp
              </a>
              <p className="pay-note">Se abre un chat con {WHATSAPP_DISPLAY}</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

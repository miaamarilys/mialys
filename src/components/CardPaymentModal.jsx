import { useState } from "react";
import { formatPrice } from "../services/cartService.js";
import { createOrder } from "../services/orderService.js";
import { calculateCartSummary } from "../data/products.js";
import {
  CloseIcon,
  CheckIcon,
  CalendarIcon,
  MapPinIcon,
  TruckIcon,
  CreditCardIcon,
  LockIcon,
} from "./Icons.jsx";

export default function CardPaymentModal({ open, items, summary, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!open) return null;

  // Si no se proporcionó summary desde el carrito, lo calculamos
  const finalSummary = summary || calculateCartSummary(items);

  function handleCardNumberChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  }

  function handleExpiryChange(e) {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Por favor completa tu nombre, teléfono y dirección de envío.");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length < 15) {
      setError("Ingresa un número de tarjeta válido (16 dígitos).");
      return;
    }
    if (cardExpiry.length < 5) {
      setError("Ingresa una fecha de expiración válida (MM/AA).");
      return;
    }
    if (cardCvv.length < 3) {
      setError("Ingresa el código CVV (3 dígitos).");
      return;
    }

    setError("");
    setProcessing(true);

    try {
      // Simulación de procesamiento con pasarela segura
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const newOrder = await createOrder({
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        customerAddress: address,
        items,
        total: finalSummary.total,
        paymentMethod: `Tarjeta (terminada en ${cardNumber.slice(-4)})`,
        notes: `Pedido pagado con tarjeta. ${
          finalSummary.couponApplied ? `Cupón: ${finalSummary.couponApplied.code}. ` : ""
        }Envío: ${finalSummary.shipping === 0 ? "Gratis" : formatPrice(finalSummary.shipping)}`,
      });

      setCompletedOrder(newOrder);
      // Callback para vaciar el carrito y desmarcar productos
      onSuccess?.(newOrder);
    } catch {
      setError("No se pudo procesar el pago. Intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="card-pay-overlay" role="dialog" aria-modal="true">
      <div className="card-pay-backdrop" onClick={onClose} />
      <div className="card-pay-modal">
        <header className="card-pay-head">
          <h3>{completedOrder ? "¡Pago Confirmado!" : "Pago con Tarjeta de Crédito / Débito"}</h3>
          <button type="button" className="card-pay-close" onClick={onClose} aria-label="Cerrar ventana"><CloseIcon size={18} /></button>
        </header>

        {completedOrder ? (
          <div className="card-pay-success">
            <div className="success-icon"><CheckIcon size={24} /></div>
            <h4>¡Gracias por tu compra, {completedOrder.customer_name}!</h4>
            <p className="order-id-badge">Pedido <strong>#{completedOrder.id}</strong></p>
            <p className="success-desc">
              Tu pago de <strong>{formatPrice(completedOrder.total)}</strong> fue procesado exitosamente.
            </p>
            <div className="success-box">
              <p><CalendarIcon size={15} /> <strong>Fecha estimada de envío:</strong> {completedOrder.shipping_date}</p>
              <p><MapPinIcon size={15} /> <strong>Dirección de entrega:</strong> {completedOrder.customer_address}</p>
              <p><TruckIcon size={15} /> <strong>Transportista asignado:</strong> {completedOrder.carrier}</p>
            </div>
            <p className="success-tip">
              Los productos han sido apartados y tu carrito ha quedado completado. Puedes revisar los detalles en el panel empresarial.
            </p>
            <button type="button" className="btn btn-full" onClick={onClose}>
              Aceptar y Volver a la Tienda
            </button>
          </div>
        ) : (
          <form className="card-pay-form" onSubmit={handleSubmit}>
            {/* Desglose de Pago transparente */}
            <div className="pay-summary">
              <div className="pay-summary-row">
                <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} productos):</span>
                <span>{formatPrice(finalSummary.subtotal)}</span>
              </div>
              {finalSummary.discount > 0 && (
                <div className="pay-summary-row is-discount">
                  <span>Descuento cupón {finalSummary.couponApplied?.code ? `(${finalSummary.couponApplied.code})` : ""}:</span>
                  <span>-{formatPrice(finalSummary.discount)}</span>
                </div>
              )}
              <div className="pay-summary-row">
                <span>Envío:</span>
                <span>{finalSummary.shipping === 0 ? "¡GRATIS!" : formatPrice(finalSummary.shipping)}</span>
              </div>
              <div className="pay-summary-row is-total">
                <span>Total a pagar:</span>
                <strong>{formatPrice(finalSummary.total)}</strong>
              </div>
            </div>

            {error && <div className="card-pay-error">{error}</div>}

            <div className="form-section-title">1. Datos de Envío y Contacto</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. María Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Teléfono WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="0998444418"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Correo Electrónico (opcional para recibo)</label>
              <input
                type="email"
                placeholder="cliente@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Dirección de Entrega completa *</label>
              <input
                type="text"
                required
                placeholder="Calle principal, secundaria y número de casa / ciudad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-section-title">2. Datos de la Tarjeta</div>
            <div className="form-group">
              <label>Número de Tarjeta *</label>
              <div className="card-input-wrap">
                <input
                  type="text"
                  required
                  placeholder="•••• •••• •••• ••••"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                />
                <span className="card-brands-ico"><CreditCardIcon size={15} /> Visa / Mastercard</span>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Expiración (MM/AA) *</label>
                <input
                  type="text"
                  required
                  placeholder="MM/AA"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                />
              </div>
              <div className="form-group">
                <label>CVV *</label>
                <input
                  type="password"
                  required
                  maxLength="4"
                  placeholder="•••"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            <div className="pay-secure-notice">
              <LockIcon size={15} /> Pago 100% encriptado con seguridad SSL
            </div>

            <button type="submit" className="btn btn-full" disabled={processing}>
              {processing ? "Procesando pago seguro..." : `Pagar ${formatPrice(finalSummary.total)} Ahora`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

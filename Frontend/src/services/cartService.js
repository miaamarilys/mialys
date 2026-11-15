import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER, formatPrice, whatsappLink } from "../data/products.js";

export { WHATSAPP_DISPLAY, WHATSAPP_NUMBER, formatPrice, whatsappLink };

/**
 * Construye el mensaje para el pedido de WhatsApp
 */
export function buildOrderMessage(items, total) {
  return [
    "Hola, quiero hacer este pedido de Mialys Skin:",
    ...items.map((item) => `• ${item.name} x${item.qty} — ${formatPrice(item.price * item.qty)}`),
    `Total: ${formatPrice(total)}`,
  ].join("\n");
}

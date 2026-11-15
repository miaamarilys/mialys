import { useState, useEffect } from "react";
import { getOrders, updateOrder } from "../services/orderService.js";
import {
  getProducts,
  updateProduct,
  createProduct,
  toggleProductPause,
  deleteProduct,
} from "../services/productService.js";
import { formatPrice } from "../services/cartService.js";
import { BRAND_FILTERS } from "../data/products.js";

const STATUS_CONFIG = {
  "En preparación": { color: "#e67e22", bg: "#fdf2e9", label: "En preparación " },
  "Enviado": { color: "#2980b9", bg: "#ebf5fb", label: "Enviado en camino " },
  "Entregado": { color: "#27ae60", bg: "#eafaf1", label: "Entregado " },
  "Pagado": { color: "#8e44ad", bg: "#f4ecf7", label: "Pagado (Por enviar) " },
  "Cancelado": { color: "#c0392b", bg: "#fdedec", label: "Cancelado " },
};

export default function BusinessModal({ open, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("mialys_auth") === "true";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Pestaña activa: "orders" | "catalog"
  const [activeTab, setActiveTab] = useState("orders");

  // Estados de Pedidos
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Estados de Catálogo
  const [productsList, setProductsList] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Formulario nuevo producto
  const [newProd, setNewProd] = useState({
    name: "",
    brand: "Natura",
    category: "Cremas",
    price: 15,
    stock: 10,
    variant: "",
    skin: "Piel Seca",
    description: "",
    image: "/carrusel/nube.jpg",
  });

  const [saveNotice, setSaveNotice] = useState("");

  useEffect(() => {
    if (!open) return;
    if (isAuthenticated) {
      loadOrders();
      loadProducts();
    }
  }, [open, isAuthenticated]);

  async function loadOrders() {
    setLoadingOrders(true);
    const data = await getOrders();
    setOrders(data);
    setLoadingOrders(false);
  }

  async function loadProducts() {
    setLoadingProducts(true);
    const data = await getProducts(true);
    setProductsList(data);
    setLoadingProducts(false);
  }

  function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    setTimeout(() => {
      if (
        (email.trim().toLowerCase() === "admin@mialys.com" || email.trim().toLowerCase() === "admin") &&
        password.trim() === "admin123"
      ) {
        setIsAuthenticated(true);
        localStorage.setItem("mialys_auth", "true");
        document.body.classList.add("is-admin");
        setAuthLoading(false);
        loadOrders();
        loadProducts();
      } else {
        setAuthLoading(false);
        setAuthError("Credenciales incorrectas. Revisa tu correo y contraseña.");
      }
    }, 500);
  }

  function handleLogout() {
    setIsAuthenticated(false);
    localStorage.removeItem("mialys_auth");
    document.body.classList.remove("is-admin");
    setSelectedOrder(null);
  }

  function fillDemoCredentials() {
    setEmail("admin@mialys.com");
    setPassword("admin123");
    setAuthError("");
  }

  function showToast(msg) {
    setSaveNotice(msg);
    setTimeout(() => setSaveNotice(""), 3000);
  }

  // -------------------------------------------------------------
  // ACCIONES DE PEDIDOS
  // -------------------------------------------------------------
  async function handleStatusChange(orderId, nextStatus) {
    const updated = await updateOrder(orderId, { status: nextStatus });
    setOrders(updated);
    const targetOrder = updated.find((o) => o.id === orderId);

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(targetOrder);
    }

    showToast(`Estado actualizado a: ${nextStatus}`);

    // Si se marca como enviado, sugerir notificación por WhatsApp
    if (nextStatus === "Enviado" && targetOrder) {
      openWhatsAppNotification(targetOrder);
    }
  }

  async function handleShippingUpdate(orderId, fields) {
    const updated = await updateOrder(orderId, fields);
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, ...fields }));
    }
    showToast("Datos de envío guardados correctamente");
  }

  /**
   * Abre WhatsApp con el mensaje oficial solicitado
   */
  function openWhatsAppNotification(order) {
    const cleanPhone = (order.customer_phone || "").replace(/\D/g, "");
    const targetPhone = cleanPhone.startsWith("0")
      ? `593${cleanPhone.slice(1)}`
      : cleanPhone.length === 9
      ? `593${cleanPhone}`
      : cleanPhone;

    let text = "";
    if (order.status === "Enviado") {
      text = `Hola ${order.customer_name}, tu pedido #${order.id} ya va en camino con el transportista ${
        order.carrier || "Servientrega"
      }. Guía: ${order.tracking_number || "Pendiente"}. ¡Gracias por tu compra en Mialys Skin!`;
    } else if (order.status === "Entregado") {
      text = `Hola ${order.customer_name}, tu pedido #${order.id} ha sido entregado exitosamente. ¡Esperamos que disfrutes al máximo tus productos Mialys Skin!`;
    } else {
      text = `Hola ${order.customer_name}, tu pedido #${order.id} se encuentra en preparación. Fecha estimada de despacho: ${
        order.shipping_date || "próximamente"
      }. ¡Gracias por tu compra!`;
    }

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  /**
   * Exporta la lista de pedidos en formato CSV compatible con Excel
   */
  function exportOrdersToCSV() {
    if (orders.length === 0) {
      showToast("No hay pedidos para exportar.");
      return;
    }

    const headers = [
      "ID Pedido",
      "Fecha",
      "Cliente",
      "Telefono",
      "Email",
      "Direccion Entrega",
      "Productos",
      "Total USD",
      "Metodo de Pago",
      "Estado",
      "Transportista",
      "Numero Guia",
      "Fecha Envio",
      "Notas",
    ];

    const rows = orders.map((o) => {
      const itemsList = (o.items || []).map((i) => `${i.name} (x${i.qty})`).join("; ");
      const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString("es-EC") : "";
      return [
        `"${o.id || ""}"`,
        `"${dateStr}"`,
        `"${(o.customer_name || "").replace(/"/g, '""')}"`,
        `"${o.customer_phone || ""}"`,
        `"${o.customer_email || ""}"`,
        `"${(o.customer_address || "").replace(/"/g, '""')}"`,
        `"${itemsList.replace(/"/g, '""')}"`,
        `"${o.total || 0}"`,
        `"${(o.payment_method || "").replace(/"/g, '""')}"`,
        `"${o.status || ""}"`,
        `"${(o.carrier || "").replace(/"/g, '""')}"`,
        `"${o.tracking_number || ""}"`,
        `"${o.shipping_date || ""}"`,
        `"${(o.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    // \uFEFF es el BOM de UTF-8 para que Excel reconozca tildes y caracteres en español
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Mialys_Pedidos_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(" Archivo Excel (CSV) descargado con éxito");
  }

  // -------------------------------------------------------------
  // ACCIONES DE CATÁLOGO
  // -------------------------------------------------------------
  async function handleTogglePause(productId) {
    const updated = await toggleProductPause(productId);
    setProductsList(updated);
    showToast("Estado del producto actualizado");
  }

  async function handleInlineUpdate(productId, field, value) {
    const updated = await updateProduct(productId, { [field]: value });
    setProductsList(updated);
    showToast("Producto actualizado en el catálogo");
  }

  async function handleCreateNewProduct(e) {
    e.preventDefault();
    if (!newProd.name.trim()) return;

    const updated = await createProduct({
      ...newProd,
      price: Number(newProd.price),
      stock: Number(newProd.stock),
    });

    setProductsList(updated);
    setShowNewProductModal(false);
    setNewProd({
      name: "",
      brand: "Natura",
      category: "Cremas",
      price: 15,
      stock: 10,
      variant: "",
      skin: "Piel Seca",
      description: "",
      image: "/carrusel/nube.jpg",
    });
    showToast(" Nuevo producto añadido al catálogo exitosamente");
  }

  async function handleDeleteProduct(id, name) {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) return;
    const updated = await deleteProduct(id);
    setProductsList(updated);
    showToast("Producto eliminado del catálogo");
  }

  if (!open) return null;

  // -------------------------------------------------------------
  // VISTA 1: LOGIN ADMINISTRATIVO
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="biz-overlay" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <div className="biz-backdrop" onClick={onClose} />
        <div className="biz-login-card">
          <header className="biz-login-head">
            <div className="biz-login-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 13 20v-4.5h-2V20A1.5 1.5 0 0 1 9.5 21.5h-5A1.5 1.5 0 0 1 3 20v-9.5Z" />
                <path d="M9 10h6" strokeLinecap="round" />
              </svg>
            </div>
            <button type="button" className="biz-login-close" onClick={onClose} aria-label="Cerrar">×</button>
            <h2 id="login-title">Inicio de Sesión Empresarial</h2>
            <p className="biz-login-subtitle">
              Panel administrativo para gestión de logística, pedidos, notificaciones de WhatsApp y catálogo de productos.
            </p>
          </header>

          <form className="biz-login-form" onSubmit={handleLogin}>
            {authError && <div className="biz-login-error">{authError}</div>}

            <div className="form-group">
              <label>Correo Electrónico o Usuario</label>
              <input
                type="text"
                required
                placeholder="admin@mialys.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-full" disabled={authLoading}>
              {authLoading ? "Verificando credenciales…" : "Ingresar al Panel"}
            </button>

            <div className="biz-login-demo">
              <p>¿Acceso rápido de prueba?</p>
              <button type="button" className="biz-demo-btn" onClick={fillDemoCredentials}>
                Autocompletar credenciales de Administrador
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CÁLCULO DE MÉTRICAS & ESTADÍSTICAS BÁSICAS
  // -------------------------------------------------------------
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Ventas del mes
  const salesThisMonth = orders.reduce((sum, o) => {
    if (!o.created_at) return sum + (Number(o.total) || 0);
    const d = new Date(o.created_at);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      return sum + (Number(o.total) || 0);
    }
    return sum;
  }, 0);

  // Cantidad de pedidos pendientes por entregar
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "En preparación" || o.status === "Pagado"
  ).length;

  // En camino
  const inTransitCount = orders.filter((o) => o.status === "Enviado").length;

  // Producto más vendido
  const productSalesMap = {};
  orders.forEach((o) => {
    (o.items || []).forEach((it) => {
      const name = it.name || it.id;
      productSalesMap[name] = (productSalesMap[name] || 0) + (it.qty || 1);
    });
  });

  let bestSellerName = "Sin ventas aún";
  let bestSellerUnits = 0;
  Object.entries(productSalesMap).forEach(([name, units]) => {
    if (units > bestSellerUnits) {
      bestSellerUnits = units;
      bestSellerName = name;
    }
  });

  // Ticket promedio
  const avgTicket = orders.length > 0 ? salesThisMonth / (orders.length || 1) : 0;

  // Filtrado de pedidos
  const filteredOrders = orders.filter((o) => {
    if (filter === "todos") return true;
    return o.status?.toLowerCase().includes(filter.toLowerCase());
  });

  // Filtrado de productos en catálogo
  const filteredProducts = productsList.filter((p) => {
    if (!catalogSearch.trim()) return true;
    const term = catalogSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.variant?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="biz-overlay" role="dialog" aria-modal="true" aria-labelledby="biz-title">
      <div className="biz-backdrop" onClick={onClose} />
      <div className="biz-window">
        {/* Header con tabs */}
        <header className="biz-head">
          <div className="biz-head-info">
            <span className="biz-badge">Panel Administrativo Mialys Skin</span>
            <div className="biz-tab-nav">
              <button
                type="button"
                className={`biz-tab-btn ${activeTab === "orders" ? "is-active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                 Pedidos y Logística ({orders.length})
              </button>
              <button
                type="button"
                className={`biz-tab-btn ${activeTab === "catalog" ? "is-active" : ""}`}
                onClick={() => setActiveTab("catalog")}
              >
                 Gestión de Catálogo ({productsList.length})
              </button>
            </div>
          </div>
          <div className="biz-head-actions">
            <button type="button" className="biz-logout-btn" onClick={handleLogout} title="Cerrar sesión">
              Cerrar Sesión
            </button>
            <button type="button" className="biz-close-btn" onClick={onClose} aria-label="Cerrar panel">
              ×
            </button>
          </div>
        </header>

        {/* =========================================================
            PESTAÑA 1: PEDIDOS Y LOGÍSTICA
           ========================================================= */}
        {activeTab === "orders" && (
          <>
            {/* Tarjetas de Métricas y Estadísticas */}
            <div className="biz-stats-grid">
              <div className="biz-stat-card is-sales">
                <span className="biz-stat-label"> Ventas del Mes</span>
                <strong className="biz-stat-num">{formatPrice(salesThisMonth)}</strong>
                <small className="biz-stat-sub">Mes en curso</small>
              </div>
              <div className="biz-stat-card is-pending">
                <span className="biz-stat-label"> Pendientes por Enviar</span>
                <strong className="biz-stat-num">{pendingOrdersCount}</strong>
                <small className="biz-stat-sub">Por despachar</small>
              </div>
              <div className="biz-stat-card is-sent">
                <span className="biz-stat-label"> En Camino</span>
                <strong className="biz-stat-num">{inTransitCount}</strong>
                <small className="biz-stat-sub">Guías activas</small>
              </div>
              <div className="biz-stat-card is-bestseller">
                <span className="biz-stat-label"> Más Vendido</span>
                <strong className="biz-stat-num-text" title={bestSellerName}>
                  {bestSellerName.length > 25 ? `${bestSellerName.slice(0, 25)}...` : bestSellerName}
                </strong>
                <small className="biz-stat-sub">{bestSellerUnits} unidades vendidas</small>
              </div>
            </div>

            {/* Barra de Filtros y Botón de Exportar a Excel */}
            <div className="biz-filter-bar">
              <div className="biz-filter-chips">
                {["todos", "preparación", "enviado", "entregado", "cancelado"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`biz-chip ${filter === st ? "is-active" : ""}`}
                    onClick={() => setFilter(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>

              <div className="biz-bar-actions">
                <button
                  type="button"
                  className="biz-export-btn"
                  onClick={exportOrdersToCSV}
                  title="Descargar pedidos en formato CSV compatible con Excel"
                >
                   Exportar a Excel (CSV)
                </button>
                <button type="button" className="biz-refresh-btn" onClick={loadOrders} title="Recargar pedidos">
                  ↻ Actualizar
                </button>
              </div>
            </div>

            {/* Tabla de Pedidos */}
            <div className="biz-body">
              {loadingOrders ? (
                <div className="biz-empty">Cargando pedidos...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="biz-empty">
                  <p>No se encontraron pedidos con este filtro.</p>
                </div>
              ) : (
                <div className="biz-table-wrap">
                  <table className="biz-table">
                    <thead>
                      <tr>
                        <th>Orden</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Fecha Envío</th>
                        <th>Notificar</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const statusInfo = STATUS_CONFIG[order.status] || {
                          color: "#555",
                          bg: "#eee",
                          label: order.status,
                        };
                        return (
                          <tr key={order.id} className={selectedOrder?.id === order.id ? "is-selected-row" : ""}>
                            <td>
                              <strong>{order.id}</strong>
                              <span className="biz-pay-method">{order.payment_method?.split(" ")[0]}</span>
                            </td>
                            <td>
                              {order.created_at
                                ? new Date(order.created_at).toLocaleDateString("es-EC", {
                                    day: "2-digit",
                                    month: "short",
                                  })
                                : "-"}
                            </td>
                            <td>
                              <div className="biz-cust-cell">
                                <span className="biz-cust-name">{order.customer_name}</span>
                                <span className="biz-cust-phone">{order.customer_phone}</span>
                              </div>
                            </td>
                            <td>
                              <span className="biz-items-summary" title={order.items?.map((i) => i.name).join(", ")}>
                                {order.items?.length || 0} producto(s)
                              </span>
                            </td>
                            <td className="biz-price-cell">{formatPrice(order.total)}</td>
                            <td>
                              <select
                                className="biz-status-select"
                                style={{ color: statusInfo.color, borderColor: statusInfo.color }}
                                value={order.status || "En preparación"}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              >
                                <option value="En preparación">En preparación</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Entregado">Entregado</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="date"
                                className="biz-date-input"
                                value={order.shipping_date || ""}
                                onChange={(e) => handleShippingUpdate(order.id, { shipping_date: e.target.value })}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="biz-wa-notify-btn"
                                onClick={() => openWhatsAppNotification(order)}
                                title={`Enviar mensaje de WhatsApp al cliente (${order.customer_phone})`}
                              >
                                 WhatsApp
                              </button>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="biz-detail-btn"
                                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                              >
                                {selectedOrder?.id === order.id ? "Cerrar" : "Ver"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Ficha lateral de detalle del pedido */}
              {selectedOrder && (
                <aside className="biz-detail-card">
                  <div className="biz-detail-head">
                    <h3>Detalle de Pedido {selectedOrder.id}</h3>
                    <button type="button" onClick={() => setSelectedOrder(null)}>×</button>
                  </div>
                  <div className="biz-detail-grid">
                    <div className="biz-field">
                      <label>Cliente</label>
                      <p><strong>{selectedOrder.customer_name}</strong> ({selectedOrder.customer_phone})</p>
                      <p className="biz-text-muted">{selectedOrder.customer_email || "Sin email"}</p>
                    </div>

                    <div className="biz-field">
                      <label>Dirección de Envío</label>
                      <p>{selectedOrder.customer_address || "No especificada"}</p>
                    </div>

                    <div className="biz-field">
                      <label>Transportista & N° de Guía</label>
                      <div className="biz-input-row">
                        <input
                          type="text"
                          placeholder="Ej. Servientrega"
                          defaultValue={selectedOrder.carrier || ""}
                          onBlur={(e) => handleShippingUpdate(selectedOrder.id, { carrier: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="N° de Guía (ej. SERV-1029)"
                          defaultValue={selectedOrder.tracking_number || ""}
                          onBlur={(e) => handleShippingUpdate(selectedOrder.id, { tracking_number: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="biz-field">
                      <label>Notificación Directa</label>
                      <button
                        type="button"
                        className="btn btn-wa-secondary btn-full"
                        onClick={() => openWhatsAppNotification(selectedOrder)}
                      >
                         Enviar Estado y Guía por WhatsApp
                      </button>
                    </div>

                    <div className="biz-field">
                      <label>Productos comprados</label>
                      <ul className="biz-item-list">
                        {selectedOrder.items?.map((it, idx) => (
                          <li key={idx}>
                            <span>{it.name} x{it.qty}</span>
                            <strong>{formatPrice(it.price * it.qty)}</strong>
                          </li>
                        ))}
                      </ul>
                      <div className="biz-item-total">
                        <span>Total Pagado:</span>
                        <strong>{formatPrice(selectedOrder.total)}</strong>
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </>
        )}

        {/* =========================================================
            PESTAÑA 2: GESTIÓN DE CATÁLOGO DESDE EL PANEL
           ========================================================= */}
        {activeTab === "catalog" && (
          <div className="biz-catalog-view">
            <div className="biz-catalog-toolbar">
              <div className="biz-catalog-search">
                <input
                  type="search"
                  placeholder="Buscar producto por nombre, marca o categoría..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
              </div>

              <div className="biz-catalog-actions">
                <button
                  type="button"
                  className="biz-create-btn"
                  onClick={() => setShowNewProductModal(true)}
                >
                  + Nuevo Producto
                </button>
                <button
                  type="button"
                  className="biz-refresh-btn"
                  onClick={loadProducts}
                  title="Recargar catálogo"
                >
                  ↻ Recargar
                </button>
              </div>
            </div>

            {loadingProducts ? (
              <div className="biz-empty">Cargando catálogo...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="biz-empty">No se encontraron productos en el catálogo.</div>
            ) : (
              <div className="biz-table-wrap">
                <table className="biz-table biz-catalog-table">
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Producto</th>
                      <th>Marca / Línea</th>
                      <th>Categoría</th>
                      <th>Precio ($)</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className={prod.paused ? "is-paused-row" : ""}>
                        <td>
                          <div className="biz-prod-thumb">
                            <img src={prod.image || "/carrusel/nube.jpg"} alt={prod.name} />
                          </div>
                        </td>
                        <td>
                          <div className="biz-prod-info">
                            <strong>{prod.name}</strong>
                            {prod.variant && <small>{prod.variant}</small>}
                          </div>
                        </td>
                        <td>{prod.line ? `${prod.brand} ${prod.line}` : prod.brand}</td>
                        <td>
                          <span className="biz-cat-pill">{prod.category || "Cremas"}</span>
                        </td>
                        <td>
                          <div className="biz-inline-edit">
                            <input
                              type="number"
                              step="0.5"
                              defaultValue={prod.price}
                              className="biz-mini-input"
                              onBlur={(e) => handleInlineUpdate(prod.id, "price", Number(e.target.value))}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="biz-inline-edit">
                            <input
                              type="number"
                              min="0"
                              defaultValue={prod.stock ?? 10}
                              className="biz-mini-input"
                              onBlur={(e) => handleInlineUpdate(prod.id, "stock", Number(e.target.value))}
                            />
                          </div>
                        </td>
                        <td>
                          {prod.paused ? (
                            <span className="biz-status-pill is-paused">⏸️ Pausado</span>
                          ) : (
                            <span className="biz-status-pill is-active"> Activo</span>
                          )}
                        </td>
                        <td>
                          <div className="biz-actions-cell">
                            <button
                              type="button"
                              className={`biz-pause-btn ${prod.paused ? "is-resume" : ""}`}
                              onClick={() => handleTogglePause(prod.id)}
                              title={prod.paused ? "Reactivar y mostrar en tienda" : "Pausar y ocultar de la tienda"}
                            >
                              {prod.paused ? "▶ Activar" : "⏸ Pausar"}
                            </button>
                            <button
                              type="button"
                              className="biz-edit-desc-btn"
                              onClick={() => setEditingProduct(prod)}
                              title="Editar descripción y detalles"
                            >
                               Editar
                            </button>
                            <button
                              type="button"
                              className="biz-del-btn"
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              title="Eliminar producto"
                            >
                              
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal: Crear Nuevo Producto */}
        {showNewProductModal && (
          <div className="biz-inner-modal">
            <div className="biz-inner-card">
              <header className="biz-inner-head">
                <h3>Crear Nuevo Producto en Catálogo</h3>
                <button type="button" onClick={() => setShowNewProductModal(false)}>×</button>
              </header>
              <form onSubmit={handleCreateNewProduct} className="biz-form-grid">
                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Crema hidratante corporal"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Marca *</label>
                    <select
                      value={newProd.brand}
                      onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    >
                      {BRAND_FILTERS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Categoría *</label>
                    <select
                      value={newProd.category}
                      onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    >
                      <option value="Cremas">Cremas</option>
                      <option value="Perfumes">Perfumes</option>
                      <option value="Desodorantes">Desodorantes</option>
                      <option value="Maquillaje">Maquillaje</option>
                      <option value="Capilar">Cuidado capilar</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Sets">Sets y más</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Precio de Venta ($ USD) *</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={newProd.price}
                      onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock inicial *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newProd.stock}
                      onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Variante / Aroma / Línea</label>
                    <input
                      type="text"
                      placeholder="Ej. Avellana y Cassis 400ml"
                      value={newProd.variant}
                      onChange={(e) => setNewProd({ ...newProd, variant: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Piel</label>
                    <select
                      value={newProd.skin}
                      onChange={(e) => setNewProd({ ...newProd, skin: e.target.value })}
                    >
                      <option value="Piel Seca">Piel Seca</option>
                      <option value="Piel Grasa">Piel Grasa</option>
                      <option value="Piel Mixta">Piel Mixta</option>
                      <option value="Piel Sensible">Piel Sensible</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción del producto</label>
                  <textarea
                    rows="3"
                    placeholder="Beneficios, ingredientes clave y modo de uso..."
                    value={newProd.description}
                    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Ruta de imagen</label>
                  <input
                    type="text"
                    placeholder="/productos/natura-avellana-casis.jpg"
                    value={newProd.image}
                    onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  />
                </div>

                <div className="biz-form-foot">
                  <button type="button" className="btn btn-wa-secondary" onClick={() => setShowNewProductModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn">
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Producto Existente */}
        {editingProduct && (
          <div className="biz-inner-modal">
            <div className="biz-inner-card">
              <header className="biz-inner-head">
                <h3>Editar Producto: {editingProduct.name}</h3>
                <button type="button" onClick={() => setEditingProduct(null)}>×</button>
              </header>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInlineUpdate(editingProduct.id, "name", editingProduct.name);
                  handleInlineUpdate(editingProduct.id, "variant", editingProduct.variant);
                  handleInlineUpdate(editingProduct.id, "description", editingProduct.description);
                  handleInlineUpdate(editingProduct.id, "price", Number(editingProduct.price));
                  handleInlineUpdate(editingProduct.id, "stock", Number(editingProduct.stock));
                  setEditingProduct(null);
                }}
                className="biz-form-grid"
              >
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Variante / Aroma</label>
                  <input
                    type="text"
                    value={editingProduct.variant || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, variant: e.target.value })}
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Precio ($ USD)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.stock ?? 10}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    rows="3"
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  />
                </div>
                <div className="biz-form-foot">
                  <button type="button" className="btn btn-wa-secondary" onClick={() => setEditingProduct(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn">
                    Actualizar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {saveNotice && <div className="biz-toast">{saveNotice}</div>}
      </div>
    </div>
  );
}

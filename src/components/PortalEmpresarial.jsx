import { useState, useEffect, useMemo } from "react";
import { getOrders, updateOrder } from "../services/orderService.js";
import {
  getProducts,
  updateProduct,
  createProduct,
  toggleProductPause,
  toggleProductFeatured,
  deleteProduct,
} from "../services/productService.js";
import { formatPrice } from "../services/cartService.js";
import { BRAND_FILTERS, COUPONS as DEFAULT_COUPONS } from "../data/products.js";
import {
  DashboardIcon,
  PackageIcon,
  SparklesIcon,
  TicketIcon,
  SettingsIcon,
  StoreIcon,
  LogoutIcon,
  StarIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  TrashIcon,
  WhatsAppIcon,
  SearchIcon,
  DownloadIcon,
  RefreshIcon,
  PlusIcon,
  CloseIcon,
  CheckIcon,
  MoneyIcon,
  AlertTriangleIcon,
  UserIcon,
  UsersIcon,
  CreditCardIcon,
  LockIcon,
  BoltIcon,
  PhoneIcon,
  TruckIcon,
} from "./Icons.jsx";

const COURIERS = [
  "Servientrega",
  "LaarCourier",
  "Urbano Express",
  "Tramaco",
  "Mensajería Directa",
];

const ORDER_STATUS_MAP = {
  "En preparación": { label: "En preparación", badgeClass: "status-prep" },
  "Enviado": { label: "Enviado en camino", badgeClass: "status-sent" },
  "Entregado": { label: "Entregado", badgeClass: "status-done" },
  "Pagado": { label: "Pagado (Por despachar)", badgeClass: "status-paid" },
  "Cancelado": { label: "Cancelado", badgeClass: "status-cancelled" },
};

function getStatusIcon(status, size = 15) {
  switch (status) {
    case "En preparación":
      return <PackageIcon size={size} />;
    case "Enviado":
      return <TruckIcon size={size} />;
    case "Entregado":
      return <CheckIcon size={size} />;
    case "Pagado":
      return <CreditCardIcon size={size} />;
    case "Cancelado":
      return <CloseIcon size={size} />;
    default:
      return <PackageIcon size={size} />;
  }
}

const IMAGE_PRESETS = [
  { label: "Tododia Fresa & Vainilla", url: "/carrusel/nube.jpg" },
  { label: "Tododia Avellana & Casis", url: "/carrusel/ambar.jpg" },
  { label: "Tododia Manzanilla & Lavanda", url: "/carrusel/bruma.jpg" },
  { label: "Ekos Maracuyá Antiestrés", url: "/carrusel/lino.jpg" },
  { label: "Ekos Castanha Hidratante", url: "/carrusel/equilibrio.jpg" },
  { label: "Local Atención / Set", url: "/local/local-atencion.jpg" },
  { label: "Local Productos / Detalle", url: "/local/local-productos.jpg" },
];

export default function PortalEmpresarial({ onBackToStore }) {
  // Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("mialys_auth") === "true";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Navegación Sidebar: "dashboard" | "orders" | "catalog" | "coupons" | "settings"
  const [activeTab, setActiveTab] = useState("dashboard");

  // Notificaciones Toast
  const [toast, setToast] = useState("");

  // -------------------------------------------------------------
  // ESTADOS DE PEDIDOS
  // -------------------------------------------------------------
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState("todos");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // -------------------------------------------------------------
  // ESTADOS DE CATÁLOGO E INVENTARIO
  // -------------------------------------------------------------
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("Todas");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [stockStatusFilter, setStockStatusFilter] = useState("todos"); // "todos" | "in_stock" | "low_stock" | "out_of_stock" | "featured" | "paused"
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Formulario de Producto (Crear / Editar)
  const [productForm, setProductForm] = useState({
    name: "",
    brand: "Natura",
    category: "Cremas",
    price: 18,
    stock: 12,
    variant: "",
    skin: "Piel Seca",
    description: "",
    badge: "Más vendido",
    featured: true,
    image: "/carrusel/nube.jpg",
  });

  // -------------------------------------------------------------
  // ESTADOS DE CONTACTOS
  // -------------------------------------------------------------
  const [customContacts, setCustomContacts] = useState(() => {
    try {
      const saved = localStorage.getItem("mialys_custom_contacts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [contactSearch, setContactSearch] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    notes: "",
  });

  // -------------------------------------------------------------
  // ESTADOS DE CUPONES Y CONFIGURACIÓN
  // -------------------------------------------------------------
  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem("mialys_custom_coupons");
      return saved ? JSON.parse(saved) : Object.values(DEFAULT_COUPONS);
    } catch {
      return Object.values(DEFAULT_COUPONS);
    }
  });
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState("percent");
  const [newCouponVal, setNewCouponVal] = useState(10);
  const [newCouponDesc, setNewCouponDesc] = useState("");

  // Configuración general
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("mialys_store_settings");
      return saved
        ? JSON.parse(saved)
        : {
            whatsapp: "0998444418",
            freeShippingMin: 35.0,
            standardShipping: 3.5,
            storeName: "Mialys Skin Cosméticos",
            city: "Guayaquil / Quito, Ecuador",
          };
    } catch {
      return {
        whatsapp: "0998444418",
        freeShippingMin: 35.0,
        standardShipping: 3.5,
        storeName: "Mialys Skin Cosméticos",
        city: "Guayaquil / Quito, Ecuador",
      };
    }
  });

  // Cargar datos al autenticar
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  async function loadData() {
    setLoadingOrders(true);
    setLoadingProducts(true);
    const [ordersData, productsData] = await Promise.all([
      getOrders(),
      getProducts(true),
    ]);
    setOrders(ordersData || []);
    setProducts(productsData || []);
    setLoadingOrders(false);
    setLoadingProducts(false);
  }

  function showToastMsg(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  // -------------------------------------------------------------
  // AUTENTICACIÓN
  // -------------------------------------------------------------
  function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    setTimeout(() => {
      const userClean = email.trim().toLowerCase();
      if ((userClean === "admin@mialys.com" || userClean === "admin") && password.trim() === "admin123") {
        setIsAuthenticated(true);
        localStorage.setItem("mialys_auth", "true");
        document.body.classList.add("is-admin");
        setAuthLoading(false);
        showToastMsg("¡Bienvenido al Portal Empresarial Mialys Skin!");
      } else {
        setAuthLoading(false);
        setAuthError("Credenciales inválidas. Usa admin@mialys.com / admin123");
      }
    }, 400);
  }

  function handleLogout() {
    setIsAuthenticated(false);
    localStorage.removeItem("mialys_auth");
    document.body.classList.remove("is-admin");
    setSelectedOrder(null);
  }

  function fillDemo() {
    setEmail("admin@mialys.com");
    setPassword("admin123");
    setAuthError("");
  }

  // -------------------------------------------------------------
  // ACCIONES DE PEDIDOS
  // -------------------------------------------------------------
  async function handleUpdateOrderStatus(orderId, nextStatus) {
    const updated = await updateOrder(orderId, { status: nextStatus });
    setOrders(updated);
    const current = updated.find((o) => o.id === orderId);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(current);
    }
    showToastMsg(`Estado de pedido actualizado a: ${nextStatus}`);

    if (nextStatus === "Enviado" && current) {
      sendWhatsAppTracking(current);
    }
  }

  async function handleSaveShippingData(orderId, updates) {
    const updated = await updateOrder(orderId, updates);
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, ...updates }));
    }
    showToastMsg("Datos de transporte guardados");
  }

  function sendWhatsAppTracking(order) {
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
      }. Guía: ${order.tracking_number || "Asignada en proceso"}. ¡Gracias por tu compra en Mialys Skin!`;
    } else if (order.status === "Entregado") {
      text = `Hola ${order.customer_name}, tu pedido #${order.id} ha sido entregado exitosamente. ¡Esperamos que disfrutes al máximo tus productos Mialys Skin!`;
    } else {
      text = `Hola ${order.customer_name}, tu pedido #${order.id} está siendo preparado con mucho cuidado. Despacho programado para: ${
        order.shipping_date || "próximamente"
      }. ¡Gracias por confiar en Mialys Skin!`;
    }

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  function exportOrdersToCSV() {
    if (!orders.length) {
      showToastMsg("No hay pedidos registrados para exportar.");
      return;
    }

    const headers = [
      "ID Pedido",
      "Fecha Creación",
      "Cliente",
      "Teléfono",
      "Email",
      "Dirección Entrega",
      "Productos",
      "Total USD",
      "Método Pago",
      "Estado",
      "Transportista",
      "Número Guía",
      "Fecha Envío",
      "Notas",
    ];

    const rows = orders.map((o) => {
      const itemsList = (o.items || []).map((i) => `${i.name} (x${i.qty})`).join("; ");
      const dateStr = o.created_at ? new Date(o.created_at).toLocaleString("es-EC") : "";
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

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Mialys_Reporte_Pedidos_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToastMsg("Reporte de pedidos exportado a Excel exitosamente");
  }

  // -------------------------------------------------------------
  // ACCIONES DE CATÁLOGO E INVENTARIO
  // -------------------------------------------------------------
  async function handleToggleProductPause(prodId) {
    const updated = await toggleProductPause(prodId);
    setProducts(updated);
    showToastMsg("Visibilidad del producto en tienda actualizada");
  }

  async function handleToggleFeatured(prodId) {
    const updated = await toggleProductFeatured(prodId);
    setProducts(updated);
    const target = updated.find((p) => p.id === prodId);
    if (target?.featured) {
      showToastMsg(`⭐ "${target.name}" se agregó a la Página Principal`);
    } else {
      showToastMsg(`Retirado de la Página Principal`);
    }
  }

  async function handleQuickStockChange(prodId, delta) {
    const target = products.find((p) => p.id === prodId);
    if (!target) return;
    const newStock = Math.max(0, (target.stock ?? 10) + delta);
    const updated = await updateProduct(prodId, { stock: newStock });
    setProducts(updated);
    showToastMsg(`Stock actualizado: ${newStock} unidades`);
  }

  async function handleSetStockZero(prodId) {
    const updated = await updateProduct(prodId, { stock: 0 });
    setProducts(updated);
    showToastMsg(`Producto marcado como AGOTADO`);
  }

  async function handleQuickUpdateProduct(prodId, updates) {
    const updated = await updateProduct(prodId, updates);
    setProducts(updated);
    showToastMsg("Cambio de producto guardado");
  }

  async function handleDeleteProduct(prodId, prodName) {
    if (!window.confirm(`¿Estás seguro de eliminar "${prodName}" del catálogo? Esta acción no se puede deshacer.`)) return;
    const updated = await deleteProduct(prodId);
    setProducts(updated);
    showToastMsg(`Producto "${prodName}" eliminado definitivamente`);
  }

  function handleOpenCreateProduct() {
    setEditingProduct(null);
    setProductForm({
      name: "",
      brand: "Natura",
      category: "Cremas",
      price: 18,
      stock: 12,
      variant: "",
      skin: "Todo tipo de piel",
      description: "",
      badge: "Más vendido",
      featured: true, // Por defecto se puede poner en portada
      image: "/carrusel/nube.jpg",
    });
    setShowProductModal(true);
  }

  function handleOpenEditProduct(prod) {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || "",
      brand: prod.brand || "Natura",
      category: prod.category || "Cremas",
      price: prod.price || 0,
      stock: prod.stock ?? 10,
      variant: prod.variant || "",
      skin: prod.skin || "Todo tipo de piel",
      description: prod.description || "",
      badge: prod.badge || "Más vendido",
      featured: Boolean(prod.featured),
      image: prod.image || "/carrusel/nube.jpg",
    });
    setShowProductModal(true);
  }

  async function handleSaveProductForm(e) {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert("Por favor ingresa un nombre para el producto.");
      return;
    }

    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        featured: Boolean(productForm.featured),
      });
      setProducts(updated);
      showToastMsg(`"${productForm.name}" actualizado correctamente`);
    } else {
      const updated = await createProduct({
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        featured: Boolean(productForm.featured),
      });
      setProducts(updated);
      showToastMsg(`Nuevo producto "${productForm.name}" agregado y publicado`);
    }

    setShowProductModal(false);
    setEditingProduct(null);
  }

  // -------------------------------------------------------------
  // ACCIONES DE CUPONES
  // -------------------------------------------------------------
  function handleAddCoupon(e) {
    e.preventDefault();
    const codeClean = newCouponCode.trim().toUpperCase();
    if (!codeClean) return;

    const exists = coupons.some((c) => c.code === codeClean);
    if (exists) {
      alert("Ya existe un cupón con ese código");
      return;
    }

    const newC = {
      code: codeClean,
      type: newCouponType,
      value: Number(newCouponVal),
      description: newCouponDesc.trim() || `Descuento ${codeClean}`,
      minSubtotal: 0,
      active: true,
    };

    const nextList = [...coupons, newC];
    setCoupons(nextList);
    localStorage.setItem("mialys_custom_coupons", JSON.stringify(nextList));
    try {
      fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newC),
      });
    } catch {}
    setNewCouponCode("");
    setNewCouponDesc("");
    showToastMsg(`Cupón ${codeClean} creado con éxito`);
  }

  function handleToggleCoupon(code) {
    const nextList = coupons.map((c) =>
      c.code === code ? { ...c, active: c.active === false ? true : false } : c
    );
    setCoupons(nextList);
    localStorage.setItem("mialys_custom_coupons", JSON.stringify(nextList));
    const target = nextList.find((c) => c.code === code);
    if (target) {
      try {
        fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(target),
        });
      } catch {}
    }
    showToastMsg("Estado de cupón actualizado");
  }

  function handleDeleteCoupon(code) {
    const nextList = coupons.filter((c) => c.code !== code);
    setCoupons(nextList);
    localStorage.setItem("mialys_custom_coupons", JSON.stringify(nextList));
    try {
      fetch(`/api/coupons/${code}`, { method: "DELETE" });
    } catch {}
    showToastMsg(`Cupón ${code} eliminado`);
  }

  // -------------------------------------------------------------
  // CONFIGURACIÓN DE TIENDA
  // -------------------------------------------------------------
  function handleSaveSettings(e) {
    e.preventDefault();
    localStorage.setItem("mialys_store_settings", JSON.stringify(storeSettings));
    try {
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeSettings),
      });
    } catch {}
    showToastMsg("Configuración de tienda guardada");
  }

  // -------------------------------------------------------------
  // CÁLCULOS DE MÉTRICAS (KPIs)
  // -------------------------------------------------------------
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyOrders = orders.filter((o) => {
      if (!o.created_at) return false;
      const d = new Date(o.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && o.status !== "Cancelado";
    });

    const monthlyTotal = monthlyOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === "En preparación" || o.status === "Pagado");
    const inTransitOrders = orders.filter((o) => o.status === "Enviado");

    // Producto más vendido
    const productSales = {};
    orders.forEach((o) => {
      if (o.status !== "Cancelado" && o.items) {
        o.items.forEach((item) => {
          productSales[item.name] = (productSales[item.name] || 0) + Number(item.qty || 1);
        });
      }
    });

    let topProduct = { name: "Aún sin ventas", qty: 0 };
    Object.entries(productSales).forEach(([name, qty]) => {
      if (qty > topProduct.qty) topProduct = { name, qty };
    });

    const inStockCount = products.filter((p) => (p.stock ?? 10) > 0 && !p.paused).length;
    const lowStockCount = products.filter((p) => (p.stock ?? 10) > 0 && (p.stock ?? 10) <= 3).length;
    const outOfStockCount = products.filter((p) => (p.stock ?? 10) === 0).length;
    const featuredCount = products.filter((p) => Boolean(p.featured)).length;
    const pausedCount = products.filter((p) => Boolean(p.paused)).length;

    return {
      monthlyTotal,
      monthlyCount: monthlyOrders.length,
      pendingCount: pendingOrders.length,
      inTransitCount: inTransitOrders.length,
      topProduct,
      totalProducts: products.length,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      featuredCount,
      pausedCount,
    };
  }, [orders, products]);

  // Filtro de pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilter !== "todos" && o.status !== orderFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchesName = (o.customer_name || "").toLowerCase().includes(q);
        const matchesId = (o.id || "").toLowerCase().includes(q);
        const matchesPhone = (o.customer_phone || "").includes(q);
        const matchesCarrier = (o.carrier || "").toLowerCase().includes(q);
        return matchesName || matchesId || matchesPhone || matchesCarrier;
      }
      return true;
    });
  }, [orders, orderFilter, orderSearch]);

  // Filtro de catálogo e inventario
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filtro de marca
      if (brandFilter !== "Todas" && (p.brand || "").toLowerCase() !== brandFilter.toLowerCase()) return false;
      // Filtro de categoría
      if (categoryFilter !== "Todas" && (p.category || "").toLowerCase() !== categoryFilter.toLowerCase())
        return false;

      // Filtro de estado de inventario / disponibilidad
      const stock = p.stock ?? 10;
      if (stockStatusFilter === "in_stock" && (stock <= 0 || p.paused)) return false;
      if (stockStatusFilter === "low_stock" && (stock <= 0 || stock > 3)) return false;
      if (stockStatusFilter === "out_of_stock" && stock > 0) return false;
      if (stockStatusFilter === "featured" && !p.featured) return false;
      if (stockStatusFilter === "paused" && !p.paused) return false;

      // Buscador por nombre, aroma o marca
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        const nameMatch = (p.name || "").toLowerCase().includes(q);
        const brandMatch = (p.brand || "").toLowerCase().includes(q);
        const catMatch = (p.category || "").toLowerCase().includes(q);
        const varMatch = (p.variant || "").toLowerCase().includes(q);
        return nameMatch || brandMatch || catMatch || varMatch;
      }
      return true;
    });
  }, [products, brandFilter, categoryFilter, stockStatusFilter, catalogSearch]);

  // -------------------------------------------------------------
  // LÓGICA Y DIRECTORIO DE CONTACTOS (SOLO CONTACTOS)
  // -------------------------------------------------------------
  const contactsList = useMemo(() => {
    const map = new Map();

    // 1. Extraer clientes de pedidos
    orders.forEach((o) => {
      const rawPhone = (o.customer_phone || "").trim();
      const normPhone = rawPhone.replace(/\D/g, "");
      const key = normPhone || (o.customer_name || "").trim().toLowerCase();
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          id: `order-contact-${key}`,
          name: o.customer_name || "Cliente Sin Nombre",
          phone: rawPhone || "Sin teléfono",
          email: o.customer_email || "—",
          address: o.customer_address || "—",
          ordersCount: 1,
          totalSpent: Number(o.total || 0),
          lastOrderDate: o.created_at ? new Date(o.created_at).toLocaleDateString("es-EC") : "Hoy",
          isCustom: false,
        });
      } else {
        const item = map.get(key);
        item.ordersCount += 1;
        item.totalSpent += Number(o.total || 0);
        if (o.customer_email && item.email === "—") item.email = o.customer_email;
        if (o.customer_address && item.address === "—") item.address = o.customer_address;
      }
    });

    // 2. Extraer contactos creados manualmente
    customContacts.forEach((c) => {
      const normPhone = (c.phone || "").replace(/\D/g, "");
      const key = normPhone || (c.name || "").trim().toLowerCase();
      if (map.has(key)) {
        const item = map.get(key);
        item.name = c.name || item.name;
        item.phone = c.phone || item.phone;
        item.email = c.email || item.email;
        item.address = c.address || item.address;
        item.notes = c.notes || "";
        item.isCustom = true;
      } else {
        map.set(key, {
          id: c.id || `custom-${Date.now()}-${Math.random()}`,
          name: c.name || "Contacto",
          phone: c.phone || "Sin teléfono",
          email: c.email || "—",
          address: c.address || "—",
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: "Manual",
          notes: c.notes || "",
          isCustom: true,
        });
      }
    });

    return Array.from(map.values());
  }, [orders, customContacts]);

  // Filtrado de contactos
  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contactsList;
    const q = contactSearch.toLowerCase();
    return contactsList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [contactsList, contactSearch]);

  function handleSaveContactForm(e) {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      showToastMsg("Nombre y teléfono son obligatorios");
      return;
    }

    const newContact = {
      id: `custom-${Date.now()}`,
      name: contactForm.name.trim(),
      phone: contactForm.phone.trim(),
      email: contactForm.email.trim() || "—",
      address: contactForm.address.trim() || (contactForm.city.trim() || "—"),
      city: contactForm.city.trim(),
      notes: contactForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newContact, ...customContacts];
    setCustomContacts(updated);
    localStorage.setItem("mialys_custom_contacts", JSON.stringify(updated));
    showToastMsg("Contacto guardado en el directorio");
    setShowContactModal(false);
    setContactForm({ name: "", phone: "", email: "", city: "", address: "", notes: "" });
  }

  function exportContactsToCSV() {
    if (!contactsList.length) {
      showToastMsg("No hay contactos registrados para exportar.");
      return;
    }

    const headers = [
      "Nombre",
      "Teléfono / WhatsApp",
      "Correo Electrónico",
      "Dirección / Ubicación",
      "Pedidos Realizados",
      "Total Comprado USD",
      "Último Pedido",
    ];

    const rows = contactsList.map((c) => [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.phone || ""}"`,
      `"${c.email || ""}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
      `"${c.ordersCount || 0}"`,
      `"${Number(c.totalSpent || 0).toFixed(2)}"`,
      `"${c.lastOrderDate || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Contactos_Mialys_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToastMsg("Directorio de contactos exportado a Excel exitosamente");
  }

  function openWhatsAppContact(c) {
    let clean = (c.phone || "").replace(/\D/g, "");
    if (!clean) {
      showToastMsg("Este contacto no tiene teléfono registrado");
      return;
    }
    if (clean.startsWith("0")) clean = "593" + clean.substring(1);
    else if (!clean.startsWith("593") && clean.length === 9) clean = "593" + clean;

    const text = `Hola ${c.name}, te saludamos cordialmente de Mialys Skin Cosméticos. ¿En qué podemos ayudarte el día de hoy?`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, "_blank");
  }

  // -------------------------------------------------------------
  // VISTA 1: LOGIN COMPLETO
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="portal-login-screen">
        <div className="portal-login-box">
          <div className="portal-brand-head">
            <span className="portal-badge-pill"><LockIcon size={14} /> Acceso Administrativo</span>
            <h1 className="portal-brand-title">Mialys Skin</h1>
            <p className="portal-brand-sub">Portal Empresarial y Logística Integral</p>
          </div>

          <form onSubmit={handleLogin} className="portal-login-form">
            {authError && <div className="portal-alert-error">{authError}</div>}

            <div className="portal-field">
              <label>Correo Electrónico Empresarial</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mialys.com"
                required
              />
            </div>

            <div className="portal-field">
              <label>Contraseña Maestra</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="portal-btn-primary" disabled={authLoading}>
              {authLoading ? "Verificando credenciales..." : "Ingresar al Portal Empresarial →"}
            </button>

            <button type="button" className="portal-btn-demo" onClick={fillDemo}>
              <BoltIcon size={14} /> Cargar Credenciales Demo (1 Clic)
            </button>
          </form>

          <div className="portal-login-foot">
            <button type="button" className="portal-btn-back-store" onClick={onBackToStore}>
              ← Volver a la Tienda Pública
            </button>
            <small>Sistema de administración interna Mialys Skin v2.4</small>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VISTA 2: PORTAL EMPRESARIAL COMPLETO
  // -------------------------------------------------------------
  return (
    <div className="portal-layout">
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="portal-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-mark">MS</div>
          <div className="sidebar-brand-text">
            <h2>Mialys Skin</h2>
            <span>Portal Empresarial</span>
          </div>
        </div>

        <div className="sidebar-status-pill">
          <span className="status-dot"></span> Tienda en Vivo (Ecuador)
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={activeTab === "dashboard" ? "nav-item is-active" : "nav-item"}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="nav-icon"><DashboardIcon size={18} /></span>
            <span className="nav-label">Panel General</span>
          </button>

          <button
            type="button"
            className={activeTab === "orders" ? "nav-item is-active" : "nav-item"}
            onClick={() => setActiveTab("orders")}
          >
            <span className="nav-icon"><PackageIcon size={18} /></span>
            <span className="nav-label">Pedidos y Logística</span>
            {metrics.pendingCount > 0 && <span className="nav-badge">{metrics.pendingCount}</span>}
          </button>

          <button
            type="button"
            className={activeTab === "contacts" ? "nav-item is-active" : "nav-item"}
            onClick={() => setActiveTab("contacts")}
          >
            <span className="nav-icon"><UsersIcon size={18} /></span>
            <span className="nav-label">Contactos</span>
            <span className="nav-badge-gray">{contactsList.length}</span>
          </button>

          <button
            type="button"
            className={activeTab === "catalog" ? "nav-item is-active" : "nav-item"}
            onClick={() => setActiveTab("catalog")}
          >
            <span className="nav-icon"><SparklesIcon size={18} /></span>
            <span className="nav-label">Inventario & Catálogo</span>
            <span className="nav-badge-gray">{products.length}</span>
          </button>

          <button
            type="button"
            className={activeTab === "coupons" ? "nav-item is-active" : "nav-item"}
            onClick={() => setActiveTab("coupons")}
          >
            <span className="nav-icon"><TicketIcon size={18} /></span>
            <span className="nav-label">Cupones y Promos</span>
          </button>

          <button
            type="button"
            className={activeTab === "settings" ? "nav-item is-active" : "nav-item"}
            onClick={() => setActiveTab("settings")}
          >
            <span className="nav-icon"><SettingsIcon size={18} /></span>
            <span className="nav-label">Configuración Tienda</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="btn-store-return" onClick={onBackToStore}>
            <StoreIcon size={16} /> Ver Tienda Pública
          </button>

          <div className="sidebar-user-card">
            <div className="user-avatar">AD</div>
            <div className="user-details">
              <strong>Admin General</strong>
              <span>admin@mialys.com</span>
            </div>
            <button type="button" className="btn-logout" title="Cerrar sesión" onClick={handleLogout}>
              <LogoutIcon size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="portal-main">
        {/* TOP BAR */}
        <header className="portal-topbar">
          <div className="topbar-breadcrumb">
            <span className="crumb-root">Mialys</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">
              {activeTab === "dashboard" && "Panel General y Métricas"}
              {activeTab === "orders" && "Gestión de Pedidos y Envíos"}
              {activeTab === "contacts" && "Directorio de Contactos"}
              {activeTab === "catalog" && "Inventario, Catálogo y Portada Principal"}
              {activeTab === "coupons" && "Cupones y Descuentos"}
              {activeTab === "settings" && "Configuración de Tienda y Envíos"}
            </span>
          </div>

          <div className="topbar-actions">
            <button type="button" className="topbar-btn-return" onClick={onBackToStore}>
              ← Regresar a la Tienda
            </button>
            <button type="button" className="topbar-btn-refresh" onClick={loadData} title="Recargar datos">
              <RefreshIcon size={14} /> Actualizar
            </button>
          </div>
        </header>

        {/* PESTAÑA 1: DASHBOARD GENERAL */}
        {activeTab === "dashboard" && (
          <div className="portal-view">
            <div className="view-header">
              <div>
                <h2>Resumen Ejecutivo de Negocio</h2>
                <p>Métricas de ventas, pedidos en tránsito y alertas de inventario en tiempo real.</p>
              </div>
              <div className="view-header-btns">
                <button type="button" className="btn-action-primary" onClick={handleOpenCreateProduct}>
                  <PlusIcon size={14} /> Nuevo Producto
                </button>
                <button type="button" className="btn-action-outline" onClick={exportOrdersToCSV}>
                  <DownloadIcon size={14} /> Exportar Excel (CSV)
                </button>
              </div>
            </div>

            {/* TARJETAS KPI */}
            <div className="kpi-grid">
              <div className="kpi-card kpi-sales">
                <div className="kpi-icon-wrap"><MoneyIcon size={22} /></div>
                <div className="kpi-data">
                  <span className="kpi-label">Ventas del Mes</span>
                  <strong className="kpi-value">{formatPrice(metrics.monthlyTotal)}</strong>
                  <span className="kpi-sub">{metrics.monthlyCount} pedidos registrados</span>
                </div>
              </div>

              <div className="kpi-card kpi-pending">
                <div className="kpi-icon-wrap"><PackageIcon size={22} /></div>
                <div className="kpi-data">
                  <span className="kpi-label">Por Despachar</span>
                  <strong className="kpi-value">{metrics.pendingCount}</strong>
                  <span className="kpi-sub">En preparación o pagados</span>
                </div>
              </div>

              <div className="kpi-card kpi-transit">
                <div className="kpi-icon-wrap"><TruckIcon size={22} /></div>
                <div className="kpi-data">
                  <span className="kpi-label">En Camino</span>
                  <strong className="kpi-value">{metrics.inTransitCount}</strong>
                  <span className="kpi-sub">Con guía activa</span>
                </div>
              </div>

              <div className="kpi-card kpi-bestseller">
                <div className="kpi-icon-wrap"><SparklesIcon size={22} /></div>
                <div className="kpi-data">
                  <span className="kpi-label">Más Vendido</span>
                  <strong className="kpi-value-sm" title={metrics.topProduct.name}>
                    {metrics.topProduct.name}
                  </strong>
                  <span className="kpi-sub">{metrics.topProduct.qty} unidades vendidas</span>
                </div>
              </div>
            </div>

            {/* ALERTA DE STOCK BAJO */}
            {metrics.lowStockCount > 0 && (
              <div className="portal-banner-warning">
                <div className="warning-text">
                  <strong><AlertTriangleIcon size={16} /> Alerta de Inventario:</strong> Tienes {metrics.lowStockCount} producto(s) con stock crítico (menos de 3 unidades).
                </div>
                <button
                  type="button"
                  className="warning-btn"
                  onClick={() => {
                    setStockStatusFilter("low_stock");
                    setActiveTab("catalog");
                  }}
                >
                  Revisar Inventario →
                </button>
              </div>
            )}

            {/* TABLA DE ÚLTIMOS PEDIDOS */}
            <div className="portal-section-card">
              <div className="section-card-head">
                <h3>Últimos Pedidos Realizados</h3>
                <button type="button" className="btn-link" onClick={() => setActiveTab("orders")}>
                  Ver todos los pedidos ({orders.length}) →
                </button>
              </div>

              <div className="portal-table-wrap">
                <table className="portal-table table-compact">
                  <thead>
                    <tr>
                      <th style={{ width: "80px" }}>Orden</th>
                      <th style={{ width: "85px" }}>Fecha</th>
                      <th>Cliente</th>
                      <th style={{ width: "70px", textAlign: "center" }}>Cant.</th>
                      <th style={{ width: "80px" }}>Total</th>
                      <th style={{ width: "160px" }}>Estado</th>
                      <th style={{ width: "160px" }}>Guía Courier</th>
                      <th style={{ width: "85px", textAlign: "center" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => {
                      const cfg = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP["En preparación"];
                      return (
                        <tr key={o.id}>
                          <td>
                            <strong>#{o.id}</strong>
                            <span className="table-sub">{o.payment_method?.split("(")[0]}</span>
                          </td>
                          <td>{o.created_at ? new Date(o.created_at).toLocaleDateString("es-EC") : "Hoy"}</td>
                          <td>
                            <strong>{o.customer_name}</strong>
                            <span className="table-sub">{o.customer_phone}</span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className="clean-qty-text">{(o.items || []).length} prod.</span>
                          </td>
                          <td>
                            <strong className="text-price">{formatPrice(o.total)}</strong>
                          </td>
                          <td>
                            <span className={`status-badge ${cfg.badgeClass}`}>
                              {getStatusIcon(o.status)} {cfg.label}
                            </span>
                          </td>
                          <td>
                            {o.carrier ? (
                              <span>
                                {o.carrier}: <code>{o.tracking_number || "Asignada"}</code>
                              </span>
                            ) : (
                              <span className="text-muted">Sin asignar</span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div className="actions-icons-clean">
                              <button
                                type="button"
                                className="btn-icon-wa"
                                title="Notificar por WhatsApp al cliente"
                                aria-label="Notificar por WhatsApp"
                                onClick={() => sendWhatsAppTracking(o)}
                              >
                                <WhatsAppIcon size={17} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon-action"
                                title="Ver Detalle"
                                aria-label="Ver Detalle"
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setActiveTab("orders");
                                }}
                              >
                                <EyeIcon size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: PEDIDOS Y LOGÍSTICA COMPLETA */}
        {activeTab === "orders" && (
          <div className="portal-view">
            <div className="view-header">
              <div>
                <h2>Gestión de Pedidos y Envíos</h2>
                <p>Controla el flujo de despacho, asigna números de guía y notifica al cliente con 1 clic.</p>
              </div>
              <div className="view-header-btns">
                <button type="button" className="btn-action-primary" onClick={exportOrdersToCSV}>
                  <DownloadIcon size={14} /> Exportar a Excel (CSV)
                </button>
              </div>
            </div>

            {/* BARRA DE FILTROS Y BÚSQUEDA */}
            <div className="filter-bar">
              <div className="search-input-wrap">
                <span className="search-icon"><SearchIcon size={15} /></span>
                <input
                  type="text"
                  placeholder="Buscar por cliente, # orden, teléfono o transportista..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
                {orderSearch && (
                  <button type="button" className="clear-btn" onClick={() => setOrderSearch("")} aria-label="Limpiar búsqueda">
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              <div className="status-filter-pills">
                {["todos", "En preparación", "Enviado", "Entregado", "Pagado", "Cancelado"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={orderFilter === st ? "pill-btn is-active" : "pill-btn"}
                    onClick={() => setOrderFilter(st)}
                  >
                    {st === "todos" ? "Todos los pedidos" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLA PRINCIPAL DE PEDIDOS LIMPIA (SIN CONTENEDORES PESADOS) */}
            <div className="portal-section-card">
              <div className="portal-table-wrap">
                <table className="portal-table table-compact">
                  <thead>
                    <tr>
                      <th style={{ width: "85px" }}># Orden</th>
                      <th style={{ width: "85px" }}>Fecha</th>
                      <th>Cliente & Contacto</th>
                      <th>Dirección</th>
                      <th style={{ width: "70px", textAlign: "center" }}>Cant.</th>
                      <th style={{ width: "85px" }}>Total</th>
                      <th style={{ width: "165px" }}>Estado</th>
                      <th style={{ width: "165px" }}>Transportista / Guía</th>
                      <th style={{ width: "85px", textAlign: "center" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="table-empty">
                          No se encontraron pedidos con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        return (
                          <tr key={o.id}>
                            <td>
                              <strong>#{o.id}</strong>
                              <span className="table-sub">{o.payment_method?.split("(")[0]}</span>
                            </td>
                            <td>{o.created_at ? new Date(o.created_at).toLocaleDateString("es-EC") : "Reciente"}</td>
                            <td>
                              <strong>{o.customer_name}</strong>
                              <span className="table-sub"><PhoneIcon size={12} /> {o.customer_phone}</span>
                            </td>
                            <td>
                              <span className="address-snippet" title={o.customer_address}>
                                {o.customer_address || "Sin dirección"}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <span className="clean-qty-text">{(o.items || []).length} prod.</span>
                            </td>
                            <td>
                              <strong className="text-price">{formatPrice(o.total)}</strong>
                            </td>
                            <td>
                              <select
                                className="clean-status-select"
                                value={o.status || "En preparación"}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              >
                                <option value="En preparación">En preparación</option>
                                <option value="Enviado">Enviado (En camino)</option>
                                <option value="Entregado">Entregado</option>
                                <option value="Pagado">Pagado</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                            </td>
                            <td>
                              <div className="carrier-clean-cell">
                                <span className="carrier-clean-name">{o.carrier || "Sin asignar"}</span>
                                <input
                                  type="text"
                                  className="tracking-clean-input"
                                  placeholder="Guía..."
                                  defaultValue={o.tracking_number || ""}
                                  onBlur={(e) => {
                                    if (e.target.value !== o.tracking_number) {
                                      handleSaveShippingData(o.id, { tracking_number: e.target.value });
                                    }
                                  }}
                                />
                              </div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="actions-icons-clean">
                                <button
                                  type="button"
                                  className="btn-icon-wa"
                                  title="Notificar por WhatsApp al cliente"
                                  aria-label="Notificar por WhatsApp"
                                  onClick={() => sendWhatsAppTracking(o)}
                                >
                                  <WhatsAppIcon size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon-action"
                                  title="Ver detalle completo"
                                  aria-label="Ver detalle"
                                  onClick={() => setSelectedOrder(o)}
                                >
                                  <EyeIcon size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: DIRECTORIO DE CONTACTOS (SOLO CONTACTOS) */}
        {activeTab === "contacts" && (
          <div className="portal-view">
            <div className="view-header">
              <div>
                <h2>Directorio de Contactos</h2>
                <p>Lista centralizada de todos los clientes y contactos para atención directa, llamadas y WhatsApp.</p>
              </div>
              <div className="view-header-btns">
                <button
                  type="button"
                  className="btn-action-primary"
                  onClick={() => {
                    setContactForm({ name: "", phone: "", email: "", city: "", address: "", notes: "" });
                    setShowContactModal(true);
                  }}
                >
                  <PlusIcon size={14} /> Nuevo Contacto
                </button>
                <button type="button" className="btn-action-outline" onClick={exportContactsToCSV}>
                  <DownloadIcon size={14} /> Exportar Contactos (CSV)
                </button>
              </div>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="filter-bar">
              <div className="search-input-wrap">
                <span className="search-icon"><SearchIcon size={15} /></span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono, correo o dirección..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
                {contactSearch && (
                  <button type="button" className="clear-btn" onClick={() => setContactSearch("")} aria-label="Limpiar búsqueda">
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>
              <span className="clean-qty-text">{filteredContacts.length} contacto(s) en lista</span>
            </div>

            {/* TABLA DE CONTACTOS LIMPIA (SIN CONTENEDORES PESADOS, SOLO ICONOS) */}
            <div className="portal-section-card">
              <div className="portal-table-wrap">
                <table className="portal-table table-compact">
                  <thead>
                    <tr>
                      <th style={{ width: "42px" }}></th>
                      <th>Nombre del Contacto</th>
                      <th style={{ width: "155px" }}>Teléfono / WhatsApp</th>
                      <th>Correo Electrónico</th>
                      <th>Dirección</th>
                      <th style={{ width: "120px", textAlign: "center" }}>Historial</th>
                      <th style={{ width: "85px", textAlign: "center" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="table-empty">
                          No se encontraron contactos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredContacts.map((c) => {
                        const initials = (c.name || "C")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();

                        return (
                          <tr key={c.id}>
                            <td style={{ textAlign: "center" }}>
                              <div className="contact-avatar-sm">{initials}</div>
                            </td>
                            <td>
                              <strong className="contact-name">{c.name}</strong>
                              {c.notes && <div className="contact-notes">{c.notes}</div>}
                            </td>
                            <td>
                              <strong className="contact-phone-val">{c.phone}</strong>
                            </td>
                            <td className="text-muted-clean">{c.email}</td>
                            <td>
                              <span className="address-snippet" title={c.address}>
                                {c.address}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="contact-history-stat">
                                <strong>{c.ordersCount} {c.ordersCount === 1 ? "pedido" : "pedidos"}</strong>
                                {c.totalSpent > 0 && <span>{formatPrice(c.totalSpent)}</span>}
                              </div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="actions-icons-clean">
                                <button
                                  type="button"
                                  className="btn-icon-wa"
                                  title="Iniciar chat de WhatsApp"
                                  aria-label="Abrir WhatsApp"
                                  onClick={() => openWhatsAppContact(c)}
                                >
                                  <WhatsAppIcon size={17} />
                                </button>
                                {c.phone && c.phone !== "Sin teléfono" && (
                                  <a
                                    href={`tel:${c.phone.replace(/\s+/g, "")}`}
                                    className="btn-icon-action"
                                    title="Llamar al contacto"
                                    aria-label="Llamar"
                                  >
                                    <PhoneIcon size={15} />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: GESTIÓN DE CATÁLOGO & INVENTARIO */}
        {activeTab === "catalog" && (
          <div className="portal-view">
            <div className="view-header">
              <div>
                <h2>Control de Inventario, Catálogo y Portada</h2>
                <p>Monitorea existencias (lo que hay y lo que se agotó), añade o elimina productos, y elige cuáles destacar en la Página Principal.</p>
              </div>
              <div className="view-header-btns">
                <button type="button" className="btn-action-primary" onClick={handleOpenCreateProduct}>
                  <PlusIcon size={14} /> Crear Nuevo Producto
                </button>
              </div>
            </div>

            {/* FILTROS DE ESTADO EN LÍNEA LIMPIA (SIN CAJAS PESADAS) */}
            <div className="clean-filter-pills">
              <button
                type="button"
                className={`clean-pill ${stockStatusFilter === "todos" ? "is-active" : ""}`}
                onClick={() => setStockStatusFilter("todos")}
              >
                Todos ({metrics.totalProducts})
              </button>
              <button
                type="button"
                className={`clean-pill is-stock ${stockStatusFilter === "in_stock" ? "is-active" : ""}`}
                onClick={() => setStockStatusFilter("in_stock")}
              >
                <span className="filter-dot is-stock"></span> En Stock ({metrics.inStockCount})
              </button>
              <button
                type="button"
                className={`clean-pill is-low ${stockStatusFilter === "low_stock" ? "is-active" : ""}`}
                onClick={() => setStockStatusFilter("low_stock")}
              >
                <span className="filter-dot is-low"></span> Poco Stock ({metrics.lowStockCount})
              </button>
              <button
                type="button"
                className={`clean-pill is-zero ${stockStatusFilter === "out_of_stock" ? "is-active" : ""}`}
                onClick={() => setStockStatusFilter("out_of_stock")}
              >
                <span className="filter-dot is-zero"></span> Agotados ({metrics.outOfStockCount})
              </button>
              <button
                type="button"
                className={`clean-pill is-featured ${stockStatusFilter === "featured" ? "is-active" : ""}`}
                onClick={() => setStockStatusFilter("featured")}
              >
                <StarIcon size={14} filled={true} /> En Portada ({metrics.featuredCount})
              </button>
              <button
                type="button"
                className={`clean-pill ${stockStatusFilter === "paused" ? "is-active" : ""}`}
                onClick={() => setStockStatusFilter("paused")}
              >
                <EyeOffIcon size={14} /> Pausados ({metrics.pausedCount})
              </button>
            </div>

            {/* FILTROS DE BÚSQUEDA Y MARCA */}
            <div className="filter-bar">
              <div className="search-input-wrap">
                <span className="search-icon"><SearchIcon size={15} /></span>
                <input
                  type="text"
                  placeholder="Buscar producto por nombre, marca o aroma..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
                {catalogSearch && (
                  <button type="button" className="clear-btn" onClick={() => setCatalogSearch("")} aria-label="Limpiar búsqueda">
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              <div className="filter-dropdowns">
                <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
                  <option value="Todas">Todas las Marcas</option>
                  {BRAND_FILTERS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="Todas">Todas las Categorías</option>
                  <option value="Cremas">Cremas</option>
                  <option value="Perfumes">Perfumes</option>
                  <option value="Desodorantes">Desodorantes</option>
                  <option value="Maquillaje">Maquillaje</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Capilar">Capilar</option>
                  <option value="Sets">Sets</option>
                </select>
              </div>
            </div>

            {/* TABLA DE PRODUCTOS LIMPIA (SOLO ICONOS, SIN CONTENEDORES PESADOS) */}
            <div className="portal-section-card">
              <div className="portal-table-wrap">
                <table className="portal-table table-compact">
                  <thead>
                    <tr>
                      <th style={{ width: "54px" }}>Foto</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th style={{ width: "95px" }}>Precio</th>
                      <th style={{ width: "125px" }}>Stock</th>
                      <th style={{ width: "70px", textAlign: "center" }} title="Mostrar en página principal">Portada</th>
                      <th style={{ width: "70px", textAlign: "center" }} title="Visible u oculto en tienda">Estado</th>
                      <th style={{ width: "95px", textAlign: "center" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="table-empty">
                          No hay productos que coincidan con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const stock = p.stock ?? 10;
                        const isZero = stock === 0;
                        const isLow = stock > 0 && stock <= 3;
                        const isFeatured = Boolean(p.featured);

                        return (
                          <tr key={p.id} className={p.paused ? "row-paused" : ""}>
                            <td>
                              <img
                                src={p.image || p.photo || "/carrusel/nube.jpg"}
                                alt={p.name}
                                className="catalog-thumb-img"
                              />
                            </td>
                            <td>
                              <strong className="prod-name-clean">{p.name}</strong>
                              <div className="prod-sub-clean">
                                <span>{p.brand || "Natura"}</span>
                                {p.variant && <span> • {p.variant}</span>}
                                {p.badge && <span className="prod-badge-sub"> [{p.badge}]</span>}
                              </div>
                            </td>
                            <td className="text-muted-clean">{p.category || "Cremas"}</td>
                            <td>
                              <div className="price-clean-input">
                                <span>$</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="1"
                                  className="clean-inline-input"
                                  defaultValue={p.price}
                                  onBlur={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > 0 && val !== p.price) {
                                      handleQuickUpdateProduct(p.id, { price: val });
                                    }
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              {/* Stock limpio sin cajas dobles ni botones apilados */}
                              <div className="stock-clean-input">
                                <input
                                  type="number"
                                  min="0"
                                  className={`clean-inline-input ${
                                    isZero ? "input-zero" : isLow ? "input-low" : ""
                                  }`}
                                  defaultValue={stock}
                                  onBlur={(e) => {
                                    const val = Number(e.target.value);
                                    if (val >= 0 && val !== stock) {
                                      handleQuickUpdateProduct(p.id, { stock: val });
                                    }
                                  }}
                                />
                                <span className={`stock-text-status ${isZero ? "txt-zero" : isLow ? "txt-low" : "txt-ok"}`}>
                                  {isZero ? "Agotado" : "unid."}
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {/* PÁGINA PRINCIPAL: SOLO ICONO ESTRELLA */}
                              <button
                                type="button"
                                className={`btn-icon-circle star ${isFeatured ? "is-featured" : ""}`}
                                onClick={() => handleToggleFeatured(p.id)}
                                title={isFeatured ? "En Portada (clic para quitar)" : "Destacar en Página Principal"}
                                aria-label="Destacar en portada"
                              >
                                <StarIcon size={18} filled={isFeatured} />
                              </button>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {/* TIENDA: SOLO ICONO (SIN PALABRAS) */}
                              <button
                                type="button"
                                className={`btn-icon-circle ${p.paused ? "is-paused" : "is-visible"}`}
                                onClick={() => handleToggleProductPause(p.id)}
                                title={p.paused ? "Oculto / Pausado (clic para activar)" : "Visible en tienda (clic para pausar)"}
                                aria-label="Estado en tienda"
                              >
                                {p.paused ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                              </button>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {/* ACCIONES: SOLO ICONOS EDITAR Y ELIMINAR (SIN TEXTO) */}
                              <div className="actions-icons-clean">
                                <button
                                  type="button"
                                  className="btn-icon-action edit"
                                  title="Editar producto"
                                  aria-label="Editar producto"
                                  onClick={() => handleOpenEditProduct(p)}
                                >
                                  <PencilIcon size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon-action delete"
                                  title="Eliminar producto"
                                  aria-label="Eliminar producto"
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                >
                                  <TrashIcon size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: CUPONES & PROMOCIONES */}
        {activeTab === "coupons" && (
          <div className="portal-view">
            <div className="view-header">
              <div>
                <h2>Cupones de Descuento y Promociones</h2>
                <p>Crea códigos promocionales para incentivar compras en el carrito de la tienda.</p>
              </div>
            </div>

            {/* FORMULARIO NUEVO CUPÓN */}
            <div className="portal-section-card">
              <div className="section-card-head">
                <h3><PlusIcon size={16} /> Crear Nuevo Código de Cupón</h3>
              </div>
              <form onSubmit={handleAddCoupon} className="coupon-create-form">
                <div className="form-group">
                  <label>Código del Cupón</label>
                  <input
                    type="text"
                    placeholder="Ej. NAVIDAD15"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Beneficio</label>
                  <select value={newCouponType} onChange={(e) => setNewCouponType(e.target.value)}>
                    <option value="percent">Porcentaje de Descuento (%)</option>
                    <option value="fixed">Monto Fijo en Dólares ($)</option>
                    <option value="free_shipping">Envío Gratis Garantizado</option>
                  </select>
                </div>

                {newCouponType !== "free_shipping" && (
                  <div className="form-group">
                    <label>Valor {newCouponType === "percent" ? "(%)" : "($ USD)"}</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={newCouponVal}
                      onChange={(e) => setNewCouponVal(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group form-grow">
                  <label>Descripción / Mensaje al cliente</label>
                  <input
                    type="text"
                    placeholder="Ej. 15% de descuento por temporada navideña"
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-action-primary">
                  Crear Cupón
                </button>
              </form>
            </div>

            {/* LISTADO DE CUPONES */}
            <div className="coupons-grid">
              {coupons.map((c) => (
                <div key={c.code} className={`coupon-card ${c.active === false ? "is-disabled" : ""}`}>
                  <div className="coupon-card-header">
                    <span className="coupon-code-pill">{c.code}</span>
                    <button
                      type="button"
                      className="coupon-delete-btn"
                      title="Eliminar cupón"
                      aria-label="Eliminar cupón"
                      onClick={() => handleDeleteCoupon(c.code)}
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                  <div className="coupon-card-body">
                    <strong>
                      {c.type === "percent" && `${c.value}% de Descuento`}
                      {c.type === "fixed" && `$${Number(c.value).toFixed(2)} de Descuento`}
                      {c.type === "free_shipping" && "Envío 100% Gratis"}
                    </strong>
                    <p>{c.description || "Cupón promocional Mialys Skin"}</p>
                  </div>
                  <div className="coupon-card-footer">
                    <button
                      type="button"
                      className={c.active === false ? "coupon-toggle-off" : "coupon-toggle-on"}
                      onClick={() => handleToggleCoupon(c.code)}
                    >
                      {c.active === false ? (
                        <><CloseIcon size={13} /> Desactivado</>
                      ) : (
                        <><CheckIcon size={13} /> Activo en Tienda</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 5: CONFIGURACIÓN DE TIENDA */}
        {activeTab === "settings" && (
          <div className="portal-view">
            <div className="view-header">
              <div>
                <h2>Configuración General de la Tienda</h2>
                <p>Ajusta el contacto de atención, reglas de despacho y datos fiscales de la tienda.</p>
              </div>
            </div>

            <div className="portal-section-card max-w-2xl">
              <form onSubmit={handleSaveSettings} className="settings-form">
                <div className="form-group">
                  <label>Número de WhatsApp para Pedidos y Notificaciones (Ecuador)</label>
                  <input
                    type="text"
                    value={storeSettings.whatsapp}
                    onChange={(e) => setStoreSettings({ ...storeSettings, whatsapp: e.target.value })}
                    placeholder="0998444418"
                    required
                  />
                  <small>Usado para coordinar pedidos y generar enlaces automáticos de seguimiento.</small>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Umbral Mínimo para Envío Gratis ($ USD)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={storeSettings.freeShippingMin}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, freeShippingMin: Number(e.target.value) })
                      }
                      required
                    />
                    <small>Actualmente compras mayores a este valor tienen envío gratis.</small>
                  </div>

                  <div className="form-group">
                    <label>Costo de Envío Estándar ($ USD)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={storeSettings.standardShipping}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, standardShipping: Number(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nombre Comercial de la Tienda</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Ubicación / Ciudad Base</label>
                  <input
                    type="text"
                    value={storeSettings.city}
                    onChange={(e) => setStoreSettings({ ...storeSettings, city: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-action-primary">
                  Guardar Configuración
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* DRAWER / MODAL LATERAL DE DETALLE DE PEDIDO */}
      {selectedOrder && (
        <div className="drawer-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-tag">Detalle de la Orden</span>
                <h3>#{selectedOrder.id}</h3>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedOrder(null)}
                aria-label="Cerrar detalle"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* ESTADO */}
              <div className="drawer-box">
                <label className="drawer-label">Estado de la Orden</label>
                <div className="drawer-status-row">
                  <select
                    className={`status-select-lg ${
                      (ORDER_STATUS_MAP[selectedOrder.status] || ORDER_STATUS_MAP["En preparación"]).badgeClass
                    }`}
                    value={selectedOrder.status || "En preparación"}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  >
                    <option value="En preparación">En preparación</option>
                    <option value="Enviado">Enviado (En camino)</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Pagado">Pagado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>

                  <button
                    type="button"
                    className="btn-whatsapp-action"
                    onClick={() => sendWhatsAppTracking(selectedOrder)}
                  >
                    <WhatsAppIcon size={16} /> Notificar por WhatsApp
                  </button>
                </div>
              </div>

              {/* DATOS DEL CLIENTE */}
              <div className="drawer-box">
                <h4 className="drawer-box-title"><UserIcon size={16} /> Datos del Cliente</h4>
                <div className="data-grid-2">
                  <div>
                    <span className="data-lbl">Nombre:</span>
                    <strong>{selectedOrder.customer_name}</strong>
                  </div>
                  <div>
                    <span className="data-lbl">Teléfono:</span>
                    <strong>{selectedOrder.customer_phone}</strong>
                  </div>
                  <div>
                    <span className="data-lbl">Email:</span>
                    <span>{selectedOrder.customer_email || "No registrado"}</span>
                  </div>
                  <div>
                    <span className="data-lbl">Pago:</span>
                    <span>{selectedOrder.payment_method}</span>
                  </div>
                </div>
                <div className="data-address">
                  <span className="data-lbl">Dirección de Entrega:</span>
                  <strong>{selectedOrder.customer_address || "Sin dirección registrada"}</strong>
                </div>
              </div>

              {/* PRODUCTOS COMPRADOS */}
              <div className="drawer-box">
                <h4 className="drawer-box-title"><PackageIcon size={16} /> Productos de la Orden</h4>
                <div className="drawer-items-list">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="drawer-item-row">
                      <div className="drawer-item-info">
                        <strong>{it.name}</strong>
                        <span className="table-sub">
                          Cantidad: x{it.qty} • {formatPrice(it.price)} c/u
                        </span>
                      </div>
                      <div className="drawer-item-total">
                        {formatPrice((it.price || 0) * (it.qty || 1))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="drawer-order-total">
                  <span>Total Pagado:</span>
                  <strong>{formatPrice(selectedOrder.total)}</strong>
                </div>
              </div>

              {/* LOGÍSTICA Y TRANSPORTE */}
              <div className="drawer-box">
                <h4 className="drawer-box-title"><TruckIcon size={16} /> Despacho y Transportista</h4>
                <div className="form-group mb-3">
                  <label>Empresa de Mensajería</label>
                  <select
                    value={selectedOrder.carrier || "Servientrega"}
                    onChange={(e) => handleSaveShippingData(selectedOrder.id, { carrier: e.target.value })}
                  >
                    {COURIERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label>Número de Guía de Rastreo</label>
                  <input
                    type="text"
                    defaultValue={selectedOrder.tracking_number || ""}
                    placeholder="Ej. SERV-992104"
                    onBlur={(e) => handleSaveShippingData(selectedOrder.id, { tracking_number: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha Estimada de Entrega</label>
                  <input
                    type="date"
                    defaultValue={selectedOrder.shipping_date || ""}
                    onChange={(e) => handleSaveShippingData(selectedOrder.id, { shipping_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                className="btn-action-primary w-full"
                onClick={() => sendWhatsAppTracking(selectedOrder)}
              >
                <WhatsAppIcon size={16} /> Abrir WhatsApp y Enviar Guía al Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {showProductModal && (
        <div className="drawer-backdrop" onClick={() => setShowProductModal(false)}>
          <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-head">
              <h3>
                {editingProduct ? (
                  <><PencilIcon size={18} /> Editar Producto</>
                ) : (
                  <><PlusIcon size={18} /> Crear Nuevo Producto</>
                )}
              </h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowProductModal(false)}
                aria-label="Cerrar modal"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="modal-dialog-body">
              <div className="form-group">
                <label>Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Crema corporal Tododia Mora Roja"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Marca</label>
                  <select
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  >
                    {BRAND_FILTERS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="Cremas">Cremas</option>
                    <option value="Perfumes">Perfumes</option>
                    <option value="Desodorantes">Desodorantes</option>
                    <option value="Maquillaje">Maquillaje</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Capilar">Capilar</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Precio de Venta ($ USD) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Inventario Inicial (Stock) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                  <small className="field-hint">0 = Agotado para los clientes</small>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Aroma / Variante (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Fresa y Vainilla"
                    value={productForm.variant}
                    onChange={(e) => setProductForm({ ...productForm, variant: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Piel</label>
                  <select
                    value={productForm.skin}
                    onChange={(e) => setProductForm({ ...productForm, skin: e.target.value })}
                  >
                    <option value="Todo tipo de piel">Todo tipo de piel</option>
                    <option value="Piel Seca">Piel Seca</option>
                    <option value="Piel Grasa">Piel Grasa</option>
                    <option value="Piel Mixta">Piel Mixta</option>
                    <option value="Piel Sensible">Piel Sensible</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Etiqueta / Insignia Visual</label>
                  <select
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                  >
                    <option value="Más vendido">Más vendido</option>
                    <option value="Nuevo aroma">Nuevo aroma</option>
                    <option value="Pocas unidades">Pocas unidades</option>
                    <option value="Descuento por tiempo limitado">Descuento por tiempo limitado</option>
                    <option value="Exclusivo">Exclusivo</option>
                  </select>
                </div>

                {/* CONTROL DESTACAR EN PÁGINA PRINCIPAL */}
                <div className="form-group flex-center-group">
                  <label className="checkbox-featured-lbl">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    />
                    <span><StarIcon size={14} filled={true} /> Mostrar en la Página Principal (Productos Destacados)</span>
                  </label>
                  <small className="field-hint">Aparecerá en la sección "Productos Destacados" del inicio.</small>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción del Producto</label>
                <textarea
                  rows={2}
                  placeholder="Beneficios, ingredientes y modo de uso..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                ></textarea>
              </div>

              {/* SELECTOR RÁPIDO DE FOTO */}
              <div className="form-group">
                <label>Foto del Producto</label>
                <input
                  type="text"
                  placeholder="/carrusel/nube.jpg o URL externa"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                />
                <div className="photo-presets-row">
                  <span className="photo-presets-title">O elige una foto existente:</span>
                  <div className="presets-chips">
                    {IMAGE_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.url}
                        className={`preset-btn ${productForm.image === p.url ? "is-selected" : ""}`}
                        onClick={() => setProductForm({ ...productForm, image: p.url })}
                      >
                        <img src={p.url} alt={p.label} />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-dialog-foot">
                <button type="button" className="btn-action-outline" onClick={() => setShowProductModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-action-primary">
                  {editingProduct ? "Guardar Cambios" : "Crear y Publicar en Tienda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVO CONTACTO */}
      {showContactModal && (
        <div className="drawer-backdrop" onClick={() => setShowContactModal(false)}>
          <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-head">
              <h3><PlusIcon size={18} /> Nuevo Contacto</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowContactModal(false)}
                aria-label="Cerrar modal"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveContactForm} className="modal-dialog-body">
              <div className="form-group">
                <label>Nombre Completo del Contacto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Valeria Mendoza"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 0987654321"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    placeholder="valeria@ejemplo.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Ciudad / Provincia</label>
                  <input
                    type="text"
                    placeholder="Ej. Guayaquil, Samborondón, Quito..."
                    value={contactForm.city}
                    onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Dirección de Entrega</label>
                  <input
                    type="text"
                    placeholder="Calle, número, urbanización..."
                    value={contactForm.address}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notas de Cliente (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Preferencias de productos, horarios de atención..."
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-dialog-foot">
                <button type="button" className="btn-action-outline" onClick={() => setShowContactModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-action-primary">
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST FLOTANTE */}
      {toast && (
        <div className="portal-toast" role="alert">
          {toast}
        </div>
      )}
    </div>
  );
}

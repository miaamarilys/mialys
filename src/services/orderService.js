import { supabase, isSupabaseConfigured } from "../config/supabase.js";

const ORDERS_STORAGE_KEY = "mialys_orders_data";

const INITIAL_SAMPLE_ORDERS = [
  {
    id: "MS-4102",
    customer_name: "Valeria Mendoza",
    customer_phone: "0987654321",
    customer_email: "valeria.m@example.com",
    customer_address: "Av. Samborondón Km 2.5, Guayaquil",
    items: [
      { id: "nube", name: "Crema corporal nutrición prebiótica (Fresa)", qty: 2, price: 17 },
      { id: "perfume-rosa", name: "Body Splash Fresa y Vainilla", qty: 1, price: 32 },
    ],
    total: 66.0,
    payment_method: "Tarjeta de Crédito (Visa •••• 4242)",
    status: "En preparación",
    shipping_date: "15/11/2026",
    tracking_number: "SERV-992104",
    carrier: "Servientrega",
    notes: "Entrega preferente por la tarde",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "MS-4098",
    customer_name: "Carlos Andrade",
    customer_phone: "0991234567",
    customer_email: "carlos.a@example.com",
    customer_address: "Calle Los Guayacanes 142, Quito",
    items: [
      { id: "lino", name: "Crema corporal antiestrés Lino", qty: 1, price: 17 },
      { id: "deo-roll", name: "Desodorante Roll-on Natura", qty: 2, price: 6 },
    ],
    total: 29.0,
    payment_method: "Tarjeta de Débito (Mastercard •••• 8812)",
    status: "Enviado",
    shipping_date: "14/11/2026",
    tracking_number: "LAAR-553210",
    carrier: "Laar Courier",
    notes: "Guía entregada al cliente",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

function getLocalOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ORDERS));
      return INITIAL_SAMPLE_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAMPLE_ORDERS;
  }
}

function saveLocalOrders(orders) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn("No se pudo guardar pedidos en localStorage:", err);
  }
}

/**
 * Obtiene la lista de pedidos (conectado a Supabase PostgreSQL)
 */
export async function getOrders() {
  // 1. Intentar cargar desde Supabase vía API
  try {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalOrders(data);
        return data;
      }
    }
  } catch {}

  // 2. Intentar Supabase Client SDK
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        saveLocalOrders(data);
        return data;
      }
    } catch (err) {
      console.warn("Error al cargar pedidos de Supabase, usando respaldo local:", err);
    }
  }

  // 3. Respaldo local
  return getLocalOrders();
}

/**
 * Crea un nuevo pedido y lo guarda en Supabase PostgreSQL
 */
export async function createOrder({
  customerName,
  customerPhone,
  customerEmail = "",
  customerAddress = "",
  items,
  total,
  paymentMethod = "Tarjeta de Crédito / Débito",
  notes = "",
}) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `MS-${randomSuffix}`;
  
  const estimatedShipping = new Date(Date.now() + 86400000 * 2)
    .toISOString()
    .split("T")[0];

  const newOrder = {
    id,
    customer_name: customerName || "Cliente Web",
    customer_phone: customerPhone || "No especificado",
    customer_email: customerEmail,
    customer_address: customerAddress || "Retiro en local / Por coordinar",
    items: items.map((it) => ({
      id: it.id,
      name: it.name,
      qty: it.qty,
      price: it.price,
    })),
    total: Number(total),
    payment_method: paymentMethod,
    status: "Pagado",
    shipping_date: estimatedShipping,
    tracking_number: `GUIA-${randomSuffix}`,
    carrier: "Servientrega",
    notes,
    created_at: new Date().toISOString(),
  };

  // Guardar en Supabase PostgreSQL vía API
  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });
  } catch (err) {
    console.warn("Error guardando orden en Supabase API:", err);
  }

  // Guardar en Supabase SDK si está configurado
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("orders").insert([newOrder]);
    } catch {}
  }

  // Mantener actualizado en localStorage
  const current = getLocalOrders();
  const updated = [newOrder, ...current];
  saveLocalOrders(updated);

  return newOrder;
}

/**
 * Actualiza el estado y datos de envío de un pedido en Supabase PostgreSQL
 */
export async function updateOrder(id, fields) {
  // Sincronizar vía API
  try {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  } catch (err) {
    console.warn("Error actualizando orden en Supabase API:", err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("orders").update(fields).eq("id", id);
    } catch {}
  }

  const current = getLocalOrders();
  const updated = current.map((order) =>
    order.id === id ? { ...order, ...fields } : order
  );
  saveLocalOrders(updated);
  return updated;
}

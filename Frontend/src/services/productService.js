import { supabase, isSupabaseConfigured } from "../config/supabase.js";
import { products as defaultProducts, featured as defaultFeatured } from "../data/products.js";

const CUSTOM_CATALOG_KEY = "mialys_custom_catalog";

function getLocalCustomCatalog() {
  try {
    const raw = localStorage.getItem(CUSTOM_CATALOG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalCustomCatalog(catalog) {
  try {
    localStorage.setItem(CUSTOM_CATALOG_KEY, JSON.stringify(catalog));
    window.dispatchEvent(new Event("mialys-catalog-updated"));
  } catch (err) {
    console.warn("No se pudo guardar catálogo en localStorage:", err);
  }
}

/**
 * Obtiene todos los productos (conectado a Supabase PostgreSQL con fallback local)
 */
export async function getProducts(includePaused = false) {
  let list = [];

  // 1. Intentar cargar desde Supabase PostgreSQL vía API
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        list = data.map((item) => ({
          id: item.id,
          brand: item.brand,
          name: item.name,
          category: item.category,
          badge: item.badge,
          variant: item.variant,
          variantLabel: item.variant_label || "Línea",
          label: item.label,
          price: Number(item.price),
          stock: Number(item.stock ?? 10),
          skin: item.skin,
          description: item.description,
          hideName: item.hide_name,
          image: item.image_url || "/carrusel/nube.jpg",
          paused: Boolean(item.paused),
          featured: Boolean(item.featured),
        }));
      }
    }
  } catch {
    // API offline o en build
  }

  // 2. Si la API no respondió, intentar cliente Supabase directo
  if (list.length === 0 && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data && data.length > 0) {
        list = data.map((item) => ({
          id: item.id,
          brand: item.brand,
          name: item.name,
          category: item.category,
          badge: item.badge,
          variant: item.variant,
          variantLabel: item.variant_label || "Línea",
          label: item.label,
          price: Number(item.price),
          stock: Number(item.stock ?? 10),
          skin: item.skin,
          description: item.description,
          hideName: item.hide_name,
          image: item.image_url || "/carrusel/nube.jpg",
          paused: Boolean(item.paused),
          featured: Boolean(item.featured),
        }));
      }
    } catch {}
  }

  // 3. Fallback a catálogo local / predeterminado
  if (list.length === 0) {
    const custom = getLocalCustomCatalog();
    list = custom && Array.isArray(custom) ? custom : [...defaultProducts];
  }

  if (includePaused) return list;
  return list.filter((p) => !p.paused);
}

/**
 * Guarda o actualiza un producto en Supabase PostgreSQL
 */
export async function updateProduct(id, updates) {
  const all = await getProducts(true);
  const updatedList = all.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveLocalCustomCatalog(updatedList);

  // Sincronizar con Supabase PostgreSQL vía API
  try {
    await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  } catch (err) {
    console.warn("Error sincronizando actualización con Supabase:", err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("products").update(updates).eq("id", id);
    } catch {}
  }

  return updatedList;
}

/**
 * Crea un nuevo producto en Supabase PostgreSQL
 */
export async function createProduct(newProduct) {
  const all = await getProducts(true);
  const id = newProduct.id || `prod-${Date.now()}`;
  const productWithId = {
    ...newProduct,
    id,
    stock: Number(newProduct.stock ?? 10),
    price: Number(newProduct.price ?? 15),
    paused: false,
    featured: Boolean(newProduct.featured),
    image: newProduct.image || "/carrusel/nube.jpg",
  };

  const updatedList = [productWithId, ...all];
  saveLocalCustomCatalog(updatedList);

  // Sincronizar con Supabase PostgreSQL vía API
  try {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productWithId),
    });
  } catch (err) {
    console.warn("Error creando producto en Supabase:", err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("products").insert([productWithId]);
    } catch {}
  }

  return updatedList;
}

/**
 * Alterna el estado de pausa de un producto
 */
export async function toggleProductPause(id) {
  const all = await getProducts(true);
  const target = all.find((p) => p.id === id);
  if (!target) return all;

  const nextState = !target.paused;
  return updateProduct(id, { paused: nextState });
}

/**
 * Alterna si un producto se muestra en la página principal (destacados)
 */
export async function toggleProductFeatured(id) {
  const all = await getProducts(true);
  const target = all.find((p) => p.id === id);
  if (!target) return all;

  const defaultIds = defaultFeatured.map((p) => p.id);
  const isCurrentlyFeatured = target.featured !== undefined ? target.featured : defaultIds.includes(target.id);
  return updateProduct(id, { featured: !isCurrentlyFeatured });
}

/**
 * Elimina un producto de Supabase PostgreSQL
 */
export async function deleteProduct(id) {
  const all = await getProducts(true);
  const updatedList = all.filter((p) => p.id !== id);
  saveLocalCustomCatalog(updatedList);

  try {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Error al eliminar producto en Supabase:", err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("products").delete().eq("id", id);
    } catch {}
  }

  return updatedList;
}

/**
 * Obtiene los productos que se muestran en la página principal
 */
export async function getFeaturedProducts() {
  const allProducts = await getProducts(false);
  const defaultIds = defaultFeatured.map((p) => p.id);
  
  const featured = allProducts.filter((p) => {
    if (p.featured !== undefined) return Boolean(p.featured);
    return defaultIds.includes(p.id);
  });

  return featured.length > 0 ? featured : defaultFeatured;
}

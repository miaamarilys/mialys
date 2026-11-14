import { supabase, isSupabaseConfigured } from "../config/supabase.js";

const STORAGE_BUCKET = "photos";
const LOCAL_STORAGE_KEY = "mialys_local_photos";

export const DEFAULT_PRODUCT_PHOTOS = {
  ambar: "/productos/natura-avellana-casis.jpg",
  bruma: "/productos/natura-todanoite-lavanda.jpg",
  lino: "/productos/natura-ekos-maracuja.jpg",
  equilibrio: "/productos/natura-ekos-castanha.jpg",
  "set-viaje": "/productos/natura-set-todanoite-desodorante.jpg",
  "set-facial": "/productos/natura-set-cuidado-diario-avellana.jpg",
  "perfume-rosa": "/productos/natura-bodysplash-fresa-vainilla.jpg",
  "deo-roll": "/productos/natura-desodorante-rollon-avellana.jpg",
  "skin-limpiador": "/productos/natura-chronos-agua-micelar.jpg",
  "skin-tonico": "/productos/natura-chronos-desmaquillante-bifasico.jpg",
  "skin-mascarilla": "/productos/natura-chronos-mousse-limpieza.jpg",
  "skin-serum": "/productos/natura-chronos-aceite-limpieza.jpg",
  "set-cinco": "/productos/natura-ekos-murumuru-kit-capilar.jpg",
  "cap-mascarilla": "/productos/natura-ekos-murumuru-kit-capilar.jpg",
  nube: "/carrusel/nube.jpg",
};

/**
 * Obtiene las fotos guardadas localmente en localStorage (fallback)
 */
function getLocalPhotos() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PRODUCT_PHOTOS;
  } catch {
    return DEFAULT_PRODUCT_PHOTOS;
  }
}

/**
 * Guarda fotos en localStorage (fallback)
 */
function saveLocalPhotos(photos) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
  } catch (err) {
    console.warn("No se pudo persistir en localStorage:", err);
  }
}

/**
 * Convierte un File a DataURL (base64) para previsualización local
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Obtiene el mapa de fotos { [id]: url }
 */
export async function fetchPhotos() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("photos").select("id, url");
      if (error) throw error;
      const map = {};
      data.forEach((item) => {
        map[item.id] = item.url;
      });
      // Sincronizar con local por si acaso
      const merged = { ...getLocalPhotos(), ...map };
      return merged;
    } catch (err) {
      console.warn("Error al cargar fotos de Supabase, usando respaldo local:", err);
      return getLocalPhotos();
    }
  }

  // Fallback si Supabase no está configurado
  return getLocalPhotos();
}

/**
 * Sube una foto asociada a un ID (producto, sección, negocio, oferta)
 */
export async function uploadPhoto(id, file) {
  if (!id || !file) {
    throw new Error("El archivo y el identificador son obligatorios.");
  }

  // Validación de tipo de archivo
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    throw new Error("Usa una imagen JPG, PNG, WebP o GIF.");
  }

  // Límite de tamaño: 5 MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La foto no debe superar 5 MB.");
  }

  let finalUrl = "";

  if (isSupabaseConfigured && supabase) {
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${id}-${Date.now()}.${extension}`;

      // 1. Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      finalUrl = publicUrlData.publicUrl;

      // 3. Registrar / Actualizar en la tabla 'photos'
      const { error: dbError } = await supabase.from("photos").upsert({
        id,
        url: finalUrl,
        file_name: fileName,
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        console.warn("Foto subida a storage pero hubo error al registrar en tabla:", dbError);
      }
    } catch (err) {
      console.warn("Fallo subida a Supabase, guardando en respaldo local:", err);
      finalUrl = await fileToDataUrl(file);
    }
  } else {
    // Si aún no configuran las credenciales en .env, guardamos en base64 local
    finalUrl = await fileToDataUrl(file);
  }

  // Actualizar caché local
  const current = getLocalPhotos();
  current[id] = finalUrl;
  saveLocalPhotos(current);

  return { id, url: finalUrl };
}

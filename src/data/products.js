export const WHATSAPP_DISPLAY = "0998444418";
export const WHATSAPP_NUMBER = "593984444418";

export const BRANDS = ["Avon", "Natura"];
export const BRAND_FILTERS = ["Natura", "Avon", "Chronos", "Tododia", "Ekos"];

export const SKIN_TYPES = ["Piel Seca", "Piel Grasa", "Piel Mixta", "Piel Sensible"];

export const FREE_SHIPPING_THRESHOLD = 35.0;
export const STANDARD_SHIPPING = 3.5;

export const COUPONS = {
  BIENVENIDA10: {
    code: "BIENVENIDA10",
    description: "10% de descuento en tu compra",
    type: "percent",
    value: 10,
    minSubtotal: 0,
  },
  ENVIOGRATIS: {
    code: "ENVIOGRATIS",
    description: "Envío gratis garantizado",
    type: "free_shipping",
    value: 0,
    minSubtotal: 0,
  },
  MIALYS5: {
    code: "MIALYS5",
    description: "$5.00 de descuento en compras mayores a $20",
    type: "fixed",
    value: 5.0,
    minSubtotal: 20.0,
  },
};

export function productMatchesBrand(product, brandFilter) {
  if (!brandFilter) return true;
  const brand = (product.brand || "").toLowerCase();
  const line = (product.line || "").toLowerCase();
  const label = (product.label || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const variant = (product.variant || "").toLowerCase();

  switch (brandFilter) {
    case "Natura":
      return brand.includes("natura");
    case "Avon":
      return brand.includes("avon");
    case "Chronos":
      return line.includes("chronos") || name.includes("chronos") || variant.includes("chronos");
    case "Tododia":
      return label.includes("tododia") || name.includes("tododia") || variant.includes("tododia");
    case "Ekos":
      return line.includes("ekos") || label.includes("ekos") || name.includes("ekos") || variant.includes("ekos");
    default:
      return true;
  }
}

export const featured = [
  { id: "ambar", name: "Crema corporal nutrición prebiótica Avellana y casis", price: 17, image: "/productos/natura-avellana-casis.jpg", stock: 12 },
  { id: "bruma", name: "Crema nocturna Todanoite Té de manzanilla y lavanda", price: 17, image: "/productos/natura-todanoite-lavanda.jpg", stock: 8 },
  { id: "lino", name: "Crema corporal antiestrés Ekos Maracuyá", price: 17, image: "/productos/natura-ekos-maracuja.jpg", stock: 2 },
  { id: "equilibrio", name: "Crema para las manos Ekos Castanha", price: 6, image: "/productos/natura-ekos-castanha.jpg", stock: 15 },
];

export const products = [
  {
    id: "nube", brand: "Natura", badge: "Más vendido",
    name: "Crema corporal nutrición prebiótica",
    variant: "Fresa y vainilla dorada",
    label: "Tododia",
    price: 17,
    stock: 9,
    skin: "Piel Seca",
    description: "Nutre e hidrata la piel con prebióticos que cuidan su barrera natural. Aroma dulce de fresa con vainilla dorada.",
    body: "#F7E7D6",
    cap: "#C6A27A",
    wash: "#F3E2D2",
    image: "/carrusel/nube.jpg",
  },
  {
    id: "ambar", brand: "Natura", badge: "Nuevo aroma",
    name: "Crema corporal nutrición prebiótica",
    variant: "Avellana y casis",
    label: "Tododia",
    price: 17,
    stock: 12,
    skin: "Piel Seca",
    description: "Textura cremosa que nutre la piel con prebióticos y la deja suave. Aroma envolvente de avellana con casis.",
    body: "#E7D3BE",
    cap: "#8C6239",
    wash: "#EAD9C8",
    image: "/productos/natura-avellana-casis.jpg",
  },
  {
    id: "bruma", brand: "Natura", badge: "Nuevo aroma",
    name: "Crema nocturna Todanoite nutrición prebiótica",
    variant: "Té de manzanilla y lavanda",
    label: "Tododia",
    price: 17,
    stock: 8,
    skin: "Piel Grasa",
    description: "Hidrata y calma la piel con prebióticos + B5 que recuperan tu piel mientras duermes. Aroma relajante de té de manzanilla.",
    body: "#F4F7F2",
    cap: "#5F7364",
    wash: "#E4EFE6",
    image: "/productos/natura-todanoite-lavanda.jpg",
  },
  {
    id: "lino", brand: "Natura", line: "Ekos", badge: "Pocas unidades",
    name: "Crema corporal antiestrés",
    variant: "Maracuyá",
    variantLabel: "Línea",
    label: "Ekos",
    price: 17,
    stock: 2,
    skin: "Piel Grasa",
    description: "Potencia antiestrés que calma y reequilibra la piel con néctar de maracuyá 400ml.",
    body: "#F6F1E6",
    cap: "#A89878",
    wash: "#E7E2D6",
    image: "/productos/natura-ekos-maracuja.jpg",
  },
  {
    id: "equilibrio", brand: "Natura", line: "Ekos", badge: "Más vendido",
    name: "Crema hidratante para las manos",
    variant: "Castanha",
    variantLabel: "Línea",
    label: "Ekos",
    price: 6,
    stock: 15,
    skin: "Piel Mixta",
    description: "Potencia antirressecamento que nutre profundamente la piel de las manos con aceite de castanha 75g.",
    body: "#F8EBE3",
    cap: "#C9897C",
    wash: "#F3E5DC",
    image: "/productos/natura-ekos-castanha.jpg",
  },
  {
    id: "claro", brand: "Natura",
    name: "Crema Ligera Día Claro",
    label: "Claro",
    price: 19,
    stock: 7,
    skin: "Piel Mixta",
    description: "Cobertura de día, ligera, para usar bajo el maquillaje.",
    body: "#FBF6EE",
    cap: "#B7A48A",
    wash: "#EFE6DA",
    image: "/carrusel/ambar.jpg",
  },
  {
    id: "camelia", brand: "Natura", badge: "Descuento por tiempo limitado",
    name: "Crema Calma Camelia",
    label: "Camelia",
    price: 25,
    stock: 5,
    skin: "Piel Sensible",
    description: "Atenúa el enrojecimiento con camelia y centella.",
    body: "#F8EEEA",
    cap: "#C98B84",
    wash: "#F6E4E1",
    image: "/carrusel/equilibrio.jpg",
  },
  {
    id: "leche", brand: "Natura", badge: "Agotado",
    name: "Leche Limpiadora Suave",
    label: "Suave",
    price: 15,
    stock: 0,
    skin: "Piel Sensible",
    description: "Desmaquilla y limpia sin perfume intenso.",
    body: "#F7F4EF",
    cap: "#8E8A84",
    wash: "#E8E6E1",
    image: "/carrusel/lino.jpg",
  },
  {
    id: "perfume-rosa", brand: "Natura", badge: "Pocas unidades", category: "Perfumes",
    name: "Body Splash Fresa y Vainilla Dorada", variant: "Fresa y vainilla dorada 200ml", price: 32, stock: 1,
    description: "Deliciosa e irresistible con notas dulces de fresa y vainilla dorada 200ml.",
    image: "/productos/natura-bodysplash-fresa-vainilla.png"
  },
  {
    id: "perfume-vainilla", brand: "Avon", category: "Perfumes",
    name: "Eau de Toilette Vainilla", price: 24, stock: 6,
    description: "Cálido y dulce, para el día a día.", image: "/carrusel/nube.jpg"
  },
  {
    id: "perfume-citrico", brand: "Natura", category: "Perfumes",
    name: "Body Splash Cítrico", price: 15, stock: 8,
    description: "Fresco y ligero, ideal después de la ducha.", image: "/carrusel/bruma.jpg"
  },
  {
    id: "perfume-noche", brand: "Avon", badge: "Nuevo aroma", category: "Perfumes",
    name: "Perfume Noche", price: 36, stock: 4,
    description: "Intenso, con fondo amaderado.", image: "/carrusel/lino.jpg"
  },
  {
    id: "deo-roll", brand: "Natura", badge: "Más vendido", category: "Desodorantes",
    name: "Desodorante Roll-on", hideName: true,
    variant: "Desodorante antitranspirante Roll-on Avellana y Cassis", variantLabel: "Tipo", price: 6, stock: 14,
    description: "Protección con performance 72h con acción prebiótica. Secado rápido 70ml.",
    image: "/productos/natura-desodorante-avellana-cassis.png"
  },
  {
    id: "deo-spray", brand: "Natura", category: "Desodorantes",
    name: "Desodorante en Spray", hideName: true,
    variant: "Desodorante antitranspirante Roll-on con acción prebiótica", variantLabel: "Tipo", price: 6, stock: 10,
    description: "Secado rápido, sin manchas en la ropa.", image: "/beneficios/envios.jpg"
  },
  {
    id: "deo-barra", brand: "Avon", category: "Desodorantes",
    name: "Desodorante en Barra", price: 9, stock: 7,
    description: "Fórmula cremosa para piel sensible.", image: "/beneficios/cruelty-free.jpg"
  },
  {
    id: "deo-natural", brand: "Natura", badge: "Agotado", category: "Desodorantes",
    name: "Desodorante Natural", price: 10, stock: 0,
    description: "Sin aluminio, con extractos botánicos.", image: "/beneficios/natural-aloe.jpg"
  },
  {
    id: "maq-base", brand: "Natura", category: "Maquillaje",
    name: "Base Líquida", price: 17, stock: 8,
    description: "Cobertura media con acabado natural.", image: "/beneficios/dermatologico.jpg"
  },
  {
    id: "maq-labial", brand: "Avon", badge: "Más vendido", category: "Maquillaje",
    name: "Labial Mate", price: 11, stock: 18,
    description: "Color intenso de larga duración.", image: "/beneficios/natural-flores.jpg"
  },
  {
    id: "maq-mascara", brand: "Avon", badge: "Pocas unidades", category: "Maquillaje",
    name: "Máscara de Pestañas", price: 12, stock: 3,
    description: "Volumen y definición sin grumos.", image: "/servicios/servicio-madura.jpg"
  },
  {
    id: "maq-rubor", brand: "Natura", category: "Maquillaje",
    name: "Rubor Compacto", price: 11, stock: 6,
    description: "Tono rosado que ilumina el rostro.", image: "/servicios/servicio-manchas.jpg"
  },
  {
    id: "cap-shampoo", brand: "Natura", line: "Ekos", category: "Capilar",
    name: "Shampoo Reconstructor Murumuru", variant: "Ekos Murumuru 300ml", price: 16, stock: 11,
    description: "Limpia suavemente y prepara el cabello para la reconstrucción profunda.",
    image: "/productos/natura-ekos-murumuru-capilar.png"
  },
  {
    id: "cap-acondicionador", brand: "Avon", category: "Capilar",
    name: "Acondicionador Reparador", price: 16, stock: 9,
    description: "Desenreda y aporta brillo.", image: "/servicios/servicio-corporal.jpg"
  },
  {
    id: "cap-mascarilla", brand: "Natura", line: "Ekos", badge: "Más vendido", category: "Capilar",
    name: "Mascarilla Capilar Murumuru", variant: "Tratamiento intensivo Ekos 200g", price: 18, stock: 7,
    description: "Penetra en la fibra capilar reduciendo las puntas abiertas y el quiebre.",
    image: "/productos/natura-ekos-murumuru-capilar.png"
  },
  {
    id: "cap-aceite", brand: "Avon", badge: "Descuento por tiempo limitado", category: "Capilar",
    name: "Spray capilar hidratante", price: 14, stock: 5,
    description: "Hidrata el cabello y aporta brillo.", image: "/beneficios/natural-flores.jpg"
  },
  {
    id: "cap-cinco", brand: "Natura", category: "Capilar",
    name: "Acondicionador hidratante", price: 11, stock: 6,
    description: "Fórmula nutritiva desenredante para todo tipo de cabello.", image: "/servicios/servicio-limpieza.jpg"
  },
  {
    id: "cap-seis", brand: "Natura", category: "Capilar",
    name: "Shampoo reconstructor", price: 12, stock: 8,
    description: "Limpieza profunda y reestructuración capilar.", image: "/servicios/servicio-corporal.jpg"
  },
  {
    id: "cap-siete", brand: "Natura", category: "Capilar",
    name: "Acondicionador reconstructor", price: 12, stock: 8,
    description: "Sella las cutículas y repara daños térmicos.", image: "/beneficios/natural-karite.jpg"
  },
  {
    id: "cap-ocho", brand: "Natura", line: "Ekos", badge: "Pocas unidades", category: "Capilar",
    name: "Crema para peinar Murumuru", variant: "Ekos Murumuru 150ml", price: 13.5, stock: 2,
    description: "Desenreda, controla el frizz y sella las cutículas del cabello.",
    image: "/productos/natura-ekos-murumuru-capilar.png"
  },
  {
    id: "skin-limpiador", brand: "Natura", line: "Chronos", badge: "Nuevo aroma", category: "Skincare",
    name: "Mousse de Limpieza Intensiva", variant: "Biociencia Chronos 85g", price: 18, stock: 10,
    description: "Espuma cremosa y suave que limpia profundamente eliminando impurezas y controlando la oleosidad.",
    image: "/productos/natura-chronos-mousse-limpieza.jpg"
  },
  {
    id: "skin-serum", brand: "Natura", line: "Chronos", badge: "Más vendido", category: "Skincare",
    name: "Desmaquillante Bifásico Intensivo", variant: "Biociencia Chronos 150ml", price: 22, stock: 8,
    description: "Retira hasta el maquillaje a prueba de agua sin agredir la piel ni dejar residuo oleoso.",
    image: "/productos/natura-chronos-desmaquillante-bifasico.jpg"
  },
  {
    id: "skin-tonico", brand: "Natura", line: "Chronos", category: "Skincare",
    name: "Agua Micelar Desmaquillante Suave", variant: "Biociencia Chronos 150ml", price: 16, stock: 9,
    description: "Fórmula suave sin enjuague que limpia, desmaquilla, protege la microbiota e hidrata por 8 horas.",
    image: "/productos/natura-chronos-agua-micelar.jpg"
  },
  {
    id: "skin-mascarilla", brand: "Natura", line: "Chronos", badge: "Descuento por tiempo limitado", category: "Skincare",
    name: "Aceite de Limpieza Desmaquillante", variant: "Biociencia Chronos 100ml", price: 24, stock: 5,
    description: "Aceite limpiador que disuelve suavemente maquillaje, protector solar e impurezas dejando la piel sedosa.",
    image: "/productos/natura-chronos-aceite-limpieza.png"
  },
  {
    id: "skin-cinco", brand: "Natura", category: "Skincare",
    name: "Gel exfoliante facial", price: 15, stock: 6,
    description: "Microesferas purificantes para renovación celular suave.", image: "/beneficios/natural-aloe.jpg"
  },
  {
    id: "skin-seis", brand: "Natura", category: "Skincare",
    name: "Tónico purificante astringente", price: 15, stock: 6,
    description: "Controla el brillo y refina los poros dilatados.", image: "/servicios/servicio-limpieza.jpg"
  },
  {
    id: "skin-siete", brand: "Natura", category: "Skincare",
    name: "Serum biohidratante intensivo", price: 26, stock: 4,
    description: "Ácido hialurónico vegetal y prebióticos de máxima penetración.", image: "/beneficios/natural-flores.jpg"
  },
  {
    id: "skin-ocho", brand: "Natura", category: "Skincare",
    name: "Crema gel antifatiga contorno de ojos", price: 19, stock: 5,
    description: "Reduce bolsas, ojeras y líneas finas con cafeína botánica.", image: "/servicios/servicio-madura.jpg"
  },
  {
    id: "set-regalo", brand: "Natura", badge: "Descuento por tiempo limitado", category: "Sets",
    name: "Set de cuidado diario", variant: "5 jabones + crema corporal + body splash de fresa y vainilla dorada",
    variantLabel: "Incluye", price: 50, stock: 4,
    description: "5 jabones + crema corporal + body splash de fresa y vainilla dorada.",
    image: "/beneficios/natural-karite.jpg"
  },
  {
    id: "set-facial", brand: "Natura", badge: "Más vendido", category: "Sets",
    name: "Set Cuidado Diario Avellana y Cassis", variant: "5 jabones + crema corporal + desodorante",
    variantLabel: "Incluye", price: 34, stock: 6,
    description: "Kit completo Tododia: 5 jabones en barra de 90g + crema corporal nutrición prebiótica 400ml + desodorante roll-on 70ml.",
    image: "/productos/natura-set-avellana-cassis.png"
  },
  {
    id: "set-viaje", brand: "Natura", badge: "Pocas unidades", category: "Sets",
    name: "Set Tododia Todanoite", variant: "Crema corporal nocturna + Desodorante roll-on",
    variantLabel: "Incluye", price: 23, stock: 2,
    description: "Crema nocturna para el cuerpo Nutrición Prebiótica + B5 Té de Manzanilla y Lavanda 400ml + Desodorante antitranspirante roll-on.",
    image: "/productos/natura-set-todanoite-desodorante.jpg"
  },
  {
    id: "set-spa", brand: "Natura", category: "Sets",
    name: "Set Spa en Casa", price: 33, stock: 5,
    description: "Exfoliante, mascarilla y aceite corporal.", image: "/beneficios/fondo-beneficios.jpg"
  },
  {
    id: "set-cinco", brand: "Natura", line: "Ekos", badge: "Pocas unidades", category: "Sets",
    name: "Set Capilar Reconstructor Murumuru", variant: "Shampoo + Acondicionador + Máscara + Crema peinar",
    variantLabel: "Incluye", price: 43, stock: 3,
    description: "Tratamiento capilar completo con manteca de murumuru que reconstruye la fibra capilar desde la raíz hasta las puntas.",
    image: "/productos/natura-ekos-murumuru-capilar.png"
  },
  {
    id: "set-seis", brand: "Natura", category: "Sets",
    name: "Set de hidratación capilar", price: 23.5, stock: 5,
    description: "Kit completo para lavado, nutrición y brillo sedoso.", image: "/servicios/servicio-limpieza.jpg"
  },
  {
    id: "set-siete", brand: "Natura", category: "Sets",
    name: "Set capilar anticaída", price: 36, stock: 4,
    description: "Tratamiento con activos botánicos fortalecedores de folículos.", image: "/beneficios/envios.jpg"
  },
  {
    id: "set-ocho", brand: "Natura", category: "Sets",
    name: "Set Ritual Relajante Manzanilla", price: 28, stock: 6,
    description: "Jabón líquido, bruma aromática y crema relajante corporal.", image: "/beneficios/dermatologico.jpg"
  },
  {
    id: "set-nueve", brand: "Natura", category: "Sets",
    name: "Set Manos y Labios Suaves", price: 21, stock: 7,
    description: "Pulpa hidratante para manos más bálsamo labial nutritivo.", image: "/beneficios/cruelty-free.jpg"
  },
  {
    id: "set-diez", brand: "Natura", category: "Sets",
    name: "Set Dúo Perfumería Femenina", price: 42, stock: 5,
    description: "Fragancia de 100ml más body splash refrescante de cartera.", image: "/beneficios/natural-flores.jpg"
  },
];

export function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function calculateCartSummary(items, couponCode = null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  let discount = 0;
  let couponApplied = null;

  if (couponCode && COUPONS[couponCode.trim().toUpperCase()]) {
    const coupon = COUPONS[couponCode.trim().toUpperCase()];
    if (subtotal >= coupon.minSubtotal) {
      couponApplied = coupon;
      if (coupon.type === "percent") {
        discount = Number(((subtotal * coupon.value) / 100).toFixed(2));
      } else if (coupon.type === "fixed") {
        discount = Math.min(coupon.value, subtotal);
      }
    }
  }

  const freeShippingByThreshold = subtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShippingByCoupon = couponApplied?.type === "free_shipping";
  const isFreeShipping = (freeShippingByThreshold || freeShippingByCoupon) && subtotal > 0;
  const shipping = subtotal === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING;
  const total = Math.max(0, Number((subtotal - discount + shipping).toFixed(2)));

  return {
    subtotal,
    discount,
    shipping,
    total,
    isFreeShipping,
    couponApplied,
    neededForFreeShipping: Math.max(0, Number((FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2))),
    progressPercent: Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)),
  };
}

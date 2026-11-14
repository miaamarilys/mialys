# Mialys Skin

Tienda web de belleza y estética integral construida con **React + Vite** y arquitectura modular por capas con conexión a base de datos y almacenamiento en la nube (Supabase / BaaS).

---

## 🏗️ Arquitectura del Proyecto (100% Modular en Frontend)

Toda la funcionalidad (gestión de productos, subida y almacenamiento de fotos, catálogo y carrito) ahora está centralizada y desacoplada dentro del Frontend:

```text
Frontend/
├── .env.example              # Variables de entorno para Supabase (URL, ANON_KEY)
├── src/
│   ├── config/
│   │   └── supabase.js       # Cliente y configuración de Supabase
│   ├── db/
│   │   └── schema.sql        # Script SQL listo para ejecutar en Supabase (tablas y Storage)
│   ├── services/
│   │   ├── photoService.js   # Servicio unificado de fotos (Supabase Storage + fallback local)
│   │   ├── productService.js # Servicio de productos y catálogo
│   │   └── cartService.js    # Lógica de cálculo y pedidos a WhatsApp
│   ├── hooks/
│   │   ├── usePhotos.js      # Hook reutilizable para cargar y subir imágenes
│   │   └── useProducts.js    # Hook para catálogo dinámico
│   ├── components/           # Componentes modulares de interfaz
│   │   ├── CartDrawer.jsx
│   │   ├── Catalog.jsx
│   │   ├── Featured.jsx
│   │   ├── Services.jsx
│   │   ├── InfoModal.jsx
│   │   └── ...
│   └── data/
│       └── products.js       # Catálogo base y configuración de WhatsApp
```

---

## 🚀 Inicio Rápido (Solo Frontend)

Ya **no es obligatorio** levantar una terminal separada con el Backend en Node.js para que la aplicación y la subida de fotos funcionen.

```bash
cd Frontend
npm install
npm run dev
```

Abre en tu navegador: **http://localhost:5173**

> **Nota:** La aplicación cuenta con un sistema de fallback inteligente: si aún no configuras tus claves de Supabase, las fotos y productos funcionan y se previsualizan automáticamente usando almacenamiento local sin arrojar errores.

---

## 🗄️ Conexión con Supabase (Base de Datos + Almacenamiento de Fotos)

Para conectar tu base de datos y persistir las fotos en la nube:

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En tu panel de Supabase ve al **SQL Editor**, copia y ejecuta el script contenido en:
   `Frontend/src/db/schema.sql`
3. Ve a **Project Settings -> API** y copia tu **URL** y tu clave **anon public**.
4. En la carpeta `Frontend`, crea tu archivo `.env` basado en `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
   VITE_STORAGE_BUCKET=photos
   ```
5. ¡Listo! Las fotos y productos se sincronizarán directamente con tu base de datos y bucket en la nube.

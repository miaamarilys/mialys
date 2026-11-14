# Mialys Skin

Tienda virtual de belleza y estetica integral construida con **React + Vite** y arquitectura modular por capas con conexion a base de datos PostgreSQL en la nube (Supabase).

---

## Arquitectura del Proyecto (100% Modular en Raiz)

Toda la funcionalidad (catalogo dinamico, carrito de compras, gestion de pedidos, portal empresarial y atencion por WhatsApp) se encuentra centralizada y organizada en la raiz del proyecto:

```text
mialys/
|-- .env.example              # Plantilla de variables de entorno (Supabase URL y credenciales)
|-- index.html                # Punto de entrada HTML
|-- vite.config.js            # Configuracion de Vite y plugin de endpoints API
|-- apiHandler.cjs            # Controlador de endpoints locales y conexion Supabase PostgreSQL
|-- package.json              # Dependencias y scripts
|-- public/                   # Recursos estaticos y fotografias de productos
|   |-- productos/            # Imagenes del catalogo
|   |-- beneficios/           # Imagenes de beneficios y sellos
|   |-- carrusel/             # Imagenes del hero carrusel
|   `-- local/                # Fotografias del local
`-- src/
    |-- config/
    |   `-- supabase.js       # Cliente y configuracion de conexion
    |-- db/
    |   `-- schema.sql        # Script SQL completo (tablas, indices y Storage)
    |-- services/
    |   |-- photoService.js   # Servicio de fotos (Storage y fallback local)
    |   |-- productService.js # Servicio de productos y catalogo
    |   |-- orderService.js   # Servicio de gestion de pedidos y despachos
    |   `-- cartService.js    # Logica de carrito y calculo de ordenes
    |-- hooks/
    |   |-- usePhotos.js      # Hook reutilizable para fotos
    |   `-- useProducts.js    # Hook para catalogo dinamico
    |-- components/           # Componentes modulares de interfaz
    |   |-- Header.jsx        # Barra de navegacion superior
    |   |-- Hero.jsx          # Carrusel principal de presentacion
    |   |-- Featured.jsx      # Seccion de productos destacados
    |   |-- Catalog.jsx       # Catalogo completo con filtros
    |   |-- CartDrawer.jsx    # Carrito lateral de compras
    |   |-- Contact.jsx       # Modulo de atencion y contactos
    |   |-- InfoModal.jsx     # Modal de Preguntas Frecuentes interactivo
    |   |-- PortalEmpresarial.jsx # Panel de gestion de pedidos, logistica e inventario
    |   |-- Services.jsx      # Servicios de estetica
    |   |-- About.jsx         # Historia y mision de la marca
    |   |-- Benefits.jsx      # Sellos de calidad y garantia
    |   |-- Footer.jsx        # Pie de pagina
    |   `-- Icons.jsx         # Iconografia vectorial SVG del sistema
    |-- data/
    |   `-- products.js       # Catalogo base e informacion de respaldo
    `-- index.css             # Estilos globales y diseno editorial
```

---

## Inicio Rapido

Para ejecutar el proyecto en tu entorno local:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

Abre en tu navegador: **http://localhost:5173**

---

## Modulos Principales

1. **Catalogo de Belleza**: Exploracion por categorias (Cremas, Perfumes, Desodorantes, Skincare, etc.) con filtros en tiempo real y selector de variantes.
2. **Preguntas Frecuentes**: Centro interactivo con buscador instantaneo, clasificacion por categorias (Envios, Productos, Pagos, Garantia) y contacto directo a WhatsApp.
3. **Portal Empresarial**: Gestion de pedidos, asignacion de transportistas y guias de despacho (Servientrega, Laar Courier), control de inventario y exportacion de datos a CSV/Excel.
4. **Modulo de Contactos**: Directorio directo con acceso instantaneo a canales de asesoria personalizada y ubicacion fisica.

---

## Base de Datos (Supabase PostgreSQL)

El proyecto se encuentra conectado a Supabase PostgreSQL. Para configurar un entorno nuevo o sincronizar:

1. Crea tu proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, ejecuta el script contenido en `src/db/schema.sql`.
3. Configura tus variables en `.env` tomando como guia `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
   VITE_STORAGE_BUCKET=photos
   ```
4. El servidor local enlazara automaticamente los endpoints de la API con tu base de datos.

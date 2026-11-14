-- ==============================================================================
-- SCHEMA SUPABASE PARA MIALYS SKIN
-- Copia y pega este script en el SQL Editor de tu panel de Supabase
-- ==============================================================================

-- 1. Tabla de Fotos (URLs públicas asociadas a productos, banners o servicios)
CREATE TABLE IF NOT EXISTS public.photos (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  file_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  brand TEXT,
  name TEXT NOT NULL,
  category TEXT,
  badge TEXT,
  variant TEXT,
  variant_label TEXT DEFAULT 'Línea',
  label TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  skin TEXT,
  description TEXT,
  hide_name BOOLEAN DEFAULT FALSE,
  body_color TEXT,
  cap_color TEXT,
  wash_color TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Tabla de Pedidos y Envíos (Módulo Empresarial)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'Tarjeta',
  status TEXT DEFAULT 'Pagado',
  shipping_date DATE,
  tracking_number TEXT,
  carrier TEXT DEFAULT 'Servientrega',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de lectura pública
DROP POLICY IF EXISTS "Fotos visibles para todos" ON public.photos;
CREATE POLICY "Fotos visibles para todos" ON public.photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Productos visibles para todos" ON public.products;
CREATE POLICY "Productos visibles para todos" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pedidos visibles para consulta" ON public.orders;
CREATE POLICY "Pedidos visibles para consulta" ON public.orders FOR SELECT USING (true);

-- 6. Políticas de escritura
DROP POLICY IF EXISTS "Permitir guardar o actualizar fotos" ON public.photos;
CREATE POLICY "Permitir guardar o actualizar fotos" ON public.photos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizar productos" ON public.products;
CREATE POLICY "Permitir actualizar productos" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir crear y gestionar pedidos" ON public.orders;
CREATE POLICY "Permitir crear y gestionar pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 7. Configuración de Storage para el bucket "photos":
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Acceso público de lectura a fotos de storage" ON storage.objects;
CREATE POLICY "Acceso público de lectura a fotos de storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Subida pública a fotos de storage" ON storage.objects;
CREATE POLICY "Subida pública a fotos de storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "Actualización de fotos de storage" ON storage.objects;
CREATE POLICY "Actualización de fotos de storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'photos');

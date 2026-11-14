const { Client } = require('./node_modules/pg');

const client = new Client({
  host: 'aws-0-ca-central-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.vtqalgngdhiycondfmur',
  password: '+s266!_mu!JeCkX',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('Connecting to PostgreSQL Supabase database...');
  await client.connect();
  console.log('Connected successfully!');

  // 1. Create tables
  console.log('Creating database tables...');

  await client.query(`
    -- TABLA DE PRODUCTOS
    CREATE TABLE IF NOT EXISTS public.products (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Cremas',
      badge TEXT,
      variant TEXT,
      variant_label TEXT DEFAULT 'Línea',
      label TEXT,
      price NUMERIC(10, 2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 10,
      skin TEXT,
      description TEXT,
      hide_name BOOLEAN DEFAULT FALSE,
      image_url TEXT,
      paused BOOLEAN DEFAULT FALSE,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- TABLA DE PEDIDOS
    CREATE TABLE IF NOT EXISTS public.orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      customer_address TEXT,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      total NUMERIC(10, 2) NOT NULL,
      payment_method TEXT,
      status TEXT DEFAULT 'En preparación',
      shipping_date TEXT,
      tracking_number TEXT,
      carrier TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- TABLA DE CONTACTOS
    CREATE TABLE IF NOT EXISTS public.contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      city TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- TABLA DE CUPONES
    CREATE TABLE IF NOT EXISTS public.coupons (
      code TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      value NUMERIC(10, 2) NOT NULL,
      min_subtotal NUMERIC(10, 2) DEFAULT 0,
      description TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- TABLA DE CONFIGURACIÓN DE TIENDA
    CREATE TABLE IF NOT EXISTS public.store_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      whatsapp TEXT,
      free_shipping_min NUMERIC(10, 2),
      standard_shipping NUMERIC(10, 2),
      store_name TEXT,
      city TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Tables created. Setting permissions and RLS policies...');

  await client.query(`
    -- Habilitar permisos públicos para lectura y escritura desde la aplicación web
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

    -- RLS policies
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public access to products" ON public.products;
    CREATE POLICY "Public access to products" ON public.products FOR ALL TO public USING (true) WITH CHECK (true);

    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public access to orders" ON public.orders;
    CREATE POLICY "Public access to orders" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);

    ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public access to contacts" ON public.contacts;
    CREATE POLICY "Public access to contacts" ON public.contacts FOR ALL TO public USING (true) WITH CHECK (true);

    ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public access to coupons" ON public.coupons;
    CREATE POLICY "Public access to coupons" ON public.coupons FOR ALL TO public USING (true) WITH CHECK (true);

    ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public access to store_settings" ON public.store_settings;
    CREATE POLICY "Public access to store_settings" ON public.store_settings FOR ALL TO public USING (true) WITH CHECK (true);
  `);

  console.log('Loading products from data/products.js...');
  const { products, featured: featuredIds } = await import('./src/data/products.js');

  console.log(`Inserting ${products.length} products...`);
  const featuredSet = new Set(['nube', 'ambar', 'bruma', 'lino', 'castanha-manos', 'perfume-rosa']);

  for (const p of products) {
    const isFeatured = featuredSet.has(p.id) || (p.featured === true);
    let category = 'Cremas';
    const nameLower = (p.name || '').toLowerCase();
    const labelLower = (p.label || '').toLowerCase();
    const lineLower = (p.line || '').toLowerCase();

    if (nameLower.includes('perfume') || nameLower.includes('eau') || nameLower.includes('splash') || nameLower.includes('colonia') || labelLower.includes('perfume')) {
      category = 'Perfumes';
    } else if (nameLower.includes('desodorante') || nameLower.includes('roll-on') || labelLower.includes('desodorante')) {
      category = 'Desodorantes';
    } else if (nameLower.includes('labial') || nameLower.includes('pestañ') || nameLower.includes('maquillaje') || nameLower.includes('base') || nameLower.includes('rubor')) {
      category = 'Maquillaje';
    } else if (nameLower.includes('shampoo') || nameLower.includes('acondicionador') || nameLower.includes('capilar')) {
      category = 'Capilar';
    } else if (nameLower.includes('serum') || nameLower.includes('facial') || lineLower.includes('chronos') || nameLower.includes('antiseñales') || nameLower.includes('exfoliante')) {
      category = 'Skincare';
    } else if (nameLower.includes('set') || nameLower.includes('kit') || nameLower.includes('duo')) {
      category = 'Sets';
    }

    await client.query(`
      INSERT INTO public.products (
        id, brand, name, category, badge, variant, variant_label, label,
        price, stock, skin, description, hide_name, image_url, paused, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        price = EXCLUDED.price,
        stock = EXCLUDED.stock,
        featured = EXCLUDED.featured,
        image_url = EXCLUDED.image_url,
        updated_at = NOW();
    `, [
      p.id,
      p.brand || 'Natura',
      p.name,
      category,
      p.badge || null,
      p.variant || null,
      p.variantLabel || 'Línea',
      p.label || null,
      p.price || 15,
      p.stock !== undefined ? p.stock : 10,
      p.skin || null,
      p.description || '',
      Boolean(p.hideName),
      p.image || '/carrusel/nube.jpg',
      false,
      isFeatured
    ]);
  }

  console.log('Inserting initial orders...');
  const initialOrders = [
    {
      id: "MS-4102",
      customer_name: "Valeria Mendoza",
      customer_phone: "0987654321",
      customer_email: "valeria.m@example.com",
      customer_address: "Av. Samborondón Km 2.5, Guayaquil",
      items: [
        { id: "nube", name: "Crema corporal nutrición prebiótica (Fresa)", qty: 2, price: 17 },
        { id: "perfume-rosa", name: "Body Splash Fresa y Vainilla", qty: 1, price: 32 }
      ],
      total: 66.0,
      payment_method: "Tarjeta de Crédito (Visa •••• 4242)",
      status: "En preparación",
      shipping_date: "15/11/2026",
      tracking_number: "SERV-992104",
      carrier: "Servientrega",
      notes: "Entrega preferente por la tarde"
    },
    {
      id: "MS-4098",
      customer_name: "Carlos Andrade",
      customer_phone: "0991234567",
      customer_email: "carlos.a@example.com",
      customer_address: "Calle Los Guayacanes 142, Quito",
      items: [
        { id: "lino", name: "Crema corporal antiestrés Lino", qty: 1, price: 17 },
        { id: "deo-roll", name: "Desodorante Roll-on Natura", qty: 2, price: 6 }
      ],
      total: 29.0,
      payment_method: "Tarjeta de Débito (Mastercard •••• 8812)",
      status: "Enviado",
      shipping_date: "14/11/2026",
      tracking_number: "LAAR-553210",
      carrier: "Laar Courier",
      notes: "Guía entregada al cliente"
    }
  ];

  for (const o of initialOrders) {
    await client.query(`
      INSERT INTO public.orders (
        id, customer_name, customer_phone, customer_email, customer_address,
        items, total, payment_method, status, shipping_date, tracking_number, carrier, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO NOTHING;
    `, [
      o.id,
      o.customer_name,
      o.customer_phone,
      o.customer_email,
      o.customer_address,
      JSON.stringify(o.items),
      o.total,
      o.payment_method,
      o.status,
      o.shipping_date,
      o.tracking_number,
      o.carrier,
      o.notes
    ]);
  }

  console.log('Inserting initial coupons and settings...');
  await client.query(`
    INSERT INTO public.coupons (code, type, value, min_subtotal, description, active)
    VALUES 
      ('BIENVENIDA10', 'percent', 10, 0, '10% de descuento en tu compra', true),
      ('ENVIOGRATIS', 'free_shipping', 0, 0, 'Envío gratis garantizado', true),
      ('MIALYS5', 'fixed', 5.0, 20.0, '$5.00 de descuento en compras mayores a $20', true)
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO public.store_settings (id, whatsapp, free_shipping_min, standard_shipping, store_name, city)
    VALUES ('default', '0998444418', 35.0, 3.5, 'Mialys Skin Cosméticos', 'Guayaquil / Quito, Ecuador')
    ON CONFLICT (id) DO UPDATE SET
      whatsapp = EXCLUDED.whatsapp,
      free_shipping_min = EXCLUDED.free_shipping_min,
      standard_shipping = EXCLUDED.standard_shipping;
  `);

  // Verify counts
  const prodCount = await client.query('SELECT COUNT(*) FROM public.products');
  const orderCount = await client.query('SELECT COUNT(*) FROM public.orders');
  const coupCount = await client.query('SELECT COUNT(*) FROM public.coupons');
  const settCount = await client.query('SELECT * FROM public.store_settings WHERE id = $1', ['default']);

  console.log('==============================================');
  console.log('MIGRATION RESULTS IN SUPABASE POSTGRESQL:');
  console.log('Products count:', prodCount.rows[0].count);
  console.log('Orders count:', orderCount.rows[0].count);
  console.log('Coupons count:', coupCount.rows[0].count);
  console.log('Settings:', settCount.rows[0]);
  console.log('==============================================');

  await client.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

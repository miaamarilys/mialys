const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-0-ca-central-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.vtqalgngdhiycondfmur',
  password: '+s266!_mu!JeCkX',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

async function handleApiRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  // Set JSON headers
  res.setHeader('Content-Type', 'application/json');

  try {
    // PRODUCTS
    if (path === '/api/products' && method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM public.products ORDER BY name ASC');
      res.end(JSON.stringify(rows));
      return true;
    }

    if (path === '/api/products' && method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const p = JSON.parse(body);
          await pool.query(`
            INSERT INTO public.products (
              id, brand, name, category, badge, variant, variant_label, label,
              price, stock, skin, description, hide_name, image_url, paused, featured
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT (id) DO UPDATE SET
              price = EXCLUDED.price,
              stock = EXCLUDED.stock,
              featured = EXCLUDED.featured,
              paused = EXCLUDED.paused,
              image_url = EXCLUDED.image_url,
              name = EXCLUDED.name,
              category = EXCLUDED.category,
              updated_at = NOW();
          `, [
            p.id, p.brand || 'Natura', p.name, p.category || 'Cremas',
            p.badge || null, p.variant || null, p.variantLabel || 'Línea', p.label || null,
            p.price, p.stock !== undefined ? p.stock : 10, p.skin || null,
            p.description || '', Boolean(p.hideName), p.image || p.image_url || '/carrusel/nube.jpg',
            Boolean(p.paused), Boolean(p.featured)
          ]);
          res.end(JSON.stringify({ success: true, product: p }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return true;
    }

    if (path.startsWith('/api/products/') && method === 'PUT') {
      const id = path.replace('/api/products/', '');
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const updates = JSON.parse(body);
          const fields = [];
          const values = [];
          let idx = 1;

          if (updates.price !== undefined) { fields.push(`price = $${idx++}`); values.push(updates.price); }
          if (updates.stock !== undefined) { fields.push(`stock = $${idx++}`); values.push(updates.stock); }
          if (updates.featured !== undefined) { fields.push(`featured = $${idx++}`); values.push(updates.featured); }
          if (updates.paused !== undefined) { fields.push(`paused = $${idx++}`); values.push(updates.paused); }
          if (updates.name !== undefined) { fields.push(`name = $${idx++}`); values.push(updates.name); }
          if (updates.category !== undefined) { fields.push(`category = $${idx++}`); values.push(updates.category); }
          if (updates.image !== undefined) { fields.push(`image_url = $${idx++}`); values.push(updates.image); }

          fields.push(`updated_at = NOW()`);
          values.push(id);

          await pool.query(`UPDATE public.products SET ${fields.join(', ')} WHERE id = $${idx}`, values);
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return true;
    }

    if (path.startsWith('/api/products/') && method === 'DELETE') {
      const id = path.replace('/api/products/', '');
      await pool.query('DELETE FROM public.products WHERE id = $1', [id]);
      res.end(JSON.stringify({ success: true }));
      return true;
    }

    // ORDERS
    if (path === '/api/orders' && method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM public.orders ORDER BY created_at DESC');
      res.end(JSON.stringify(rows));
      return true;
    }

    if (path === '/api/orders' && method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const o = JSON.parse(body);
          await pool.query(`
            INSERT INTO public.orders (
              id, customer_name, customer_phone, customer_email, customer_address,
              items, total, payment_method, status, shipping_date, tracking_number, carrier, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO UPDATE SET
              status = EXCLUDED.status,
              tracking_number = EXCLUDED.tracking_number,
              carrier = EXCLUDED.carrier,
              shipping_date = EXCLUDED.shipping_date,
              updated_at = NOW();
          `, [
            o.id, o.customer_name, o.customer_phone, o.customer_email || '',
            o.customer_address || '', JSON.stringify(o.items || []), o.total,
            o.payment_method || 'Tarjeta', o.status || 'En preparación',
            o.shipping_date || '', o.tracking_number || '', o.carrier || '', o.notes || ''
          ]);
          res.end(JSON.stringify({ success: true, order: o }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return true;
    }

    if (path.startsWith('/api/orders/') && method === 'PUT') {
      const id = path.replace('/api/orders/', '');
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const updates = JSON.parse(body);
          const fields = [];
          const values = [];
          let idx = 1;

          if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
          if (updates.tracking_number !== undefined) { fields.push(`tracking_number = $${idx++}`); values.push(updates.tracking_number); }
          if (updates.carrier !== undefined) { fields.push(`carrier = $${idx++}`); values.push(updates.carrier); }
          if (updates.shipping_date !== undefined) { fields.push(`shipping_date = $${idx++}`); values.push(updates.shipping_date); }

          fields.push(`updated_at = NOW()`);
          values.push(id);

          await pool.query(`UPDATE public.orders SET ${fields.join(', ')} WHERE id = $${idx}`, values);
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return true;
    }

    // CONTACTS
    if (path === '/api/contacts' && method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM public.contacts ORDER BY created_at DESC');
      res.end(JSON.stringify(rows));
      return true;
    }

    if (path === '/api/contacts' && method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const c = JSON.parse(body);
          await pool.query(`
            INSERT INTO public.contacts (id, name, phone, email, address, city, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              email = EXCLUDED.email,
              address = EXCLUDED.address,
              notes = EXCLUDED.notes;
          `, [
            c.id, c.name, c.phone, c.email || '', c.address || '', c.city || '', c.notes || ''
          ]);
          res.end(JSON.stringify({ success: true, contact: c }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return true;
    }

    // COUPONS
    if (path === '/api/coupons' && method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM public.coupons ORDER BY code ASC');
      res.end(JSON.stringify(rows));
      return true;
    }

    if (path === '/api/coupons' && method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const cp = JSON.parse(body);
          await pool.query(`
            INSERT INTO public.coupons (code, type, value, min_subtotal, description, active)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (code) DO UPDATE SET
              type = EXCLUDED.type,
              value = EXCLUDED.value,
              min_subtotal = EXCLUDED.min_subtotal,
              description = EXCLUDED.description,
              active = EXCLUDED.active;
          `, [
            cp.code, cp.type, cp.value, cp.min_subtotal || 0, cp.description || '', cp.active !== false
          ]);
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return true;
    }

    if (path.startsWith('/api/coupons/') && method === 'DELETE') {
      const code = path.replace('/api/coupons/', '');
      await pool.query('DELETE FROM public.coupons WHERE code = $1', [code]);
      res.end(JSON.stringify({ success: true }));
      return true;
    }

    // SETTINGS
    if (path === '/api/settings' && method === 'GET') {
      const { rows } = await pool.query("SELECT * FROM public.store_settings WHERE id = 'default'");
      res.end(JSON.stringify(rows[0] || {}));
      return true;
    }

    if (path === '/api/settings' && method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const s = JSON.parse(body);
          await pool.query(`
            INSERT INTO public.store_settings (id, whatsapp, free_shipping_min, standard_shipping, store_name, city, updated_at)
            VALUES ('default', $1, $2, $3, $4, $5, NOW())
            ON CONFLICT (id) DO UPDATE SET
              whatsapp = EXCLUDED.whatsapp,
              free_shipping_min = EXCLUDED.free_shipping_min,
              standard_shipping = EXCLUDED.standard_shipping,
              store_name = EXCLUDED.store_name,
              city = EXCLUDED.city,
              updated_at = NOW();
          `, [s.whatsapp, s.free_shipping_min, s.standard_shipping, s.store_name, s.city]);
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return true;
    }

  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
    return true;
  }

  return false;
}

module.exports = { handleApiRequest };

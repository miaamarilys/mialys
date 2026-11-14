const { Client } = require('./node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://postgres:%2Bs266!_mu!JeCkX@db.vtqalgngdhiycondfmur.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');
    const res = await client.query('SELECT current_database(), current_user, version()');
    console.log('DB Info:', res.rows[0]);

    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Existing public tables:', tables.rows.map(r => r.table_name));

    // Also let's check if we can read JWT secret or API keys if stored in vault or settings
    try {
      const jwtSecret = await client.query("SELECT * FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%anon%'");
      console.log('Settings:', jwtSecret.rows);
    } catch (e) {
      console.log('No jwt in pg_settings');
    }

  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

run();

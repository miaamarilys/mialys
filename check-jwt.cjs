const { Client } = require('./node_modules/pg');

const client = new Client({
  host: 'aws-0-ca-central-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.vtqalgngdhiycondfmur',
  password: '+s266!_mu!JeCkX',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  
  // Try querying pg_catalog, pg_proc or auth
  const res = await client.query("SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%jwt%' OR proname LIKE '%sign%' OR proname LIKE '%secret%' LIMIT 10");
  console.log('Functions:', res.rows.map(r => r.proname));

  // Try checking auth schema tables
  const authTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth'");
  console.log('Auth tables:', authTables.rows.map(r => r.table_name));

  // Try checking storage schema tables
  const storageTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'storage'");
  console.log('Storage tables:', storageTables.rows.map(r => r.table_name));

  // Check if any vault secret exists
  try {
    const v = await client.query("SELECT * FROM vault.secrets");
    console.log('Vault secrets raw:', v.rows);
  } catch(e) {
    console.log('Vault error:', e.message);
  }

  // Check if there are any roles in auth.users
  try {
    const users = await client.query("SELECT * FROM auth.users");
    console.log('Auth users count:', users.rows.length);
  } catch(e) {
    console.log('Auth users error:', e.message);
  }

  await client.end();
}

run();

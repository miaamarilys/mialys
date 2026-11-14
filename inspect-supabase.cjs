const { Client } = require('./node_modules/pg');

const client = new Client({
  host: 'aws-0-ca-central-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.vtqalgngdhiycondfmur',
  password: '+s266!_mu!JeCkX',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  await client.connect();
  console.log('Connected!');

  // Check vault secrets
  try {
    const secrets = await client.query("SELECT * FROM vault.decrypted_secrets");
    console.log('Vault secrets:', secrets.rows);
  } catch (e) {
    console.log('No vault.decrypted_secrets access:', e.message);
  }

  // Check jwt setting
  try {
    const jwt = await client.query("SELECT current_setting('app.settings.jwt_secret', true)");
    console.log('app.settings.jwt_secret:', jwt.rows);
  } catch (e) {
    console.log('No app.settings.jwt_secret:', e.message);
  }

  // Check schemas
  const schemas = await client.query("SELECT schema_name FROM information_schema.schemata");
  console.log('Schemas:', schemas.rows.map(r => r.schema_name));

  // Check public tables
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Public tables:', tables.rows.map(r => r.table_name));

  await client.end();
}

inspect();

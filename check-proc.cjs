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
  const res = await client.query("SELECT proname, prosrc FROM pg_proc WHERE proname IN ('sign', 'jwt')");
  res.rows.forEach(r => console.log(r.proname, ':\n', r.prosrc));

  // Check pg_stat_statements or any config
  const configs = await client.query("SELECT name, setting FROM pg_settings WHERE name LIKE '%auth%' OR name LIKE '%supabase%'");
  console.log('Configs:', configs.rows);

  await client.end();
}
run();

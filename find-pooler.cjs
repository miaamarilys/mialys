const { Client } = require('./node_modules/pg');

const regions = [
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
  'ap-northeast-1'
];

async function checkRegion(region) {
  const host = 'aws-0-' + region + '.pooler.supabase.com';
  // Try port 6543 (transaction) and port 5432 (session)
  for (const port of [6543, 5432]) {
    const client = new Client({
      host: host,
      port: port,
      user: 'postgres.vtqalgngdhiycondfmur',
      password: '+s266!_mu!JeCkX',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 2500
    });
    try {
      await client.connect();
      console.log('SUCCESS IN REGION:', region, 'HOST:', host, 'PORT:', port);
      const res = await client.query('SELECT current_database(), current_user, version()');
      console.log('Query result:', res.rows[0]);
      await client.end();
      return true;
    } catch(e) {
      if (e.message.includes('Tenant') || e.message.includes('password') || e.message.includes('auth')) {
        console.log(`Region ${region}:${port} response:`, e.message);
      }
    }
  }
  return false;
}

async function run() {
  for (const r of regions) {
    const ok = await checkRegion(r);
    if (ok) {
      process.exit(0);
    }
  }
  console.log('Done testing regions');
}
run();

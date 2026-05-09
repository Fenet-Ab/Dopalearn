const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query("SELECT id FROM users LIMIT 1");
  console.log("User ID:", res.rows[0].id);

  const catRes = await client.query("SELECT id FROM categories LIMIT 1");
  console.log("Category ID:", catRes.rows[0].id);
  
  await client.end();
}
run();

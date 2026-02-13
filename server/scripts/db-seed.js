const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function run() {
  const seedPath = path.join(__dirname, '..', 'src', 'db', 'migrations', '003_seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(seedSql);
    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();

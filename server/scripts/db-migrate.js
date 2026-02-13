const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../src/config/db');

function readMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');
  return fs
    .readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort()
    .map((fileName) => {
      const fullPath = path.join(migrationsDir, fileName);
      const sql = fs.readFileSync(fullPath, 'utf8');
      return {
        fileName,
        sql,
        checksum: crypto.createHash('sha256').update(sql).digest('hex'),
      };
    });
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      file_name TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function run() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const { rows } = await client.query('SELECT file_name, checksum FROM schema_migrations');
    const appliedMap = new Map(rows.map((row) => [row.file_name, row.checksum]));

    const migrations = readMigrations();

    for (const migration of migrations) {
      const appliedChecksum = appliedMap.get(migration.fileName);

      if (appliedChecksum && appliedChecksum === migration.checksum) {
        console.log(`Skipping ${migration.fileName} (already applied)`);
        continue;
      }

      if (appliedChecksum && appliedChecksum !== migration.checksum) {
        throw new Error(`Checksum mismatch for migration ${migration.fileName}.`);
      }

      console.log(`Applying ${migration.fileName}`);
      await client.query('BEGIN');
      await client.query(migration.sql);
      await client.query(
        'INSERT INTO schema_migrations (file_name, checksum) VALUES ($1, $2)',
        [migration.fileName, migration.checksum]
      );
      await client.query('COMMIT');
    }

    console.log('Migrations complete.');
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

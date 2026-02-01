const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fitness_center',
  port: Number(process.env.DB_PORT || 5432),
  max: Number(process.env.DB_CONNECTION_LIMIT || 10),
});

module.exports = pool;

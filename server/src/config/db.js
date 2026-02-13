const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

const envFileName = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, '..', '..', envFileName) });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'FitLab',
  port: Number(process.env.DB_PORT || 5432),
  max: Number(process.env.DB_CONNECTION_LIMIT || 10),
});

module.exports = pool;

const { Pool } = require('pg');

require('dotenv').config();

const isLocalDb =
  process.env.DB_HOST === 'localhost' ||
  process.env.DB_HOST === '127.0.0.1';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,

  ssl: isLocalDb
    ? false
    : {
        rejectUnauthorized: false,
      },
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connection established');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
  pool,
};
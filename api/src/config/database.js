const { Pool } = require('pg');
const { promisify } = require('util');

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'book_hub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 210,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased timeout to 5 seconds
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  retry: {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
    randomize: true
  }
};

// Create connection pool
const pool = new Pool(config);

// Test database connection
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  // Don't exit immediately, try to recover
  if (err.code === 'ECONNREFUSED') {
    console.error('❌ Connection refused, retrying...');
    setTimeout(() => {
      pool.end();
      pool.connect();
    }, 5000);
  }
});

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  let result;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      result = await pool.query(text, params);
      break;
    } catch (error) {
      attempts++;
      console.error(`❌ Database query attempt ${attempts} failed`, error);
      if (attempts === maxAttempts) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }

  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Executed query', { text, duration, rows: result.rowCount });
  }
  
  return result;
};

// Transaction helper
const withTransaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Ensure connection is released even on error
    try {
      client.release();
    } catch (releaseError) {
      console.error('❌ Error releasing connection:', releaseError);
    }
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('📦 Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
};

module.exports = {
  pool,
  query,
  withTransaction,
  closePool
};
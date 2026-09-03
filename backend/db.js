const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,                      // Maksimal 10 koneksi bersamaan
  idleTimeoutMillis: 30000,     // Tutup koneksi idle setelah 30 detik
  connectionTimeoutMillis: 5000 // Error jika gagal konek dalam 5 detik
});

// Tangkap error jika terjadi gangguan koneksi background dari Neon DB
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = pool;
// database.js — MySQL connection pool
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host:               process.env.DB_HOST,
    port:               parseInt(process.env.DB_PORT,
    user:               process.env.DB_USER,
    password:           process.env.DB_PASSWORD,
    database:           process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           'Z',
});

// Log pool-level connection errors so they are visible in server logs
pool.on('error', (err) => {
    console.error('Database pool error:', err.code, err.message);
});

const promisePool = pool.promise();

/**
 * Returns true when the error originated from a failed DB connection
 * (as opposed to a SQL logic error).
 */
function isConnectionError(err) {
    const connectionCodes = [
        'ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ENOTFOUND',
        'ETIMEDOUT', 'ER_ACCESS_DENIED_ERROR', 'ECONNRESET',
    ];
    return connectionCodes.includes(err.code);
}

/** User-facing message returned when the database cannot be reached. */
const DB_UNAVAILABLE_MSG = 'Database unavailable. Please ensure MySQL is running and your .env is configured correctly.';

/**
 * Attempt a lightweight query to verify connectivity.
 * Resolves on success, rejects with the original error on failure.
 */
async function testConnection() {
    await promisePool.query('SELECT 1');
}

module.exports = Object.assign(promisePool, { isConnectionError, testConnection, DB_UNAVAILABLE_MSG });

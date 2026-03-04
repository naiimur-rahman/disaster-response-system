// middleware/errorHandler.js — Centralized error formatting middleware
const { isConnectionError, DB_UNAVAILABLE_MSG } = require('../config/database');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
    // Database connection errors
    if (isConnectionError(err)) {
        return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
    }

    // Operational errors (AppError)
    if (err.isOperational) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Validation errors from express-validator (passed manually)
    if (err.statusCode === 422) {
        return res.status(422).json({ error: err.message, fields: err.fields });
    }

    // Generic fallback
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
}

module.exports = errorHandler;

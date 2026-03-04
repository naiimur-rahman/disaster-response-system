// middleware/auth.js — JWT authentication & role-based authorization
const jwt = require('jsonwebtoken');

/**
 * Verify JWT from Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user on success.
 */
function authenticate(req, res, next) {
    const header = req.headers['authorization'] || '';
    const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Restrict access to specific roles.
 * Must be used after authenticate middleware.
 * @param {...string} roles — Allowed roles (e.g. 'Admin', 'Coordinator')
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Authentication required' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
        }
        next();
    };
}

module.exports = { authenticate, authorize };

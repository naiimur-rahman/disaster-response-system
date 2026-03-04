// routes/auth.js — Authentication endpoints
const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const db         = require('../config/database');
const { authenticate }                    = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// ── POST /api/auth/login ────────────────────────────────────
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.query(
            'SELECT user_id, username, password_hash, email, role FROM users WHERE username = ?',
            [username.trim()]
        );
        if (!rows.length) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user  = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            token,
            user: { user_id: user.user_id, username: user.username, email: user.email, role: user.role },
        });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/auth/register ─────────────────────────────────
router.post('/register', validateRegister, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Check username uniqueness
        const [existing] = await db.query(
            'SELECT user_id FROM users WHERE username = ? OR email = ?',
            [username.trim(), email]
        );
        if (existing.length) {
            return res.status(409).json({ error: 'Username or email already in use' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
            [username.trim(), password_hash, email, role || 'Viewer']
        );
        res.status(201).json({ user_id: result.insertId, message: 'User registered successfully' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/auth/me ────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT user_id, username, email, role, created_at FROM users WHERE user_id = ?',
            [req.user.user_id]
        );
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

// routes/donors.js — Full CRUD for donors
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateDonor } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// ── Pagination helper ───────────────────────────────────────
function paginate(req) {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    return { page, limit, offset: (page - 1) * limit };
}

// GET /api/donors — List all donors with total donation amount
router.get('/', async (req, res) => {
    try {
        const { page, limit, offset } = paginate(req);
        const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM donors');
        const [rows] = await db.query(
            `SELECT d.*, COALESCE(SUM(don.amount), 0) AS total_donated
             FROM donors d
             LEFT JOIN donations don ON d.donor_id = don.donor_id
             GROUP BY d.donor_id
             ORDER BY d.name
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/donors/:id — Get donor with donation history
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM donors WHERE donor_id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        const [donations] = await db.query(
            `SELECT don.*, d.disaster_type, d.location AS disaster_location
             FROM donations don
             LEFT JOIN disasters d ON don.disaster_id = d.disaster_id
             WHERE don.donor_id = ?
             ORDER BY don.donation_date DESC`,
            [req.params.id]
        );
        res.json({ ...rows[0], donations });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/donors — Create donor
router.post('/', authenticate, validateDonor, async (req, res) => {
    try {
        const { name, donor_type, email, phone } = req.body;
        const [result] = await db.query(
            'INSERT INTO donors (name, donor_type, email, phone) VALUES (?, ?, ?, ?)',
            [name.trim(), donor_type || 'Individual', email || null, phone || null]
        );
        res.status(201).json({ donor_id: result.insertId, message: 'Donor created' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/donors/:id — Update donor
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { name, donor_type, email, phone } = req.body;
        const [result] = await db.query(
            'UPDATE donors SET name=?, donor_type=?, email=?, phone=? WHERE donor_id=?',
            [name, donor_type, email || null, phone || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Donor updated' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/donors/:id — Delete donor
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [check] = await db.query('SELECT donor_id FROM donors WHERE donor_id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM donors WHERE donor_id = ?', [req.params.id]);
        res.json({ message: 'Donor deleted' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

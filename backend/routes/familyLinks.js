// routes/familyLinks.js
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateFamilyLink } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// ── Pagination helper ───────────────────────────────────────
function paginate(req) {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    return { page, limit, offset: (page - 1) * limit };
}

// GET /api/family-links — List missing person reports
router.get('/', async (req, res) => {
    try {
        const { page, limit, offset } = paginate(req);
        const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM family_links');
        const [rows] = await db.query(
            `SELECT fl.*, v.name AS reporter_name, fv.name AS found_victim_name
             FROM family_links fl
             LEFT JOIN victims v  ON fl.victim_id       = v.victim_id
             LEFT JOIN victims fv ON fl.found_victim_id = fv.victim_id
             ORDER BY fl.last_seen_date DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/family-links — Report missing family member
router.post('/', authenticate, validateFamilyLink, async (req, res) => {
    try {
        const { victim_id, missing_person_name, relationship, last_seen_location, last_seen_date } = req.body;
        const [result] = await db.query(
            `INSERT INTO family_links (victim_id, missing_person_name, relationship, last_seen_location, last_seen_date)
             VALUES (?, ?, ?, ?, ?)`,
            [victim_id, missing_person_name, relationship, last_seen_location || null, last_seen_date || null]
        );
        res.status(201).json({ link_id: result.insertId, message: 'Missing person report created' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/family-links/:id/found — Mark as found
router.put('/:id/found', authenticate, async (req, res) => {
    try {
        const { found_victim_id } = req.body;
        await db.query(
            'UPDATE family_links SET is_found = TRUE, found_victim_id = ? WHERE link_id = ?',
            [found_victim_id || null, req.params.id]
        );
        res.json({ message: 'Marked as found' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/family-links/:id — Delete family link
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [check] = await db.query('SELECT link_id FROM family_links WHERE link_id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM family_links WHERE link_id = ?', [req.params.id]);
        res.json({ message: 'Family link deleted' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

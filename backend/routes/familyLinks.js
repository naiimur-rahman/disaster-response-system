// routes/familyLinks.js
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// GET /api/family-links — List missing person reports
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT fl.*, v.name AS reporter_name, fv.name AS found_victim_name
             FROM family_links fl
             LEFT JOIN victims v  ON fl.victim_id       = v.victim_id
             LEFT JOIN victims fv ON fl.found_victim_id = fv.victim_id
             ORDER BY fl.last_seen_date DESC`
        );
        res.json(rows);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/family-links — Report missing family member
router.post('/', async (req, res) => {
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
router.put('/:id/found', async (req, res) => {
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

module.exports = router;

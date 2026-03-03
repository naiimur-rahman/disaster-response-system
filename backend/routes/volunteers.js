// routes/volunteers.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

// GET /api/volunteers — List all volunteers
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT v.*, d.disaster_type, d.location AS disaster_location,
             az.zone_name
             FROM volunteers v
             LEFT JOIN disasters     d  ON v.assigned_disaster_id = d.disaster_id
             LEFT JOIN affected_zones az ON v.assigned_zone_id   = az.zone_id
             ORDER BY v.hours_contributed DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/volunteers/leaderboard — Leaderboard view
router.get('/leaderboard', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM volunteer_leaderboard');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/volunteers/match?disaster_id=...&skill=... — MatchVolunteers procedure
router.get('/match', async (req, res) => {
    try {
        const { disaster_id, skill } = req.query;
        if (!skill) return res.status(400).json({ error: 'skill is required' });
        const [results] = await db.query('CALL MatchVolunteers(?, ?)', [disaster_id || null, skill]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/volunteers/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM volunteers WHERE volunteer_id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/volunteers — Register volunteer
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, skills, availability, assigned_disaster_id,
                assigned_zone_id, hours_contributed, rating } = req.body;
        const [result] = await db.query(
            `INSERT INTO volunteers (name, email, phone, skills, availability,
             assigned_disaster_id, assigned_zone_id, hours_contributed, rating)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email || null, phone || null, skills || null, availability || 'Available',
             assigned_disaster_id || null, assigned_zone_id || null,
             hours_contributed || 0, rating || 0]
        );
        res.status(201).json({ volunteer_id: result.insertId, message: 'Volunteer registered' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/volunteers/:id — Update volunteer
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, skills, availability, assigned_disaster_id,
                assigned_zone_id, hours_contributed, rating } = req.body;
        await db.query(
            `UPDATE volunteers SET name=?, email=?, phone=?, skills=?, availability=?,
             assigned_disaster_id=?, assigned_zone_id=?, hours_contributed=?, rating=?
             WHERE volunteer_id=?`,
            [name, email || null, phone || null, skills || null, availability,
             assigned_disaster_id || null, assigned_zone_id || null,
             hours_contributed || 0, rating || 0, req.params.id]
        );
        res.json({ message: 'Volunteer updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

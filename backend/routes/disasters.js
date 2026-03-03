// routes/disasters.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

// GET /api/disasters — List all disasters with optional filters
router.get('/', async (req, res) => {
    try {
        const { status, type, severity } = req.query;
        let sql    = 'SELECT * FROM disasters WHERE 1=1';
        const params = [];
        if (status)   { sql += ' AND status = ?';         params.push(status); }
        if (type)     { sql += ' AND disaster_type = ?';  params.push(type); }
        if (severity) { sql += ' AND severity = ?';       params.push(severity); }
        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/disasters/:id — Get disaster details with zone info
router.get('/:id', async (req, res) => {
    try {
        const [disasters] = await db.query('SELECT * FROM disasters WHERE disaster_id = ?', [req.params.id]);
        if (!disasters.length) return res.status(404).json({ error: 'Not found' });
        const [zones] = await db.query('SELECT * FROM affected_zones WHERE disaster_id = ?', [req.params.id]);
        res.json({ ...disasters[0], zones });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/disasters — Create new disaster
router.post('/', async (req, res) => {
    try {
        const { disaster_type, severity, location, latitude, longitude,
                start_date, end_date, status, affected_population, description } = req.body;
        const [result] = await db.query(
            `INSERT INTO disasters (disaster_type, severity, location, latitude, longitude,
             start_date, end_date, status, affected_population, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [disaster_type, severity, location, latitude || null, longitude || null,
             start_date, end_date || null, status || 'Active', affected_population || 0, description || null]
        );
        res.status(201).json({ disaster_id: result.insertId, message: 'Disaster created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/disasters/:id — Update disaster
router.put('/:id', async (req, res) => {
    try {
        const { disaster_type, severity, location, latitude, longitude,
                start_date, end_date, status, affected_population, description } = req.body;
        await db.query(
            `UPDATE disasters SET disaster_type=?, severity=?, location=?, latitude=?,
             longitude=?, start_date=?, end_date=?, status=?, affected_population=?, description=?
             WHERE disaster_id=?`,
            [disaster_type, severity, location, latitude || null, longitude || null,
             start_date, end_date || null, status, affected_population || 0, description || null, req.params.id]
        );
        res.json({ message: 'Disaster updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/disasters/:id/report — Call DisasterReport procedure
router.get('/:id/report', async (req, res) => {
    try {
        const results = await db.query('CALL DisasterReport(?)', [req.params.id]);
        // MySQL returns multiple result sets for multi-statement procedures
        res.json({
            disaster:   results[0][0] || [],
            victims:    results[0][1] || [],
            volunteers: results[0][2] || [],
            donations:  results[0][3] || [],
            operations: results[0][4] || [],
            resources:  results[0][5] || [],
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

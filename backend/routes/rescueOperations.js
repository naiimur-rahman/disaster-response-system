// routes/rescueOperations.js — Full CRUD for rescue_operations
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateRescueOperation } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// ── Pagination helper ───────────────────────────────────────
function paginate(req) {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    return { page, limit, offset: (page - 1) * limit };
}

// GET /api/rescue-operations — List all with disaster & zone info
router.get('/', async (req, res) => {
    try {
        const { page, limit, offset } = paginate(req);
        const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM rescue_operations');
        const [rows] = await db.query(
            `SELECT ro.*,
                    d.disaster_type, d.location AS disaster_location,
                    az.zone_name,
                    v.name AS team_lead_name
             FROM rescue_operations ro
             LEFT JOIN disasters     d  ON ro.disaster_id  = d.disaster_id
             LEFT JOIN affected_zones az ON ro.zone_id     = az.zone_id
             LEFT JOIN volunteers    v  ON ro.team_lead_id = v.volunteer_id
             ORDER BY ro.start_time DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/rescue-operations/:id — Get single
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT ro.*,
                    d.disaster_type, d.location AS disaster_location,
                    az.zone_name,
                    v.name AS team_lead_name
             FROM rescue_operations ro
             LEFT JOIN disasters     d  ON ro.disaster_id  = d.disaster_id
             LEFT JOIN affected_zones az ON ro.zone_id     = az.zone_id
             LEFT JOIN volunteers    v  ON ro.team_lead_id = v.volunteer_id
             WHERE ro.operation_id = ?`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/rescue-operations — Create
router.post('/', authenticate, validateRescueOperation, async (req, res) => {
    try {
        const { disaster_id, zone_id, operation_name, team_lead_id,
                status, people_rescued, start_time, end_time, notes } = req.body;
        const [result] = await db.query(
            `INSERT INTO rescue_operations
             (disaster_id, zone_id, operation_name, team_lead_id, status, people_rescued, start_time, end_time, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [disaster_id || null, zone_id || null, operation_name.trim(),
             team_lead_id || null, status || 'Planned',
             people_rescued || 0, start_time || null, end_time || null, notes || null]
        );
        res.status(201).json({ operation_id: result.insertId, message: 'Rescue operation created' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/rescue-operations/:id — Update
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { disaster_id, zone_id, operation_name, team_lead_id,
                status, people_rescued, start_time, end_time, notes } = req.body;
        const [result] = await db.query(
            `UPDATE rescue_operations
             SET disaster_id=?, zone_id=?, operation_name=?, team_lead_id=?,
                 status=?, people_rescued=?, start_time=?, end_time=?, notes=?
             WHERE operation_id=?`,
            [disaster_id || null, zone_id || null, operation_name,
             team_lead_id || null, status, people_rescued || 0,
             start_time || null, end_time || null, notes || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Rescue operation updated' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/rescue-operations/:id — Delete
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [check] = await db.query('SELECT operation_id FROM rescue_operations WHERE operation_id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM rescue_operations WHERE operation_id = ?', [req.params.id]);
        res.json({ message: 'Rescue operation deleted' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

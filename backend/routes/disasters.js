// routes/disasters.js
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateDisaster } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// ── Pagination helper ───────────────────────────────────────
function paginate(req) {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    return { page, limit, offset: (page - 1) * limit };
}

// GET /api/disasters — List all disasters with optional filters
router.get('/', async (req, res) => {
    try {
        const { status, type, severity } = req.query;
        const { page, limit, offset }    = paginate(req);

        let whereSql = 'WHERE 1=1';
        const params = [];
        if (status)   { whereSql += ' AND status = ?';         params.push(status); }
        if (type)     { whereSql += ' AND disaster_type = ?';  params.push(type); }
        if (severity) { whereSql += ' AND severity = ?';       params.push(severity); }

        const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM disasters ${whereSql}`, params);
        const [rows]        = await db.query(
            `SELECT * FROM disasters ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
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
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/disasters — Create new disaster
router.post('/', authenticate, validateDisaster, async (req, res) => {
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
        // Emit real-time event
        const io = req.app.get('io');
        if (io) io.emit('disaster:created', { disaster_id: result.insertId, disaster_type, location });
        // Send email notification for new disasters
        const { notifyNewDisaster } = require('../services/emailService');
        notifyNewDisaster({ disaster_type, severity, location }).catch(() => {});
        res.status(201).json({ disaster_id: result.insertId, message: 'Disaster created' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/disasters/:id — Update disaster
router.put('/:id', authenticate, async (req, res) => {
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
        const io = req.app.get('io');
        if (io) io.emit('disaster:updated', { disaster_id: parseInt(req.params.id) });
        res.json({ message: 'Disaster updated' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
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
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/disasters/:id — Delete disaster
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [check] = await db.query('SELECT disaster_id FROM disasters WHERE disaster_id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM disasters WHERE disaster_id = ?', [req.params.id]);
        res.json({ message: 'Disaster deleted' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/disasters/export — Export disasters as CSV
router.get('/export', async (req, res) => {
    try {
        const { Parser } = require('json2csv');
        const [rows] = await db.query('SELECT * FROM disasters ORDER BY created_at DESC');
        const parser = new Parser();
        const csv    = parser.parse(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="disasters.csv"');
        res.send(csv);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

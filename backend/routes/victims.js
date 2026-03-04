// routes/victims.js
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateVictim } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;
const { notifyCriticalVictim } = require('../services/emailService');

// ── Pagination helper ───────────────────────────────────────
function paginate(req) {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    return { page, limit, offset: (page - 1) * limit };
}

// GET /api/victims — List victims with optional filters
router.get('/', async (req, res) => {
    try {
        const { status, disaster_id } = req.query;
        const { page, limit, offset } = paginate(req);

        let whereSql = 'WHERE 1=1';
        const params = [];
        if (status)      { whereSql += ' AND v.status = ?';      params.push(status); }
        if (disaster_id) { whereSql += ' AND v.disaster_id = ?'; params.push(disaster_id); }

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM victims v ${whereSql}`, params
        );
        const [rows] = await db.query(
            `SELECT v.*, d.disaster_type, d.location AS disaster_location,
                   s.name AS shelter_name, az.zone_name
                   FROM victims v
                   LEFT JOIN disasters d    ON v.disaster_id = d.disaster_id
                   LEFT JOIN shelters s     ON v.shelter_id  = s.shelter_id
                   LEFT JOIN affected_zones az ON v.zone_id  = az.zone_id
                   ${whereSql}
                   ORDER BY v.registered_at DESC
                   LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/victims/search?name=... — Search by name
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ error: 'name is required' });
        const [rows] = await db.query(
            `SELECT v.*, d.disaster_type, s.name AS shelter_name
             FROM victims v
             LEFT JOIN disasters d ON v.disaster_id = d.disaster_id
             LEFT JOIN shelters s  ON v.shelter_id  = s.shelter_id
             WHERE v.name LIKE ?
             ORDER BY v.registered_at DESC`,
            [`%${name}%`]
        );
        res.json(rows);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/victims/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT v.*, d.disaster_type, s.name AS shelter_name, az.zone_name
             FROM victims v
             LEFT JOIN disasters d    ON v.disaster_id = d.disaster_id
             LEFT JOIN shelters s     ON v.shelter_id  = s.shelter_id
             LEFT JOIN affected_zones az ON v.zone_id  = az.zone_id
             WHERE v.victim_id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/victims — Register victim
router.post('/', authenticate, validateVictim, async (req, res) => {
    try {
        const { name, age, gender, contact, nid_number, disaster_id, zone_id,
                shelter_id, medical_condition, status } = req.body;
        const [result] = await db.query(
            `INSERT INTO victims (name, age, gender, contact, nid_number, disaster_id, zone_id,
             shelter_id, medical_condition, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, age || null, gender || null, contact || null, nid_number || null,
             disaster_id || null, zone_id || null, shelter_id || null,
             medical_condition || null, status || 'Safe']
        );
        // Send email alert for critical victims
        if (status === 'Critical') {
            notifyCriticalVictim({ name, medical_condition }).catch(() => {});
        }
        res.status(201).json({ victim_id: result.insertId, message: 'Victim registered' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/victims/:id — Update victim status
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { name, age, gender, contact, disaster_id, zone_id,
                shelter_id, medical_condition, status } = req.body;
        await db.query(
            `UPDATE victims SET name=?, age=?, gender=?, contact=?, disaster_id=?,
             zone_id=?, shelter_id=?, medical_condition=?, status=?
             WHERE victim_id=?`,
            [name, age || null, gender || null, contact || null,
             disaster_id || null, zone_id || null, shelter_id || null,
             medical_condition || null, status, req.params.id]
        );
        res.json({ message: 'Victim updated' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/victims/:id — Delete victim
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [check] = await db.query('SELECT victim_id FROM victims WHERE victim_id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM victims WHERE victim_id = ?', [req.params.id]);
        res.json({ message: 'Victim deleted' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/victims/export — Export victims as CSV
router.get('/export', async (req, res) => {
    try {
        const { Parser } = require('json2csv');
        const [rows] = await db.query(
            `SELECT v.victim_id, v.name, v.age, v.gender, v.contact, v.status,
                    d.disaster_type, d.location AS disaster_location
             FROM victims v
             LEFT JOIN disasters d ON v.disaster_id = d.disaster_id
             ORDER BY v.registered_at DESC`
        );
        const parser = new Parser();
        const csv    = parser.parse(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="victims.csv"');
        res.send(csv);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

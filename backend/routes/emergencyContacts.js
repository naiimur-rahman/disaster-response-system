// routes/emergencyContacts.js — Full CRUD for emergency_contacts
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateEmergencyContact } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// ── Pagination helper ───────────────────────────────────────
function paginate(req) {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    return { page, limit, offset: (page - 1) * limit };
}

// GET /api/emergency-contacts — List all, optional filter by service_type or is_active
router.get('/', async (req, res) => {
    try {
        const { service_type, is_active } = req.query;
        const { page, limit, offset }     = paginate(req);

        let countSql = 'SELECT COUNT(*) AS total FROM emergency_contacts WHERE 1=1';
        let dataSql  = 'SELECT * FROM emergency_contacts WHERE 1=1';
        const params = [];

        if (service_type) { countSql += ' AND service_type = ?'; dataSql += ' AND service_type = ?'; params.push(service_type); }
        if (is_active !== undefined) {
            countSql += ' AND is_active = ?';
            dataSql  += ' AND is_active = ?';
            params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
        }
        dataSql += ' ORDER BY organization_name LIMIT ? OFFSET ?';

        const [[{ total }]] = await db.query(countSql, params);
        const [rows]        = await db.query(dataSql, [...params, limit, offset]);
        res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/emergency-contacts/:id — Get single
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM emergency_contacts WHERE contact_id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/emergency-contacts — Create
router.post('/', authenticate, validateEmergencyContact, async (req, res) => {
    try {
        const { organization_name, service_type, phone, zone_coverage, is_active } = req.body;
        const [result] = await db.query(
            `INSERT INTO emergency_contacts (organization_name, service_type, phone, zone_coverage, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            [organization_name.trim(), service_type, phone.trim(),
             zone_coverage || null, is_active !== undefined ? (is_active ? 1 : 0) : 1]
        );
        res.status(201).json({ contact_id: result.insertId, message: 'Emergency contact created' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/emergency-contacts/:id — Update
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { organization_name, service_type, phone, zone_coverage, is_active } = req.body;
        const [result] = await db.query(
            `UPDATE emergency_contacts
             SET organization_name=?, service_type=?, phone=?, zone_coverage=?, is_active=?
             WHERE contact_id=?`,
            [organization_name, service_type, phone,
             zone_coverage || null, is_active ? 1 : 0, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Emergency contact updated' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/emergency-contacts/:id — Delete
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [check] = await db.query('SELECT contact_id FROM emergency_contacts WHERE contact_id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM emergency_contacts WHERE contact_id = ?', [req.params.id]);
        res.json({ message: 'Emergency contact deleted' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

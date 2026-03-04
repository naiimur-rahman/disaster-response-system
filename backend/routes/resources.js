// routes/resources.js — handles both /api/resources and /api/distributions
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateResource } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// ── Pagination helper ───────────────────────────────────────
function paginate(req) {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    return { page, limit, offset: (page - 1) * limit };
}

// ── Resources ───────────────────────────────────────────────

// GET /api/resources — List all resources with low-stock flag
router.get('/', async (req, res) => {
    try {
        const { page, limit, offset } = paginate(req);
        const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM resources');
        const [rows]        = await db.query(
            `SELECT *, (quantity < min_stock_level) AS is_low_stock
             FROM resources
             ORDER BY category, resource_name
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// ── Distributions ───────────────────────────────────────────

// GET /api/resources/distributions — Distribution history
router.get('/distributions', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT dist.*, r.resource_name, r.category,
             s.name AS shelter_name, az.zone_name, vol.name AS volunteer_name
             FROM distributions dist
             LEFT JOIN resources     r   ON dist.resource_id   = r.resource_id
             LEFT JOIN shelters      s   ON dist.shelter_id    = s.shelter_id
             LEFT JOIN affected_zones az ON dist.zone_id       = az.zone_id
             LEFT JOIN volunteers    vol ON dist.distributed_by = vol.volunteer_id
             ORDER BY dist.distribution_date DESC`
        );
        res.json(rows);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/resources/distributions — Distribute resources (calls AllocateResources procedure)
router.post('/distributions', authenticate, async (req, res) => {
    try {
        const { resource_id, shelter_id, quantity, volunteer_id } = req.body;
        await db.query('CALL AllocateResources(?, ?, ?, ?)', [resource_id, shelter_id, quantity, volunteer_id || null]);
        res.status(201).json({ message: 'Resources allocated successfully' });
    } catch (err) {
        if (err.sqlMessage && err.sqlMessage.includes('Insufficient')) {
            return res.status(400).json({ error: err.sqlMessage });
        }
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/resources/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT *, (quantity < min_stock_level) AS is_low_stock FROM resources WHERE resource_id = ?',
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/resources — Add resource
router.post('/', authenticate, validateResource, async (req, res) => {
    try {
        const { resource_name, category, quantity, unit, warehouse_location, expiry_date, min_stock_level } = req.body;
        const [result] = await db.query(
            `INSERT INTO resources (resource_name, category, quantity, unit, warehouse_location, expiry_date, min_stock_level)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [resource_name, category, quantity || 0, unit || null, warehouse_location || null,
             expiry_date || null, min_stock_level || 100]
        );
        res.status(201).json({ resource_id: result.insertId, message: 'Resource added' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/resources/:id — Delete resource
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [check] = await db.query('SELECT resource_id FROM resources WHERE resource_id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM resources WHERE resource_id = ?', [req.params.id]);
        res.json({ message: 'Resource deleted' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

// routes/resources.js — handles both /api/resources and /api/distributions
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

// ── Resources ───────────────────────────────────────────────

// GET /api/resources — List all resources with low-stock flag
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT *, (quantity < min_stock_level) AS is_low_stock
             FROM resources
             ORDER BY category, resource_name`
        );
        res.json(rows);
    } catch (err) {
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
        res.status(500).json({ error: err.message });
    }
});

// POST /api/resources — Add resource
router.post('/', async (req, res) => {
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
        res.status(500).json({ error: err.message });
    }
});

// ── Distributions ───────────────────────────────────────────

// GET /api/distributions — Distribution history
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
        res.status(500).json({ error: err.message });
    }
});

// POST /api/distributions — Distribute resources (calls AllocateResources procedure)
router.post('/distributions', async (req, res) => {
    try {
        const { resource_id, shelter_id, quantity, volunteer_id } = req.body;
        await db.query('CALL AllocateResources(?, ?, ?, ?)', [resource_id, shelter_id, quantity, volunteer_id || null]);
        res.status(201).json({ message: 'Resources allocated successfully' });
    } catch (err) {
        if (err.sqlMessage && err.sqlMessage.includes('Insufficient')) {
            return res.status(400).json({ error: err.sqlMessage });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

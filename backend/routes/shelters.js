// routes/shelters.js
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateShelter } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// ── Pagination helper ───────────────────────────────────────
function paginate(req) {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    return { page, limit, offset: (page - 1) * limit };
}

// GET /api/shelters — List all shelters
router.get('/', async (req, res) => {
    try {
        const { page, limit, offset } = paginate(req);
        const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM shelters');
        const [rows]        = await db.query('SELECT * FROM shelters ORDER BY name LIMIT ? OFFSET ?', [limit, offset]);
        res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/shelters/nearest?lat=...&lon=... — Find nearest shelters via procedure
router.get('/nearest', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
        const [results] = await db.query('CALL FindNearestShelter(?, ?)', [parseFloat(lat), parseFloat(lon)]);
        res.json(results[0]);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/shelters/:id — Get shelter by id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM shelters WHERE shelter_id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/shelters — Add shelter
router.post('/', authenticate, validateShelter, async (req, res) => {
    try {
        const { name, location, latitude, longitude, max_capacity, has_medical_facility,
                has_food_supply, contact_number } = req.body;
        const [result] = await db.query(
            `INSERT INTO shelters (name, location, latitude, longitude, max_capacity,
             has_medical_facility, has_food_supply, contact_number)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, location, latitude || null, longitude || null, max_capacity,
             has_medical_facility ? 1 : 0, has_food_supply ? 1 : 0, contact_number || null]
        );
        res.status(201).json({ shelter_id: result.insertId, message: 'Shelter created' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/shelters/:id — Update shelter
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { name, location, max_capacity, current_occupancy, status,
                has_medical_facility, has_food_supply, contact_number } = req.body;
        await db.query(
            `UPDATE shelters SET name=?, location=?, max_capacity=?, current_occupancy=?,
             status=?, has_medical_facility=?, has_food_supply=?, contact_number=?
             WHERE shelter_id=?`,
            [name, location, max_capacity, current_occupancy, status,
             has_medical_facility ? 1 : 0, has_food_supply ? 1 : 0, contact_number || null, req.params.id]
        );
        res.json({ message: 'Shelter updated' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/shelters/:id — Delete shelter
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [check] = await db.query('SELECT shelter_id FROM shelters WHERE shelter_id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM shelters WHERE shelter_id = ?', [req.params.id]);
        res.json({ message: 'Shelter deleted' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

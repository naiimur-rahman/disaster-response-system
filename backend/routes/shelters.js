// routes/shelters.js
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// GET /api/shelters — List all shelters
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM shelters ORDER BY name');
        res.json(rows);
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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

module.exports = router;

// routes/donations.js
const express          = require('express');
const router           = express.Router();
const db               = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validateDonation } = require('../middleware/validate');
const { isConnectionError, DB_UNAVAILABLE_MSG } = db;

// ── Pagination helper ───────────────────────────────────────
function paginate(req) {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    return { page, limit, offset: (page - 1) * limit };
}

// GET /api/donations — Donation transparency list (via view)
router.get('/', async (req, res) => {
    try {
        const { page, limit, offset } = paginate(req);
        const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM donation_transparency');
        const [rows]        = await db.query('SELECT * FROM donation_transparency LIMIT ? OFFSET ?', [limit, offset]);
        res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/donations/stats — Donation statistics
router.get('/stats', async (req, res) => {
    try {
        const [totals] = await db.query(
            `SELECT
                COUNT(*)        AS total_donations,
                SUM(amount)     AS total_money,
                SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) AS verified_count,
                SUM(CASE WHEN is_verified = 0 THEN 1 ELSE 0 END) AS pending_count
             FROM donations`
        );
        const [byType] = await db.query(
            `SELECT donation_type, COUNT(*) AS count, SUM(amount) AS total_amount
             FROM donations GROUP BY donation_type`
        );
        const [monthly] = await db.query(
            `SELECT DATE_FORMAT(donation_date, '%Y-%m') AS month,
             SUM(amount) AS total
             FROM donations
             GROUP BY month ORDER BY month DESC LIMIT 12`
        );
        res.json({ totals: totals[0], byType, monthly });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/donations — Record donation
router.post('/', authenticate, validateDonation, async (req, res) => {
    try {
        const { donor_id, disaster_id, donation_type, amount, item_description, quantity } = req.body;
        const [result] = await db.query(
            `INSERT INTO donations (donor_id, disaster_id, donation_type, amount, item_description, quantity)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [donor_id || null, disaster_id || null, donation_type,
             amount || 0, item_description || null, quantity || 0]
        );
        res.status(201).json({ donation_id: result.insertId, message: 'Donation recorded' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/donations/:id — Delete donation
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [check] = await db.query('SELECT donation_id FROM donations WHERE donation_id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ error: 'Not found' });
        await db.query('DELETE FROM donations WHERE donation_id = ?', [req.params.id]);
        res.json({ message: 'Donation deleted' });
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

// GET /api/donations/export — Export donations as CSV
router.get('/export', async (req, res) => {
    try {
        const { Parser } = require('json2csv');
        const [rows] = await db.query('SELECT * FROM donation_transparency');
        const parser = new Parser();
        const csv    = parser.parse(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="donations.csv"');
        res.send(csv);
    } catch (err) {
        if (isConnectionError(err)) return res.status(503).json({ error: DB_UNAVAILABLE_MSG });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

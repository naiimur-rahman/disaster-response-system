// routes/dashboard.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

// GET /api/dashboard — Main dashboard stats
router.get('/', async (req, res) => {
    try {
        const [[disasters]]  = await db.query("SELECT COUNT(*) AS total, SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) AS active FROM disasters");
        const [[victims]]    = await db.query('SELECT COUNT(*) AS total, SUM(CASE WHEN status="Missing" THEN 1 ELSE 0 END) AS missing FROM victims');
        const [[volunteers]] = await db.query("SELECT COUNT(*) AS total, SUM(CASE WHEN availability='Deployed' THEN 1 ELSE 0 END) AS deployed FROM volunteers");
        const [[donations]]  = await db.query('SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS total_amount FROM donations');
        const [[shelters]]   = await db.query("SELECT COUNT(*) AS total, SUM(CASE WHEN status='Open' THEN 1 ELSE 0 END) AS open_count FROM shelters");
        res.json({ disasters, victims, volunteers, donations, shelters });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dashboard/live — Live dashboard view data
router.get('/live', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM live_dashboard');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/audit-log — Recent audit log entries
router.get('/audit-log', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 50');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dashboard/charts — Chart data
router.get('/charts', async (req, res) => {
    try {
        const [disasterTypes] = await db.query(
            'SELECT disaster_type, COUNT(*) AS count FROM disasters GROUP BY disaster_type'
        );
        const [victimStatus] = await db.query(
            'SELECT status, COUNT(*) AS count FROM victims GROUP BY status'
        );
        const [donationTrend] = await db.query(
            `SELECT DATE_FORMAT(donation_date,'%Y-%m') AS month, SUM(amount) AS total
             FROM donations GROUP BY month ORDER BY month LIMIT 12`
        );
        res.json({ disasterTypes, victimStatus, donationTrend });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

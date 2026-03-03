// server.js — Main Express application
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Rate Limiting ──────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs:        15 * 60 * 1000, // 15 minutes
    max:             500,             // limit each IP to 500 requests per window
    standardHeaders: true,
    legacyHeaders:   false,
    message:         { error: 'Too many requests, please try again later.' },
});

// ── Middleware ─────────────────────────────────────────────
app.use(globalLimiter);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve Frontend Static Files ────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ─────────────────────────────────────────────
app.use('/api/disasters',    require('./routes/disasters'));
app.use('/api/shelters',     require('./routes/shelters'));
app.use('/api/victims',      require('./routes/victims'));
app.use('/api/family-links', require('./routes/familyLinks'));
app.use('/api/volunteers',   require('./routes/volunteers'));
app.use('/api/resources',    require('./routes/resources'));
app.use('/api/donations',    require('./routes/donations'));
app.use('/api/dashboard',    require('./routes/dashboard'));

// ── SPA Fallback ───────────────────────────────────────────
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
    } else {
        res.status(404).json({ error: 'API route not found' });
    }
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ── Start Server ───────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000', 10);
const { testConnection } = require('./config/database');

app.listen(PORT, async () => {
    console.log(`🌊 Disaster Response System running on http://localhost:${PORT}`);
    try {
        await testConnection();
        console.log('✅ Database connected successfully');
    } catch (err) {
        console.error(`❌ Database connection failed: ${err.code || ''} ${err.message}`);
        console.error('   Ensure MySQL is running and the .env file is configured correctly.');
        console.error('   See backend/.env.example for the required environment variables.');
    }
});

// server.js — Main Express application
require('dotenv').config();
const validateEnv = require('./config/validateEnv');
validateEnv();

const express     = require('express');
const http        = require('http');
const cors        = require('cors');
const path        = require('path');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const { Server }  = require('socket.io');
const upload      = require('./middleware/upload');
const errorHandler = require('./middleware/errorHandler');

const app    = express();
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST'] },
});
app.set('io', io);
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// ── Security ───────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Disabled to allow inline scripts in frontend
}));

// ── CORS ───────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            cb(null, true);
        } else {
            cb(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// ── Rate Limiting ──────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs:        15 * 60 * 1000, // 15 minutes
    max:             500,             // limit each IP to 500 requests per window
    standardHeaders: true,
    legacyHeaders:   false,
    message:         { error: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
    windowMs:        15 * 60 * 1000, // 15 minutes
    max:             10,              // stricter limit for auth endpoints
    standardHeaders: true,
    legacyHeaders:   false,
    message:         { error: 'Too many auth attempts, please try again later.' },
});

// ── Logging ────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Middleware ─────────────────────────────────────────────
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve Frontend Static Files ────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── Serve Uploads ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── File Upload Endpoint ───────────────────────────────────
app.post('/api/upload', require('./middleware/auth').authenticate, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',              authLimiter, require('./routes/auth'));
app.use('/api/disasters',         require('./routes/disasters'));
app.use('/api/shelters',          require('./routes/shelters'));
app.use('/api/victims',           require('./routes/victims'));
app.use('/api/family-links',      require('./routes/familyLinks'));
app.use('/api/volunteers',        require('./routes/volunteers'));
app.use('/api/resources',         require('./routes/resources'));
app.use('/api/donations',         require('./routes/donations'));
app.use('/api/dashboard',         require('./routes/dashboard'));
app.use('/api/rescue-operations', require('./routes/rescueOperations'));
app.use('/api/emergency-contacts',require('./routes/emergencyContacts'));
app.use('/api/donors',            require('./routes/donors'));

// ── SPA Fallback ───────────────────────────────────────────
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
    } else {
        res.status(404).json({ error: 'API route not found' });
    }
});

// ── Global Error Handler ───────────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000', 10);
const { testConnection } = require('./config/database');

// Only listen when not in test mode
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, async () => {
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
}

module.exports = { app, server, io };


// middleware/upload.js — Multer config for file uploads
const multer = require('multer');
const path   = require('path');

// Vercel's filesystem is read-only outside of /tmp; use /tmp when running on Vercel.
// Note: files written to /tmp are ephemeral and will be lost between invocations.
const uploadDir = process.env.VERCEL
    ? '/tmp'
    : path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    const ext     = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime    = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png, gif) and PDFs are allowed'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

module.exports = upload;

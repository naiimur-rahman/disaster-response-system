// config/validateEnv.js — Fail fast if required env vars are missing
function validateEnv() {
    const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    const optional = {
        PORT:      '3000',
        NODE_ENV:  'development',
        SMTP_HOST: null,
        SMTP_PORT: null,
        SMTP_USER: null,
        SMTP_PASS: null,
    };

    const missing = required.filter(key => !process.env[key]);
    if (missing.length) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.error('   Copy backend/.env.example to backend/.env and fill in the values.');
        process.exit(1);
    }

    Object.entries(optional).forEach(([key, defaultVal]) => {
        if (!process.env[key]) {
            if (defaultVal !== null) {
                console.warn(`⚠️  ${key} not set — using default: ${defaultVal}`);
            }
        }
    });
}

module.exports = validateEnv;

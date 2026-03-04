// config/validateEnv.js — Warn about missing env vars without crashing serverless functions
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
        // On Vercel (and other serverless platforms), process.exit() crashes the
        // function invocation. Skip it there and let individual request handlers
        // return 503 for DB errors and 500 for JWT errors instead.
        if (!process.env.VERCEL) {
            process.exit(1);
        }
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

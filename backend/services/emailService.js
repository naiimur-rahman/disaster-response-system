// services/emailService.js — Nodemailer-based email notifications
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    // Only configure if SMTP settings are present
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
    transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    return transporter;
}

/**
 * Send an email. Silently skips if SMTP is not configured.
 * @param {Object} options - { to, subject, html }
 */
async function sendEmail({ to, subject, html }) {
    const t = getTransporter();
    if (!t) return; // SMTP not configured — skip gracefully
    try {
        await t.sendMail({
            from: `"DisasterRelief BD" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
    } catch (err) {
        console.error('Email send failed:', err.message);
    }
}

/**
 * Notify on new disaster creation.
 */
async function notifyNewDisaster(disaster) {
    await sendEmail({
        to:      process.env.ALERT_EMAIL || process.env.SMTP_USER,
        subject: `🚨 New Disaster Alert: ${disaster.disaster_type} in ${disaster.location}`,
        html:    `<h2>New Disaster Reported</h2>
                  <p><strong>Type:</strong> ${disaster.disaster_type}</p>
                  <p><strong>Severity:</strong> ${disaster.severity}</p>
                  <p><strong>Location:</strong> ${disaster.location}</p>`,
    });
}

/**
 * Notify on critical victim registration.
 */
async function notifyCriticalVictim(victim) {
    await sendEmail({
        to:      process.env.ALERT_EMAIL || process.env.SMTP_USER,
        subject: `⚠️ Critical Victim Registered: ${victim.name}`,
        html:    `<h2>Critical Victim Alert</h2>
                  <p><strong>Name:</strong> ${victim.name}</p>
                  <p><strong>Condition:</strong> ${victim.medical_condition || 'Unknown'}</p>`,
    });
}

module.exports = { sendEmail, notifyNewDisaster, notifyCriticalVictim };

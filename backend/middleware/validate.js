// middleware/validate.js — Reusable express-validator chains for each resource
const { body, validationResult } = require('express-validator');

/**
 * Run after validation chains — returns 422 with field-level errors if any.
 */
function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validation failed', fields: errors.array() });
    }
    next();
}

// ── Disaster ────────────────────────────────────────────────
const validateDisaster = [
    body('disaster_type').trim().notEmpty().withMessage('disaster_type is required'),
    body('severity').trim().notEmpty().withMessage('severity is required'),
    body('location').trim().notEmpty().withMessage('location is required'),
    body('start_date').notEmpty().withMessage('start_date is required'),
    handleValidation,
];

// ── Shelter ─────────────────────────────────────────────────
const validateShelter = [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('location').trim().notEmpty().withMessage('location is required'),
    body('max_capacity').isInt({ min: 1 }).withMessage('max_capacity must be a positive integer'),
    handleValidation,
];

// ── Victim ──────────────────────────────────────────────────
const validateVictim = [
    body('name').trim().notEmpty().withMessage('name is required'),
    handleValidation,
];

// ── Volunteer ───────────────────────────────────────────────
const validateVolunteer = [
    body('name').trim().notEmpty().withMessage('name is required'),
    handleValidation,
];

// ── Donation ────────────────────────────────────────────────
const validateDonation = [
    body('donation_type').trim().notEmpty().withMessage('donation_type is required'),
    handleValidation,
];

// ── Family Link ─────────────────────────────────────────────
const validateFamilyLink = [
    body('victim_id').notEmpty().withMessage('victim_id is required'),
    body('missing_person_name').trim().notEmpty().withMessage('missing_person_name is required'),
    body('relationship').trim().notEmpty().withMessage('relationship is required'),
    handleValidation,
];

// ── Resource ────────────────────────────────────────────────
const validateResource = [
    body('resource_name').trim().notEmpty().withMessage('resource_name is required'),
    body('category').trim().notEmpty().withMessage('category is required'),
    handleValidation,
];

// ── Rescue Operation ────────────────────────────────────────
const validateRescueOperation = [
    body('operation_name').trim().notEmpty().withMessage('operation_name is required'),
    handleValidation,
];

// ── Emergency Contact ───────────────────────────────────────
const validateEmergencyContact = [
    body('organization_name').trim().notEmpty().withMessage('organization_name is required'),
    body('service_type').trim().notEmpty().withMessage('service_type is required'),
    body('phone').trim().notEmpty().withMessage('phone is required'),
    handleValidation,
];

// ── Donor ───────────────────────────────────────────────────
const validateDonor = [
    body('name').trim().notEmpty().withMessage('name is required'),
    handleValidation,
];

// ── Auth ────────────────────────────────────────────────────
const validateLogin = [
    body('username').trim().notEmpty().withMessage('username is required'),
    body('password').notEmpty().withMessage('password is required'),
    handleValidation,
];

const validateRegister = [
    body('username').trim().isLength({ min: 3 }).withMessage('username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
    handleValidation,
];

module.exports = {
    handleValidation,
    validateDisaster,
    validateShelter,
    validateVictim,
    validateVolunteer,
    validateDonation,
    validateFamilyLink,
    validateResource,
    validateRescueOperation,
    validateEmergencyContact,
    validateDonor,
    validateLogin,
    validateRegister,
};

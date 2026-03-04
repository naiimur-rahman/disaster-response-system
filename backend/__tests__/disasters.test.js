// __tests__/disasters.test.js — Disaster CRUD endpoint tests
const request = require('supertest');
const jwt     = require('jsonwebtoken');

// Mock the database module
jest.mock('../config/database', () => {
    const mockQuery = jest.fn();
    const pool = { query: mockQuery };
    pool.isConnectionError = (err) => ['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST'].includes(err.code);
    pool.DB_UNAVAILABLE_MSG = 'Database unavailable.';
    pool.testConnection = jest.fn().mockResolvedValue(true);
    return pool;
});

jest.mock('../config/validateEnv', () => jest.fn());

process.env.JWT_SECRET  = 'test-jwt-secret-for-testing-only';
process.env.DB_HOST     = 'localhost';
process.env.DB_USER     = 'root';
process.env.DB_PASSWORD = 'password';
process.env.DB_NAME     = 'disaster_response';
process.env.NODE_ENV    = 'test';

const db    = require('../config/database');
const { app } = require('../server');

// Generate a valid test JWT
const testToken = jwt.sign(
    { user_id: 1, username: 'admin', role: 'Admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

const mockDisaster = {
    disaster_id: 1, disaster_type: 'Flood', severity: 'Critical',
    location: 'Sylhet, Bangladesh', start_date: '2024-06-15T06:00:00.000Z',
    status: 'Active', affected_population: 850000, created_at: new Date(),
};

describe('GET /api/disasters', () => {
    it('should return paginated disasters list', async () => {
        db.query
            .mockResolvedValueOnce([[{ total: 1 }]])
            .mockResolvedValueOnce([[mockDisaster]]);
        const res = await request(app).get('/api/disasters');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support page and limit query params', async () => {
        db.query
            .mockResolvedValueOnce([[{ total: 5 }]])
            .mockResolvedValueOnce([[mockDisaster]]);
        const res = await request(app).get('/api/disasters?page=1&limit=5');
        expect(res.status).toBe(200);
        expect(res.body.pagination.limit).toBe(5);
    });
});

describe('GET /api/disasters/:id', () => {
    it('should return disaster details', async () => {
        db.query
            .mockResolvedValueOnce([[mockDisaster]])
            .mockResolvedValueOnce([[]]); // no zones
        const res = await request(app).get('/api/disasters/1');
        expect(res.status).toBe(200);
        expect(res.body.disaster_id).toBe(1);
    });

    it('should return 404 for non-existent disaster', async () => {
        db.query.mockResolvedValueOnce([[]]); // not found
        const res = await request(app).get('/api/disasters/9999');
        expect(res.status).toBe(404);
    });
});

describe('POST /api/disasters', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .post('/api/disasters')
            .send({ disaster_type: 'Flood', severity: 'High', location: 'Test', start_date: '2024-01-01' });
        expect(res.status).toBe(401);
    });

    it('should return 422 for missing required fields', async () => {
        const res = await request(app)
            .post('/api/disasters')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ disaster_type: 'Flood' }); // missing severity, location, start_date
        expect(res.status).toBe(422);
    });

    it('should create disaster with valid data and auth', async () => {
        db.query.mockResolvedValueOnce([{ insertId: 11 }]);
        const res = await request(app)
            .post('/api/disasters')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ disaster_type: 'Flood', severity: 'High', location: 'Test Location', start_date: '2024-01-01T00:00:00' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('disaster_id', 11);
    });
});

describe('DELETE /api/disasters/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/disasters/1');
        expect(res.status).toBe(401);
    });

    it('should return 404 if not found', async () => {
        db.query.mockResolvedValueOnce([[]]); // not found
        const res = await request(app)
            .delete('/api/disasters/9999')
            .set('Authorization', `Bearer ${testToken}`);
        expect(res.status).toBe(404);
    });

    it('should delete disaster with auth', async () => {
        db.query
            .mockResolvedValueOnce([[{ disaster_id: 1 }]]) // found
            .mockResolvedValueOnce([{ affectedRows: 1 }]); // deleted
        const res = await request(app)
            .delete('/api/disasters/1')
            .set('Authorization', `Bearer ${testToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
    });
});

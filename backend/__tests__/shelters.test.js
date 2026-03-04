// __tests__/shelters.test.js — Shelter CRUD endpoint tests
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

const db      = require('../config/database');
const { app } = require('../server');

const testToken = jwt.sign(
    { user_id: 1, username: 'admin', role: 'Admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

const mockShelter = {
    shelter_id: 1, name: 'Test Shelter', location: 'Test Location',
    max_capacity: 500, current_occupancy: 100, status: 'Open',
};

describe('GET /api/shelters', () => {
    it('should return paginated shelters list', async () => {
        db.query
            .mockResolvedValueOnce([[{ total: 1 }]])
            .mockResolvedValueOnce([[mockShelter]]);
        const res = await request(app).get('/api/shelters');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
    });
});

describe('GET /api/shelters/:id', () => {
    it('should return shelter by id', async () => {
        db.query.mockResolvedValueOnce([[mockShelter]]);
        const res = await request(app).get('/api/shelters/1');
        expect(res.status).toBe(200);
        expect(res.body.shelter_id).toBe(1);
    });

    it('should return 404 for non-existent shelter', async () => {
        db.query.mockResolvedValueOnce([[]]); // not found
        const res = await request(app).get('/api/shelters/9999');
        expect(res.status).toBe(404);
    });
});

describe('POST /api/shelters', () => {
    it('should require authentication', async () => {
        const res = await request(app)
            .post('/api/shelters')
            .send({ name: 'Test', location: 'Test', max_capacity: 100 });
        expect(res.status).toBe(401);
    });

    it('should return 422 for missing name', async () => {
        const res = await request(app)
            .post('/api/shelters')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ location: 'Test', max_capacity: 100 }); // missing name
        expect(res.status).toBe(422);
    });

    it('should return 422 for non-positive max_capacity', async () => {
        const res = await request(app)
            .post('/api/shelters')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ name: 'Test', location: 'Test', max_capacity: -5 });
        expect(res.status).toBe(422);
    });

    it('should create shelter with valid data', async () => {
        db.query.mockResolvedValueOnce([{ insertId: 5 }]);
        const res = await request(app)
            .post('/api/shelters')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ name: 'Test Shelter', location: 'Test City', max_capacity: 300 });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('shelter_id', 5);
    });
});

describe('DELETE /api/shelters/:id', () => {
    it('should require authentication', async () => {
        const res = await request(app).delete('/api/shelters/1');
        expect(res.status).toBe(401);
    });

    it('should return 404 if shelter not found', async () => {
        db.query.mockResolvedValueOnce([[]]); // not found
        const res = await request(app)
            .delete('/api/shelters/9999')
            .set('Authorization', `Bearer ${testToken}`);
        expect(res.status).toBe(404);
    });

    it('should delete shelter successfully', async () => {
        db.query
            .mockResolvedValueOnce([[{ shelter_id: 1 }]]) // found
            .mockResolvedValueOnce([{ affectedRows: 1 }]); // deleted
        const res = await request(app)
            .delete('/api/shelters/1')
            .set('Authorization', `Bearer ${testToken}`);
        expect(res.status).toBe(200);
    });
});

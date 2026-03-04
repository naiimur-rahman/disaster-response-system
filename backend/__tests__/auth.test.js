// __tests__/auth.test.js — Authentication endpoint tests
const request = require('supertest');

// Mock the database module to avoid requiring a real MySQL connection
jest.mock('../config/database', () => {
    const mockQuery = jest.fn();
    const pool = { query: mockQuery };
    pool.isConnectionError = (err) => ['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST'].includes(err.code);
    pool.DB_UNAVAILABLE_MSG = 'Database unavailable.';
    pool.testConnection = jest.fn().mockResolvedValue(true);
    return pool;
});

// Mock validateEnv to be a no-op in tests
jest.mock('../config/validateEnv', () => jest.fn());

const db = require('../config/database');

// Set required env vars for tests
process.env.JWT_SECRET    = 'test-jwt-secret-for-testing-only';
process.env.DB_HOST       = 'localhost';
process.env.DB_USER       = 'root';
process.env.DB_PASSWORD   = 'password';
process.env.DB_NAME       = 'disaster_response';
process.env.NODE_ENV      = 'test';

const { app } = require('../server');
const bcrypt  = require('bcryptjs');

describe('POST /api/auth/login', () => {
    it('should return 401 for invalid username', async () => {
        db.query.mockResolvedValueOnce([[]]); // no user found
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'nonexistent', password: 'password123' });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('should return 401 for wrong password', async () => {
        const hash = await bcrypt.hash('correctpassword', 10);
        db.query.mockResolvedValueOnce([[{ user_id: 1, username: 'admin', password_hash: hash, role: 'Admin', email: 'admin@test.com' }]]);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });

    it('should return JWT token for valid credentials', async () => {
        const hash = await bcrypt.hash('password123', 10);
        db.query.mockResolvedValueOnce([[{ user_id: 1, username: 'admin', password_hash: hash, role: 'Admin', email: 'admin@test.com' }]]);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe('admin');
    });

    it('should return 422 for missing credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({});
        expect(res.status).toBe(422);
    });
});

describe('POST /api/auth/register', () => {
    it('should create a new user', async () => {
        db.query
            .mockResolvedValueOnce([[]])   // no existing user
            .mockResolvedValueOnce([{ insertId: 10 }]);
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'newuser', email: 'new@test.com', password: 'password123' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('user_id', 10);
    });

    it('should return 409 if username or email already exists', async () => {
        db.query.mockResolvedValueOnce([[{ user_id: 1 }]]); // existing user
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'admin', email: 'admin@test.com', password: 'password123' });
        expect(res.status).toBe(409);
    });

    it('should return 422 for short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'user', email: 'user@test.com', password: '123' });
        expect(res.status).toBe(422);
    });
});

describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('should return user info with valid token', async () => {
        const hash = await bcrypt.hash('password123', 10);
        // Login first to get token
        db.query.mockResolvedValueOnce([[{ user_id: 1, username: 'admin', password_hash: hash, role: 'Admin', email: 'admin@test.com' }]]);
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'password123' });
        const { token } = loginRes.body;

        // Use token to get /me
        db.query.mockResolvedValueOnce([[{ user_id: 1, username: 'admin', email: 'admin@test.com', role: 'Admin', created_at: new Date() }]]);
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.username).toBe('admin');
    });
});

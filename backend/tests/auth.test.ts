// ── Auth endpoint tests ──
// Tests the three auth endpoints: register, login, and profile (/me)
// Uses supertest to make HTTP requests against the Express app without a server
// Tests cover happy paths, validation errors, and auth failures

import request from 'supertest';
import app from '../src/index';

// ── POST /api/auth/register ──
// Verifies successful user creation, duplicate detection, and field validation
describe('POST /api/auth/register', () => {
  it('registers a new user and returns token', async () => {
    // Should return 201 with a JWT token and the user object
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', mobile: '9876543210', password: 'Pass123!', name: 'Test User' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('rejects duplicate email', async () => {
    // Register once, then try again with the same email — should get 409
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', mobile: '1111111111', password: 'Pass123!', name: 'Dup' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', mobile: '2222222222', password: 'Pass123!', name: 'Dup' });
    expect(res.status).toBe(409);
  });

  it('rejects missing fields', async () => {
    // Omitting mobile, password, and name — should return 400
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad@example.com' });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/login ──
// Verifies successful login and wrong-password rejection
describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    // Register a user first, then log in — should return 200 + token
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', mobile: '3333333333', password: 'Pass123!', name: 'Login' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Pass123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects invalid password', async () => {
    // Wrong password for an existing user — should return 401
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

// ── GET /api/auth/me ──
// Verifies profile retrieval with a valid token and rejection without one
describe('GET /api/auth/me', () => {
  it('returns user info with valid token', async () => {
    // Register, then use the returned token to fetch /me — should match
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'me@example.com', mobile: '4444444444', password: 'Pass123!', name: 'Me' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@example.com');
  });

  it('rejects missing token', async () => {
    // No auth header at all — should return 401
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

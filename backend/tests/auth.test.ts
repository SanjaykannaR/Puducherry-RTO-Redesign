// ── Auth endpoint tests ──
// Tests the three auth endpoints: register, login, and profile (/me)
// Uses supertest to make HTTP requests against the Express app without a server
// Tests cover happy paths, validation errors, and auth failures

import request from 'supertest';
import app from '../src/index';

// ── Unique email/mobile helper to avoid DB collisions across runs ──
function uniq(suffix: string) {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 9999);
  return {
    email: `${suffix}_${ts}_${rand}@test.com`,
    mobile: `7${String(ts).slice(-5)}${String(rand).padStart(4, '0')}`,
  };
}

// ── POST /api/auth/register ──
// Verifies successful user creation, duplicate detection, and field validation
describe('POST /api/auth/register', () => {
  it('registers a new user and returns token', async () => {
    const u = uniq('reg');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: u.email, mobile: u.mobile, password: 'Pass123!', name: 'Test User' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(u.email);
  });

  it('rejects duplicate email', async () => {
    const u = uniq('dup');
    await request(app)
      .post('/api/auth/register')
      .send({ email: u.email, mobile: u.mobile, password: 'Pass123!', name: 'Dup' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: u.email, mobile: `9${String(Date.now()).slice(-9)}`, password: 'Pass123!', name: 'Dup' });
    expect(res.status).toBe(409);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad_fields_only@example.com' });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/login ──
// Verifies successful login and wrong-password rejection
describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    const u = uniq('login');
    await request(app)
      .post('/api/auth/register')
      .send({ email: u.email, mobile: u.mobile, password: 'Pass123!', name: 'Login' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: u.email, password: 'Pass123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects invalid password', async () => {
    const u = uniq('wrongpw');
    await request(app)
      .post('/api/auth/register')
      .send({ email: u.email, mobile: u.mobile, password: 'Pass123!', name: 'WrongPw' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: u.email, password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

// ── GET /api/auth/me ──
// Verifies profile retrieval with a valid token and rejection without one
describe('GET /api/auth/me', () => {
  it('returns user info with valid token', async () => {
    const u = uniq('me');
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: u.email, mobile: u.mobile, password: 'Pass123!', name: 'Me' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(u.email);
  });

  it('rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

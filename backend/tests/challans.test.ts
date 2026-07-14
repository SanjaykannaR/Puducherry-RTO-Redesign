// ── Challan endpoint tests ──
// Tests listing challans and paying them.
// Covers auth, empty state, and payment flow.

import request from 'supertest';
import app from '../src/index';

let citizenToken: string;

beforeAll(async () => {
  const email = `chtest_${Date.now()}@test.com`;
  const mobile = `${8300000000 + Math.floor(Math.random() * 999999)}`;
  await request(app)
    .post('/api/auth/register')
    .send({ email, mobile, password: 'Pass123!', name: 'Challan Tester' });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Pass123!' });
  citizenToken = login.body.token;
});

// ── GET /api/challans ──
describe('GET /api/challans', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/challans');
    expect(res.status).toBe(401);
  });

  it('returns challans list for authenticated user', async () => {
    const res = await request(app)
      .get('/api/challans')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('challans');
    expect(Array.isArray(res.body.challans)).toBe(true);
  });
});

// ── POST /api/challans/:id/pay ──
describe('POST /api/challans/:id/pay', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/challans/fake-id/pay');
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent challan', async () => {
    const res = await request(app)
      .post('/api/challans/non-existent/pay')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(404);
  });
});

// ── Payment endpoint tests ──
// Tests the GRAS payment flow: create challan, verify, and history.
// Uses supertest against the Express app.

import request from 'supertest';
import app from '../src/index';

// ── Helper: register + login a user, return token ──
async function getAuthToken(): Promise<string> {
  const email = `paytest_${Date.now()}@test.com`;
  const mobile = `${9000000000 + Math.floor(Math.random() * 999999)}`;
  await request(app)
    .post('/api/auth/register')
    .send({ email, mobile, password: 'Test@123', name: 'Pay Test' });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Test@123' });
  return login.body.token;
}

// ── POST /api/payments/create-challan ──
describe('POST /api/payments/create-challan', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/payments/create-challan')
      .send({ amount: 500, purpose: 'Test' });
    expect(res.status).toBe(401);
  });

  it('creates a challan with valid data', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/payments/create-challan')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 500, purpose: 'Driving License Fee' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('challanId');
    expect(res.body).toHaveProperty('grn');
    expect(res.body.amount).toBe(500);
    expect(res.body.purpose).toBe('Driving License Fee');
    expect(res.body.department).toContain('Puducherry');
  });

  it('rejects zero amount', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/payments/create-challan')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 0, purpose: 'Test' });
    expect(res.status).toBe(400);
  });

  it('rejects negative amount', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/payments/create-challan')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: -100, purpose: 'Test' });
    expect(res.status).toBe(400);
  });

  it('rejects missing purpose', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/payments/create-challan')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 500 });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/payments/verify-challan ──
describe('POST /api/payments/verify-challan', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/payments/verify-challan')
      .send({ challanId: 'PY-2026-00001', grn: '26PY20260101000001', paymentMethod: 'upi' });
    expect(res.status).toBe(401);
  });

  it('rejects missing fields', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/payments/verify-challan')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('verifies a valid challan payment', async () => {
    const token = await getAuthToken();

    // First create a challan
    const createRes = await request(app)
      .post('/api/payments/create-challan')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 250, purpose: 'Learner License Fee' });
    expect(createRes.status).toBe(201);

    // Then verify it
    const verifyRes = await request(app)
      .post('/api/payments/verify-challan')
      .set('Authorization', `Bearer ${token}`)
      .send({
        challanId: createRes.body.challanId,
        grn: createRes.body.grn,
        paymentMethod: 'upi',
      });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.status).toBe('COMPLETED');
    expect(verifyRes.body).toHaveProperty('brn');
    expect(verifyRes.body.paymentMethod).toBe('upi');
  });
});

// ── GET /api/payments/history ──
describe('GET /api/payments/history', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/payments/history');
    expect(res.status).toBe(401);
  });

  it('returns payment list for authenticated user', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .get('/api/payments/history')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('payments');
    expect(Array.isArray(res.body.payments)).toBe(true);
  });
});

// ── License endpoint tests ──
// Tests CRUD operations: list, get by id, create.
// Covers auth, validation, and data integrity.

import request from 'supertest';
import app from '../src/index';

let citizenToken: string;
let licenseId: string;
const testLicenseNo = `PY-${Date.now().toString().slice(-6)}-DL`;

beforeAll(async () => {
  const email = `ltest_${Date.now()}@test.com`;
  const mobile = `${8200000000 + Math.floor(Math.random() * 999999)}`;
  await request(app)
    .post('/api/auth/register')
    .send({ email, mobile, password: 'Pass123!', name: 'License Tester' });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Pass123!' });
  citizenToken = login.body.token;
});

// ── POST /api/licenses ──
describe('POST /api/licenses', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/licenses')
      .send({ licenseNo: 'PY-000000', name: 'Test', dob: '2000-01-01', address: 'Test', issueDate: '2024-01-01', expiryDate: '2029-01-01' });
    expect(res.status).toBe(401);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/licenses')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ licenseNo: 'PY-000000' });
    expect(res.status).toBe(400);
  });

  it('creates a license with valid data', async () => {
    const res = await request(app)
      .post('/api/licenses')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        licenseNo: testLicenseNo,
        type: 'LMV',
        name: 'License Tester',
        dob: '1995-06-15',
        address: 'Puducherry, India',
        issueDate: '2024-01-01',
        expiryDate: '2029-01-01',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.licenseNo).toBe(testLicenseNo);
    expect(res.body.type).toBe('LMV');
    licenseId = res.body.id;
  });
});

// ── GET /api/licenses ──
describe('GET /api/licenses', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/licenses');
    expect(res.status).toBe(401);
  });

  it('returns user licenses', async () => {
    const res = await request(app)
      .get('/api/licenses')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('licenses');
    expect(Array.isArray(res.body.licenses)).toBe(true);
    expect(res.body.licenses.length).toBeGreaterThanOrEqual(1);
  });
});

// ── GET /api/licenses/:id ──
describe('GET /api/licenses/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get(`/api/licenses/${licenseId}`);
    expect(res.status).toBe(401);
  });

  it('returns license by id', async () => {
    const res = await request(app)
      .get(`/api/licenses/${licenseId}`)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(licenseId);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app)
      .get('/api/licenses/non-existent')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(404);
  });
});

// ── Vehicle endpoint tests ──
// Tests CRUD operations: list, search by regNo, get by id, create.
// Covers auth, validation, and data integrity.

import request from 'supertest';
import app from '../src/index';

let citizenToken: string;
let vehicleId: string;
const testRegNo = `PY-${Date.now().toString().slice(-4)}-AB-${Math.floor(1000 + Math.random() * 9000)}`;

beforeAll(async () => {
  const email = `vhtest_${Date.now()}@test.com`;
  const mobile = `${8100000000 + Math.floor(Math.random() * 999999)}`;
  await request(app)
    .post('/api/auth/register')
    .send({ email, mobile, password: 'Pass123!', name: 'Vehicle Tester' });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Pass123!' });
  citizenToken = login.body.token;
});

// ── POST /api/vehicles ──
describe('POST /api/vehicles', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send({ registrationNo: 'PY-00-XX-0000', chassisNo: 'CH1', engineNo: 'EN1', make: 'Honda', model: 'Activa', manufactureYear: 2024, fuelType: 'Petrol', color: 'Red' });
    expect(res.status).toBe(401);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ registrationNo: 'PY-00-XX-0000' });
    expect(res.status).toBe(400);
  });

  it('creates a vehicle with valid data', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        registrationNo: testRegNo,
        chassisNo: 'CHASSIS123456789',
        engineNo: 'ENGINE123456',
        make: 'Honda',
        model: 'Activa 6G',
        manufactureYear: 2024,
        fuelType: 'Petrol',
        color: 'Red',
        ownerName: 'Vehicle Tester',
        ownerAddress: 'Puducherry',
        insuranceUpto: '2027-01-01',
        taxPaidUpto: '2027-01-01',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.registrationNo).toBe(testRegNo);
    expect(res.body.make).toBe('Honda');
    vehicleId = res.body.id;
  });
});

// ── GET /api/vehicles ──
describe('GET /api/vehicles', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('returns user vehicles', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('vehicles');
    expect(Array.isArray(res.body.vehicles)).toBe(true);
    expect(res.body.vehicles.length).toBeGreaterThanOrEqual(1);
  });
});

// ── GET /api/vehicles/search/:regNo ──
describe('GET /api/vehicles/search/:regNo', () => {
  it('returns 404 for non-existent vehicle', async () => {
    const res = await request(app).get('/api/vehicles/search/NONEXISTENT');
    expect(res.status).toBe(404);
  });

  it('finds vehicle by registration number', async () => {
    const res = await request(app).get(`/api/vehicles/search/${encodeURIComponent(testRegNo)}`);
    expect(res.status).toBe(200);
    expect(res.body.registrationNo).toBe(testRegNo);
    expect(res.body.make).toBe('Honda');
  });
});

// ── GET /api/vehicles/:id ──
describe('GET /api/vehicles/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get(`/api/vehicles/${vehicleId}`);
    expect(res.status).toBe(401);
  });

  it('returns vehicle by id', async () => {
    const res = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(vehicleId);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app)
      .get('/api/vehicles/non-existent')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(404);
  });
});

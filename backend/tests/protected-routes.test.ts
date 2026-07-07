import request from 'supertest';
import app from '../src/index';

let token: string;
let appointmentId: string;
let applicationId: string;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'protected@example.com', mobile: '6666666666', password: 'Pass123!', name: 'Protected User' });
  token = res.body.token;
});

describe('POST /api/calculator', () => {
  it('calculates fee without auth', async () => {
    const res = await request(app)
      .post('/api/calculator')
      .send({ services: ['DL'], state: 'PY' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
  });
});

describe('GET /api/appointments', () => {
  it('rejects without auth', async () => {
    const res = await request(app).get('/api/appointments');
    expect(res.status).toBe(401);
  });

  it('returns appointments with auth', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('appointments');
  });
});

describe('POST /api/appointments', () => {
  it('creates appointment with auth', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-07-15', timeSlot: '10:00', purpose: 'DL Test' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    appointmentId = res.body.id;
  });
});

describe('GET /api/applications', () => {
  it('rejects without auth', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.status).toBe(401);
  });

  it('returns applications with auth', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('applications');
  });
});

describe('POST /api/applications', () => {
  it('creates application with auth', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'DL', details: {} });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    applicationId = res.body.id;
  });
});

describe('GET /api/challans', () => {
  it('rejects without auth', async () => {
    const res = await request(app).get('/api/challans');
    expect(res.status).toBe(401);
  });

  it('returns challans with auth', async () => {
    const res = await request(app)
      .get('/api/challans')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('challans');
  });
});

describe('GET /api/notifications', () => {
  it('rejects without auth', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('returns notifications with auth', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('notifications');
  });
});

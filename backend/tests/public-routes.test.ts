import request from 'supertest';
import app from '../src/index';

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/info', () => {
  it('GET /api/info/about returns about data', async () => {
    const res = await request(app).get('/api/info/about');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('description');
  });

  it('GET /api/info/faq returns faq', async () => {
    const res = await request(app).get('/api/info/faq');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('faqs');
  });
});

describe('GET /api/directory', () => {
  it('returns directory data', async () => {
    const res = await request(app).get('/api/directory');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('offices');
  });
});

describe('GET /api/fares', () => {
  it('returns fare structure', async () => {
    const res = await request(app).get('/api/fares');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('vehicle_registration');
    expect(res.body).toHaveProperty('driving_license');
  });
});

describe('GET /api/services', () => {
  it('returns services data', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('services');
  });
});

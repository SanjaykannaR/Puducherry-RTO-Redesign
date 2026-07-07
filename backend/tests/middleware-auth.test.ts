import request from 'supertest';
import app from '../src/index';

describe('authenticate middleware', () => {
  it('rejects requests without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('rejects invalid token format', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Invalid token');
    expect(res.status).toBe(401);
  });

  it('rejects expired/malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer fake.jwt.token');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });
});

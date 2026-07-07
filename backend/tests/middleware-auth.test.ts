// ── Auth middleware unit tests ──
// Tests the `authenticate` middleware in isolation by hitting a protected route (/me)
// Verifies all three rejection paths: missing header, bad format, malformed token

import request from 'supertest';
import app from '../src/index';

describe('authenticate middleware', () => {
  it('rejects requests without Authorization header', async () => {
    // No Authorization header at all → 401 "Authentication required"
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('rejects invalid token format', async () => {
    // Authorization header present but doesn't start with "Bearer " → 401
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Invalid token');
    expect(res.status).toBe(401);
  });

  it('rejects expired/malformed token', async () => {
    // Bearer prefix present but the token itself is garbage → 401 after JWT verify fails
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer fake.jwt.token');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });
});

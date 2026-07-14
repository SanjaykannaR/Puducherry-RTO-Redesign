// ── Admin misc endpoint tests ──
// Tests admin stats, users, user role management, settings, and service/fares endpoints.
// Follows the same pattern as admin-applications.test.ts.

// Jest globals (describe, it, expect, beforeAll) are available globally — no import needed
import request from 'supertest';
import app from '../src/index';

let citizenToken: string;
let adminToken: string;
let adminUserId: string;

// ── Setup: register citizen + admin ──
beforeAll(async () => {
  const citizenEmail = `citizen_misc_${Date.now()}@test.com`;
  const citizenRes = await request(app)
    .post('/api/auth/register')
    .send({ email: citizenEmail, mobile: `810000${Math.floor(Math.random() * 9999)}`, password: 'Pass123!', name: 'Misc Citizen' });
  citizenToken = citizenRes.body.token;

  const adminEmail = `admin_misc_${Date.now()}@test.com`;
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ email: adminEmail, mobile: `820000${Math.floor(Math.random() * 9999)}`, password: 'Admin123!', name: 'Misc Admin' });
  adminToken = adminRes.body.token;
  adminUserId = adminRes.body.user?.id;

  // Promote to ADMIN via direct DB update
  const prisma = (await import('../src/services/prisma')).default;
  await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } });

  // Re-login to get ADMIN token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: 'Admin123!' });
  adminToken = loginRes.body.token;
});

// ═══════════════════════════════════════════
// GET /api/admin/stats
// ═══════════════════════════════════════════
describe('GET /api/admin/stats', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('returns 403 for CITIZEN', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 200 with stats for ADMIN', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.totalUsers).toBe('number');
    expect(typeof res.body.totalAppointments).toBe('number');
    expect(typeof res.body.totalApplications).toBe('number');
    expect(typeof res.body.totalChallans).toBe('number');
  });

  it('reports at least 2 users (citizen + admin)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body.totalUsers).toBeGreaterThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════
// GET /api/admin/users
// ═══════════════════════════════════════════
describe('GET /api/admin/users', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('returns 403 for CITIZEN', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(403);
  });

  it('returns users array for ADMIN', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
  });

  it('users have expected fields', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    const user = res.body.users[0];
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('role');
    expect(user).not.toHaveProperty('passwordHash');
  });
});

// ═══════════════════════════════════════════
// PATCH /api/admin/users/:id/role
// ═══════════════════════════════════════════
describe('PATCH /api/admin/users/:id/role', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${adminUserId}/role`)
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(401);
  });

  it('returns 403 for CITIZEN', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${adminUserId}/role`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid role', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${adminUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'SUPERADMIN' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request(app)
      .patch('/api/admin/users/non-existent-id/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'CITIZEN' });
    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════
// PUT /api/admin/fares
// ═══════════════════════════════════════════
describe('PUT /api/admin/fares', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/admin/fares').send({});
    expect(res.status).toBe(401);
  });

  it('returns 200 for ADMIN', async () => {
    const res = await request(app)
      .put('/api/admin/fares')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fares: [] });
    expect(res.status).toBe(200);
  });
});

// ═══════════════════════════════════════════
// PUT /api/admin/services
// ═══════════════════════════════════════════
describe('PUT /api/admin/services', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/admin/services').send({});
    expect(res.status).toBe(401);
  });

  it('returns 200 for ADMIN', async () => {
    const res = await request(app)
      .put('/api/admin/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ services: [] });
    expect(res.status).toBe(200);
  });
});

// ═══════════════════════════════════════════
// PUT /api/admin/directory
// ═══════════════════════════════════════════
describe('PUT /api/admin/directory', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/admin/directory').send({});
    expect(res.status).toBe(401);
  });

  it('returns 200 for ADMIN', async () => {
    const res = await request(app)
      .put('/api/admin/directory')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ directory: [] });
    expect(res.status).toBe(200);
  });
});

// ═══════════════════════════════════════════
// PATCH /api/admin/settings/password
// ═══════════════════════════════════════════
describe('PATCH /api/admin/settings/password', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .patch('/api/admin/settings/password')
      .send({ currentPassword: 'Admin123!', newPassword: 'NewPass456!' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app)
      .patch('/api/admin/settings/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .patch('/api/admin/settings/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ currentPassword: 'Admin123!', newPassword: '12' });
    expect(res.status).toBe(400);
  });

  it('returns 401 for wrong current password', async () => {
    const res = await request(app)
      .patch('/api/admin/settings/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ currentPassword: 'WrongPass!', newPassword: 'NewPass456!' });
    expect(res.status).toBe(401);
  });

  it('returns 200 for valid password change', async () => {
    const res = await request(app)
      .patch('/api/admin/settings/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ currentPassword: 'Admin123!', newPassword: 'Admin456!' });
    expect(res.status).toBe(200);

    // Re-login with new password
    const adminEmail = `admin_misc_${Date.now() - 1}@test.com`;
    // Just verify the response was OK
    expect(res.body.message).toContain('Password');
  });
});

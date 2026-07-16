"use strict";
// ── Protected route access tests ──
// Verifies that routes requiring authentication work correctly:
//   - Public routes (calculator) are accessible without auth
//   - Protected routes reject unauthenticated requests with 401
//   - Protected routes return data when a valid token is provided
// Also verifies creation of appointments and applications
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
let token;
let appointmentId;
let applicationId;
// Register a test user once before all tests and store the token
// Use unique email/mobile to avoid 409 collisions across re-runs
beforeAll(async () => {
    const ts = Date.now();
    const rand = Math.floor(Math.random() * 9999);
    const email = `protected_${ts}_${rand}@test.com`;
    const mobile = `6${String(ts).slice(-5)}${String(rand).padStart(4, '0')}`;
    const res = await (0, supertest_1.default)(index_1.default)
        .post('/api/auth/register')
        .send({ email, mobile, password: 'Pass123!', name: 'Protected User' });
    token = res.body.token;
});
// ── POST /api/calculator (public) ──
// No auth required — should always return 200 with calculation result
describe('POST /api/calculator', () => {
    it('calculates fee without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/calculator')
            .send({ services: ['DL'], state: 'PY' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('total');
    });
});
// ── GET /api/appointments (protected) ──
// Should 401 without token, 200 with valid token
describe('GET /api/appointments', () => {
    it('rejects without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/appointments');
        expect(res.status).toBe(401);
    });
    it('returns appointments with auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/appointments')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('appointments');
    });
});
// ── POST /api/appointments (protected) ──
// Creates an appointment; stores the returned ID for potential cancellation tests
describe('POST /api/appointments', () => {
    it('creates appointment with auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${token}`)
            .send({ date: '2026-07-15', timeSlot: '10:00', purpose: 'DL Test' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        appointmentId = res.body.id;
    });
});
// ── GET /api/applications (protected) ──
// Should 401 without token, 200 with valid token
describe('GET /api/applications', () => {
    it('rejects without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/applications');
        expect(res.status).toBe(401);
    });
    it('returns applications with auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/applications')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('applications');
    });
});
// ── POST /api/applications (protected) ──
// Creates an application; stores the returned ID
describe('POST /api/applications', () => {
    it('creates application with auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/applications')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'DL', details: {} });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        applicationId = res.body.id;
    });
});
// ── GET /api/challans (protected) ──
// Should 401 without token, 200 returning challans with valid token
describe('GET /api/challans', () => {
    it('rejects without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/challans');
        expect(res.status).toBe(401);
    });
    it('returns challans with auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/challans')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('challans');
    });
});
// ── GET /api/notifications (protected) ──
// Should 401 without token, 200 returning notifications with valid token
describe('GET /api/notifications', () => {
    it('rejects without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/notifications');
        expect(res.status).toBe(401);
    });
    it('returns notifications with auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('notifications');
    });
});
//# sourceMappingURL=protected-routes.test.js.map
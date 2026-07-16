"use strict";
// ── Notification endpoint tests ──
// Tests listing notifications and marking as read.
// Covers auth, empty state, and read flow.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
let citizenToken;
beforeAll(async () => {
    const email = `ntest_${Date.now()}@test.com`;
    const mobile = `${8400000000 + Math.floor(Math.random() * 999999)}`;
    await (0, supertest_1.default)(index_1.default)
        .post('/api/auth/register')
        .send({ email, mobile, password: 'Pass123!', name: 'Notif Tester' });
    const login = await (0, supertest_1.default)(index_1.default)
        .post('/api/auth/login')
        .send({ email, password: 'Pass123!' });
    citizenToken = login.body.token;
});
// ── GET /api/notifications ──
describe('GET /api/notifications', () => {
    it('returns 401 without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/notifications');
        expect(res.status).toBe(401);
    });
    it('returns notifications list for authenticated user', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${citizenToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('notifications');
        expect(Array.isArray(res.body.notifications)).toBe(true);
    });
});
// ── PATCH /api/notifications/:id/read ──
describe('PATCH /api/notifications/:id/read', () => {
    it('returns 401 without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .patch('/api/notifications/fake-id/read');
        expect(res.status).toBe(401);
    });
    it('returns 404 for non-existent notification', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .patch('/api/notifications/non-existent/read')
            .set('Authorization', `Bearer ${citizenToken}`);
        expect(res.status).toBe(404);
    });
});
//# sourceMappingURL=notifications.test.js.map
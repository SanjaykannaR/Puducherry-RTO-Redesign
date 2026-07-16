"use strict";
// ── Challan endpoint tests ──
// Tests listing challans and paying them.
// Covers auth, empty state, and payment flow.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
let citizenToken;
beforeAll(async () => {
    const email = `chtest_${Date.now()}@test.com`;
    const mobile = `${8300000000 + Math.floor(Math.random() * 999999)}`;
    await (0, supertest_1.default)(index_1.default)
        .post('/api/auth/register')
        .send({ email, mobile, password: 'Pass123!', name: 'Challan Tester' });
    const login = await (0, supertest_1.default)(index_1.default)
        .post('/api/auth/login')
        .send({ email, password: 'Pass123!' });
    citizenToken = login.body.token;
});
// ── GET /api/challans ──
describe('GET /api/challans', () => {
    it('returns 401 without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/challans');
        expect(res.status).toBe(401);
    });
    it('returns challans list for authenticated user', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/challans')
            .set('Authorization', `Bearer ${citizenToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('challans');
        expect(Array.isArray(res.body.challans)).toBe(true);
    });
});
// ── POST /api/challans/:id/pay ──
describe('POST /api/challans/:id/pay', () => {
    it('returns 401 without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/challans/fake-id/pay');
        expect(res.status).toBe(401);
    });
    it('returns 404 for non-existent challan', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/challans/non-existent/pay')
            .set('Authorization', `Bearer ${citizenToken}`);
        expect(res.status).toBe(404);
    });
});
//# sourceMappingURL=challans.test.js.map
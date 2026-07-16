"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
let token;
beforeAll(async () => {
    const ts = Date.now();
    const rand = Math.floor(Math.random() * 9999);
    const res = await (0, supertest_1.default)(index_1.default)
        .post('/api/auth/register')
        .send({ email: `exam_${ts}_${rand}@test.com`, mobile: `5${String(ts).slice(-5)}${String(rand).padStart(4, '0')}`, password: 'Pass123!', name: 'Exam Taker' });
    token = res.body.token;
});
describe('POST /api/exam/start', () => {
    it('starts exam and returns questions', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/exam/start')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.questions).toHaveLength(5);
        expect(res.body.questions[0]).not.toHaveProperty('answer');
    });
    it('rejects without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default).post('/api/exam/start');
        expect(res.status).toBe(401);
    });
});
describe('POST /api/exam/submit', () => {
    it('scores and returns pass/fail', async () => {
        await (0, supertest_1.default)(index_1.default)
            .post('/api/exam/start')
            .set('Authorization', `Bearer ${token}`);
        const answers = { 1: 1, 2: 2, 3: 1, 4: 0, 5: 1 };
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/exam/submit')
            .set('Authorization', `Bearer ${token}`)
            .send({ answers });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('score');
        expect(res.body).toHaveProperty('total', 5);
        expect(res.body).toHaveProperty('passed');
    });
});
//# sourceMappingURL=exam.test.js.map
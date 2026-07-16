"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
describe('GET /api/health', () => {
    it('returns ok', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});
describe('GET /api/info', () => {
    it('GET /api/info/about returns about data', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/info/about');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('description');
    });
    it('GET /api/info/faq returns faq', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/info/faq');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('faqs');
    });
});
describe('GET /api/directory', () => {
    it('returns directory data', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/directory');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('offices');
    });
});
describe('GET /api/fares', () => {
    it('returns fare structure', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/fares');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('vehicle_registration');
        expect(res.body).toHaveProperty('driving_license');
    });
});
describe('GET /api/services', () => {
    it('returns services data', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/services');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('services');
    });
});
//# sourceMappingURL=public-routes.test.js.map
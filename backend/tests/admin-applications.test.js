"use strict";
// ── Admin applications endpoint tests ──
// Tests the admin application management workflow:
//   - GET /api/admin/applications (list all)
//   - PATCH /api/admin/applications/:id/status (approve/reject/under_review)
// Covers auth, validation, status transitions, and notification creation.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
let citizenToken;
let adminToken;
let applicationId;
// ── Setup: register a citizen (creates an application) and an admin user ──
beforeAll(async () => {
    // Citizen: register + create an application
    const citizenEmail = `citizen_${Date.now()}@test.com`;
    const citizenMobile = `${8000000000 + Math.floor(Math.random() * 999999)}`;
    const citizenRes = await (0, supertest_1.default)(index_1.default)
        .post('/api/auth/register')
        .send({ email: citizenEmail, mobile: citizenMobile, password: 'Pass123!', name: 'Test Citizen' });
    citizenToken = citizenRes.body.token;
    const appRes = await (0, supertest_1.default)(index_1.default)
        .post('/api/applications')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ type: 'VEHICLE_REGISTRATION', formData: { make: 'Honda', model: 'Activa' } });
    applicationId = appRes.body.id;
    // Admin: register + promote to ADMIN
    const adminEmail = `admin_${Date.now()}@test.com`;
    const adminMobile = `${7000000000 + Math.floor(Math.random() * 999999)}`;
    const adminRes = await (0, supertest_1.default)(index_1.default)
        .post('/api/auth/register')
        .send({ email: adminEmail, mobile: adminMobile, password: 'Admin123!', name: 'Test Admin' });
    adminToken = adminRes.body.token;
    // Promote to admin via direct DB update (since we can't call admin routes without being admin)
    const prisma = (await Promise.resolve().then(() => __importStar(require('../src/services/prisma')))).default;
    await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
    });
    // Re-login to get a token with updated role
    const loginRes = await (0, supertest_1.default)(index_1.default)
        .post('/api/auth/login')
        .send({ email: adminEmail, password: 'Admin123!' });
    adminToken = loginRes.body.token;
});
// ── GET /api/admin/applications ──
describe('GET /api/admin/applications', () => {
    it('returns 401 without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/admin/applications');
        expect(res.status).toBe(401);
    });
    it('returns 403 for non-admin user', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/applications')
            .set('Authorization', `Bearer ${citizenToken}`);
        expect(res.status).toBe(403);
    });
    it('returns all applications for admin', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/applications')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('applications');
        expect(Array.isArray(res.body.applications)).toBe(true);
        expect(res.body.applications.length).toBeGreaterThanOrEqual(1);
        // Should include applicant info
        const firstApp = res.body.applications[0];
        expect(firstApp).toHaveProperty('applicant');
        expect(firstApp.applicant).toHaveProperty('name');
        expect(firstApp.applicant).toHaveProperty('email');
    });
});
// ── PATCH /api/admin/applications/:id/status ──
describe('PATCH /api/admin/applications/:id/status', () => {
    it('returns 401 without auth', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .patch(`/api/admin/applications/${applicationId}/status`)
            .send({ status: 'UNDER_REVIEW' });
        expect(res.status).toBe(401);
    });
    it('returns 403 for non-admin user', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .patch(`/api/admin/applications/${applicationId}/status`)
            .set('Authorization', `Bearer ${citizenToken}`)
            .send({ status: 'UNDER_REVIEW' });
        expect(res.status).toBe(403);
    });
    it('rejects invalid status', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .patch(`/api/admin/applications/${applicationId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'INVALID_STATUS' });
        expect(res.status).toBe(400);
    });
    it('rejects missing status', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .patch(`/api/admin/applications/${applicationId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({});
        expect(res.status).toBe(400);
    });
    it('returns 404 for non-existent application', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .patch('/api/admin/applications/non-existent-id/status')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'APPROVED' });
        expect(res.status).toBe(404);
    });
    it('transitions to UNDER_REVIEW', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .patch(`/api/admin/applications/${applicationId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'UNDER_REVIEW' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('UNDER_REVIEW');
    });
    it('transitions from UNDER_REVIEW to APPROVED', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .patch(`/api/admin/applications/${applicationId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'APPROVED' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('APPROVED');
    });
    it('creates a notification for the citizen on status change', async () => {
        // Create a fresh application for this test
        const freshApp = await (0, supertest_1.default)(index_1.default)
            .post('/api/applications')
            .set('Authorization', `Bearer ${citizenToken}`)
            .send({ type: 'DRIVING_LICENSE', formData: { fullName: 'Test' } });
        const freshId = freshApp.body.id;
        // Approve it
        await (0, supertest_1.default)(index_1.default)
            .patch(`/api/admin/applications/${freshId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'APPROVED' });
        // Check citizen's notifications
        const notifRes = await (0, supertest_1.default)(index_1.default)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${citizenToken}`);
        expect(notifRes.status).toBe(200);
        const notifs = notifRes.body.notifications;
        const approvalNotif = notifs.find((n) => n.title === 'Application Approved');
        expect(approvalNotif).toBeDefined();
        expect(approvalNotif.message).toContain('DRIVING_LICENSE');
    });
    it('transitions to REJECTED', async () => {
        // Create a fresh application for rejection test
        const freshApp = await (0, supertest_1.default)(index_1.default)
            .post('/api/applications')
            .set('Authorization', `Bearer ${citizenToken}`)
            .send({ type: 'LICENSE_RENEWAL', formData: { licenseNo: 'PY-123' } });
        const freshId = freshApp.body.id;
        const res = await (0, supertest_1.default)(index_1.default)
            .patch(`/api/admin/applications/${freshId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'REJECTED' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('REJECTED');
    });
});
//# sourceMappingURL=admin-applications.test.js.map
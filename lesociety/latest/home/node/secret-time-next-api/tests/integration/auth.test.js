/**
 * Authentication API Integration Tests
 */

const request = require('supertest');
const app = require('../../app');
const testDb = require('../helpers/testDatabase');
const { createTestUser, assertSuccessResponse, assertErrorResponse } = require('../helpers/testHelpers');

describe('Authentication API', () => {
    beforeAll(async () => {
        await testDb.connect();
    });

    afterAll(async () => {
        await testDb.disconnect();
    });

    beforeEach(async () => {
        await testDb.clearDatabase();
    });

    // ==========================================
    // POST /api/v1/user/login
    // ==========================================
    describe('POST /api/v1/user/login', () => {
        it('should login with valid credentials', async () => {
            const password = 'Test123456';
            const user = await createTestUser({ 
                email: 'test@example.com',
                password,
                status: 1,
                email_verified: true
            });

            const response = await request(app)
                .post('/api/v1/user/login')
                .send({
                    email: 'test@example.com',
                    password
                });

            assertSuccessResponse(response, 200);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data).toHaveProperty('email', user.email);
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should reject login with wrong password', async () => {
            await createTestUser({ 
                email: 'test@example.com',
                password: 'CorrectPassword',
                status: 1
            });

            const response = await request(app)
                .post('/api/v1/user/login')
                .send({
                    email: 'test@example.com',
                    password: 'WrongPassword'
                });

            assertErrorResponse(response, 401, 'Invalid credentials');
        });

        it('should reject login for non-existent user', async () => {
            const response = await request(app)
                .post('/api/v1/user/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'SomePassword'
                });

            assertErrorResponse(response, 404, 'User not found');
        });

        it('should reject login for inactive user', async () => {
            const password = 'Test123456';
            await createTestUser({ 
                email: 'inactive@example.com',
                password,
                status: 0 // Inactive
            });

            const response = await request(app)
                .post('/api/v1/user/login')
                .send({
                    email: 'inactive@example.com',
                    password
                });

            assertErrorResponse(response, 403, 'inactive');
        });

        it('should require email and password', async () => {
            const response = await request(app)
                .post('/api/v1/user/login')
                .send({});

            assertErrorResponse(response, 422);
        });
    });

    // ==========================================
    // POST /api/v1/auth/refresh
    // ==========================================
    describe('POST /api/v1/auth/refresh', () => {
        it('should refresh access token with valid refresh token', async () => {
            const password = 'Test123456';
            const user = await createTestUser({ password, status: 1 });

            // Login to get refresh token
            const loginResponse = await request(app)
                .post('/api/v1/user/login')
                .send({
                    email: user.email,
                    password
                });

            const { refreshToken } = loginResponse.body.data;

            // Use refresh token to get new access token
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken });

            assertSuccessResponse(response, 200);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('expiresIn');
        });

        it('should reject invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken: 'invalid.token.here' });

            assertErrorResponse(response, 401);
        });

        it('should require refresh token', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({});

            assertErrorResponse(response, 400, 'Refresh token required');
        });
    });

    // ==========================================
    // POST /api/v1/auth/logout
    // ==========================================
    describe('POST /api/v1/auth/logout', () => {
        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/logout');

            assertSuccessResponse(response, 200);
            expect(response.body.message).toContain('Logged out');
        });
    });
});

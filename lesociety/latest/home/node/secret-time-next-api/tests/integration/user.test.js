/**
 * User API Integration Tests
 */

const request = require('supertest');
const app = require('../../app');
const testDb = require('../helpers/testDatabase');
const { 
    createTestUser, 
    createAuthenticatedUser,
    assertSuccessResponse, 
    assertErrorResponse 
} = require('../helpers/testHelpers');

describe('User API', () => {
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
    // GET /api/v1/user/profile/:userId
    // ==========================================
    describe('GET /api/v1/user/profile/:userId', () => {
        it('should get user profile with valid auth', async () => {
            const { user, token } = await createAuthenticatedUser();

            const response = await request(app)
                .get(`/api/v1/user/profile/${user._id}`)
                .set('Authorization', `Bearer ${token}`);

            assertSuccessResponse(response, 200);
            expect(response.body.data).toHaveProperty('email', user.email);
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should reject request without auth token', async () => {
            const user = await createTestUser();

            const response = await request(app)
                .get(`/api/v1/user/profile/${user._id}`);

            assertErrorResponse(response, 403, 'No credentials');
        });

        it('should reject request with invalid token', async () => {
            const user = await createTestUser();

            const response = await request(app)
                .get(`/api/v1/user/profile/${user._id}`)
                .set('Authorization', 'Bearer invalid.token.here');

            assertErrorResponse(response, 401);
        });

        it('should return 404 for non-existent user', async () => {
            const { token } = await createAuthenticatedUser();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/v1/user/profile/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            assertErrorResponse(response, 404, 'User not found');
        });
    });

    // ==========================================
    // PUT /api/v1/user/profile
    // ==========================================
    describe('PUT /api/v1/user/profile', () => {
        it('should update user profile', async () => {
            const { user, token } = await createAuthenticatedUser();

            const updates = {
                full_name: 'Updated Name',
                location: 'New Location'
            };

            const response = await request(app)
                .put('/api/v1/user/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(updates);

            assertSuccessResponse(response, 200);
            expect(response.body.data.full_name).toBe('Updated Name');
            expect(response.body.data.location).toBe('New Location');
        });

        it('should not update sensitive fields', async () => {
            const { user, token } = await createAuthenticatedUser();

            const maliciousUpdates = {
                password: 'hacked',
                email_verified: true,
                status: 999,
                role: 100
            };

            const response = await request(app)
                .put('/api/v1/user/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(maliciousUpdates);

            // Should succeed but not update sensitive fields
            assertSuccessResponse(response, 200);
            expect(response.body.data.password).not.toBe('hacked');
        });

        it('should reject verified-user edits without verification flag', async () => {
            const { token } = await createAuthenticatedUser({
                status: 2,
                verified: true,
                location: 'Live Location'
            });

            const response = await request(app)
                .put('/api/v1/user/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ location: 'Bypassed Location' });

            assertErrorResponse(response, 422, 'verificationFlag=true');
        });

        it('should queue verified-user edits instead of publishing them directly', async () => {
            const { user, token } = await createAuthenticatedUser({
                status: 2,
                verified: true,
                location: 'Live Location',
                tagline: 'Live tagline',
                description: 'Live description',
                images: ['live-1.jpg']
            });

            const response = await request(app)
                .put('/api/v1/user/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    verificationFlag: true,
                    location: 'Queued Location',
                    tagline: 'Queued tagline',
                    description: 'Queued description',
                    images: ['queued-1.jpg']
                });

            assertSuccessResponse(response, 200);
            expect(response.body.data.location).toBe('Live Location');
            expect(response.body.data.un_verified_profile_details.location).toBe('Queued Location');
            expect(response.body.data.un_verified_tagline).toBe('Queued tagline');
            expect(response.body.data.un_verified_description).toBe('Queued description');
            expect(response.body.data.un_verified_images).toEqual(['queued-1.jpg']);
        });

        it('should require authentication', async () => {
            const response = await request(app)
                .put('/api/v1/user/profile')
                .send({ full_name: 'Test' });

            assertErrorResponse(response, 403);
        });
    });
});

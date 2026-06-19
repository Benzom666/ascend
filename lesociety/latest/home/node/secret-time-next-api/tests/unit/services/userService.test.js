/**
 * User Service Unit Tests
 */

const userService = require('../../../services/userService');
const User = require('../../../models/user');
const bcrypt = require('bcrypt');
const testDb = require('../../helpers/testDatabase');
const { createTestUser } = require('../../helpers/testHelpers');

describe('UserService', () => {
    // Setup and teardown
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
    // findByEmail Tests
    // ==========================================
    describe('findByEmail', () => {
        it('should find user by email', async () => {
            const testUser = await createTestUser({
                email: 'test@example.com'
            });

            const foundUser = await userService.findByEmail('test@example.com');

            expect(foundUser).toBeDefined();
            expect(foundUser.email).toBe('test@example.com');
            expect(foundUser._id.toString()).toBe(testUser._id.toString());
        });

        it('should return null for non-existent email', async () => {
            const foundUser = await userService.findByEmail('nonexistent@example.com');
            expect(foundUser).toBeNull();
        });

        it('should be case-insensitive', async () => {
            await createTestUser({ email: 'Test@Example.com' });
            
            const foundUser = await userService.findByEmail('test@example.com');
            expect(foundUser).toBeDefined();
        });
    });

    // ==========================================
    // findById Tests
    // ==========================================
    describe('findById', () => {
        it('should find user by ID', async () => {
            const testUser = await createTestUser();
            const foundUser = await userService.findById(testUser._id);

            expect(foundUser).toBeDefined();
            expect(foundUser._id.toString()).toBe(testUser._id.toString());
        });

        it('should throw NotFoundError for invalid ID', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            
            await expect(userService.findById(fakeId))
                .rejects
                .toThrow('User not found');
        });
    });

    // ==========================================
    // createUser Tests
    // ==========================================
    describe('createUser', () => {
        it('should create a new user', async () => {
            const userData = {
                email: 'newuser@example.com',
                user_name: 'newuser',
                full_name: 'New User',
                password: 'Password123',
                gender: 'male',
                age: 25
            };

            const createdUser = await userService.createUser(userData);

            expect(createdUser).toBeDefined();
            expect(createdUser.email).toBe(userData.email);
            expect(createdUser.user_name).toBe(userData.user_name);
            expect(createdUser.password).toBeDefined();
            expect(createdUser.password).not.toBe(userData.password); // Should be hashed
        });

        it('should hash the password', async () => {
            const userData = {
                email: 'test@example.com',
                user_name: 'testuser',
                password: 'Password123',
                gender: 'male'
            };

            const createdUser = await userService.createUser(userData);
            
            const isPasswordHashed = await bcrypt.compare(
                userData.password,
                createdUser.password
            );

            expect(isPasswordHashed).toBe(true);
        });

        it('should throw ConflictError for duplicate email', async () => {
            const userData = {
                email: 'duplicate@example.com',
                user_name: 'user1',
                password: 'Password123',
                gender: 'male'
            };

            await userService.createUser(userData);

            await expect(
                userService.createUser({
                    ...userData,
                    user_name: 'user2'
                })
            ).rejects.toThrow('Email already registered');
        });

        it('should throw ConflictError for duplicate username', async () => {
            const userData = {
                email: 'user1@example.com',
                user_name: 'duplicateuser',
                password: 'Password123',
                gender: 'male'
            };

            await userService.createUser(userData);

            await expect(
                userService.createUser({
                    ...userData,
                    email: 'user2@example.com'
                })
            ).rejects.toThrow('Username already taken');
        });
    });

    // ==========================================
    // verifyPassword Tests
    // ==========================================
    describe('verifyPassword', () => {
        it('should verify correct password', async () => {
            const password = 'CorrectPassword123';
            const testUser = await createTestUser({ password });

            // Get full user with password
            const userWithPassword = await User.findById(testUser._id);

            const isValid = await userService.verifyPassword(
                userWithPassword,
                password
            );

            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const testUser = await createTestUser({ password: 'CorrectPassword' });
            const userWithPassword = await User.findById(testUser._id);

            const isValid = await userService.verifyPassword(
                userWithPassword,
                'WrongPassword'
            );

            expect(isValid).toBe(false);
        });
    });

    // ==========================================
    // updateProfile Tests
    // ==========================================
    describe('updateProfile', () => {
        it('should update user profile', async () => {
            const testUser = await createTestUser();

            const updates = {
                full_name: 'Updated Name',
                location: 'Updated Location'
            };

            const updatedUser = await userService.updateProfile(
                testUser._id,
                updates
            );

            expect(updatedUser.full_name).toBe('Updated Name');
            expect(updatedUser.location).toBe('Updated Location');
        });

        it('should not update sensitive fields', async () => {
            const testUser = await createTestUser();

            const updates = {
                password: 'hacked',
                email_verified: true,
                status: 999,
                role: 'admin'
            };

            const updatedUser = await userService.updateProfile(
                testUser._id,
                updates
            );

            // These should not be updated
            expect(updatedUser.password).not.toBe('hacked');
            expect(updatedUser.email_verified).toBe(testUser.email_verified);
        });

        it('should reject verified-user updates that bypass the verification flag', async () => {
            const verifiedUser = await createTestUser({
                status: 2,
                verified: true,
                location: 'Old Location'
            });

            await expect(
                userService.updateProfile(verifiedUser._id, {
                    location: 'Queued Location'
                })
            ).rejects.toThrow('verificationFlag=true');
        });

        it('should queue verified-user edits when verification flag is present', async () => {
            const verifiedUser = await createTestUser({
                status: 2,
                verified: true,
                location: 'Old Location',
                tagline: 'Old tagline',
                description: 'Old description',
                images: ['live-1.jpg']
            });

            const updatedUser = await userService.updateProfile(verifiedUser._id, {
                verificationFlag: true,
                location: 'Queued Location',
                tagline: 'Queued tagline',
                description: 'Queued description',
                images: ['queued-1.jpg']
            });

            expect(updatedUser.location).toBe('Old Location');
            expect(updatedUser.un_verified_profile_details.location).toBe('Queued Location');
            expect(updatedUser.un_verified_tagline).toBe('Queued tagline');
            expect(updatedUser.un_verified_description).toBe('Queued description');
            expect(updatedUser.un_verified_images).toEqual(['queued-1.jpg']);
        });

        it('should throw NotFoundError for non-existent user', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            await expect(
                userService.updateProfile(fakeId, { full_name: 'Test' })
            ).rejects.toThrow('User not found');
        });
    });

    // ==========================================
    // deductTokens Tests
    // ==========================================
    describe('deductTokens', () => {
        it('should deduct tokens successfully', async () => {
            const testUser = await createTestUser();
            
            // Add tokens first
            await User.findByIdAndUpdate(testUser._id, {
                interested_tokens: 10
            });

            const updatedUser = await userService.deductTokens(
                testUser._id,
                'interested_tokens',
                5
            );

            expect(updatedUser.interested_tokens).toBe(5);
        });

        it('should throw ValidationError for insufficient tokens', async () => {
            const testUser = await createTestUser();
            
            await User.findByIdAndUpdate(testUser._id, {
                interested_tokens: 2
            });

            await expect(
                userService.deductTokens(testUser._id, 'interested_tokens', 5)
            ).rejects.toThrow('Insufficient');
        });

        it('should throw ValidationError for invalid token type', async () => {
            const testUser = await createTestUser();

            await expect(
                userService.deductTokens(testUser._id, 'invalid_token_type', 1)
            ).rejects.toThrow('Invalid token type');
        });
    });

    // ==========================================
    // calculateProfileCompletion Tests
    // ==========================================
    describe('calculateProfileCompletion', () => {
        it('should calculate 100% for complete profile', () => {
            const completeUser = {
                full_name: 'John Doe',
                gender: 'male',
                age: 25,
                location: 'New York',
                bio: 'Test bio',
                photos: ['photo1.jpg', 'photo2.jpg']
            };

            const completion = userService.calculateProfileCompletion(completeUser);
            expect(completion).toBe(100);
        });

        it('should calculate 0% for empty profile', () => {
            const emptyUser = {};
            
            const completion = userService.calculateProfileCompletion(emptyUser);
            expect(completion).toBe(0);
        });

        it('should calculate partial completion', () => {
            const partialUser = {
                full_name: 'John Doe',
                gender: 'male',
                age: 25
                // Missing: location, bio, photos
            };

            const completion = userService.calculateProfileCompletion(partialUser);
            expect(completion).toBe(50); // 3 out of 6 fields
        });
    });
});

/**
 * Auth Service Unit Tests
 */

const authService = require('../../../lib/auth');
const jwt = require('jsonwebtoken');

describe('Auth Service', () => {
    const testUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 1,
        gender: 'male'
    };

    // ==========================================
    // generateAccessToken Tests
    // ==========================================
    describe('generateAccessToken', () => {
        it('should generate valid access token', () => {
            const token = authService.generateAccessToken(testUser);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3); // JWT has 3 parts
        });

        it('should include user data in token', () => {
            const token = authService.generateAccessToken(testUser);
            const decoded = jwt.decode(token);

            expect(decoded.userId).toBe(testUser._id);
            expect(decoded.email).toBe(testUser.email);
            expect(decoded.role).toBe(testUser.role);
            expect(decoded.gender).toBe(testUser.gender);
        });

        it('should include token type', () => {
            const token = authService.generateAccessToken(testUser);
            const decoded = jwt.decode(token);

            expect(decoded.type).toBe(authService.TOKEN_TYPES.ACCESS);
        });

        it('should have expiry time', () => {
            const token = authService.generateAccessToken(testUser);
            const decoded = jwt.decode(token);

            expect(decoded.exp).toBeDefined();
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });
    });

    // ==========================================
    // generateRefreshToken Tests
    // ==========================================
    describe('generateRefreshToken', () => {
        it('should generate valid refresh token', () => {
            const result = authService.generateRefreshToken(testUser);

            expect(result).toBeDefined();
            expect(result.token).toBeDefined();
            expect(result.expiresAt).toBeDefined();
            expect(result.expiresAt).toBeInstanceOf(Date);
        });

        it('should include jti (unique token ID)', () => {
            const result = authService.generateRefreshToken(testUser);
            const decoded = jwt.decode(result.token);

            expect(decoded.jti).toBeDefined();
            expect(typeof decoded.jti).toBe('string');
        });

        it('should have refresh token type', () => {
            const result = authService.generateRefreshToken(testUser);
            const decoded = jwt.decode(result.token);

            expect(decoded.type).toBe(authService.TOKEN_TYPES.REFRESH);
        });

        it('should have longer expiry than access token', () => {
            const accessToken = authService.generateAccessToken(testUser);
            const refreshToken = authService.generateRefreshToken(testUser);

            const accessDecoded = jwt.decode(accessToken);
            const refreshDecoded = jwt.decode(refreshToken.token);

            expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
        });
    });

    // ==========================================
    // generateTokenPair Tests
    // ==========================================
    describe('generateTokenPair', () => {
        it('should generate both access and refresh tokens', () => {
            const tokens = authService.generateTokenPair(testUser);

            expect(tokens.accessToken).toBeDefined();
            expect(tokens.refreshToken).toBeDefined();
            expect(tokens.expiresIn).toBeDefined();
            expect(tokens.refreshExpiresAt).toBeDefined();
        });

        it('should generate different tokens', () => {
            const tokens = authService.generateTokenPair(testUser);

            expect(tokens.accessToken).not.toBe(tokens.refreshToken);
        });
    });

    // ==========================================
    // verifyAccessToken Tests
    // ==========================================
    describe('verifyAccessToken', () => {
        it('should verify valid access token', () => {
            const token = authService.generateAccessToken(testUser);
            const decoded = authService.verifyAccessToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(testUser._id);
        });

        it('should throw error for invalid token', () => {
            expect(() => {
                authService.verifyAccessToken('invalid.token.here');
            }).toThrow('Invalid token');
        });

        it('should throw error for refresh token', () => {
            const refreshToken = authService.generateRefreshToken(testUser);

            expect(() => {
                authService.verifyAccessToken(refreshToken.token);
            }).toThrow('Invalid token type');
        });

        it('should throw error for expired token', () => {
            // Create token that expires immediately
            const expiredToken = authService.generateAccessToken(testUser, {
                expiresIn: '0s'
            });

            // Wait a bit to ensure expiry
            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(() => {
                        authService.verifyAccessToken(expiredToken);
                    }).toThrow('Token expired');
                    resolve();
                }, 100);
            });
        });
    });

    // ==========================================
    // verifyRefreshToken Tests
    // ==========================================
    describe('verifyRefreshToken', () => {
        it('should verify valid refresh token', () => {
            const { token } = authService.generateRefreshToken(testUser);
            const decoded = authService.verifyRefreshToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(testUser._id);
            expect(decoded.type).toBe(authService.TOKEN_TYPES.REFRESH);
        });

        it('should throw error for access token', () => {
            const accessToken = authService.generateAccessToken(testUser);

            expect(() => {
                authService.verifyRefreshToken(accessToken);
            }).toThrow('Invalid token type');
        });
    });

    // ==========================================
    // generateEmailVerificationToken Tests
    // ==========================================
    describe('generateEmailVerificationToken', () => {
        it('should generate email verification token', () => {
            const token = authService.generateEmailVerificationToken(
                testUser.email,
                testUser._id
            );

            expect(token).toBeDefined();
            
            const decoded = jwt.decode(token);
            expect(decoded.email).toBe(testUser.email);
            expect(decoded.userId).toBe(testUser._id);
            expect(decoded.type).toBe(authService.TOKEN_TYPES.EMAIL_VERIFICATION);
        });
    });

    // ==========================================
    // generatePasswordResetToken Tests
    // ==========================================
    describe('generatePasswordResetToken', () => {
        it('should generate password reset token', () => {
            const token = authService.generatePasswordResetToken(
                testUser.email,
                testUser._id
            );

            expect(token).toBeDefined();
            
            const decoded = jwt.decode(token);
            expect(decoded.email).toBe(testUser.email);
            expect(decoded.userId).toBe(testUser._id);
            expect(decoded.type).toBe(authService.TOKEN_TYPES.PASSWORD_RESET);
        });
    });
});

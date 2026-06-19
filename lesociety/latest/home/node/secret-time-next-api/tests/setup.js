/**
 * Jest Test Setup
 * Runs before all tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET_TOKEN = 'test-jwt-secret-token-for-testing-only';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.MONGO_USER = 'test-user';
process.env.MONGO_PASS = 'test-password';
process.env.MONGO_HOST = 'test-host';
process.env.DB_NAME = 'lesociety-test';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
    /**
     * Generate random email for testing
     */
    randomEmail: () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `test${timestamp}${random}@example.com`;
    },

    /**
     * Generate random username
     */
    randomUsername: () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `testuser${timestamp}${random}`;
    },

    /**
     * Wait for specified milliseconds
     */
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    /**
     * Create test user data
     */
    createTestUserData: () => ({
        email: global.testUtils.randomEmail(),
        user_name: global.testUtils.randomUsername(),
        full_name: 'Test User',
        password: 'Test123456',
        gender: 'male',
        age: 25,
        location: 'Test City'
    })
};

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error for debugging
    error: console.error
};

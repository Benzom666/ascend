/**
 * Jest Configuration
 * Testing framework configuration for Ascend API
 */

module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Coverage directory
    coverageDirectory: 'coverage',

    // Files to collect coverage from
    collectCoverageFrom: [
        'controllers/**/*.js',
        'services/**/*.js',
        'lib/**/*.js',
        'middleware/**/*.js',
        'helpers/**/*.js',
        '!**/*.test.js',
        '!**/node_modules/**',
        '!coverage/**'
    ],

    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/__tests__/**/*.js'
    ],

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    // Verbose output
    verbose: true,

    // Test timeout (10 seconds)
    testTimeout: 10000,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks between tests
    restoreMocks: true,

    // Coverage reporters
    coverageReporters: [
        'text',
        'text-summary',
        'html',
        'lcov'
    ]
};

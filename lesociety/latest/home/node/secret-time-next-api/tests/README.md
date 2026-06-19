# Testing Guide - Le Society API

## 📋 Overview

This directory contains comprehensive tests for the Le Society API. Tests are organized into:

- **Unit Tests** - Test individual functions/services in isolation
- **Integration Tests** - Test API endpoints with real HTTP requests
- **Helpers** - Reusable test utilities

---

## 🚀 Quick Start

### Install Dependencies

```bash
cd lesociety/latest/home/node/secret-time-next-api

# Install testing dependencies
npm install --save-dev jest@29.7.0 supertest@6.3.3 mongodb-memory-server@9.1.1
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode (auto-rerun on changes)
npm run test:watch

# CI mode (for automation)
npm run test:ci
```

---

## 📁 Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── services/           # Service layer tests
│   │   └── userService.test.js
│   └── lib/                # Library tests
│       └── auth.test.js
│
├── integration/            # API integration tests
│   ├── auth.test.js       # Authentication endpoints
│   └── user.test.js       # User endpoints
│
├── helpers/                # Test utilities
│   ├── testDatabase.js    # In-memory database
│   └── testHelpers.js     # Reusable helpers
│
├── fixtures/               # Test data
└── setup.js               # Global test setup
```

---

## 📊 Coverage Reports

Test coverage reports are generated in the `coverage/` directory:

```bash
# Run tests with coverage
npm test

# View HTML coverage report
open coverage/index.html
```

**Coverage Thresholds:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

---

## ✍️ Writing Tests

### Unit Test Example

```javascript
const userService = require('../../../services/userService');
const testDb = require('../../helpers/testDatabase');
const { createTestUser } = require('../../helpers/testHelpers');

describe('UserService', () => {
    beforeAll(async () => {
        await testDb.connect();
    });

    afterAll(async () => {
        await testDb.disconnect();
    });

    beforeEach(async () => {
        await testDb.clearDatabase();
    });

    it('should find user by email', async () => {
        const user = await createTestUser({ email: 'test@example.com' });
        const found = await userService.findByEmail('test@example.com');
        
        expect(found).toBeDefined();
        expect(found.email).toBe(user.email);
    });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../../app');
const { createAuthenticatedUser } = require('../helpers/testHelpers');

describe('User API', () => {
    it('should get user profile', async () => {
        const { user, token } = await createAuthenticatedUser();

        const response = await request(app)
            .get(`/api/v1/user/profile/${user._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.email).toBe(user.email);
    });
});
```

---

## 🛠️ Test Utilities

### Database Helpers

```javascript
const testDb = require('./helpers/testDatabase');

// Connect to in-memory database
await testDb.connect();

// Clear all collections
await testDb.clearDatabase();

// Drop entire database
await testDb.dropDatabase();

// Disconnect
await testDb.disconnect();
```

### Test User Helpers

```javascript
const { createTestUser, createAuthenticatedUser } = require('./helpers/testHelpers');

// Create basic test user
const user = await createTestUser({
    email: 'custom@example.com',
    password: 'CustomPassword'
});

// Create user with auth token
const { user, token, refreshToken } = await createAuthenticatedUser();
```

### Global Test Utilities

```javascript
// Available globally in all tests
global.testUtils.randomEmail()      // Generate random email
global.testUtils.randomUsername()   // Generate random username
global.testUtils.createTestUserData() // Generate full user data
global.testUtils.wait(1000)         // Wait 1 second
```

---

## 🔍 Best Practices

### 1. Isolation
- Each test should be independent
- Use `beforeEach` to reset state
- Don't rely on test execution order

### 2. Descriptive Names
```javascript
// ✅ Good
it('should reject login with invalid password')

// ❌ Bad
it('test login')
```

### 3. Arrange-Act-Assert
```javascript
it('should update user profile', async () => {
    // Arrange
    const { user, token } = await createAuthenticatedUser();
    const updates = { full_name: 'New Name' };

    // Act
    const response = await request(app)
        .put('/api/v1/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.full_name).toBe('New Name');
});
```

### 4. Test Edge Cases
- Empty inputs
- Invalid data types
- Boundary values
- Unauthorized access
- Missing required fields

### 5. Clean Up
```javascript
afterEach(async () => {
    await testDb.clearDatabase();
});

afterAll(async () => {
    await testDb.disconnect();
});
```

---

## 🎯 What to Test

### Services (Unit Tests)
- ✅ Business logic correctness
- ✅ Error handling
- ✅ Edge cases
- ✅ Data transformations

### Controllers (Integration Tests)
- ✅ HTTP status codes
- ✅ Response format
- ✅ Authentication/authorization
- ✅ Input validation
- ✅ Error responses

### Libraries (Unit Tests)
- ✅ Utility functions
- ✅ Token generation/verification
- ✅ Data formatting
- ✅ Validation logic

---

## 🚫 Common Pitfalls

### Don't Test Implementation Details
```javascript
// ❌ Bad - testing internal implementation
it('should call bcrypt.hash', async () => {
    const spy = jest.spyOn(bcrypt, 'hash');
    await userService.createUser(userData);
    expect(spy).toHaveBeenCalled();
});

// ✅ Good - testing behavior
it('should hash password when creating user', async () => {
    const user = await userService.createUser({ password: 'Plain123' });
    expect(user.password).not.toBe('Plain123');
    const isHashed = await bcrypt.compare('Plain123', user.password);
    expect(isHashed).toBe(true);
});
```

### Don't Test External Libraries
```javascript
// ❌ Bad - testing bcrypt library
it('should hash password correctly', async () => {
    const hash = await bcrypt.hash('password', 10);
    expect(hash).toBeDefined();
});

// ✅ Good - testing your code that uses bcrypt
it('should create user with hashed password', async () => {
    const user = await userService.createUser(userData);
    expect(user.password).toBeDefined();
    expect(user.password).not.toBe(userData.password);
});
```

### Don't Share State Between Tests
```javascript
// ❌ Bad - shared state
let testUser;
beforeAll(async () => {
    testUser = await createTestUser(); // Used by all tests
});

// ✅ Good - isolated state
beforeEach(async () => {
    testUser = await createTestUser(); // Fresh for each test
});
```

---

## 📈 CI/CD Integration

Tests run automatically in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:ci
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

---

## 🐛 Debugging Tests

### Run Single Test File
```bash
npm test -- tests/unit/services/userService.test.js
```

### Run Single Test
```bash
npm test -- -t "should find user by email"
```

### Enable Verbose Output
```bash
npm test -- --verbose
```

### See Console Logs
```javascript
// Temporarily unmock console
global.console = require('console');
console.log('Debug info:', data);
```

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

**Happy Testing! 🧪**

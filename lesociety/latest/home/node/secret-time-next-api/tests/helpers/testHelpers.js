/**
 * Test Helpers
 * Reusable utilities for tests
 */

const authService = require('../../lib/auth');
const User = require('../../models/user');
const bcrypt = require('bcrypt');

/**
 * Create a test user in database
 */
async function createTestUser(userData = {}) {
    const defaultData = {
        email: global.testUtils.randomEmail(),
        user_name: global.testUtils.randomUsername(),
        full_name: 'Test User',
        password: 'Test123456',
        gender: 'male',
        age: 25,
        location: 'Test City',
        status: 1,
        email_verified: true,
        step_completed: 4
    };

    const hashedPassword = await bcrypt.hash(
        userData.password || defaultData.password,
        10
    );

    const user = new User({
        ...defaultData,
        ...userData,
        password: hashedPassword
    });

    await user.save();
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    return userObj;
}

/**
 * Create test user and generate auth token
 */
async function createAuthenticatedUser(userData = {}) {
    const user = await createTestUser(userData);
    
    const tokens = authService.generateTokenPair({
        _id: user._id,
        email: user.email,
        role: user.role,
        gender: user.gender
    });

    return {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
    };
}

/**
 * Create multiple test users
 */
async function createTestUsers(count = 3, baseData = {}) {
    const users = [];
    
    for (let i = 0; i < count; i++) {
        const user = await createTestUser({
            ...baseData,
            email: global.testUtils.randomEmail(),
            user_name: global.testUtils.randomUsername()
        });
        users.push(user);
    }
    
    return users;
}

/**
 * Create test date (date posting)
 */
async function createTestDate(userId, dateData = {}) {
    const Date = require('../../models/dates');
    
    const defaultData = {
        user_id: userId,
        title: 'Test Date',
        description: 'This is a test date description',
        location: 'Test Location',
        price: 100,
        status: 2,
        date_status: true
    };

    const date = new Date({
        ...defaultData,
        ...dateData
    });

    await date.save();
    return date.toObject();
}

/**
 * Create test chat room
 */
async function createTestChatRoom(user1Id, user2Id, chatData = {}) {
    const ChatRoom = require('../../models/chat_room');
    
    const defaultData = {
        users: [user1Id, user2Id],
        requester_id: user1Id,
        receiver_id: user2Id,
        status: 'active'
    };

    const chatRoom = new ChatRoom({
        ...defaultData,
        ...chatData
    });

    await chatRoom.save();
    return chatRoom.toObject();
}

/**
 * Assert error response format
 */
function assertErrorResponse(response, expectedStatus, expectedMessage = null) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe(true);
    expect(response.body).toHaveProperty('message');
    
    if (expectedMessage) {
        expect(response.body.message).toContain(expectedMessage);
    }
}

/**
 * Assert success response format
 */
function assertSuccessResponse(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('data');
}

module.exports = {
    createTestUser,
    createAuthenticatedUser,
    createTestUsers,
    createTestDate,
    createTestChatRoom,
    assertErrorResponse,
    assertSuccessResponse
};

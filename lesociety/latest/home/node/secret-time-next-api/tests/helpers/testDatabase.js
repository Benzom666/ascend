/**
 * Test Database Helper
 * Manages in-memory MongoDB for testing
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to in-memory MongoDB
 */
async function connect() {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Disconnect if already connected
    await mongoose.disconnect();

    // Connect to in-memory database
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log('Test database connected');
}

/**
 * Disconnect and stop MongoDB
 */
async function disconnect() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }

    console.log('Test database disconnected');
}

/**
 * Clear all collections
 */
async function clearDatabase() {
    if (mongoose.connection.readyState === 0) {
        return;
    }

    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
}

/**
 * Drop entire database
 */
async function dropDatabase() {
    if (mongoose.connection.readyState === 0) {
        return;
    }

    await mongoose.connection.dropDatabase();
}

module.exports = {
    connect,
    disconnect,
    clearDatabase,
    dropDatabase
};

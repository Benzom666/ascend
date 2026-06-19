const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// MongoDB connection from environment variables
const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoHost = process.env.MONGO_HOST;
const dbName = process.env.DB_NAME || 'lesociety';

if (!mongoUser || !mongoPass || !mongoHost) {
    console.error('❌ ERROR: MongoDB credentials not configured.');
    console.error('Set MONGO_USER, MONGO_PASS, and MONGO_HOST environment variables.');
    console.error('Or create a .env file in the lesoceity root with these values:');
    console.error('');
    console.error('  MONGO_USER=your_username');
    console.error('  MONGO_PASS=your_password');
    console.error('  MONGO_HOST=your_cluster.mongodb.net');
    console.error('');
    process.exit(1);
}

const uri = process.env.MONGO_URI || `mongodb+srv://${mongoUser}:${encodeURIComponent(mongoPass)}@${mongoHost}/${dbName}?retryWrites=true&w=majority`;

async function checkUser() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);

        // Find all users
        const users = await db.collection('users').find({}).toArray();

        console.log('=== All users in database ===');
        users.forEach(user => {
            console.log(`Email: ${user.email}, Status: ${user.status}, Name: ${user.name || 'N/A'}`);
        });

        // Check specific user
        const user = await db.collection('users').findOne({ email: 'manman@yopmail.com' });
        console.log('\n=== Searching for manman@yopmail.com ===');
        console.log('Found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('User data:', JSON.stringify(user, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

checkUser();

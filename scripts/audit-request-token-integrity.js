const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Prefer root .env, fallback to API .env
const rootEnv = path.resolve(__dirname, '..', '.env');
const apiEnv = path.resolve(__dirname, '..', 'lesociety/latest/home/node/secret-time-next-api/.env');
dotenv.config({ path: rootEnv });
dotenv.config({ path: apiEnv });

const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoHost = process.env.MONGO_HOST;
const dbName = process.env.DB_NAME || 'lesociety';

if (!mongoUser || !mongoPass || !mongoHost) {
  console.error('Missing MongoDB env values (MONGO_USER/MONGO_PASS/MONGO_HOST).');
  process.exit(1);
}

const uri = process.env.MONGO_URI || `mongodb+srv://${mongoUser}:${encodeURIComponent(mongoPass)}@${mongoHost}/${dbName}?retryWrites=true&w=majority`;

const REQUEST = {
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
  IGNORED: 3,
};

const CHAT = {
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 3,
  IGNORED: 4,
};

async function main() {
  const client = new MongoClient(uri);
  const now = new Date();

  try {
    await client.connect();
    const db = client.db(dbName);

    const users = db.collection('users');
    const requests = db.collection('requests');
    const collections = await db.listCollections().toArray();
    const collectionNames = new Set(collections.map((c) => c.name));
    const chatRoomCollectionName = collectionNames.has('chatrooms')
      ? 'chatrooms'
      : collectionNames.has('chat_rooms')
      ? 'chat_rooms'
      : null;
    const chatRooms = chatRoomCollectionName ? db.collection(chatRoomCollectionName) : null;

    const [
      totalUsers,
      usersWithNegativeTokens,
      requestStatusCounts,
      chatStatusCounts,
      expiredPendingRequests,
      ignoredRequestsNotRefunded,
      rejectedRequestsRefunded,
      pendingRequestsPast48h,
      expiredPendingChats,
      ignoredChatsNotRefunded,
      rejectedChatsRefunded,
      pendingChatsPast48h,
    ] = await Promise.all([
      users.countDocuments({}),
      users.find({
        $or: [
          { interested_tokens: { $lt: 0 } },
          { super_interested_tokens: { $lt: 0 } },
          { chat_tokens: { $lt: 0 } },
        ],
      }, { projection: { email: 1, interested_tokens: 1, super_interested_tokens: 1, chat_tokens: 1 } }).toArray(),
      requests.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray(),
      chatRooms ? chatRooms.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray() : [],
      requests.countDocuments({ status: REQUEST.PENDING, expires_at: { $lte: now } }),
      requests.find({ status: REQUEST.IGNORED, $or: [{ is_refunded: { $exists: false } }, { is_refunded: false }] }, { projection: { requester_id: 1, request_type: 1, created_date: 1 } }).limit(25).toArray(),
      requests.find({ status: REQUEST.REJECTED, is_refunded: true }, { projection: { requester_id: 1, request_type: 1, created_date: 1 } }).limit(25).toArray(),
      requests.find({ status: REQUEST.PENDING, created_date: { $lte: new Date(now.getTime() - 48 * 60 * 60 * 1000) } }, { projection: { requester_id: 1, request_type: 1, created_date: 1, expires_at: 1 } }).limit(25).toArray(),
      chatRooms ? chatRooms.countDocuments({ status: CHAT.PENDING, expires_at: { $lte: now } }) : 0,
      chatRooms ? chatRooms.find({ status: CHAT.IGNORED, $or: [{ is_refunded: { $exists: false } }, { is_refunded: false }] }, { projection: { requester_id: 1, users: 1, isSuperInterested: 1, create_date: 1 } }).limit(25).toArray() : [],
      chatRooms ? chatRooms.find({ status: CHAT.REJECTED, is_refunded: true }, { projection: { requester_id: 1, users: 1, isSuperInterested: 1, create_date: 1 } }).limit(25).toArray() : [],
      chatRooms ? chatRooms.find({ status: CHAT.PENDING, create_date: { $lte: new Date(now.getTime() - 48 * 60 * 60 * 1000) } }, { projection: { requester_id: 1, users: 1, create_date: 1, expires_at: 1 } }).limit(25).toArray() : [],
    ]);

    const toMap = (arr) => arr.reduce((acc, curr) => {
      acc[String(curr._id)] = curr.count;
      return acc;
    }, {});

    const report = {
      generated_at: now.toISOString(),
      collections: {
        requests: 'requests',
        chat_rooms: chatRoomCollectionName || 'NOT_FOUND',
      },
      totals: {
        users: totalUsers,
        requests_by_status: toMap(requestStatusCounts),
        chats_by_status: toMap(chatStatusCounts),
      },
      anomalies: {
        users_with_negative_tokens: usersWithNegativeTokens,
        requests: {
          expired_pending_count: expiredPendingRequests,
          ignored_not_refunded_sample: ignoredRequestsNotRefunded,
          rejected_marked_refunded_sample: rejectedRequestsRefunded,
          pending_over_48h_sample: pendingRequestsPast48h,
        },
        chat_rooms: {
          expired_pending_count: expiredPendingChats,
          ignored_not_refunded_sample: ignoredChatsNotRefunded,
          rejected_marked_refunded_sample: rejectedChatsRefunded,
          pending_over_48h_sample: pendingChatsPast48h,
        },
      },
      health: {
        ok:
          usersWithNegativeTokens.length === 0 &&
          expiredPendingRequests === 0 &&
          ignoredRequestsNotRefunded.length === 0 &&
          rejectedRequestsRefunded.length === 0 &&
          pendingRequestsPast48h.length === 0 &&
          expiredPendingChats === 0 &&
          ignoredChatsNotRefunded.length === 0 &&
          rejectedChatsRefunded.length === 0 &&
          pendingChatsPast48h.length === 0,
      },
    };

    console.log(JSON.stringify(report, null, 2));

    if (!report.health.ok) {
      process.exitCode = 2;
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});

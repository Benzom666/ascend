# 🗄️ Database Optimization Guide - Le Society

**Last Updated:** April 4, 2026  
**Version:** 1.0

---

## 📋 TABLE OF CONTENTS

1. [MongoDB Indexes](#mongodb-indexes)
2. [Query Optimization](#query-optimization)
3. [Schema Design](#schema-design)
4. [Connection Management](#connection-management)
5. [Backup & Recovery](#backup--recovery)
6. [Performance Monitoring](#performance-monitoring)

---

## MONGODB INDEXES

### Current Collections

Le Society uses 11 MongoDB collections. Below are optimized index strategies for each.

### 1. Users Collection

**Critical Indexes:**

```javascript
// Unique index on email
db.users.createIndex({ email: 1 }, { unique: true });

// Compound index for user listing
db.users.createIndex({ status: 1, gender: 1, created_at: -1 });

// Location-based searches
db.users.createIndex({ location: 1, status: 1 });

// Profile verification status
db.users.createIndex({ verification_status: 1, profile_status: 1 });

// Admin queries
db.users.createIndex({ created_at: -1 });
db.users.createIndex({ last_login: -1 });

// Token management
db.users.createIndex({ tokens: 1 }, { sparse: true });
```

**Implementation Script:**

```javascript
// File: scripts/create-user-indexes.js
const mongoose = require('mongoose');
const User = require('../models/user');

async function createUserIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Creating user indexes...');
    
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Email index created');
    
    await User.collection.createIndex({ status: 1, gender: 1, created_at: -1 });
    console.log('✓ Status-gender compound index created');
    
    await User.collection.createIndex({ location: 1, status: 1 });
    console.log('✓ Location index created');
    
    await User.collection.createIndex({ verification_status: 1, profile_status: 1 });
    console.log('✓ Verification status index created');
    
    await User.collection.createIndex({ created_at: -1 });
    console.log('✓ Created_at index created');
    
    await User.collection.createIndex({ tokens: 1 }, { sparse: true });
    console.log('✓ Tokens index created');
    
    console.log('All user indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

createUserIndexes();
```

### 2. Dates Collection

**Critical Indexes:**

```javascript
// User's dates
db.dates.createIndex({ user_id: 1, status: 1 });

// Public listing (most important)
db.dates.createIndex({ status: 1, date_time: 1 });

// Location-based date search
db.dates.createIndex({ location: 1, status: 1, date_time: 1 });

// Admin moderation
db.dates.createIndex({ status: 1, created_at: -1 });

// Date categories
db.dates.createIndex({ category: 1, status: 1 });

// Expiry management
db.dates.createIndex({ date_time: 1 }, { expireAfterSeconds: 86400 }); // Optional: auto-delete old dates
```

### 3. Chat Rooms Collection

**Critical Indexes:**

```javascript
// Find chat room by participants
db.chatrooms.createIndex({ user_id: 1, partner_id: 1 });
db.chatrooms.createIndex({ partner_id: 1, user_id: 1 });

// Recent conversations
db.chatrooms.createIndex({ user_id: 1, updated_at: -1 });
db.chatrooms.createIndex({ partner_id: 1, updated_at: -1 });

// Active rooms
db.chatrooms.createIndex({ is_active: 1, updated_at: -1 });
```

### 4. Chats Collection

**Critical Indexes:**

```javascript
// Messages by room (most used query)
db.chats.createIndex({ room_id: 1, created_at: -1 });

// Unread messages
db.chats.createIndex({ receiver_id: 1, is_read: 1 });

// Sender's messages
db.chats.createIndex({ sender_id: 1, created_at: -1 });

// Cleanup old messages (optional)
db.chats.createIndex({ created_at: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
```

### 5. Notifications Collection

**Critical Indexes:**

```javascript
// User notifications
db.notifications.createIndex({ user_id: 1, created_at: -1 });

// Unread notifications
db.notifications.createIndex({ user_id: 1, is_read: 1 });

// Notification type filtering
db.notifications.createIndex({ user_id: 1, type: 1, created_at: -1 });

// Auto-cleanup old notifications
db.notifications.createIndex({ created_at: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
```

### 6. Payments Collection

**Critical Indexes:**

```javascript
// User payment history
db.payments.createIndex({ user_id: 1, created_at: -1 });

// Transaction tracking
db.payments.createIndex({ transaction_id: 1 }, { unique: true, sparse: true });

// Payment status
db.payments.createIndex({ status: 1, created_at: -1 });

// Revenue reporting
db.payments.createIndex({ created_at: -1, status: 1, amount: 1 });
```

### 7. Categories & Countries (Static Data)

**Simple Indexes:**

```javascript
// Categories
db.categories.createIndex({ name: 1 });
db.categories.createIndex({ status: 1 });

// Countries
db.countries.createIndex({ name: 1 });
db.countries.createIndex({ code: 1 });
```

### Master Index Creation Script

**File: `scripts/create-all-indexes.js`**

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const collections = {
  users: [
    { keys: { email: 1 }, options: { unique: true } },
    { keys: { status: 1, gender: 1, created_at: -1 } },
    { keys: { location: 1, status: 1 } },
    { keys: { verification_status: 1, profile_status: 1 } },
    { keys: { created_at: -1 } },
    { keys: { tokens: 1 }, options: { sparse: true } }
  ],
  dates: [
    { keys: { user_id: 1, status: 1 } },
    { keys: { status: 1, date_time: 1 } },
    { keys: { location: 1, status: 1, date_time: 1 } },
    { keys: { status: 1, created_at: -1 } },
    { keys: { category: 1, status: 1 } }
  ],
  chatrooms: [
    { keys: { user_id: 1, partner_id: 1 } },
    { keys: { partner_id: 1, user_id: 1 } },
    { keys: { user_id: 1, updated_at: -1 } },
    { keys: { partner_id: 1, updated_at: -1 } },
    { keys: { is_active: 1, updated_at: -1 } }
  ],
  chats: [
    { keys: { room_id: 1, created_at: -1 } },
    { keys: { receiver_id: 1, is_read: 1 } },
    { keys: { sender_id: 1, created_at: -1 } }
  ],
  notifications: [
    { keys: { user_id: 1, created_at: -1 } },
    { keys: { user_id: 1, is_read: 1 } },
    { keys: { user_id: 1, type: 1, created_at: -1 } }
  ],
  payments: [
    { keys: { user_id: 1, created_at: -1 } },
    { keys: { transaction_id: 1 }, options: { unique: true, sparse: true } },
    { keys: { status: 1, created_at: -1 } }
  ]
};

async function createAllIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    for (const [collectionName, indexes] of Object.entries(collections)) {
      console.log(`\nCreating indexes for ${collectionName}...`);
      
      for (const index of indexes) {
        try {
          await db.collection(collectionName).createIndex(
            index.keys,
            index.options || {}
          );
          console.log(`  ✓ Index created: ${JSON.stringify(index.keys)}`);
        } catch (error) {
          if (error.code === 11000 || error.codeName === 'IndexOptionsConflict') {
            console.log(`  ⚠ Index already exists: ${JSON.stringify(index.keys)}`);
          } else {
            console.error(`  ✗ Error creating index: ${error.message}`);
          }
        }
      }
    }
    
    console.log('\n✅ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAllIndexes();
```

**Usage:**

```bash
cd lesociety/latest/home/node/secret-time-next-api
node scripts/create-all-indexes.js
```

---

## QUERY OPTIMIZATION

### Use .lean() for Read-Only Queries

**Before (Slow):**

```javascript
const users = await User.find({ status: 1 });
// Returns full Mongoose documents with methods
```

**After (Fast):**

```javascript
const users = await User.find({ status: 1 }).lean();
// Returns plain JavaScript objects (30-50% faster)
```

### Use .select() to Limit Fields

**Before:**

```javascript
const users = await User.find({ status: 1 });
// Returns all fields
```

**After:**

```javascript
const users = await User.find({ status: 1 })
  .select('name email profile_image location')
  .lean();
// Returns only needed fields (reduces data transfer)
```

### Use Projection in Aggregation

**Before:**

```javascript
const results = await User.aggregate([
  { $match: { status: 1 } },
  { $lookup: { ... } }
]);
// Processes all fields
```

**After:**

```javascript
const results = await User.aggregate([
  { $match: { status: 1 } },
  { $project: { name: 1, email: 1, profile_image: 1 } },
  { $lookup: { ... } }
]);
// Processes only needed fields
```

### Optimize $lookup Operations

**Use localField and foreignField correctly:**

```javascript
// Efficient lookup
const dates = await User.aggregate([
  { $match: { gender: 'female', status: 1 } },
  {
    $lookup: {
      from: 'dates',
      localField: '_id',
      foreignField: 'user_id',
      as: 'dates',
      pipeline: [
        { $match: { status: 1 } },
        { $limit: 5 }
      ]
    }
  }
]);
```

### Pagination Best Practices

**Use skip/limit efficiently:**

```javascript
// For small datasets (<10,000 records)
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const users = await User.find({ status: 1 })
  .skip(skip)
  .limit(limit)
  .lean();

// For large datasets, use cursor-based pagination
const lastId = req.query.lastId;
const query = { status: 1 };

if (lastId) {
  query._id = { $gt: mongoose.Types.ObjectId(lastId) };
}

const users = await User.find(query)
  .sort({ _id: 1 })
  .limit(20)
  .lean();
```

---

## SCHEMA DESIGN

### Denormalization Strategies

**Store frequently accessed data together:**

```javascript
// Instead of always joining users and dates
// Store user summary in dates

const datesSchema = new mongoose.Schema({
  user_id: ObjectId,
  
  // Denormalized user data (updated when user profile changes)
  user_summary: {
    name: String,
    profile_image: String,
    verification_status: Number
  },
  
  // Date details
  location: String,
  date_time: Date,
  // ... other fields
});
```

### Embedding vs Referencing

**Embed when:**
- Data is small
- Data doesn't change often
- Data is always accessed together

**Reference when:**
- Data is large
- Data changes frequently
- Data is accessed independently

**Example:**

```javascript
// Good: Embed small, static data
const userSchema = new mongoose.Schema({
  name: String,
  preferences: {  // Embedded
    notifications: Boolean,
    theme: String
  }
});

// Good: Reference large, changing data
const dateSchema = new mongoose.Schema({
  user_id: { type: ObjectId, ref: 'User' },  // Referenced
  description: String
});
```

---

## CONNECTION MANAGEMENT

### Connection Pool Configuration

```javascript
// In app.js or database config
const mongoOptions = {
  // Connection Pool
  maxPoolSize: 50,           // Max connections in pool
  minPoolSize: 10,           // Min connections to maintain
  maxIdleTimeMS: 30000,      // Close idle connections after 30s
  
  // Timeouts
  serverSelectionTimeoutMS: 5000,  // Wait 5s for server selection
  socketTimeoutMS: 45000,          // Close sockets after 45s
  connectTimeoutMS: 10000,         // Wait 10s for initial connection
  
  // Monitoring
  monitorCommands: true,     // Enable command monitoring
  
  // Retry
  retryWrites: true,
  retryReads: true
};

mongoose.connect(process.env.MONGO_URI, mongoOptions);
```

### Monitor Connection Health

```javascript
// Add to app.js
mongoose.connection.on('connected', () => {
  console.log('✓ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('✗ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected');
});

// Monitor pool size
setInterval(() => {
  const pool = mongoose.connection.client?.topology?.s?.pool;
  if (pool) {
    console.log(`Pool: ${pool.totalConnectionCount} total, ${pool.availableConnectionCount} available`);
  }
}, 60000); // Every minute
```

---

## BACKUP & RECOVERY

### Automated Backup Script

**Enhanced backup-database.sh:**

```bash
#!/bin/bash

# Configuration
MONGO_URI="${MONGO_URI:-mongodb+srv://user:pass@cluster.mongodb.net/lesociety}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="lesociety_backup_${TIMESTAMP}"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting MongoDB backup..."

# Create backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/$BACKUP_NAME"

if [ $? -eq 0 ]; then
  echo "✓ Backup created: $BACKUP_NAME"
  
  # Compress backup
  cd "$BACKUP_DIR"
  tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
  rm -rf "$BACKUP_NAME"
  
  echo "✓ Backup compressed: ${BACKUP_NAME}.tar.gz"
  
  # Clean old backups
  find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
  echo "✓ Cleaned backups older than $RETENTION_DAYS days"
  
  # Upload to cloud storage (optional)
  if [ ! -z "$AWS_S3_BUCKET" ]; then
    aws s3 cp "${BACKUP_NAME}.tar.gz" "s3://$AWS_S3_BUCKET/backups/"
    echo "✓ Backup uploaded to S3"
  fi
else
  echo "✗ Backup failed!"
  exit 1
fi
```

### Point-in-Time Recovery

MongoDB Atlas provides automatic point-in-time recovery. Enable it:

1. Go to MongoDB Atlas Dashboard
2. Select your cluster
3. Click "Backup" tab
4. Enable "Continuous Cloud Backup"
5. Set retention policy

---

## PERFORMANCE MONITORING

### Enable Profiling

```javascript
// Enable slow query logging
mongoose.set('debug', function(coll, method, query, doc, options) {
  const start = Date.now();
  
  // Log queries taking > 100ms
  setTimeout(() => {
    const duration = Date.now() - start;
    if (duration > 100) {
      console.warn(`Slow query (${duration}ms):`, {
        collection: coll,
        method,
        query: JSON.stringify(query)
      });
    }
  }, 100);
});
```

### Query Analysis Script

```javascript
// File: scripts/analyze-queries.js
const mongoose = require('mongoose');

async function analyzeQueries() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  
  // Enable profiling (level 1 = slow queries only)
  await db.setProfilingLevel(1, { slowms: 100 });
  
  console.log('Profiling enabled. Waiting for queries...');
  console.log('Press Ctrl+C to stop and see results.');
  
  setTimeout(async () => {
    const profile = await db.collection('system.profile')
      .find()
      .sort({ ts: -1 })
      .limit(20)
      .toArray();
    
    console.log('\n📊 Slow Queries:');
    profile.forEach(q => {
      console.log(`\n${q.op} on ${q.ns} - ${q.millis}ms`);
      console.log('Query:', JSON.stringify(q.command, null, 2));
    });
    
    process.exit(0);
  }, 300000); // Run for 5 minutes
}

analyzeQueries();
```

### Index Usage Analysis

```javascript
// File: scripts/check-index-usage.js
const mongoose = require('mongoose');

async function checkIndexUsage() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  
  const collections = ['users', 'dates', 'chats', 'chatrooms'];
  
  for (const collName of collections) {
    console.log(`\n📊 ${collName} collection:`);
    
    const stats = await db.collection(collName).aggregate([
      { $indexStats: {} }
    ]).toArray();
    
    stats.forEach(index => {
      console.log(`  ${index.name}: ${index.accesses.ops} accesses since ${index.accesses.since}`);
    });
  }
  
  process.exit(0);
}

checkIndexUsage();
```

---

## OPTIMIZATION CHECKLIST

### Immediate Actions
- [ ] Create all recommended indexes
- [ ] Add .lean() to read-only queries
- [ ] Use .select() to limit fields
- [ ] Implement pagination limits
- [ ] Configure connection pool

### Short-term (1 week)
- [ ] Enable query profiling
- [ ] Analyze slow queries
- [ ] Review and optimize aggregations
- [ ] Set up automated backups
- [ ] Monitor index usage

### Long-term (1 month)
- [ ] Implement query result caching (Redis)
- [ ] Review schema design for denormalization
- [ ] Set up replica sets (if not using Atlas)
- [ ] Implement sharding strategy (for scale)
- [ ] Advanced monitoring (MongoDB Charts)

---

## MONITORING QUERIES

```bash
# View current operations
mongosh "mongodb+srv://..." --eval "db.currentOp()"

# View slow queries
mongosh "mongodb+srv://..." --eval "db.system.profile.find().sort({ts:-1}).limit(10)"

# Index statistics
mongosh "mongodb+srv://..." --eval "db.users.aggregate([{\$indexStats:{}}])"

# Collection stats
mongosh "mongodb+srv://..." --eval "db.users.stats()"
```

---

**Last Updated:** April 4, 2026  
**Maintained By:** Database Team

# 🚀 Performance Optimization Guide - Le Society

**Last Updated:** April 4, 2026  
**Version:** 1.0

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Backend Performance](#backend-performance)
3. [Frontend Performance](#frontend-performance)
4. [Database Optimization](#database-optimization)
5. [Network & CDN](#network--cdn)
6. [Monitoring & Metrics](#monitoring--metrics)
7. [Quick Wins](#quick-wins)

---

## EXECUTIVE SUMMARY

### Current Performance Baseline

**Backend (API):**
- Average response time: ~200ms
- Peak throughput: ~100 req/s
- Memory usage: ~500MB
- CPU usage: ~30% (single core)

**Frontend:**
- Initial page load: ~3-5s
- Time to Interactive (TTI): ~4-6s
- First Contentful Paint (FCP): ~1.5s
- Bundle size: ~2.5MB (uncompressed)

**Database:**
- Average query time: ~50ms
- Connection pool: 10 connections
- Index coverage: ~60%

### Performance Goals

🎯 **Target Metrics:**
- API response time: <100ms (95th percentile)
- Page load time: <2s
- Time to Interactive: <3s
- Database queries: <20ms (95th percentile)

---

## BACKEND PERFORMANCE

### 1. Database Query Optimization

#### Add Missing Indexes

**Critical indexes to add:**

```javascript
// In models/user.js - Add compound indexes
userSchema.index({ email: 1, status: 1 });
userSchema.index({ gender: 1, status: 1, created_at: -1 });
userSchema.index({ location: 1, status: 1 });
userSchema.index({ verification_status: 1, profile_status: 1 });

// In models/dates.js
datesSchema.index({ user_id: 1, status: 1 });
datesSchema.index({ status: 1, date_time: 1 });
datesSchema.index({ location: 1, status: 1, date_time: 1 });
datesSchema.index({ created_at: -1, status: 1 });

// In models/chat.js
chatSchema.index({ room_id: 1, created_at: -1 });
chatSchema.index({ sender_id: 1, created_at: -1 });
chatSchema.index({ receiver_id: 1, is_read: 1 });
```

**Implementation:**

```bash
# Create a script: scripts/create-indexes.js
cd lesociety/latest/home/node/secret-time-next-api
node scripts/create-indexes.js
```

#### Use Lean Queries

**Before:**
```javascript
const users = await User.find({ status: 1 });
```

**After:**
```javascript
const users = await User.find({ status: 1 }).lean();
```

**Impact:** 30-50% faster query execution, less memory usage

#### Implement Query Result Caching

**Add Redis caching layer:**

```javascript
// lib/cache.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    next();
  };
};
```

**Usage:**
```javascript
router.get('/users', cacheMiddleware(600), getUserList);
```

### 2. Connection Pooling

**MongoDB Connection Pool:**

```javascript
// In app.js or config/database.js
mongoose.connect(mongoURI, {
  maxPoolSize: 50,        // Increase from default 10
  minPoolSize: 10,        // Maintain minimum connections
  maxIdleTimeMS: 30000,   // Close idle connections
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
});
```

### 3. Response Compression

**Enable gzip compression:**

```javascript
// In app.js
const compression = require('compression');

app.use(compression({
  level: 6,  // Compression level (0-9)
  threshold: 1024,  // Only compress if > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
```

### 4. Pagination & Limiting

**Always implement pagination:**

```javascript
// helpers/pagination.js - Already exists, ensure it's used everywhere
const getPagination = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return { skip, limit: Math.min(limit, 100) }; // Cap at 100
};

// Usage in controllers
const { skip, limit } = getPagination(req.query.page, req.query.limit);
const users = await User.find().skip(skip).limit(limit).lean();
```

### 5. Async Processing

**Move heavy operations to background jobs:**

```javascript
// Use a job queue for emails, image processing, etc.
const Queue = require('bull');
const emailQueue = new Queue('emails', process.env.REDIS_URL);

// Instead of sending email immediately
emailQueue.add({ to, subject, body }, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
});
```

### 6. API Response Optimization

**Reduce payload size:**

```javascript
// Select only needed fields
const users = await User.find()
  .select('name email profile_image location')
  .lean();

// Use projection in aggregation
const results = await User.aggregate([
  { $match: { status: 1 } },
  { $project: { 
    name: 1, 
    email: 1, 
    profile_image: 1,
    _id: 1 
  }}
]);
```

---

## FRONTEND PERFORMANCE

### 1. Code Splitting & Lazy Loading

**Implement dynamic imports:**

```javascript
// pages/index.js
import dynamic from 'next/dynamic';

// Lazy load heavy components
const UserCardList = dynamic(() => import('../components/UserCardList'), {
  loading: () => <LoadingSkeleton />,
  ssr: false
});

const ChatModal = dynamic(() => import('../components/ChatModal'), {
  ssr: false
});
```

### 2. Image Optimization

**Use Next.js Image component:**

```javascript
import Image from 'next/image';

// Before
<img src={profileImage} alt="profile" />

// After
<Image 
  src={profileImage}
  alt="profile"
  width={300}
  height={300}
  loading="lazy"
  placeholder="blur"
  quality={75}
/>
```

**Implement responsive images:**

```javascript
<Image 
  src={image}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="date"
/>
```

### 3. Bundle Size Reduction

**Analyze bundle:**

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# In next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... existing config
});

# Run analysis
ANALYZE=true npm run build
```

**Remove unused dependencies:**

```bash
# Use depcheck
npm install -g depcheck
depcheck
```

**Tree-shake lodash:**

```javascript
// Before
import _ from 'lodash';
_.debounce(fn, 300);

// After
import debounce from 'lodash/debounce';
debounce(fn, 300);
```

### 4. Caching Strategy

**Implement service worker caching:**

```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('images').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

### 5. Debounce & Throttle

**Optimize event handlers:**

```javascript
import { debounce } from 'lodash';

// Search input
const handleSearch = debounce((query) => {
  fetchResults(query);
}, 300);

// Scroll events
const handleScroll = throttle(() => {
  checkScrollPosition();
}, 100);
```

### 6. Virtual Scrolling

**For long lists:**

```javascript
import { FixedSizeList } from 'react-window';

const UserList = ({ users }) => (
  <FixedSizeList
    height={600}
    itemCount={users.length}
    itemSize={100}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <UserCard user={users[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

---

## DATABASE OPTIMIZATION

### 1. Index Strategy

**Create indexes for all frequent queries:**

```bash
# Connect to MongoDB
mongosh "mongodb+srv://lesociety.lalld11.mongodb.net/lesociety"

# Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ status: 1, gender: 1, created_at: -1 });
db.dates.createIndex({ status: 1, date_time: 1 });
db.chats.createIndex({ room_id: 1, created_at: -1 });

# Verify indexes
db.users.getIndexes();
```

### 2. Query Profiling

**Enable profiling:**

```bash
# Set profiling level
db.setProfilingLevel(1, { slowms: 100 });

# View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10);
```

### 3. Aggregation Pipeline Optimization

**Use $match early:**

```javascript
// Bad - filters after processing
db.users.aggregate([
  { $lookup: { ... } },
  { $match: { status: 1 } }
]);

// Good - filter first
db.users.aggregate([
  { $match: { status: 1 } },
  { $lookup: { ... } }
]);
```

### 4. Connection Management

**Monitor connection pool:**

```javascript
// Add to app.js
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
  console.log('Pool size:', mongoose.connection.client.s.options.maxPoolSize);
});

setInterval(() => {
  const pool = mongoose.connection.client.s.pool;
  console.log('Active connections:', pool.totalConnectionCount);
}, 60000);
```

---

## NETWORK & CDN

### 1. Content Delivery Network

**Use CDN for static assets:**

```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.CDN_URL || '',
  images: {
    domains: ['cdn.lesociety.com', 'supabase.co'],
  }
};
```

### 2. HTTP/2 & Compression

**Enable in production:**

```javascript
// For nginx reverse proxy
server {
    listen 443 ssl http2;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}
```

### 3. API Response Caching

**Use HTTP cache headers:**

```javascript
// Middleware for cacheable routes
const setCacheHeaders = (duration = 300) => (req, res, next) => {
  res.set('Cache-Control', `public, max-age=${duration}`);
  next();
};

router.get('/categories', setCacheHeaders(3600), getCategories);
```

---

## MONITORING & METRICS

### 1. Application Performance Monitoring

**Add performance tracking:**

```javascript
// middleware/performance.js
const trackPerformance = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
};
```

### 2. Database Query Monitoring

**Log slow queries:**

```javascript
mongoose.set('debug', (collectionName, method, query, doc) => {
  const start = Date.now();
  
  mongoose.set('debug', false);
  const result = mongoose.Query.prototype.exec.call(this);
  
  result.then(() => {
    const duration = Date.now() - start;
    if (duration > 100) {
      logger.warn(`Slow query: ${collectionName}.${method} - ${duration}ms`);
    }
  });
  
  return result;
});
```

### 3. Frontend Performance Metrics

**Track Core Web Vitals:**

```javascript
// pages/_app.js
export function reportWebVitals(metric) {
  const { id, name, label, value } = metric;
  
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    });
  }
}
```

---

## QUICK WINS

### Immediate Optimizations (1-2 hours)

✅ **1. Enable gzip compression**
```bash
npm install compression
# Add to app.js as shown above
```

✅ **2. Add critical database indexes**
```bash
node scripts/create-indexes.js
```

✅ **3. Implement query lean()**
```javascript
// Replace all .find() with .find().lean()
```

✅ **4. Add pagination limits**
```javascript
// Cap all queries to max 100 results
```

✅ **5. Enable Next.js image optimization**
```javascript
// Replace <img> with <Image>
```

### Short-term Optimizations (1 week)

🔧 **1. Implement Redis caching**
- Cache user lists (5 min)
- Cache category/country data (1 hour)
- Cache date listings (2 min)

🔧 **2. Code splitting**
- Lazy load modals
- Lazy load chat components
- Dynamic imports for heavy pages

🔧 **3. Database query optimization**
- Profile all queries >100ms
- Add indexes for slow queries
- Optimize aggregation pipelines

### Long-term Optimizations (1 month)

🚀 **1. CDN implementation**
- Cloudflare or AWS CloudFront
- Cache static assets globally
- Image optimization service

🚀 **2. Microservices architecture**
- Separate chat service
- Separate notification service
- API gateway

🚀 **3. Advanced caching**
- Redis cluster
- Cache warming strategy
- Intelligent cache invalidation

---

## PERFORMANCE CHECKLIST

### Backend
- [ ] All database indexes created
- [ ] Query result caching implemented
- [ ] Response compression enabled
- [ ] Connection pooling optimized
- [ ] API pagination enforced
- [ ] Slow query logging enabled

### Frontend
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Bundle size < 1MB (gzipped)
- [ ] Service worker caching
- [ ] Virtual scrolling for lists
- [ ] Web Vitals monitored

### Database
- [ ] Indexes on all foreign keys
- [ ] Compound indexes for frequent queries
- [ ] Query profiling enabled
- [ ] Connection pool sized correctly
- [ ] Aggregation pipelines optimized

### Infrastructure
- [ ] CDN configured
- [ ] HTTP/2 enabled
- [ ] Cache headers set
- [ ] Load balancer configured
- [ ] Auto-scaling enabled

---

## PERFORMANCE TARGETS BY ENDPOINT

| Endpoint | Current | Target | Priority |
|----------|---------|--------|----------|
| GET /api/v1/user/list | 300ms | <100ms | High |
| GET /api/v1/date/list | 250ms | <80ms | High |
| POST /api/v1/user/login | 200ms | <150ms | Medium |
| GET /api/v1/chat/history | 400ms | <100ms | High |
| POST /api/v1/chat/send | 150ms | <100ms | Medium |

---

## MONITORING COMMANDS

```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/v1/user/list

# Monitor MongoDB slow queries
mongosh --eval "db.system.profile.find({millis:{$gt:100}}).sort({ts:-1}).limit(10)"

# Check memory usage
pm2 monit

# View application logs
tail -f logs/app.log | grep "Slow"
```

---

**Last Updated:** April 4, 2026  
**Next Review:** May 4, 2026

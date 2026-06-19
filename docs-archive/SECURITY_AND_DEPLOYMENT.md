# LESOCIETY Security & Deployment Notes

## 🔒 Security Changes Made

### 1. Removed Hardcoded Credentials
**CRITICAL SECURITY FIX**

The following files previously contained hardcoded MongoDB credentials:
- `check-user.js` 
- `restore-db.js`
- `app.js`

**All credentials have been moved to environment variables.**

### 2. Environment Variables Required

Create a `.env` file in the API directory:
```bash
cd lesociety/latest/home/node/secret-time-next-api
cp .env.template .env
# Edit .env with your credentials
```

Or in the root directory for utility scripts:
```bash
cd ~/.openclaw/workspace/lesoceity
cp .env.template .env
# Edit .env with your credentials
```

### 3. .gitignore Protection
`.env` files are already in `.gitignore` and will NOT be committed to git.

### 4. CORS Security
Previously: `Access-Control-Allow-Origin: *` (allows any website)
Now: Restricted to configured origins in production

---

## 💰 Cost Optimizations Applied

### 1. Mongoose Debug
- **Before**: Always enabled (`mongoose.set("debug", true)`)
- **After**: Only enabled in development mode
- **Savings**: Reduced log volume, faster queries

### 2. Winston Logging
- **Before**: 
  - File logs at `info` level
  - Console logs at `debug` level
  - 5 log files retained
- **After**:
  - Production: `warn` level only
  - Console disabled in production (unless explicitly enabled)
  - 3 log files retained (reduced from 5)
- **Savings**: 60-80% reduction in log storage costs

### 3. Connection Pooling
- **Before**: Default mongoose connection (no pooling)
- **After**: Configurable pool size (default: min 2, max 10)
- **Benefits**: Better performance, reduced connection overhead

### 4. Morgan HTTP Logging
- **Before**: Enabled in all environments
- **After**: Only enabled in development
- **Savings**: Reduced log volume in production

### 5. CORS Preflight Caching
- Added `maxAge: 86400` (24 hours) for preflight requests
- Reduces OPTIONS requests by caching results

---

## 🚀 Quick Start

### Local Development
```bash
cd lesociety/latest/home/node/secret-time-next-api

# Install dependencies
npm install

# Create environment file
cp .env.template .env
# Edit .env with your MongoDB credentials

# Start development server
NODE_ENV=development npm start
```

### Production Deployment
```bash
# Set production environment
export NODE_ENV=production
export LOG_LEVEL=warn
export MONGO_USER=your_user
export MONGO_PASS=your_pass
export MONGO_HOST=your_host

# Start with PM2
pm2 start app.js --name "lesoceity-api"
```

---

## 📊 Estimated Cost Savings

| Optimization | Before | After | Savings |
|--------------|--------|-------|---------|
| EC2 → VPS | $45-70/mo | $10-24/mo | **$25-60/mo** |
| Logging | ~$10/mo | ~$2/mo | **~$8/mo** |
| **Total** | **$55-80/mo** | **$12-26/mo** | **$43-68/mo (70-85%)** |

---

## ⚠️ IMPORTANT REMINDERS

1. **NEVER commit `.env` files**
2. **Rotate MongoDB credentials** (change password since it was exposed)
3. **Add new server IP to MongoDB Atlas whitelist** after migration
4. **Review MongoDB Atlas access logs** for unauthorized access
5. **Enable MongoDB Atlas IP whitelist** if not already active

---

## 🔄 Migration Checklist

- [ ] Change MongoDB password (was exposed in git history)
- [ ] Set up new VPS/Server
- [ ] Configure environment variables
- [ ] Test app on new server
- [ ] Update DNS
- [ ] Monitor for 24-48 hours
- [ ] Terminate old AWS resources

---

*Last Updated: 2026-02-10*

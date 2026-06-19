# 🚨 START HERE FIRST - MANDATORY READ 🚨

**⚠️ DO NOT SKIP THIS FILE ⚠️**

This document prevents hours of debugging. Read it before touching anything.

---

## 📋 CRITICAL CHECKLIST - DO THESE IN ORDER

### ✅ Step 1: Fix the JWT Secret (ALWAYS FAILS WITHOUT THIS!)

**Location:** `v2/lesociety/latest/home/node/secret-time-next-api/.env`

**Problem:** Login will show "Something went wrong" without this fix.

**Solution:** Add this ONE line to `.env`:
```bash
JWT_SECRET_TOKEN=your-secret-key-change-this-in-production
```

**Complete JWT section must look like:**
```bash
# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_SECRET_TOKEN=your-secret-key-change-this-in-production  # ← THIS IS REQUIRED!
JWT_EXPIRES_IN=7d
```

**Why:** Code uses `process.env.JWT_SECRET_TOKEN` but default .env only has `JWT_SECRET`.

---

### ✅ Step 2: Verify Database Connection

**Run this test BEFORE starting the app:**
```bash
cd v2/
node check-user.js
```

**Expected:** Should list 29+ users and show "Connection successful"

**If fails:** Check MongoDB Atlas credentials in `.env`

---

### ✅ Step 3: Start Backend API

```bash
cd v2/lesociety/latest/home/node/secret-time-next-api
node bin/www &
```

**Expected output:**
```
Server listening on port: 3001
connection successful
Connected to Mongo DB
running a task every minute
```

**Test it works:**
```bash
curl -X POST http://localhost:3001/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "afro@yopmail.com", "password": "123456"}'
```

**Expected:** Returns `"status": 200` with JWT token

**If fails:** You forgot Step 1! Go back and add `JWT_SECRET_TOKEN`.

---

### ✅ Step 4: Start Frontend

```bash
cd v2/lesociety/latest/home/node/secret-time-next
npm run dev &
```

**Expected:**
```
ready - started server on 0.0.0.0:3000
```

**Test it works:**
- Open: http://localhost:3000
- Login: afro@yopmail.com / 123456
- Should redirect to dashboard (NOT "Something went wrong")

---

## 🚫 COMMON MISTAKES (DON'T DO THESE!)

### ❌ Mistake #1: Starting frontend before backend
**Result:** Frontend can't connect to API, shows errors

**Fix:** Always start backend FIRST, then frontend

---

### ❌ Mistake #2: Skipping Step 1 (JWT fix)
**Result:** "Something went wrong" on login, hours wasted debugging

**Fix:** ALWAYS add `JWT_SECRET_TOKEN` to `.env` FIRST

---

### ❌ Mistake #3: Not testing API before frontend
**Result:** Don't know if backend works until frontend fails

**Fix:** Test login endpoint with curl BEFORE starting frontend

---

### ❌ Mistake #4: Wrong directory for commands
**Result:** Commands fail, confusion about which package.json

**Fix:** 
- Backend: `v2/lesociety/latest/home/node/secret-time-next-api`
- Frontend: `v2/lesociety/latest/home/node/secret-time-next`

---

## ⚡ QUICK START (30 Seconds)

**For experienced developers who just need the essentials:**

```bash
# 1. Add JWT_SECRET_TOKEN to backend .env (CRITICAL!)
echo "JWT_SECRET_TOKEN=your-secret-key-change-this-in-production" >> v2/lesociety/latest/home/node/secret-time-next-api/.env

# 2. Start backend
cd v2/lesociety/latest/home/node/secret-time-next-api
node bin/www &

# 3. Wait 3 seconds
sleep 3

# 4. Test login works
curl -X POST http://localhost:3001/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "afro@yopmail.com", "password": "123456"}'

# Should see: "status": 200

# 5. Start frontend
cd ../secret-time-next
npm run dev &

# 6. Open browser: http://localhost:3000
```

---

## 📊 COMPLETE .ENV TEMPLATE (BACKEND)

**Location:** `v2/lesociety/latest/home/node/secret-time-next-api/.env`

```bash
# Database Configuration
MONGO_USER=ronyroyrox_db_user
MONGO_PASS=Dgreatreset1!
MONGO_HOST=lesociety.lalld11.mongodb.net
DB_NAME=lesociety

# Application Configuration
APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3001

# JWT Configuration (BOTH REQUIRED!)
JWT_SECRET=your-secret-key-change-this-in-production
JWT_SECRET_TOKEN=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AWS S3 (Optional for local dev)
AWS_ACCESS_KEY_ID=dummy_key
AWS_SECRET_ACCESS_KEY=dummy_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=dummy_bucket

# Email (Optional for local dev)
AWS_MAIL_PASS=dummy_sendgrid_key
```

---

## 🧪 VERIFICATION CHECKLIST

Use this to verify everything works:

- [ ] Backend .env has `JWT_SECRET_TOKEN`
- [ ] `node check-user.js` shows 29+ users
- [ ] Backend starts without errors (port 3001)
- [ ] Login API returns 200 status with token
- [ ] Frontend starts without errors (port 3000)
- [ ] Can login with afro@yopmail.com / 123456
- [ ] Dashboard loads (not "Something went wrong")

**All checked?** ✅ You're ready to work!

---

## 🆘 EMERGENCY TROUBLESHOOTING

### Issue: "Something went wrong" on login

**99% of the time this is:** Missing `JWT_SECRET_TOKEN`

**Fix:**
1. Open `v2/lesociety/latest/home/node/secret-time-next-api/.env`
2. Add: `JWT_SECRET_TOKEN=your-secret-key-change-this-in-production`
3. Restart: `pkill -f "node bin/www" && cd v2/lesociety/latest/home/node/secret-time-next-api && node bin/www &`
4. Test: `curl -X POST http://localhost:3001/api/v1/user/login -H "Content-Type: application/json" -d '{"email": "afro@yopmail.com", "password": "123456"}'`

---

### Issue: Port already in use

**Fix:**
```bash
# Find and kill process
lsof -i :3001  # or :3000 for frontend
kill -9 <PID>

# Or kill all node processes
pkill -f node
```

---

### Issue: Database connection failed

**Fix:**
1. Check MongoDB Atlas IP whitelist (allow your IP or 0.0.0.0/0)
2. Verify credentials in .env are correct
3. Test with: `node check-user.js`

---

## 📚 ADDITIONAL DOCUMENTATION

**After completing the checklist above, refer to:**

1. **CRITICAL_FIX_README.md** - JWT issue deep dive
2. **APPLICATION_ARCHITECTURE.md** - Complete app documentation (2000+ lines)
   - Technology stack
   - Database schemas
   - API endpoints
   - Business logic
   - Workflows

---

## 🎯 THE GOLDEN RULE

> **ALWAYS add `JWT_SECRET_TOKEN` to backend .env BEFORE starting the app!**

This one line prevents 90% of "Something went wrong" issues.

---

## 🚀 THAT'S IT!

Follow the checklist above = Working app in 30 seconds.

Skip the checklist = Hours of debugging the same JWT issue.

**Your choice! 😊**

---

**Last Updated:** February 9, 2026  
**Reason:** Documented the JWT_SECRET_TOKEN requirement after login failures

---

## 📱 MOBILE ACCESS (BONUS!)

### Want to test on your phone?

**Problem:** Default setup uses `localhost` which doesn't work from mobile devices.

**Solution:** Update frontend .env to use your network IP.

**Steps:**

1. **Get your network IP:**
```bash
hostname -I | awk '{print $1}'
# Example output: 10.0.0.139
```

2. **Update frontend .env:**

**File:** `v2/lesociety/latest/home/node/secret-time-next/.env`

**Change from:**
```bash
NEXT_PUBLIC_DEV_API_URL="http://localhost:3001"
NEXT_PUBLIC_DEV_SOCKET_URL="http://localhost:3001/"
```

**Change to:** (replace with YOUR network IP)
```bash
NEXT_PUBLIC_DEV_API_URL="http://10.0.0.139:3001"
NEXT_PUBLIC_DEV_SOCKET_URL="http://10.0.0.139:3001/"
```

3. **Restart frontend:**
```bash
pkill -f "next dev"
cd v2/lesociety/latest/home/node/secret-time-next
npm run dev &
```

4. **Access from mobile:**
   - Ensure phone is on SAME WiFi network
   - Open browser: `http://YOUR_IP:3000`
   - Example: `http://10.0.0.139:3000`
   - Login: afro@yopmail.com / 123456

**✅ That's it! App works on mobile too!**

---


---

## 🐛 Common Frontend Issues

### Issue: Messages Page Shows "e.preventDefault is not a function"

**Quick Fix:** Already fixed in the codebase!

**What was wrong:** 
```javascript
// Wrong
<form onSubmit={handleSubmit((e) => e.preventDefault())}>

// Correct
<form onSubmit={handleSubmit(() => {})}>
```

**Why:** `react-hook-form`'s `handleSubmit` already handles preventDefault internally.

**If you see this error:** The fix has been applied. Just refresh the page.

---


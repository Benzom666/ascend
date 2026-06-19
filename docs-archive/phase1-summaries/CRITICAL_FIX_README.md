# 🚨 CRITICAL FIX - READ THIS FIRST! 🚨

## Issue: "Something went wrong" on Login

### Quick Fix (30 seconds):

1. **Open:** `v2/lesociety/latest/home/node/secret-time-next-api/.env`

2. **Add this line:**
   ```bash
   JWT_SECRET_TOKEN=your-secret-key-change-this-in-production
   ```

3. **Restart API:**
   ```bash
   pkill -f "node bin/www"
   cd v2/lesociety/latest/home/node/secret-time-next-api
   node bin/www &
   ```

4. **Done!** Login should now work.

---

## Why?

- Code uses `process.env.JWT_SECRET_TOKEN`
- Default .env only has `JWT_SECRET`
- Mismatch = JWT generation fails = Login broken

---

## Test It:

```bash
curl -X POST http://localhost:3001/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "afro@yopmail.com", "password": "123456"}'
```

Should return `"status": 200` with a token.

---

## Complete .env Template:

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
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=your-bucket

# Email (Optional for local dev)
# AWS_MAIL_PASS=your-sendgrid-api-key
```

---

**For full documentation, see `APPLICATION_ARCHITECTURE.md`**

---

## 🐛 Issue #2: Messages Page Form Error

### Symptom:
- Accessing `/messages` page shows error
- "TypeError: e.preventDefault is not a function"
- Chat/messaging functionality broken

### Root Cause:
```javascript
// WRONG (in messages.js line 762)
<form onSubmit={handleSubmit((e) => e.preventDefault())}>
```

The `handleSubmit` from `react-hook-form` already prevents default and manages the event. 
Calling `e.preventDefault()` inside the callback causes a type error because `handleSubmit` 
doesn't pass the raw event - it passes the form data.

### Solution:
```javascript
// CORRECT
<form onSubmit={handleSubmit(() => {})}>
```

**File Changed:** `v2/lesociety/latest/home/node/secret-time-next/pages/messages.js` (line 762)

### How to Apply:
The fix has been applied. Next.js will auto-reload. Just refresh the page.

---


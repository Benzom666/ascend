# 🚀 Quick Start Guide - Le Society

Get the Le Society platform running in **5 minutes**!

---

## ⚡ The Fastest Way

```bash
git clone https://github.com/Benzom666/v2.git
cd v2
./scripts/start-dev.sh
```

Visit **http://localhost:3000** 🎉

---

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ **Node.js 16+** installed ([download](https://nodejs.org/))
- ✅ **MongoDB Atlas account** ([free signup](https://www.mongodb.com/cloud/atlas))
- ✅ **Git** installed

---

## 🎯 Step-by-Step Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/Benzom666/v2.git
cd v2
```

### Step 2: Configure Backend

```bash
cd lesociety/latest/home/node/secret-time-next-api
cp .env.example .env
```

**Edit `.env` and add these critical values:**

```bash
# Database (get from MongoDB Atlas)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/lesociety

# JWT Secret (REQUIRED!)
JWT_SECRET_TOKEN=your-secret-key-change-this-in-production

# Application
PORT=3001
NODE_ENV=development
```

### Step 3: Configure Frontend

```bash
cd ../secret-time-next
cp .env.example .env
```

**Edit `.env`:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Step 4: Install Dependencies

```bash
# Backend
cd ../secret-time-next-api
npm install

# Frontend
cd ../secret-time-next
npm install
```

### Step 5: Start Services

```bash
# Terminal 1 - Backend
cd lesociety/latest/home/node/secret-time-next-api
node bin/www

# Terminal 2 - Frontend
cd lesociety/latest/home/node/secret-time-next
npm run dev
```

### Step 6: Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1

---

## ✅ Test Login

**Test Credentials:**
- Email: `afro@yopmail.com`
- Password: `123456`

---

## 🔧 Troubleshooting

### "Something went wrong" on login

**Solution:** Add `JWT_SECRET_TOKEN` to backend `.env`

```bash
echo "JWT_SECRET_TOKEN=your-secret-key" >> lesociety/latest/home/node/secret-time-next-api/.env
# Restart backend
```

### Database connection failed

**Check:** MongoDB credentials in `.env` are correct

```bash
# Test connection
node check-user.js
```

### Port already in use

```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

---

## 📚 Next Steps

- 📖 Read [Architecture Overview](architecture/APPLICATION_ARCHITECTURE.md)
- 🔌 Explore [API Documentation](api/API_DOCUMENTATION.md)
- 👥 New developer? See [Team Onboarding](guides/TEAM_ONBOARDING.md)
- 🚀 Deploy to production? Check [Deployment Guide](operations/DEPLOYMENT.md)

---

**Need help?** Check the [complete documentation](README.md) or open an [issue](https://github.com/Benzom666/v2/issues).

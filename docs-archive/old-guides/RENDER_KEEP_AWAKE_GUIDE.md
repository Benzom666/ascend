# 🔄 Render Keep-Awake Solution

## 🚨 THE PROBLEM

Your Render free tier backend spins down after **15 minutes of inactivity**, causing:
- ❌ 50+ second delays on first request (cold start)
- ❌ Poor user experience
- ❌ Failed API calls during spin-down

**Why internal cron jobs don't help:**
- Render only counts **EXTERNAL HTTP requests** as activity
- Your internal cron job (line 150 in `app.js`) runs INSIDE the server
- When the server is asleep, the cron job is also asleep!

---

## ✅ THE SOLUTION

Use a **FREE external cron service** to ping your backend every 5 minutes.

---

## 🎯 RECOMMENDED: CRON-JOB.ORG (Easiest!)

### Setup Steps:

1. **Go to:** https://cron-job.org/en/
2. **Sign up** (free account)
3. **Click:** "Create cronjob"
4. **Fill in:**
   ```
   Title: Keep Render Awake - Le Society
   URL: https://lesociety-api.onrender.com/api/v1/health
   Schedule: */5 * * * * (every 5 minutes)
   Method: GET
   Enabled: Yes
   ```
5. **Save** and activate

### Why Cron-Job.org?
- ✅ 100% free forever
- ✅ No credit card required
- ✅ Reliable (99.9% uptime)
- ✅ Email alerts if your server goes down
- ✅ Simple interface

---

## 🎯 ALTERNATIVE: UPTIMEROBOT (Popular Choice)

### Setup Steps:

1. **Go to:** https://uptimerobot.com
2. **Sign up** (free - 50 monitors included)
3. **Add New Monitor:**
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Le Society Backend
   URL: https://lesociety-api.onrender.com/api/v1/health
   Monitoring Interval: 5 minutes
   ```
4. **Save**

### Why UptimeRobot?
- ✅ Free tier: 50 monitors, 5-minute intervals
- ✅ Email/SMS alerts when server goes down
- ✅ Status page for monitoring
- ✅ Very popular (trusted by millions)

---

## 🎯 ALTERNATIVE: BETTERSTACK

### Setup Steps:

1. **Go to:** https://betterstack.com/uptime
2. **Sign up** (free tier available)
3. **Create Monitor:**
   ```
   Name: Le Society Backend
   URL: https://lesociety-api.onrender.com/api/v1/health
   Check Frequency: 5 minutes
   ```
4. **Save**

### Why BetterStack?
- ✅ Modern, clean interface
- ✅ Free tier includes monitoring
- ✅ Detailed uptime reports
- ✅ Incident management

---

## 🎯 ALTERNATIVE: EASYCRON

### Setup Steps:

1. **Go to:** https://www.easycron.com
2. **Sign up** (free - 1 cron job)
3. **Create Cron Job:**
   ```
   URL: https://lesociety-api.onrender.com/api/v1/health
   Cron Expression: */5 * * * *
   ```
4. **Enable**

---

## 🧪 TESTING YOUR SETUP

### Before Setup:
1. Wait 15 minutes without accessing your backend
2. Try loading your app
3. You'll see a 50+ second delay (cold start)

### After Setup:
1. Your cron service will ping every 5 minutes
2. Try loading your app after 30 minutes
3. It should respond instantly! ✅

### Verify Health Endpoint:
```bash
curl https://lesociety-api.onrender.com/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2026-03-30T02:19:00.000Z"
}
```

---

## 📊 WHAT YOU'LL GET

After setting up external pings:
- ✅ **Instant response** - No more 50s delays
- ✅ **24/7 uptime** - Server stays awake
- ✅ **Better UX** - Users get fast responses
- ✅ **Monitoring** - Email alerts if server goes down
- ✅ **Free forever** - All recommended services have free tiers

---

## 🔧 TECHNICAL DETAILS

### Your Current Setup:
- **Backend URL:** https://lesociety-api.onrender.com
- **Health Endpoint:** https://lesociety-api.onrender.com/api/v1/health
- **Internal Cron:** Runs every 1 minute (but doesn't prevent spin-down)

### How It Works:
```
External Cron Service → Pings /api/v1/health every 5 min
                     ↓
              Render sees HTTP request
                     ↓
              Server stays awake
                     ↓
              No cold starts!
```

### Why 5 Minutes?
- Render spins down after **15 minutes** of inactivity
- Pinging every **5 minutes** = Server never sleeps
- This is the sweet spot (not too frequent, not too rare)

---

## 🎯 QUICK START (30 SECONDS)

**Fastest Option - Cron-Job.org:**

1. Go to: https://cron-job.org/en/members/jobs/
2. Click: "Create cronjob"
3. Paste URL: `https://lesociety-api.onrender.com/api/v1/health`
4. Set interval: `*/5 * * * *`
5. Click: "Save"

**Done!** Your Render backend will now stay awake 24/7 🎉

---

## 📝 NOTES

- ✅ Your health endpoint is already configured (no code changes needed)
- ✅ All recommended services are 100% free
- ✅ You can use multiple services for redundancy
- ✅ Check your Render logs to see the ping requests coming in

---

## 🆘 TROUBLESHOOTING

### "Server still spinning down"
- **Check:** Is your cron job actually running? (Check service dashboard)
- **Check:** Is it hitting the correct URL?
- **Check:** Is the interval less than 15 minutes?

### "Health endpoint not responding"
- **Test locally:** `curl http://localhost:3001/api/v1/health`
- **Test production:** `curl https://lesociety-api.onrender.com/api/v1/health`
- **Check:** Backend logs in Render dashboard

### "Getting 404 errors"
- **Verify URL:** Should be `/api/v1/health` (not just `/health`)
- **Check:** Backend is deployed and running

---

## 🎉 RECOMMENDED ACTION

**Go set up Cron-Job.org right now!** It takes 30 seconds and will solve your Render spin-down issue permanently.

👉 **Link:** https://cron-job.org/en/

---

**Last Updated:** March 30, 2026

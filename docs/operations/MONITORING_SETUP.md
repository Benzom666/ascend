# 📊 Monitoring & Observability Setup

**Last Updated:** April 3, 2026  
**Purpose:** Monitor production health, performance, and errors

---

## 📋 TABLE OF CONTENTS

1. [Health Check Endpoints](#health-check-endpoints)
2. [Error Tracking (Sentry)](#error-tracking-sentry)
3. [Uptime Monitoring](#uptime-monitoring)
4. [Application Performance Monitoring](#application-performance-monitoring)
5. [Logging](#logging)
6. [Alerts](#alerts)

---

## 🏥 HEALTH CHECK ENDPOINTS

The application provides three health check endpoints:

### 1. Liveness Probe
**Endpoint:** `GET /alive`

**Purpose:** Check if the application is running

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-03T21:00:00.000Z",
  "uptime": 3600,
  "service": "lesociety-api"
}
```

**Use Case:** 
- Container orchestration (Kubernetes, Docker Swarm)
- Process managers (PM2)
- Load balancer health checks

---

### 2. Readiness Probe
**Endpoint:** `GET /ready`

**Purpose:** Check if app is ready to serve traffic

**Response (Ready):**
```json
{
  "status": "ready",
  "timestamp": "2026-04-03T21:00:00.000Z",
  "checks": {
    "database": "connected",
    "memory": "ok: 45.2% used",
    "uptime": 3600,
    "memoryDetails": {
      "rss": 120,
      "heapTotal": 80,
      "heapUsed": 36,
      "external": 2
    }
  }
}
```

**Response (Not Ready):**
```json
{
  "status": "not_ready",
  "timestamp": "2026-04-03T21:00:00.000Z",
  "checks": {
    "database": "disconnected",
    "memory": "ok: 45.2% used"
  }
}
```

**Status Codes:**
- `200` - Ready to serve traffic
- `503` - Not ready (database disconnected, etc.)

**Use Case:**
- Load balancer routing decisions
- Kubernetes readiness probes
- Before routing traffic to instance

---

### 3. Health Status
**Endpoint:** `GET /health`

**Purpose:** Uptime-safe health status for monitors. Always returns `200` while reporting dependency state in the payload.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-03T21:00:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": {
    "process": 3600,
    "system": 86400
  },
  "database": {
    "status": "connected",
    "readyState": 1,
    "name": "lesociety",
    "collections": 11,
    "dataSize": 10485760,
    "storageSize": 20971520
  },
  "memory": {
    "rss": 125829120,
    "heapTotal": 83894272,
    "heapUsed": 37945344,
    "external": 2097152
  },
  "cpu": {
    "user": 123456,
    "system": 78901
  },
  "platform": {
    "node": "v18.16.0",
    "platform": "linux",
    "arch": "x64"
  }
}
```

**Status Codes:**
- `200` - Process is alive

**Use Case:**
- External uptime monitoring
- Cron-based keepalive pings
- Quick dependency visibility without flapping monitors on temporary DB reconnects

---

## 🐛 ERROR TRACKING (SENTRY)

### Setup Sentry

**Step 1: Create Sentry Account**

1. Go to [sentry.io](https://sentry.io)
2. Create account / Login
3. Create new project → Node.js
4. Copy DSN: `https://xxxxx@sentry.io/xxxxx`

**Step 2: Configure Environment**

Add to `.env`:
```bash
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

**Step 3: Already Integrated!**

The application already has Sentry integration in `app.js`:
```javascript
if (process.env.SENTRY_DSN) {
    const Sentry = require("@sentry/node");
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT || 'production',
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1
    });
}
```

**Step 4: Verify**

Trigger a test error:
```bash
curl https://your-api.com/api/v1/nonexistent-endpoint
```

Check Sentry dashboard - error should appear within 1 minute.

### What Sentry Captures:

- ✅ Unhandled exceptions
- ✅ API errors (500s)
- ✅ Request context (URL, method, IP)
- ✅ User context (if authenticated)
- ✅ Stack traces
- ✅ Breadcrumbs (last actions before error)

### Sentry Alerts:

1. Sentry Dashboard → Alerts
2. Create alert rule:
   - Condition: Error rate > 10/minute
   - Action: Email/Slack notification
   - Frequency: Max once per 5 minutes

---

## ⏱️ UPTIME MONITORING

### Option 1: UptimeRobot (Free)

**Setup:**

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create account (free tier: 50 monitors)
3. Add New Monitor:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Le Society API
   URL: https://your-api.com/ready
   Monitoring Interval: 5 minutes
   ```
4. Add Alert Contacts:
   - Email
   - Slack (optional)
   - SMS (optional, paid)

**Monitors to Create:**
- Main API: `https://your-api.com/ready`
- Frontend: `https://your-frontend.com`
- Database connectivity check

---

### Option 2: Pingdom

**Setup:**

1. Go to [pingdom.com](https://pingdom.com)
2. Create uptime check
3. Configure:
   ```
   Name: Le Society API Health
   URL: https://your-api.com/ready
   Check interval: 1 minute
   ```

---

### Option 3: Better Uptime (Recommended)

**Why Better Uptime:**
- Modern UI
- Public status page
- Incident management
- Free tier available

**Setup:**

1. Go to [betteruptime.com](https://betteruptime.com)
2. Create monitor
3. Configure alerts
4. Create public status page: `status.yourdomain.com`

---

## 📈 APPLICATION PERFORMANCE MONITORING

### Option 1: New Relic

**Setup:**

```bash
npm install newrelic
```

Create `newrelic.js` in root:
```javascript
exports.config = {
  app_name: ['Le Society API'],
  license_key: 'your-license-key',
  logging: {
    level: 'info'
  }
};
```

Add to `bin/www`:
```javascript
require('newrelic');
// ... rest of file
```

**Monitors:**
- Response times
- Throughput
- Error rates
- Database query performance
- External service calls

---

### Option 2: Datadog

**Setup:**

```bash
npm install dd-trace
```

At the top of `app.js`:
```javascript
require('dd-trace').init({
  service: 'lesociety-api',
  env: process.env.NODE_ENV
});
```

Environment:
```bash
DD_API_KEY=your-datadog-key
DD_SITE=datadoghq.com
```

---

## 📝 LOGGING

### Current Setup (Winston)

Logs are already configured with Winston:

**Log Levels:**
- `error` - Errors that need attention
- `warn` - Warnings (non-critical)
- `info` - General information
- `http` - HTTP requests
- `debug` - Debug information (dev only)

**Log Format:**
```json
{
  "level": "error",
  "message": "Database connection failed",
  "timestamp": "2026-04-03T21:00:00.000Z",
  "context": "database",
  "error": {
    "message": "Connection timeout",
    "stack": "..."
  }
}
```

### Log Aggregation

**Option 1: Papertrail (Easiest)**

```bash
# Install
npm install winston-papertrail

# Add to winston config
const { Papertrail } = require('winston-papertrail');

transport = new Papertrail({
  host: 'logs.papertrailapp.com',
  port: 12345
});
```

**Option 2: Logtail**

```bash
npm install @logtail/node @logtail/winston

# Add transport
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");

const logtail = new Logtail("your-source-token");
transport = new LogtailTransport(logtail);
```

---

## 🚨 ALERTS

### Critical Alerts (Immediate)

**Trigger:** Within 5 minutes
**Channel:** Email + SMS + Slack

- API down (health check fails)
- Database connection lost
- Error rate > 10% of requests
- Response time > 5 seconds (avg)
- Memory usage > 90%

**Action:** Wake up on-call engineer

---

### Warning Alerts (15 minutes)

**Trigger:** Within 15 minutes
**Channel:** Email + Slack

- Error rate > 1% of requests
- Response time > 2 seconds (p95)
- Memory usage > 80%
- CPU usage > 80%
- Disk usage > 85%

**Action:** Investigate during business hours

---

### Info Alerts (Daily)

**Trigger:** Daily summary
**Channel:** Email

- Daily request count
- Error summary
- Performance metrics
- User signups
- Active users

**Action:** Review dashboard

---

## 📊 MONITORING DASHBOARD

### Recommended Stack:

**Free Tier:**
1. **UptimeRobot** - Uptime monitoring
2. **Sentry** - Error tracking
3. **Render Metrics** - Basic hosting metrics (if using Render)

**Paid (Small Team):**
1. **Better Uptime** ($20/mo) - Uptime + status page
2. **Sentry** ($26/mo) - Error tracking + performance
3. **Logtail** ($25/mo) - Log aggregation

**Enterprise:**
1. **Datadog** - All-in-one observability
2. **New Relic** - APM + monitoring
3. **PagerDuty** - Incident management

---

## ✅ MONITORING CHECKLIST

### Initial Setup:
- [x] Health check endpoints configured
- [ ] Sentry account created
- [ ] SENTRY_DSN added to environment
- [ ] Uptime monitoring configured
- [ ] Alert contacts added
- [ ] Test alerts triggered
- [ ] Status page created (optional)

### Ongoing:
- [ ] Review Sentry errors daily
- [ ] Check uptime dashboard weekly
- [ ] Analyze performance trends monthly
- [ ] Update alert thresholds as needed
- [ ] Review and rotate logs

---

## 🔧 TROUBLESHOOTING

### Health Check Always Returns 503

**Cause:** Database not connecting

**Solution:**
1. Check MongoDB credentials
2. Verify IP whitelist
3. Check network connectivity

### Sentry Not Capturing Errors

**Cause:** DSN not configured or invalid

**Solution:**
1. Verify `SENTRY_DSN` in environment
2. Check Sentry dashboard for project settings
3. Test with intentional error

### High Memory Usage Alerts

**Cause:** Memory leak or high traffic

**Solution:**
1. Check for memory leaks in code
2. Restart application
3. Scale horizontally (add instances)
4. Implement connection pooling

---

**Next:** See `OPERATIONS_RUNBOOK.md` for incident response

---

**Created by:** Monitoring Setup Guide  
**Date:** April 3, 2026

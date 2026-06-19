# 📊 MONITORING & OBSERVABILITY GUIDE - LE SOCIETY

**Date:** April 3, 2026  
**Purpose:** Complete guide to monitoring the production application  
**Audience:** DevOps, SRE, Backend Developers

---

## 🎯 MONITORING STRATEGY

### Three Pillars of Observability:
1. **Metrics** - System and application performance
2. **Logs** - Detailed event records
3. **Traces** - Request flows through the system

---

## 📈 KEY METRICS TO MONITOR

### Application Health:
- **Uptime** - Target: 99.9% (8.76 hours downtime/year max)
- **Response Time** - Target: <500ms (p95), <1s (p99)
- **Error Rate** - Target: <0.1%
- **Throughput** - Requests per second

### Backend Metrics:
```javascript
// Available at /health endpoint
{
  "status": "ok",                    // Overall health
  "uptime": 86400,                   // Seconds
  "mongodb": "connected",            // Database status
  "memory": {
    "used": "150MB",
    "total": "512MB"
  }
}
```

### Database Metrics (MongoDB Atlas):
- **Connection Pool Usage** - Alert if >80%
- **Query Performance** - Slow queries >100ms
- **Disk Space** - Alert at 80% capacity
- **Replication Lag** - Should be <1s

### System Metrics:
- **CPU Usage** - Alert if >80% for 5+ minutes
- **Memory Usage** - Alert if >85%
- **Disk I/O** - Monitor read/write throughput
- **Network** - Monitor bandwidth usage

---

## 🔍 MONITORING TOOLS SETUP

### 1. Sentry (Error Tracking) ⭐ REQUIRED

**Setup:**
```bash
# Already integrated in app.js
# Just need to configure DSN

# In .env:
SENTRY_DSN=https://your-key@o000000.ingest.sentry.io/0000000
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

**What to Monitor:**
- JavaScript errors
- API errors (500s)
- Slow transactions (>3s)
- Performance degradation

**Dashboard URL:** https://sentry.io/organizations/your-org/issues/

**Key Views:**
- **Issues** - All errors grouped
- **Performance** - Slow endpoints
- **Releases** - Track deployments
- **Alerts** - Configure notifications

**Alert Rules to Set:**
1. Error count >10 in 1 hour
2. Error rate >1% in 5 minutes
3. Slow transaction >3s sustained
4. New error type detected

---

### 2. Uptime Robot (Availability Monitoring) ⭐ RECOMMENDED

**Setup:**
1. Sign up at https://uptimerobot.com (free tier OK)
2. Add monitors:

**Monitor 1: API Health Check**
```
Type: HTTP(s)
URL: https://api.yourdomain.com/health
Interval: 5 minutes
Alert: Email + SMS when down
Expected: Contains "ok"
```

**Monitor 2: Frontend Availability**
```
Type: HTTP(s)
URL: https://yourdomain.com
Interval: 5 minutes
Alert: Email when down
Expected: HTTP 200
```

**Monitor 3: Database Connectivity**
```
Type: Keyword
URL: https://api.yourdomain.com/health
Keyword: "connected"
Interval: 5 minutes
```

---

### 3. MongoDB Atlas Monitoring ⭐ REQUIRED

**Built-in Dashboards:**

**Real-Time Performance:**
- Navigate to: Clusters → Your Cluster → Metrics
- View:
  - Operations per second
  - Query execution times
  - Connection count
  - Network I/O

**Performance Advisor:**
- Navigate to: Performance Advisor tab
- Reviews:
  - Slow queries
  - Missing indexes
  - Schema optimization

**Alerts to Configure:**

1. **Connection Pool Alert:**
   ```
   Metric: Connections
   Threshold: >80% of max
   Action: Email team
   ```

2. **Slow Query Alert:**
   ```
   Metric: Query Execution Time
   Threshold: >100ms (p95)
   Action: Email developers
   ```

3. **Disk Space Alert:**
   ```
   Metric: Disk Space %
   Threshold: >80%
   Action: Email + Slack
   ```

4. **Replication Lag:**
   ```
   Metric: Replication Lag
   Threshold: >5 seconds
   Action: Immediate alert
   ```

---

### 4. Server Monitoring (Host Metrics)

**For Render/Railway:**
- Use built-in metrics dashboard
- Monitor: CPU, Memory, Network

**For Self-Hosted:**
```bash
# Install node exporter (optional)
# Or use simple monitoring script:

#!/bin/bash
# server-stats.sh
while true; do
    echo "=== $(date) ==="
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
    echo "Memory: $(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')"
    echo "Disk: $(df -h / | awk 'NR==2{print $5}')"
    sleep 300  # Every 5 minutes
done
```

---

## 📊 CUSTOM DASHBOARDS

### Create Your Own Monitoring Dashboard

**Option 1: Simple HTML Dashboard**
```html
<!-- monitoring-dashboard.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Le Society - Monitoring</title>
    <meta http-equiv="refresh" content="30">
</head>
<body>
    <h1>Le Society Production Monitor</h1>
    
    <div id="health"></div>
    <div id="status"></div>
    
    <script>
        // Fetch health status
        fetch('https://api.yourdomain.com/health')
            .then(r => r.json())
            .then(data => {
                document.getElementById('health').innerHTML = 
                    `<h2>Health: ${data.status}</h2>
                     <p>Uptime: ${data.uptime}s</p>
                     <p>MongoDB: ${data.mongodb}</p>`;
            });
    </script>
</body>
</html>
```

**Option 2: Grafana (Advanced)**
- Use Grafana Cloud (free tier)
- Connect to MongoDB Atlas
- Import pre-built dashboards

---

## 🚨 ALERT CONFIGURATION

### Critical Alerts (Immediate Action):
1. **Server Down** - Site unreachable
2. **Database Down** - MongoDB connection lost
3. **Error Rate >5%** - Widespread failures
4. **Disk Space >95%** - Immediate expansion needed

### High Priority Alerts (1-hour SLA):
1. **Error Rate >1%** - Elevated failures
2. **Response Time >3s** - Performance degraded
3. **CPU >90%** - Resource exhaustion
4. **Memory >90%** - Memory leak?

### Medium Priority Alerts (4-hour SLA):
1. **Slow Queries** - >100ms sustained
2. **Connection Pool >80%** - Scaling needed
3. **Disk Space >80%** - Plan expansion

### Low Priority Alerts (24-hour SLA):
1. **Individual errors** - Single user issues
2. **Slow individual requests** - Edge cases

---

## 📝 LOG MANAGEMENT

### Current Logging Setup:

**Backend Logs:**
```bash
# Location
lesociety/latest/home/node/secret-time-next-api/logs/

# Rotation
# Logs are created daily: app_YYYYMMDD.log

# View live logs
tail -f lesociety/latest/home/node/secret-time-next-api/logs/app_$(date +%Y%m%d).log

# Search for errors
grep -i "error" lesociety/latest/home/node/secret-time-next-api/logs/*.log

# Find slow requests
grep "SLOW REQUEST" lesociety/latest/home/node/secret-time-next-api/logs/*.log
```

**Log Aggregation (Recommended):**

**Option 1: Papertrail (Free Tier)**
```bash
# Install
npm install winston-papertrail

# Add to app.js
const papertrail = new winston.transports.Papertrail({
    host: 'logs.papertrailapp.com',
    port: XXXXX
});
```

**Option 2: Logtail**
- Sign up at https://logtail.com
- Add source: Node.js
- Install library and configure

---

## 🔎 DEBUGGING IN PRODUCTION

### Using Request IDs:

Every request now has a unique ID in headers:
```bash
curl -I https://api.yourdomain.com/api/v1/user/profile
# Returns: X-Request-ID: 123e4567-e89b-12d3-a456-426614174000
```

**Trace request through logs:**
```bash
grep "123e4567-e89b-12d3-a456-426614174000" logs/app_*.log
```

### Performance Debugging:

**Check slow endpoints:**
```bash
# Response time is in X-Response-Time header
curl -I https://api.yourdomain.com/api/v1/dates

# Or check logs for SLOW REQUEST warnings
grep "SLOW REQUEST" logs/*.log | tail -20
```

---

## 📊 DAILY MONITORING CHECKLIST

### Morning Check (9 AM):
- [ ] Check Sentry for overnight errors
- [ ] Review Uptime Robot status
- [ ] Check MongoDB Atlas metrics
- [ ] Review server resource usage
- [ ] Check backup completion

### Afternoon Check (2 PM):
- [ ] Review peak traffic performance
- [ ] Check error rates
- [ ] Monitor response times
- [ ] Review any alerts

### Evening Check (6 PM):
- [ ] End-of-day Sentry review
- [ ] Check tomorrow's capacity
- [ ] Review any unusual patterns

---

## 📈 WEEKLY MONITORING TASKS

### Monday:
- Review previous week's error trends
- Analyze performance degradation
- Plan optimization work

### Wednesday:
- Check database index performance
- Review slow query logs
- Optimize if needed

### Friday:
- Weekly report generation
- Capacity planning review
- Backup verification

---

## 🎯 KEY PERFORMANCE INDICATORS (KPIs)

### Track These Weekly:

**Availability:**
```
Uptime % = (Total Time - Downtime) / Total Time * 100
Target: >99.9%
```

**Performance:**
```
Avg Response Time (p95) - Target: <500ms
Avg Response Time (p99) - Target: <1000ms
```

**Reliability:**
```
Error Rate = (Error Count / Total Requests) * 100
Target: <0.1%
```

**User Experience:**
```
Page Load Time - Target: <3s
API Response Time - Target: <500ms
```

---

## 🔧 TROUBLESHOOTING GUIDE

### Problem: High Error Rate

**Check:**
1. Sentry dashboard for error patterns
2. Database connection status
3. Recent deployments
4. External service status

**Action:**
```bash
# Check health
curl https://api.yourdomain.com/health

# Check logs
tail -100 logs/app_$(date +%Y%m%d).log | grep -i error

# Rollback if needed
./rollback.sh backups/TIMESTAMP
```

### Problem: Slow Response Times

**Check:**
1. Database query performance
2. Server resource usage (CPU/Memory)
3. Network latency
4. Connection pool usage

**Action:**
```bash
# Check MongoDB slow queries
# Go to Atlas → Performance Advisor

# Check server resources
top
free -m
df -h

# Enable query profiling temporarily
# See MongoDB docs
```

### Problem: Server Unresponsive

**Check:**
1. Server is running: `ps aux | grep node`
2. Port is listening: `netstat -tlnp | grep 3001`
3. Health endpoint: `curl localhost:3001/health`

**Action:**
```bash
# Restart services
./start-production.sh

# Or manual restart
pkill -f "node bin/www"
cd lesociety/latest/home/node/secret-time-next-api
node bin/www &
```

---

## 📱 MOBILE APP MONITORING

**For iOS/Android apps (future):**
- Use Sentry Mobile SDK
- Track crashes and errors
- Monitor app performance
- Track user sessions

---

## 🎓 TRAINING RESOURCES

### Learn More:
- **Sentry Docs:** https://docs.sentry.io
- **MongoDB Monitoring:** https://docs.atlas.mongodb.com/monitoring/
- **Node.js Performance:** https://nodejs.org/en/docs/guides/simple-profiling/
- **Express Best Practices:** https://expressjs.com/en/advanced/best-practice-performance.html

---

## ✅ MONITORING CHECKLIST

Before going live, ensure:
- [ ] Sentry configured and tested
- [ ] Uptime Robot monitors created
- [ ] MongoDB Atlas alerts configured
- [ ] Log aggregation set up (optional but recommended)
- [ ] Alert channels configured (email, Slack)
- [ ] Team trained on monitoring tools
- [ ] Runbook created for common issues
- [ ] On-call rotation established

---

**Monitoring is not optional - it's essential for production success!** 🚀

---

**Last Updated:** April 3, 2026  
**Maintained By:** DevOps Team  
**Review Schedule:** Monthly

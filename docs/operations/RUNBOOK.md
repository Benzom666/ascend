# 📖 Operations Runbook - Le Society

**Last Updated:** April 3, 2026  
**Purpose:** Day-to-day operations and incident response procedures

---

## 📋 TABLE OF CONTENTS

1. [Daily Operations](#daily-operations)
2. [Common Issues & Solutions](#common-issues--solutions)
3. [Incident Response](#incident-response)
4. [Maintenance Procedures](#maintenance-procedures)
5. [Scaling Guidelines](#scaling-guidelines)
6. [On-Call Procedures](#on-call-procedures)

---

## 🌅 DAILY OPERATIONS

### Morning Checklist (Start of Day)

**Time:** 9:00 AM (or start of business day)

- [ ] Check uptime monitoring dashboard
- [ ] Review overnight error logs (Sentry)
- [ ] Verify all services are running
- [ ] Check database connection status
- [ ] Review performance metrics
- [ ] Check backup completion status
- [ ] Review support tickets/user reports

**Tools:**
- UptimeRobot/Better Uptime dashboard
- Sentry error dashboard
- Hosting provider dashboard
- MongoDB Atlas monitoring

---

### Evening Checklist (End of Day)

**Time:** 6:00 PM (or end of business day)

- [ ] Review day's error rate
- [ ] Check for any pending alerts
- [ ] Verify automated backups scheduled
- [ ] Review performance trends
- [ ] Check storage usage
- [ ] Update incident log (if any)
- [ ] Prepare handoff notes for on-call

---

### Weekly Tasks

**Monday:**
- [ ] Review previous week's incidents
- [ ] Check database performance
- [ ] Review API response times
- [ ] Plan week's maintenance

**Wednesday:**
- [ ] Mid-week health check
- [ ] Review user growth metrics
- [ ] Check resource utilization

**Friday:**
- [ ] Week-in-review meeting
- [ ] Update documentation
- [ ] Plan weekend on-call coverage

---

## 🔧 COMMON ISSUES & SOLUTIONS

### Issue 1: API Responding Slowly

**Symptoms:**
- Response times > 2 seconds
- User complaints about slowness
- Timeout errors

**Diagnosis:**
```bash
# Check server resources
top
free -h

# Check database connections
# MongoDB Atlas → Metrics → Connections

# Check logs for slow queries
grep "slow query" /var/log/app.log
```

**Solutions:**

**Immediate (< 5 min):**
1. Restart application
   ```bash
   pm2 restart lesociety-api  # PM2
   # or
   # Restart via hosting dashboard
   ```

2. Check if specific endpoint is slow
   ```bash
   # Review Sentry performance
   # Identify slow endpoint
   ```

**Short-term (< 1 hour):**
1. Add database indexes
2. Enable response caching
3. Optimize slow queries

**Long-term:**
1. Scale horizontally (add instances)
2. Implement Redis caching
3. Database read replicas

---

### Issue 2: Database Connection Lost

**Symptoms:**
- Health check returns 503
- "MongoServerError" in logs
- Users can't login/load data

**Diagnosis:**
```bash
# Check MongoDB Atlas status
# https://cloud.mongodb.com/status

# Test connection
mongo "mongodb+srv://USER:PASS@HOST/DB" --eval "db.runCommand({ping:1})"

# Check IP whitelist
# MongoDB Atlas → Network Access
```

**Solutions:**

**Immediate:**
1. Check MongoDB Atlas status page
2. Verify IP whitelist includes current IP
3. Check credentials haven't expired
4. Restart application

**If Atlas is down:**
1. Check status: https://status.mongodb.com
2. Wait for service restoration
3. Monitor recovery
4. Post status update for users

**If credentials issue:**
1. Verify `.env` has correct credentials
2. Test with MongoDB Compass
3. Rotate credentials if compromised

---

### Issue 3: High Memory Usage

**Symptoms:**
- Memory > 80% of available
- Application restarts frequently
- OOM (Out of Memory) errors

**Diagnosis:**
```bash
# Check memory usage
free -h
pm2 monit  # If using PM2

# Check for memory leaks
node --inspect bin/www
# Then use Chrome DevTools
```

**Solutions:**

**Immediate:**
1. Restart application (frees memory)
   ```bash
   pm2 restart lesociety-api
   ```

2. Scale horizontally (add instance)

**Short-term:**
1. Reduce connection pool size
   ```javascript
   // In mongoose options
   maxPoolSize: 50 // from 100
   ```

2. Implement garbage collection
   ```bash
   node --expose-gc bin/www
   ```

**Long-term:**
1. Fix memory leaks in code
2. Upgrade instance size
3. Implement caching to reduce memory pressure

---

### Issue 4: High Error Rate

**Symptoms:**
- Sentry shows spike in errors
- User reports of errors
- Specific feature not working

**Diagnosis:**
```bash
# Check Sentry dashboard
# Filter by:
# - Time period
# - Error type
# - Affected endpoints

# Check logs
tail -f /var/log/app.log | grep ERROR

# Test affected endpoint
curl -X POST https://api.yourdomain.com/api/v1/endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Solutions:**

**If caused by recent deployment:**
1. Rollback to previous version
   ```bash
   git revert HEAD
   git push production main
   ```

**If caused by external service:**
1. Check service status pages
2. Implement fallback/graceful degradation
3. Contact service provider

**If caused by bad data:**
1. Identify bad records
2. Clean data or add validation
3. Deploy fix

---

### Issue 5: Users Can't Login

**Symptoms:**
- Login endpoint returns 401/500
- "Invalid token" errors
- User complaints

**Diagnosis:**
```bash
# Test login endpoint
curl -X POST https://api.yourdomain.com/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# Check JWT_SECRET_TOKEN exists
grep JWT_SECRET_TOKEN .env

# Check database has users
mongo "DB_URI" --eval "db.users.countDocuments()"
```

**Solutions:**

1. Verify JWT_SECRET_TOKEN configured
2. Check user exists in database
3. Verify password hashing works
4. Check CORS allows frontend domain

---

## 🚨 INCIDENT RESPONSE

### Severity Levels

**P0 - Critical (15 min response)**
- Complete service outage
- Data breach
- Payment system down
- Database corrupted

**P1 - High (1 hour response)**
- Partial service outage
- Login not working
- Major feature broken
- High error rate (>10%)

**P2 - Medium (4 hours response)**
- Minor feature broken
- Slow performance
- Non-critical errors

**P3 - Low (Next business day)**
- Cosmetic issues
- Enhancement requests
- Low-priority bugs

---

### Incident Response Process

**Step 1: Acknowledge (< 5 min)**
1. Acknowledge alert
2. Assess severity
3. Notify team if P0/P1

**Step 2: Investigate (< 15 min)**
1. Check health endpoints
2. Review error logs
3. Check recent deployments
4. Identify root cause

**Step 3: Mitigate (< 30 min)**
1. Apply immediate fix (restart, rollback, etc.)
2. Verify fix works
3. Update status page

**Step 4: Resolve (< 2 hours)**
1. Implement permanent fix
2. Deploy fix
3. Verify resolution
4. Close incident

**Step 5: Post-Mortem (< 24 hours)**
1. Document incident
2. Identify root cause
3. List action items
4. Update runbook

---

### Incident Response Template

```markdown
# Incident Report - [DATE]

## Summary
**Severity:** P0/P1/P2/P3  
**Start Time:** YYYY-MM-DD HH:MM UTC  
**End Time:** YYYY-MM-DD HH:MM UTC  
**Duration:** X minutes  
**Status:** Investigating/Mitigated/Resolved

## Impact
- Users affected: X
- Features affected: [List]
- Revenue impact: $X (if applicable)

## Timeline
- **HH:MM** - Alert triggered
- **HH:MM** - Incident acknowledged
- **HH:MM** - Root cause identified
- **HH:MM** - Fix deployed
- **HH:MM** - Incident resolved

## Root Cause
[Description of what caused the incident]

## Resolution
[What was done to fix it]

## Action Items
- [ ] Fix X
- [ ] Update documentation
- [ ] Improve monitoring
- [ ] Add tests

## Lessons Learned
[What we learned and how to prevent future incidents]
```

---

## 🔧 MAINTENANCE PROCEDURES

### Planned Maintenance Window

**Recommended Time:** Sunday 2:00 AM - 4:00 AM (lowest traffic)

**Notification:** 48 hours advance notice

**Template:**
```
Subject: Scheduled Maintenance - [DATE]

Le Society will undergo scheduled maintenance on [DATE] from 2:00 AM to 4:00 AM UTC.

During this time, the service may be temporarily unavailable.

Expected impact:
- Duration: Up to 2 hours
- Features affected: All

We apologize for any inconvenience.
```

**Checklist:**
- [ ] Schedule maintenance window
- [ ] Notify users (48h advance)
- [ ] Take database backup
- [ ] Create rollback plan
- [ ] Perform maintenance
- [ ] Verify all systems working
- [ ] Send completion notification

---

### Deploying Updates

**Procedure:**

1. **Pre-Deployment**
   ```bash
   # Run tests
   npm test
   
   # Check CI/CD passed
   # Review code changes
   # Create deployment tag
   git tag -a v1.0.1 -m "Release 1.0.1"
   git push origin v1.0.1
   ```

2. **Deployment**
   ```bash
   # Deploy to staging first
   git push staging main
   
   # Test on staging
   # Smoke test critical flows
   
   # Deploy to production
   git push production main
   ```

3. **Post-Deployment**
   ```bash
   # Monitor error rates (first 30 min)
   # Check performance metrics
   # Verify critical features work
   # Monitor user feedback
   ```

4. **Rollback (if needed)**
   ```bash
   # Revert to previous version
   git revert HEAD
   git push production main
   
   # Or rollback via hosting dashboard
   ```

---

## 📈 SCALING GUIDELINES

### When to Scale

**Horizontal Scaling (Add Instances):**
- CPU usage consistently > 70%
- Memory usage > 80%
- Response times degrading
- Increased traffic expected

**Vertical Scaling (Bigger Instance):**
- Single-instance bottleneck
- Memory-intensive operations
- CPU-bound operations

**Database Scaling:**
- Connection pool exhausted
- Query performance degrading
- Storage > 80% capacity

### How to Scale

**Horizontal:**
```bash
# Render
Dashboard → Settings → Scaling → Add Instance

# Railway
railway up --replicas 3

# Heroku
heroku ps:scale web=3
```

**Vertical:**
```bash
# Render
Dashboard → Settings → Instance Type → Upgrade

# Heroku
heroku ps:resize web=standard-2x
```

---

## 📞 ON-CALL PROCEDURES

### On-Call Schedule

**Rotation:** Weekly (Monday - Sunday)

**Responsibilities:**
- Respond to P0/P1 incidents
- Monitor alerts
- Escalate when needed

### On-Call Checklist

**Start of Shift:**
- [ ] Test alert notifications work
- [ ] Review system status
- [ ] Check for scheduled maintenance
- [ ] Read handoff notes
- [ ] Have laptop/phone charged

**During Shift:**
- [ ] Respond to alerts within SLA
- [ ] Document all incidents
- [ ] Escalate if needed
- [ ] Keep status page updated

**End of Shift:**
- [ ] Hand off any ongoing incidents
- [ ] Document actions taken
- [ ] Update runbook if learned something new

---

## 🔗 Quick Links

### Dashboards:
- Uptime: https://uptimerobot.com/dashboard
- Errors: https://sentry.io/organizations/yourorg
- Hosting: [Your hosting provider]
- Database: https://cloud.mongodb.com

### Documentation:
- API Docs: `APPLICATION_ARCHITECTURE.md`
- Deployment: `DEPLOYMENT_GUIDE.md`
- Backups: `BACKUP_DISASTER_RECOVERY.md`
- Monitoring: `MONITORING_SETUP.md`

### Emergency Contacts:
- On-Call Engineer: [Phone]
- Lead Developer: [Phone]
- CTO: [Phone]
- MongoDB Support: support.mongodb.com
- Hosting Support: [Provider support]

---

**Maintained by:** Operations Team  
**Last Review:** April 3, 2026  
**Next Review:** July 3, 2026

# 📊 Monitoring Dashboard Configuration - Le Society

**Last Updated:** April 4, 2026  
**Version:** 1.0

---

## 🎯 OVERVIEW

This guide provides configurations for setting up comprehensive monitoring dashboards for the Le Society platform using various monitoring tools.

---

## TABLE OF CONTENTS

1. [Monitoring Stack](#monitoring-stack)
2. [Health Check Endpoints](#health-check-endpoints)
3. [UptimeRobot Setup](#uptimerobot-setup)
4. [Grafana + Prometheus](#grafana--prometheus)
5. [CloudWatch (AWS)](#cloudwatch-aws)
6. [Custom Dashboard](#custom-dashboard)
7. [Alert Configuration](#alert-configuration)

---

## MONITORING STACK

### Recommended Tools

**Free/Starter:**
- ✅ UptimeRobot (uptime monitoring)
- ✅ Sentry (error tracking)
- ✅ LogRocket (session replay)
- ✅ Google Analytics (user analytics)

**Advanced:**
- Grafana + Prometheus (metrics)
- DataDog (APM)
- New Relic (APM)
- CloudWatch (AWS native)

---

## HEALTH CHECK ENDPOINTS

### Implement Health Checks

**Create health check endpoint:**

```javascript
// File: lesociety/latest/home/node/secret-time-next-api/routes/health.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * Basic health check
 * GET /health
 */
router.get('/', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    service: 'lesociety-api',
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    res.status(200).json(health);
  } catch (error) {
    health.status = 'ERROR';
    res.status(503).json(health);
  }
});

/**
 * Detailed health check (includes dependencies)
 * GET /health/detailed
 */
router.get('/detailed', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    service: 'lesociety-api',
    version: process.env.npm_package_version || '1.0.0',
    status: 'OK',
    checks: {}
  };

  // Database check
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.checks.database = {
        status: 'UP',
        responseTime: 0,
        details: {
          type: 'MongoDB',
          readyState: mongoose.connection.readyState
        }
      };
    } else {
      health.checks.database = {
        status: 'DOWN',
        details: { readyState: mongoose.connection.readyState }
      };
      health.status = 'DEGRADED';
    }
  } catch (error) {
    health.checks.database = {
      status: 'DOWN',
      error: error.message
    };
    health.status = 'DEGRADED';
  }

  // Memory check
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    status: memUsage.heapUsed < memUsage.heapTotal * 0.9 ? 'OK' : 'WARNING',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100) + '%'
  };

  // External services (optional)
  health.checks.supabase = { status: 'UNKNOWN', note: 'Check manually' };
  health.checks.sendgrid = { status: 'UNKNOWN', note: 'Check manually' };

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Readiness check (for k8s/load balancers)
 * GET /health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ ready: false, reason: 'Database not connected' });
    }

    // Check if can query database
    await mongoose.connection.db.admin().ping();

    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, reason: error.message });
  }
});

/**
 * Liveness check (for k8s)
 * GET /health/live
 */
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

module.exports = router;
```

**Register routes in app.js:**

```javascript
// In lesociety/latest/home/node/secret-time-next-api/app.js
const healthRoutes = require('./routes/health');
app.use('/health', healthRoutes);
```

---

## UPTIMEROBOT SETUP

### Free Uptime Monitoring

**Setup Steps:**

1. **Create Account:** https://uptimerobot.com
2. **Add Monitors:**

**Monitor 1: API Health**
```
Type: HTTP(S)
Name: Le Society API - Health
URL: https://your-api-domain.com/health
Interval: 5 minutes
Expected Status: 200
```

**Monitor 2: Frontend**
```
Type: HTTP(S)
Name: Le Society Frontend
URL: https://your-domain.com
Interval: 5 minutes
Alert When: Down
```

**Monitor 3: API Endpoint**
```
Type: HTTP(S)
Name: Le Society API - Endpoint
URL: https://your-api-domain.com/api/v1/
Interval: 5 minutes
Expected Status: 200
```

3. **Alert Contacts:**
   - Add email
   - Add Slack webhook
   - Add SMS (paid)

4. **Status Page:**
   - Create public status page
   - Add all monitors
   - Share with users

---

## GRAFANA + PROMETHEUS

### Complete Metrics Stack

**1. Install Prometheus Client**

```bash
cd lesociety/latest/home/node/secret-time-next-api
npm install prom-client
```

**2. Create Metrics Endpoint**

```javascript
// File: lib/metrics.js
const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users'
});

const databaseQueryDuration = new promClient.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'collection'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeUsers);
register.registerMetric(databaseQueryDuration);

module.exports = {
  register,
  httpRequestDuration,
  httpRequestTotal,
  activeUsers,
  databaseQueryDuration
};
```

**3. Metrics Middleware**

```javascript
// File: middleware/metrics.js
const { httpRequestDuration, httpRequestTotal } = require('../lib/metrics');

module.exports = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};
```

**4. Metrics Endpoint**

```javascript
// In app.js
const metricsMiddleware = require('./middleware/metrics');
const { register } = require('./lib/metrics');

// Add middleware
app.use(metricsMiddleware);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

**5. Prometheus Configuration**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'lesociety-api'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

**6. Grafana Dashboard JSON**

```json
{
  "dashboard": {
    "title": "Le Society - Application Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Request Duration (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Database Query Duration",
        "targets": [
          {
            "expr": "rate(database_query_duration_seconds_sum[5m]) / rate(database_query_duration_seconds_count[5m])"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

---

## CLOUDWATCH (AWS)

### AWS CloudWatch Setup

**1. Install CloudWatch SDK**

```bash
npm install aws-sdk
```

**2. CloudWatch Logger**

```javascript
// File: lib/cloudwatch.js
const AWS = require('aws-sdk');

const cloudwatch = new AWS.CloudWatch({
  region: process.env.AWS_REGION || 'us-east-1'
});

const sendMetric = (metricName, value, unit = 'Count') => {
  const params = {
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date()
      }
    ],
    Namespace: 'LeSociety/API'
  };

  cloudwatch.putMetricData(params, (err, data) => {
    if (err) console.error('CloudWatch error:', err);
  });
};

module.exports = { sendMetric };
```

**3. Usage Example**

```javascript
const { sendMetric } = require('../lib/cloudwatch');

// In your route handlers
router.post('/login', async (req, res) => {
  try {
    // ... login logic
    sendMetric('LoginSuccess', 1);
  } catch (error) {
    sendMetric('LoginFailure', 1);
  }
});
```

---

## CUSTOM DASHBOARD

### Simple HTML Dashboard

**Create monitoring dashboard:**

```html
<!-- File: public/dashboard.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Le Society - Monitoring Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    .metric-card { 
      background: white; 
      padding: 20px; 
      margin: 10px; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: inline-block;
      min-width: 200px;
    }
    .metric-value { font-size: 32px; font-weight: bold; color: #2196F3; }
    .metric-label { color: #666; margin-top: 5px; }
    .status-ok { color: #4CAF50; }
    .status-warning { color: #FF9800; }
    .status-error { color: #F44336; }
    .refresh { 
      background: #2196F3; 
      color: white; 
      padding: 10px 20px; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer; 
      margin: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Le Society - System Monitor</h1>
    <button class="refresh" onclick="loadMetrics()">Refresh</button>
    <span id="last-update"></span>
    
    <div id="metrics"></div>
    
    <h2>Health Status</h2>
    <div id="health"></div>
  </div>

  <script>
    async function loadMetrics() {
      try {
        // Load health status
        const healthRes = await fetch('/health/detailed');
        const health = await healthRes.json();
        
        displayHealth(health);
        
        // Update timestamp
        document.getElementById('last-update').textContent = 
          'Last updated: ' + new Date().toLocaleTimeString();
          
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    }
    
    function displayHealth(health) {
      const healthDiv = document.getElementById('health');
      let html = `<div class="metric-card">
        <div class="metric-label">Overall Status</div>
        <div class="metric-value status-${health.status.toLowerCase()}">${health.status}</div>
      </div>`;
      
      html += `<div class="metric-card">
        <div class="metric-label">Uptime</div>
        <div class="metric-value">${Math.floor(health.uptime / 3600)}h</div>
      </div>`;
      
      if (health.checks) {
        for (const [key, value] of Object.entries(health.checks)) {
          html += `<div class="metric-card">
            <div class="metric-label">${key}</div>
            <div class="metric-value status-${value.status.toLowerCase()}">${value.status}</div>
            ${value.details ? `<div style="font-size:12px;margin-top:5px;">${JSON.stringify(value.details)}</div>` : ''}
          </div>`;
        }
      }
      
      healthDiv.innerHTML = html;
    }
    
    // Auto-refresh every 30 seconds
    setInterval(loadMetrics, 30000);
    
    // Initial load
    loadMetrics();
  </script>
</body>
</html>
```

---

## ALERT CONFIGURATION

### Alert Rules

**1. Critical Alerts (Immediate Action)**

```javascript
// File: lib/alerts.js
const sendAlert = async (severity, message, details) => {
  const alert = {
    timestamp: new Date().toISOString(),
    severity, // 'critical', 'warning', 'info'
    message,
    details,
    service: 'lesociety-api'
  };
  
  console.error('ALERT:', JSON.stringify(alert));
  
  // Send to Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 ${severity.toUpperCase()}: ${message}`,
        attachments: [{
          color: severity === 'critical' ? 'danger' : 'warning',
          fields: Object.entries(details).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true
          }))
        }]
      })
    });
  }
  
  // Send email for critical alerts
  if (severity === 'critical' && process.env.ALERT_EMAIL) {
    // Send email using SendGrid
  }
};

module.exports = { sendAlert };
```

**2. Alert Conditions**

```javascript
// In middleware or monitoring script
const { sendAlert } = require('../lib/alerts');

// Database connection lost
mongoose.connection.on('disconnected', () => {
  sendAlert('critical', 'Database connection lost', {
    timestamp: Date.now(),
    service: 'MongoDB'
  });
});

// High memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  const heapPercentage = (usage.heapUsed / usage.heapTotal) * 100;
  
  if (heapPercentage > 90) {
    sendAlert('warning', 'High memory usage', {
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      percentage: `${Math.round(heapPercentage)}%`
    });
  }
}, 60000); // Check every minute

// Slow API responses
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 5000) {
      sendAlert('warning', 'Slow API response', {
        endpoint: req.path,
        duration: `${duration}ms`,
        method: req.method
      });
    }
  });
  next();
});
```

---

## METRICS TO MONITOR

### Application Metrics
- ✅ Request rate (requests/second)
- ✅ Response time (p50, p95, p99)
- ✅ Error rate (5xx responses)
- ✅ Active connections
- ✅ Queue lengths

### Business Metrics
- 📊 User signups per day
- 📊 Dates created per day
- 📊 Messages sent per day
- 📊 Token purchases per day
- 📊 Active users (DAU/MAU)

### Infrastructure Metrics
- 💻 CPU usage
- 💻 Memory usage
- 💻 Disk usage
- 💻 Network I/O
- 💻 Database connections

### Database Metrics
- 🗄️ Query response time
- 🗄️ Connection pool usage
- 🗄️ Slow queries
- 🗄️ Index usage
- 🗄️ Collection sizes

---

## IMPLEMENTATION CHECKLIST

- [ ] Health check endpoints created
- [ ] UptimeRobot configured
- [ ] Prometheus metrics exported
- [ ] Grafana dashboard created
- [ ] Alert webhooks configured
- [ ] Custom dashboard deployed
- [ ] Error tracking (Sentry) setup
- [ ] Log aggregation setup
- [ ] Performance monitoring enabled
- [ ] Business metrics tracked

---

**Last Updated:** April 4, 2026  
**Maintained By:** DevOps Team

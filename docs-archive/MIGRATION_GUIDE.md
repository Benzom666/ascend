# LESOCIETY Migration Guide
## From AWS EC2 to Cost-Effective Alternatives

---

## 📊 Current State Analysis

### Current Issues Fixed ✅
- [x] **SECURITY**: Removed hardcoded MongoDB credentials from:
  - `check-user.js`
  - `restore-db.js`  
  - `app.js`
- [x] **COST OPTIMIZATION**: 
  - Disabled mongoose debug in production
  - Reduced Winston logging (warn level in prod)
  - Added connection pooling
  - Optimized CORS (no more wildcard `*`)
- [x] **ENV TEMPLATE**: Created `.env.template` with all required variables

### Current AWS Costs (Estimated)
| Service | Current Cost/Month |
|---------|-------------------|
| EC2 (t3.medium) | ~$30-40 |
| Data Transfer | ~$10-20 |
| CloudWatch Logs | ~$5-10 |
| **Total** | **~$45-70/month** |

---

## 🚀 Migration Options

### Option A: VPS (DigitalOcean, Linode, Vultr)
**Best for**: Predictable workloads, full control, simple architecture

| Provider | Plan | Specs | Price/Month |
|----------|------|-------|-------------|
| **DigitalOcean** | Basic Premium | 2 vCPU, 2GB RAM | **$14** |
| **Linode** | Shared 4GB | 2 vCPU, 4GB RAM | **$24** |
| **Vultr** | Cloud Compute | 2 vCPU, 2GB RAM | **$10** |

**Pros:**
- ✅ 60-80% cheaper than AWS EC2
- ✅ Predictable monthly pricing
- ✅ Simple pricing (no surprise bills)
- ✅ Full root access
- ✅ Easy to migrate (just move Node.js app)
- ✅ Free backup snapshots

**Cons:**
- ❌ Manual scaling (need to resize droplet)
- ❌ No built-in load balancing
- ❌ Manual server management (updates, security)

**Migration Effort**: ⭐⭐ Low (1-2 days)

**Estimated New Cost**: **$10-24/month** (70% savings)

---

### Option B: Serverless (Vercel Functions + MongoDB Atlas)
**Best for**: Variable traffic, pay-per-use, modern architecture

| Service | Pricing Model | Est. Cost/Month |
|---------|---------------|-----------------|
| **Vercel Functions** | $0.60 per 100GB-hrs + $0.15/GB execution | **$0-20** |
| **MongoDB Atlas** | Shared M0 (free) to M10 ($57) | **$0-57** |

**Pros:**
- ✅ Pay only for what you use
- ✅ Auto-scaling to zero (no idle costs)
- ✅ No server management
- ✅ Global edge deployment
- ✅ Free tier for low traffic

**Cons:**
- ❌ Cold start latency (100-500ms)
- ❌ MongoDB connection limits (need connection pooling)
- ❌ 10s timeout on free plan, 60s on pro
- ❌ Requires code refactoring (Express → Serverless functions)
- ❌ File uploads need S3/R2

**Migration Effort**: ⭐⭐⭐⭐ High (1-2 weeks)

**Code Changes Required:**
```javascript
// BEFORE: Express app
app.get('/api/users', (req, res) => { ... });

// AFTER: Vercel function
export default function handler(req, res) {
  // Need to handle MongoDB connection caching
}
```

**Estimated New Cost**: **$0-40/month** (90% savings for low traffic, 40% for high traffic)

---

### Option C: Container (Docker + AWS ECS Fargate)
**Best for**: AWS ecosystem, containerized apps, moderate scaling

| Component | Price | Notes |
|-----------|-------|-------|
| **ECS Fargate** | ~$30-50/month | 0.25 vCPU, 0.5GB RAM always running |
| **Application Load Balancer** | ~$16-22/month | Required for HTTPS |
| **Data Transfer** | ~$5-10/month | |
| **CloudWatch** | ~$2-5/month | Reduced with optimizations |

**Pros:**
- ✅ Still on AWS (familiar ecosystem)
- ✅ No server management (AWS handles OS)
- ✅ Easy horizontal scaling
- ✅ Works with existing Docker setup
- ✅ Can use spot instances for 70% savings

**Cons:**
- ❌ Still on AWS (complex pricing)
- ❌ Requires Docker knowledge
- ❌ Application Load Balancer adds cost
- ❌ Not as cheap as VPS for steady workloads

**Migration Effort**: ⭐⭐⭐ Medium (2-3 days)

**Estimated New Cost**: **$35-60/month** (10-20% savings with optimizations, or use Spot for 70% savings → **$10-20/month**)

---

## 📈 Decision Matrix

| Criteria | VPS (Option A) | Serverless (Option B) | ECS Fargate (Option C) |
|----------|---------------|----------------------|----------------------|
| **Monthly Cost** | ⭐⭐⭐⭐⭐ $10-24 | ⭐⭐⭐⭐⭐ $0-40 | ⭐⭐⭐ $35-60 (or $10-20 with Spot) |
| **Migration Ease** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐ Hard | ⭐⭐⭐ Medium |
| **Scalability** | ⭐⭐ Manual | ⭐⭐⭐⭐⭐ Auto | ⭐⭐⭐⭐ Auto |
| **Maintenance** | ⭐⭐ High | ⭐⭐⭐⭐⭐ None | ⭐⭐⭐⭐ Low |
| **Performance** | ⭐⭐⭐⭐⭐ Consistent | ⭐⭐⭐ Cold starts | ⭐⭐⭐⭐ Consistent |
| **Vendor Lock-in** | ⭐⭐⭐⭐ Low | ⭐⭐ High (Vercel) | ⭐⭐⭐ AWS |

---

## 🎯 Recommended Approach

### For Immediate Cost Savings (This Week):
**Go with Option A - VPS (DigitalOcean/Linode)**
1. Create droplet with Node.js pre-installed
2. Clone repository
3. `npm install --production`
4. Set up PM2 process manager
5. Configure Nginx reverse proxy
6. Update DNS
7. **Estimated savings: $30-50/month**

### For Long-term Optimization (Next Quarter):
Consider Option B (Serverless) if:
- Traffic is sporadic
- You want to modernize the architecture
- Dev team has bandwidth for refactoring

---

## 🛠️ VPS Migration Steps (Detailed)

### 1. Provision Server
```bash
# On DigitalOcean
# - Choose Ubuntu 22.04 LTS
# - Select Basic $14/month (2GB RAM)
# - Add SSH key
# - Create
```

### 2. Server Setup
```bash
# SSH into server
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install Git (if cloning from repo)
apt install git -y
```

### 3. Deploy Application
```bash
# Create app directory
mkdir -p /var/www/lesoceity
cd /var/www/lesoceity

# Clone repository
git clone https://github.com/your-repo/lesoceity.git .

# Install dependencies (production only)
cd lesociety/latest/home/node/secret-time-next-api
npm install --production

# Create .env file
nano .env
# (Paste contents from .env.template)

# Create logs directory
mkdir -p logs
```

### 4. Configure PM2
```bash
# Start with PM2
pm2 start app.js --name "lesoceity-api"

# Save PM2 config
pm2 save
pm2 startup
```

### 5. Configure Nginx
```bash
nano /etc/nginx/sites-available/lesoceity
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/lesoceity /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. SSL with Let's Encrypt
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.yourdomain.com
```

### 7. MongoDB Atlas IP Whitelist
Don't forget to add your new VPS IP to MongoDB Atlas Network Access!

---

## 💰 Cost Comparison Summary

| Option | Monthly Cost | Setup Time | Annual Savings |
|--------|--------------|------------|----------------|
| **Current AWS** | $45-70 | - | - |
| **VPS (DigitalOcean)** | $14 | 2 hours | **$372-672** |
| **VPS (Vultr)** | $10 | 2 hours | **$420-720** |
| **Serverless** | $0-40 | 1-2 weeks | **$60-840** |
| **ECS Fargate (Spot)** | $10-20 | 1 day | **$300-720** |

---

## ✅ Pre-Migration Checklist

- [ ] Backup current database
- [ ] Document all environment variables
- [ ] Test app locally with production build
- [ ] Set up monitoring (UptimeRobot - free)
- [ ] Configure log rotation on new server
- [ ] Update DNS TTL to 300 seconds (before migration)
- [ ] Create rollback plan

---

## 📞 Support Resources

- **DigitalOcean**: $200 free credit for 60 days (new accounts)
- **Linode**: $100 free credit for 60 days
- **Vercel**: Generous free tier
- **MongoDB Atlas**: M0 free tier available

---

*Generated: 2026-02-10*
*Project: LESOCIETY API*

# 🚀 Production Deployment Guide - Le Society

**Last Updated:** April 3, 2026  
**Status:** Production Ready (after credential rotation)

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Platform-Specific Guides](#platform-specific-guides)
   - [Render.com](#rendercom-recommended)
   - [Railway.app](#railwayapp)
   - [Heroku](#heroku)
   - [AWS EC2](#aws-ec2)
   - [DigitalOcean](#digitalocean)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Post-Deployment Checklist](#post-deployment-checklist)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 PREREQUISITES

### Before Deployment:

✅ **All credentials rotated** (see `CREDENTIAL_ROTATION_GUIDE.md`)
- [ ] MongoDB password changed
- [ ] JWT secrets regenerated
- [ ] GitHub token revoked and replaced
- [ ] API keys rotated (Supabase, SendGrid, BucksBus)

✅ **Tests passing**
```bash
cd lesociety/latest/home/node/secret-time-next-api
npm test
# All tests should pass
```

✅ **Environment variables prepared**
- Backend `.env` configured
- Frontend `.env` configured
- Production values ready

✅ **Code committed to Git**
```bash
git status
# Should be clean or have only intentional changes
```

---

## 🌐 PLATFORM-SPECIFIC GUIDES

### Render.com (Recommended)

**Why Render:**
- Free tier available
- Automatic HTTPS
- Easy MongoDB Atlas integration
- Auto-deploy from Git
- Built-in monitoring

#### Backend Deployment (API)

**Step 1: Create Web Service**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   ```
   Name: lesociety-api
   Environment: Node
   Region: Oregon (or closest to users)
   Branch: main
   Root Directory: lesociety/latest/home/node/secret-time-next-api
   Build Command: npm install
   Start Command: node bin/www
   ```

**Step 2: Environment Variables**

Add all from `.env.example`:
```
MONGO_USER=your_rotated_user
MONGO_PASS=your_rotated_password
MONGO_HOST=lesociety.lalld11.mongodb.net
DB_NAME=lesociety
JWT_SECRET=your_new_secret_64_bytes
JWT_SECRET_TOKEN=your_new_token_64_bytes
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key
SENDGRID_API_KEY=your_key
```

**Step 3: Deploy**

Click "Create Web Service" - Render will:
- Install dependencies
- Run build
- Start application
- Assign URL: `https://lesociety-api.onrender.com`

#### Frontend Deployment (Next.js)

**Option A: Vercel (Recommended for Next.js)**

1. Go to [Vercel](https://vercel.com)
2. Import GitHub repository
3. Configure:
   ```
   Framework: Next.js
   Root Directory: lesociety/latest/home/node/secret-time-next
   ```
4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://lesociety-api.onrender.com
   NEXT_PUBLIC_SOCKET_URL=https://lesociety-api.onrender.com
   NEXT_PUBLIC_ENV=production
   ```
5. Deploy

**Option B: Render Static Site**

1. New → Static Site
2. Configure:
   ```
   Build Command: npm run build
   Publish Directory: out
   ```

#### Custom Domain Setup

1. In Render dashboard → Settings → Custom Domain
2. Add your domain: `api.yourdomain.com`
3. Update DNS with provided CNAME
4. Wait for DNS propagation (5-30 min)
5. HTTPS automatically provisioned

---

### Railway.app

**Why Railway:**
- Simple deployment
- Generous free tier
- Built-in databases
- GitHub integration

#### Deployment Steps

**Step 1: Create Project**

1. Go to [Railway](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository

**Step 2: Add Services**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Add environment variables
railway variables set MONGO_USER=your_user
railway variables set MONGO_PASS=your_password
# ... (add all env vars)

# Deploy
railway up
```

**Step 3: Configure Start Command**

In `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd lesociety/latest/home/node/secret-time-next-api && node bin/www",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### Heroku

**Why Heroku:**
- Mature platform
- Add-ons ecosystem
- Easy scaling

#### Deployment Steps

**Step 1: Install Heroku CLI**
```bash
brew install heroku/brew/heroku  # macOS
# or
curl https://cli-assets.heroku.com/install.sh | sh  # Linux
```

**Step 2: Create App**
```bash
heroku login
heroku create lesociety-api

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Set root directory
heroku config:set PROJECT_PATH=lesociety/latest/home/node/secret-time-next-api
```

**Step 3: Configure Environment**
```bash
heroku config:set MONGO_USER=your_user
heroku config:set MONGO_PASS=your_password
heroku config:set JWT_SECRET_TOKEN=your_secret
heroku config:set NODE_ENV=production
# ... (all other env vars)
```

**Step 4: Create Procfile**

`Procfile` in root:
```
web: cd lesociety/latest/home/node/secret-time-next-api && node bin/www
```

**Step 5: Deploy**
```bash
git push heroku main
heroku open
```

---

### AWS EC2

**Why AWS:**
- Full control
- Scalable
- Enterprise-grade

#### Deployment Steps

**Step 1: Launch EC2 Instance**

1. AWS Console → EC2 → Launch Instance
2. Choose Ubuntu 22.04 LTS
3. Instance type: t3.small (minimum)
4. Security Group: Allow ports 22, 80, 443, 3001
5. Create and download key pair

**Step 2: Connect and Setup**

```bash
# Connect
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Clone repository
git clone https://github.com/Benzom666/v2.git
cd v2/lesociety/latest/home/node/secret-time-next-api
```

**Step 3: Configure Environment**

```bash
# Create .env file
nano .env
# Paste your production environment variables
# Save (Ctrl+X, Y, Enter)

# Install dependencies
npm install --production
```

**Step 4: Setup PM2**

```bash
# Start application
pm2 start bin/www --name lesociety-api

# Configure auto-start on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs lesociety-api
```

**Step 5: Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/lesociety
```

Add:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lesociety /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Step 6: Setup SSL (Let's Encrypt)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

### DigitalOcean

**Why DigitalOcean:**
- Simple pricing
- Good documentation
- App Platform (PaaS option)

#### Option A: App Platform (Easier)

1. Create account at [DigitalOcean](https://www.digitalocean.com)
2. Apps → Create App
3. Connect GitHub repository
4. Configure:
   ```
   Source: GitHub repo
   Branch: main
   Type: Web Service
   Run Command: cd lesociety/latest/home/node/secret-time-next-api && node bin/www
   ```
5. Add environment variables
6. Deploy

#### Option B: Droplet (More Control)

Similar to AWS EC2 steps above, but:
```bash
# Create Droplet with Ubuntu 22.04
# SSH into droplet
ssh root@your-droplet-ip

# Follow same steps as AWS EC2
```

---

## ⚙️ ENVIRONMENT CONFIGURATION

### Production Environment Variables

**Backend (API):**
```bash
# Database
MONGO_USER=production_user
MONGO_PASS=strong_rotated_password
MONGO_HOST=lesociety.lalld11.mongodb.net
DB_NAME=lesociety

# Application
NODE_ENV=production
PORT=3001
APP_URL=https://api.yourdomain.com

# Security
JWT_SECRET=your_new_64_byte_secret
JWT_SECRET_TOKEN=your_new_64_byte_token
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS (IMPORTANT!)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# File Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_key
SUPABASE_STORAGE_BUCKET=lesociety-production

# Email
SENDGRID_API_KEY=your_production_key
MAIL_FROM=noreply@yourdomain.com

# Payment
BUCKSBUS_API_KEY=your_production_key
BUCKSBUS_API_SECRET=your_production_secret
BUCKSBUS_WEBHOOK_SECRET=your_webhook_secret

# Monitoring
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENVIRONMENT=production

# Cron
ENABLE_CRON=true
CRON_INTERVAL=*/10 * * * *
```

**Frontend (Next.js):**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENV=production
```

---

## 🗄️ DATABASE SETUP

### MongoDB Atlas Production Configuration

**Step 1: Create Production Cluster (if not exists)**

1. Login to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster or use existing
3. Tier: M10 or higher (for production)

**Step 2: Security**

1. **Database Access:**
   - Create new user (NOT the one from development)
   - Username: `lesociety_prod_user`
   - Password: Strong, randomly generated (32+ chars)
   - Privileges: Read and write to `lesociety` database only

2. **Network Access:**
   - Remove `0.0.0.0/0` (allows all IPs - INSECURE!)
   - Add specific IPs:
     - Your deployment platform's IPs
     - Or use Cloud Provider IP ranges
   
**Step 3: Connection String**

```
mongodb+srv://lesociety_prod_user:PASSWORD@lesociety.lalld11.mongodb.net/lesociety?retryWrites=true&w=majority
```

**Step 4: Backup**

1. Navigate to: Backup tab
2. Enable automatic backups
3. Configure retention: 7 days minimum
4. Test restore procedure

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Immediate (First Hour):

- [ ] Application accessible at production URL
- [ ] Health check endpoint working: `GET /health`
- [ ] Login works with test credentials
- [ ] Database connection successful
- [ ] SSL/HTTPS working (green padlock)
- [ ] CORS allows your frontend domain
- [ ] API responds within 2 seconds
- [ ] No errors in logs

### Within 24 Hours:

- [ ] Test all critical user flows
- [ ] Verify file uploads work
- [ ] Test payment integration
- [ ] Verify email sending works
- [ ] Check error tracking (Sentry)
- [ ] Monitor resource usage (CPU, memory)
- [ ] Set up uptime monitoring
- [ ] Configure alerts
- [ ] Test backup/restore

### Ongoing:

- [ ] Monitor error rates
- [ ] Check response times
- [ ] Review security logs
- [ ] Database performance
- [ ] Storage usage
- [ ] Cost optimization

---

## 🔧 TROUBLESHOOTING

### Application Won't Start

**Check logs:**
```bash
# Render
Dashboard → Logs

# Railway
railway logs

# Heroku
heroku logs --tail

# PM2 (EC2/Droplet)
pm2 logs lesociety-api
```

**Common issues:**
1. Missing environment variables
   - Solution: Verify all required vars set
2. Port binding issues
   - Solution: Use `process.env.PORT || 3001`
3. Database connection failed
   - Solution: Check IP whitelist, credentials

### Database Connection Errors

```
Error: MongoServerError: Authentication failed
```
**Solution:** Verify MongoDB credentials, check IP whitelist

```
Error: Connection timeout
```
**Solution:** Check network access rules, firewall

### CORS Errors

```
Access to fetch blocked by CORS policy
```
**Solution:** Add frontend domain to `ALLOWED_ORIGINS`

### High Memory Usage

- Check for memory leaks
- Reduce connection pool size
- Enable response compression
- Implement caching

### Slow Response Times

- Add database indexes
- Implement Redis caching
- Optimize database queries
- Enable CDN for static assets

---

## 📞 SUPPORT RESOURCES

### Platform Documentation:
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Heroku Docs](https://devcenter.heroku.com)
- [AWS Docs](https://docs.aws.amazon.com)

### Emergency Contacts:
- MongoDB Support: support.mongodb.com
- Hosting Provider Support
- Your team's on-call engineer

---

**Next:** See `OPERATIONS_RUNBOOK.md` for day-to-day operations

---

**Created by:** Deployment Guide Generator  
**Date:** April 3, 2026

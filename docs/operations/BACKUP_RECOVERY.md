# 💾 Backup & Disaster Recovery Plan

**Last Updated:** April 3, 2026  
**Critical:** Execute backup procedures immediately after deployment

---

## 📋 TABLE OF CONTENTS

1. [Backup Strategy](#backup-strategy)
2. [MongoDB Backup](#mongodb-backup)
3. [File Storage Backup](#file-storage-backup)
4. [Application Code Backup](#application-code-backup)
5. [Disaster Recovery Procedures](#disaster-recovery-procedures)
6. [Testing Backups](#testing-backups)

---

## 🎯 BACKUP STRATEGY

### RPO & RTO Targets

**RPO (Recovery Point Objective):** Maximum acceptable data loss
- **Critical data:** 1 hour
- **User uploads:** 24 hours
- **Logs:** 7 days

**RTO (Recovery Time Objective):** Maximum acceptable downtime
- **Complete outage:** 4 hours
- **Degraded service:** 1 hour
- **Data corruption:** 2 hours

### Backup Schedule

| Data Type | Frequency | Retention | Location |
|-----------|-----------|-----------|----------|
| **Database** | Every 6 hours | 30 days | MongoDB Atlas + S3 |
| **User Uploads** | Daily | 90 days | Supabase + backup |
| **Application Code** | On every commit | Indefinite | GitHub |
| **Configuration** | On change | 90 days | Encrypted vault |
| **Logs** | Continuous | 30 days | Log aggregation service |

---

## 🗄️ MONGODB BACKUP

### Automated Backups (MongoDB Atlas)

**Step 1: Enable Continuous Backups**

1. Login to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster
3. Click "Backup" tab
4. Enable "Continuous Backup"
   - Point-in-time restore
   - Automatic snapshots every 6 hours
   - Retention: 30 days

**Step 2: Configure Backup Schedule**

```
Snapshot Frequency: Every 6 hours
Snapshot Retention:
  - Daily: Keep for 7 days
  - Weekly: Keep for 4 weeks
  - Monthly: Keep for 12 months
```

**Step 3: Configure Alerts**

1. Alerts → Add Alert
2. Configure:
   ```
   Alert Type: Backup failure
   Notification: Email + Slack
   Frequency: Immediately
   ```

---

### Manual Backup (On-Demand)

**Using mongodump:**

```bash
# Install MongoDB tools
brew install mongodb/brew/mongodb-database-tools  # macOS
# or
sudo apt install mongodb-database-tools  # Linux

# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup entire database
mongodump \
  --uri="mongodb+srv://USER:PASS@lesociety.lalld11.mongodb.net/lesociety" \
  --out=backups/$(date +%Y%m%d)/lesociety-backup

# Compress backup
tar -czf backups/lesociety-$(date +%Y%m%d-%H%M%S).tar.gz \
  backups/$(date +%Y%m%d)

# Upload to S3 (optional)
aws s3 cp backups/lesociety-$(date +%Y%m%d-%H%M%S).tar.gz \
  s3://your-backup-bucket/database/
```

**Automated Daily Backup Script:**

Create `backup-database.sh`:
```bash
#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d-%H%M%S)
MONGO_URI="mongodb+srv://USER:PASS@HOST/DB"
RETENTION_DAYS=30

# Create backup
mkdir -p ${BACKUP_DIR}/${DATE}
mongodump --uri="${MONGO_URI}" --out=${BACKUP_DIR}/${DATE}

# Compress
tar -czf ${BACKUP_DIR}/lesociety-${DATE}.tar.gz ${BACKUP_DIR}/${DATE}
rm -rf ${BACKUP_DIR}/${DATE}

# Upload to S3
aws s3 cp ${BACKUP_DIR}/lesociety-${DATE}.tar.gz \
  s3://your-backup-bucket/database/

# Clean up old local backups
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: lesociety-${DATE}.tar.gz"
```

**Schedule with cron:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-database.sh >> /var/log/backup.log 2>&1
```

---

### Restore from Backup

**Option 1: Atlas Point-in-Time Restore**

1. MongoDB Atlas Dashboard
2. Cluster → Backup tab
3. Click "Restore"
4. Select restore point (any time in last 30 days)
5. Choose destination:
   - New cluster (safest)
   - Replace current cluster (DANGEROUS)
6. Confirm and restore

**Option 2: Restore from mongodump**

```bash
# Download backup
aws s3 cp s3://your-backup-bucket/database/lesociety-YYYYMMDD.tar.gz .

# Extract
tar -xzf lesociety-YYYYMMDD.tar.gz

# Restore
mongorestore \
  --uri="mongodb+srv://USER:PASS@HOST/DB" \
  --drop \
  lesociety-backup/

# Verify restoration
mongo "mongodb+srv://USER:PASS@HOST/DB" --eval "db.users.countDocuments()"
```

---

## 📁 FILE STORAGE BACKUP

### Supabase Storage Backup

**What to Backup:**
- User profile photos
- Date posting images
- Verification documents
- Chat attachments

**Backup Strategy:**

**Option 1: Supabase Built-in Backups**

1. Supabase Dashboard
2. Storage → Settings
3. Enable automatic backups
4. Configure retention: 30 days

**Option 2: Mirror to S3**

Create sync script `sync-supabase-to-s3.sh`:
```bash
#!/bin/bash

# Supabase bucket
SUPABASE_URL="https://your-project.supabase.co/storage/v1/object/public/secret-time-uploads"
S3_BUCKET="s3://your-backup-bucket/supabase-mirror/"

# Sync files
rclone sync \
  supabase:secret-time-uploads \
  ${S3_BUCKET} \
  --progress

echo "Supabase → S3 sync completed"
```

**Schedule weekly:**
```bash
0 3 * * 0 /path/to/sync-supabase-to-s3.sh >> /var/log/storage-sync.log 2>&1
```

---

## 💻 APPLICATION CODE BACKUP

### Git Repository Backup

**Primary:** GitHub
**Secondary:** GitLab Mirror (recommended)

**Setup GitLab Mirror:**

```bash
# Add GitLab remote
git remote add gitlab https://gitlab.com/yourorg/lesociety.git

# Push to both remotes
git push origin main
git push gitlab main

# Or create alias
git config alias.pushall '!git push origin main && git push gitlab main'

# Now use
git pushall
```

**Automated Mirroring (GitHub Actions):**

`.github/workflows/mirror.yml`:
```yaml
name: Mirror to GitLab

on:
  push:
    branches: [ main, develop ]

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Mirror to GitLab
        env:
          GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}
        run: |
          git remote add gitlab https://oauth2:${GITLAB_TOKEN}@gitlab.com/yourorg/lesociety.git
          git push gitlab --all
          git push gitlab --tags
```

---

## 🚨 DISASTER RECOVERY PROCEDURES

### Scenario 1: Complete Database Loss

**Severity:** CRITICAL  
**RTO:** 2 hours  
**RPO:** Up to 6 hours

**Recovery Steps:**

1. **Identify Last Good Backup**
   ```bash
   # List available backups
   aws s3 ls s3://your-backup-bucket/database/ --recursive
   ```

2. **Create New Database (if needed)**
   - MongoDB Atlas → Create new cluster
   - Same configuration as original

3. **Restore Data**
   ```bash
   # Download latest backup
   aws s3 cp s3://your-backup-bucket/database/lesociety-latest.tar.gz .
   
   # Extract and restore
   tar -xzf lesociety-latest.tar.gz
   mongorestore --uri="NEW_DB_URI" --drop lesociety-backup/
   ```

4. **Update Application Configuration**
   ```bash
   # Update MONGO_URI in environment
   # Restart application
   ```

5. **Verify Restoration**
   ```bash
   # Check record counts
   # Test critical operations
   # Verify user login works
   ```

6. **Communicate to Users**
   - Status page update
   - Email notification
   - Estimate data loss window

---

### Scenario 2: Application Crash / Corruption

**Severity:** HIGH  
**RTO:** 30 minutes  
**RPO:** 0 (no data loss)

**Recovery Steps:**

1. **Rollback to Last Known Good Version**
   ```bash
   # Find last working commit
   git log --oneline -10
   
   # Create rollback branch
   git checkout -b rollback-emergency <commit-hash>
   
   # Deploy rollback
   git push production rollback-emergency:main --force
   ```

2. **Or Restore from Backup**
   ```bash
   # Clone repository
   git clone https://github.com/Benzom666/v2.git lesociety-restore
   cd lesociety-restore
   
   # Checkout last stable tag
   git checkout tags/v1.0.0
   
   # Deploy
   ```

3. **Verify Application**
   - Health check endpoints
   - Critical user flows
   - Error monitoring

---

### Scenario 3: Ransomware / Malicious Activity

**Severity:** CRITICAL  
**RTO:** 4 hours  
**RPO:** Up to 24 hours

**Recovery Steps:**

1. **Immediate Actions**
   - Disconnect compromised systems
   - Change all passwords immediately
   - Revoke all API keys and tokens

2. **Assess Damage**
   - Identify compromised data
   - Check backup integrity
   - Review audit logs

3. **Clean Restore**
   - Provision new infrastructure
   - Restore from verified clean backup
   - Apply all security patches

4. **Security Hardening**
   - Rotate all credentials
   - Enable 2FA everywhere
   - Review access controls
   - Update firewall rules

5. **Post-Incident**
   - Document incident
   - Notify affected users
   - Report to authorities (if needed)
   - Conduct security audit

---

### Scenario 4: Hosting Provider Outage

**Severity:** HIGH  
**RTO:** 2 hours  
**RPO:** 0 (if multi-region)

**Recovery Steps:**

1. **Activate Backup Hosting**
   - Deploy to alternative platform (prepared in advance)
   - Update DNS to point to new host

2. **Database Failover**
   - If using Atlas: Automatic regional failover
   - If self-hosted: Switch to replica

3. **Update Configuration**
   - Environment variables
   - External service endpoints

4. **Verify Functionality**
   - Run smoke tests
   - Check integrations

---

## 🧪 TESTING BACKUPS

### Monthly Backup Test

**Schedule:** First Sunday of each month

**Test Procedure:**

1. **Download Latest Backup**
   ```bash
   aws s3 cp s3://your-backup-bucket/database/lesociety-latest.tar.gz .
   ```

2. **Restore to Test Database**
   ```bash
   mongorestore --uri="mongodb://test-restore-db" lesociety-backup/
   ```

3. **Verify Data Integrity**
   ```bash
   # Check record counts
   mongo "mongodb://test-restore-db/lesociety" --eval "
     printjson({
       users: db.users.countDocuments(),
       dates: db.dates.countDocuments(),
       chats: db.chats.countDocuments()
     })
   "
   
   # Sample data verification
   mongo "mongodb://test-restore-db/lesociety" --eval "
     db.users.findOne()
   "
   ```

4. **Document Results**
   ```markdown
   ## Backup Test - [DATE]
   
   - Backup Date: YYYY-MM-DD HH:MM
   - Restore Time: X minutes
   - Data Integrity: ✅ Pass / ❌ Fail
   - Issues Found: None / [Description]
   - Action Items: [If any]
   ```

5. **Clean Up**
   ```bash
   # Drop test database
   mongo "mongodb://test-restore-db" --eval "db.dropDatabase()"
   ```

---

## 📋 BACKUP VERIFICATION CHECKLIST

### Daily:
- [ ] Verify automated backup completed
- [ ] Check backup file size (should be consistent)
- [ ] Review backup logs for errors

### Weekly:
- [ ] Verify backup files are accessible
- [ ] Check backup storage usage
- [ ] Test file download from S3

### Monthly:
- [ ] Complete restore test
- [ ] Verify data integrity
- [ ] Update backup documentation
- [ ] Review and update retention policy

### Quarterly:
- [ ] Full disaster recovery drill
- [ ] Review RTO/RPO targets
- [ ] Update recovery procedures
- [ ] Train team on recovery process

---

## 🔐 SECURITY BEST PRACTICES

### Backup Encryption

**Encrypt backups before upload:**
```bash
# Encrypt backup
gpg --symmetric --cipher-algo AES256 lesociety-backup.tar.gz

# Upload encrypted file
aws s3 cp lesociety-backup.tar.gz.gpg s3://bucket/

# Decrypt when needed
gpg --decrypt lesociety-backup.tar.gz.gpg > lesociety-backup.tar.gz
```

### Access Control

- Backup S3 bucket: Restricted to specific IAM roles only
- MongoDB Atlas backups: Separate user with read-only access
- Backup encryption keys: Stored in separate vault
- Audit all backup access attempts

---

## 📞 EMERGENCY CONTACTS

### Escalation Chain

1. **On-Call Engineer** - First responder
2. **Lead Developer** - Technical decisions
3. **CTO/Technical Lead** - Major incidents
4. **CEO/Founder** - Data breach / PR issues

### Service Providers

- **MongoDB Atlas Support:** support.mongodb.com
- **Hosting Provider Support:** [Your provider]
- **Supabase Support:** support@supabase.io

---

## 📝 BACKUP LOG TEMPLATE

```markdown
# Backup Log - [MONTH YEAR]

## [DATE] - Scheduled Backup
- Status: ✅ Success / ❌ Failed
- Backup Size: XXX MB
- Duration: X minutes
- Location: s3://bucket/path
- Verified: Yes/No

## [DATE] - Restore Test
- Backup Used: [filename]
- Restore Duration: X minutes
- Data Integrity: Pass/Fail
- Issues: None / [Description]
```

---

**Next:** See `OPERATIONS_RUNBOOK.md` for incident response procedures

---

**Created by:** Disaster Recovery Planning  
**Date:** April 3, 2026  
**Review Frequency:** Quarterly

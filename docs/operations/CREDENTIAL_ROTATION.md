# 🔐 Credential Rotation Guide - Le Society

**CRITICAL:** All credentials in this repository have been exposed in git history and MUST be rotated immediately.

**Status:** 🔴 **COMPROMISED** - Immediate action required  
**Last Updated:** April 3, 2026

---

## ⚠️ EXPOSED CREDENTIALS

The following credentials were committed to git and are now considered compromised:

### 1. MongoDB Atlas Database
- **User:** `ronyroyrox_db_user`
- **Password:** `Dgreatreset1!`
- **Host:** `lesociety.lalld11.mongodb.net`
- **Impact:** Full database access (all user data, messages, payments)

### 2. JWT Secrets
- **JWT_SECRET:** `rOFVJJQdrjg+LZsLAJ/RlRwv3OE4k0dr4Jelbcv1TmQNwZMTRV8Nih9RpMREbFOfKCyWhGaDlEgTVGORWyzszA==`
- **JWT_SECRET_TOKEN:** `BU3R9At32dHu9c+O+UuHzDJe054bk7OP0wMSMmZJ+4dC8wXWk1hDcoiDPvInav9/Ke8baco5SvWO60VlBfGmHA==`
- **Impact:** Can forge authentication tokens, impersonate any user

### 3. GitHub Personal Access Token
- **Token:** `ghp_EXAMPLE_TOKEN_REPLACE_WITH_REAL`
- **Impact:** Full repository access, can modify code

---

## 🚨 IMMEDIATE ACTIONS (Do Within 1 Hour)

### Step 1: Rotate MongoDB Credentials

**Time Required:** 15 minutes

1. **Login to MongoDB Atlas:**
   ```
   https://cloud.mongodb.com
   ```

2. **Create Backup (CRITICAL - Do First!):**
   ```bash
   # From your local machine
   cd lesociety/latest/home/node/secret-time-next-api
   mongodump --uri="mongodb+srv://ronyroyrox_db_user:Dgreatreset1!@lesociety.lalld11.mongodb.net/lesociety" --out=backup-before-rotation-$(date +%Y%m%d)
   ```

3. **Delete Compromised User:**
   - Navigate to: Database Access
   - Delete user: `ronyroyrox_db_user`

4. **Create New User:**
   - Click "Add New Database User"
   - Username: `lesociety_prod_user` (or generate random)
   - Password: **Generate strong password** (see below)
   - Database Privileges: Read and write to any database
   - Click "Add User"

5. **Generate Strong Password:**
   ```bash
   # Generate 32-character alphanumeric password
   openssl rand -base64 24 | tr -d '/+=' | cut -c1-32
   # Example output: K7mN9pQ2rS4tU6vW8xY0zA1bC3dE5fG7
   ```

6. **Update IP Whitelist (CRITICAL):**
   - Remove: `0.0.0.0/0` (allows all IPs - INSECURE!)
   - Add: Your production server IP addresses only
   - Add: Your development machine IP (temporarily, for testing)

7. **Update .env File:**
   ```bash
   # Update backend .env
   vim lesociety/latest/home/node/secret-time-next-api/.env
   
   # Change:
   MONGO_USER=lesociety_prod_user
   MONGO_PASS=YOUR_NEW_STRONG_PASSWORD_HERE
   ```

8. **Test Connection:**
   ```bash
   cd lesociety/latest/home/node/secret-time-next-api
   node -e "const mongoose = require('mongoose'); const uri = 'mongodb+srv://' + process.env.MONGO_USER + ':' + encodeURIComponent(process.env.MONGO_PASS) + '@' + process.env.MONGO_HOST + '/' + process.env.DB_NAME; mongoose.connect(uri).then(() => console.log('✓ Connected')).catch(e => console.error('✗ Failed:', e.message));"
   ```

---

### Step 2: Rotate JWT Secrets

**Time Required:** 10 minutes

1. **Generate New Strong Secrets:**
   ```bash
   # Generate JWT_SECRET (64 bytes)
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('base64'))"
   
   # Generate JWT_SECRET_TOKEN (64 bytes)  
   node -e "console.log('JWT_SECRET_TOKEN=' + require('crypto').randomBytes(64).toString('base64'))"
   ```

   **Example output:**
   ```
   JWT_SECRET=xK8mP3nQ6rT9vY2zA5bD8fG1hJ4kM7pS0uX3wA6yC9eE2gH5jL8nN1qR4tV7xZ0aB3cF6iK9mO2pS5uW8yB1dE4gH7k
   JWT_SECRET_TOKEN=cF6iL9oR2uX5zA8dG1jM4pS7vY0bE3hK6nQ9tW2yA5cF8iL1oR4uX7zA0dG3jM6pS9vY2bE5hK8nQ1tW4yA7c
   ```

2. **Update .env File:**
   ```bash
   # Update both secrets in .env
   vim lesociety/latest/home/node/secret-time-next-api/.env
   ```

3. **IMPORTANT:** This will invalidate ALL existing user sessions
   - All users will be forced to login again
   - This is necessary for security
   - Notify users if in production

4. **Restart Application:**
   ```bash
   # Stop backend
   pkill -f "node bin/www"
   
   # Start backend with new secrets
   cd lesociety/latest/home/node/secret-time-next-api
   node bin/www &
   ```

5. **Test Login:**
   ```bash
   curl -X POST http://localhost:3001/api/v1/user/login \
     -H "Content-Type: application/json" \
     -d '{"email": "afro@yopmail.com", "password": "123456"}'
   
   # Should return 200 with new token
   ```

---

### Step 3: Revoke GitHub Token

**Time Required:** 5 minutes

1. **Revoke Compromised Token:**
   - Go to: https://github.com/settings/tokens
   - Find token starting with `ghp_Wo85...`
   - Click "Delete" or "Revoke"

2. **Update Git Remote (Remove Embedded Token):**
   ```bash
   # Check current remote
   git remote -v
   
   # Update to use HTTPS without token
   git remote set-url origin https://github.com/Benzom666/v2.git
   
   # Or better: Use SSH
   git remote set-url origin git@github.com:Benzom666/v2.git
   ```

3. **Configure Git Credential Helper (Recommended):**
   ```bash
   # Use OS keychain for credentials
   git config --global credential.helper store
   
   # On first push, you'll be prompted once, then credentials cached securely
   ```

4. **Create New Token (If Needed):**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Permissions: Select **only** what you need (e.g., `repo`)
   - Copy token and store in password manager
   - **NEVER** commit to git

---

## 📋 ADDITIONAL ROTATIONS (If Configured)

### Supabase (If Real Keys Used)

1. **Check if configured:**
   ```bash
   grep SUPABASE_SERVICE_ROLE_KEY lesociety/latest/home/node/secret-time-next-api/.env
   ```

2. **If real key found (not placeholder):**
   - Login to: https://app.supabase.com
   - Navigate to: Settings > API
   - Under "Service Role Key" click "Reset"
   - Update `.env` with new key

### SendGrid (If Configured)

1. **Check if configured:**
   ```bash
   grep SENDGRID_API_KEY lesociety/latest/home/node/secret-time-next-api/.env
   ```

2. **If configured:**
   - Login to: https://app.sendgrid.com
   - Navigate to: Settings > API Keys
   - Delete old key
   - Create new API key
   - Update `.env`

### BucksBus Payment Gateway (If Configured)

1. **Check if configured:**
   ```bash
   grep BUCKSBUS_API_KEY lesociety/latest/home/node/secret-time-next-api/.env
   ```

2. **If configured:**
   - Contact BucksBus support for key rotation
   - Update `.env` with new keys

---

## 🧹 GIT HISTORY CLEANUP (Optional - DANGEROUS)

**WARNING:** This rewrites git history. Coordinate with team first!

### Option 1: BFG Repo-Cleaner (Recommended)

```bash
# Install BFG
# macOS: brew install bfg
# Linux: Download from https://rtyley.github.io/bfg-repo-cleaner/

# Clone fresh repo
git clone --mirror https://github.com/Benzom666/v2.git v2-cleanup
cd v2-cleanup

# Remove .env files from history
bfg --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: Destructive!)
git push --force
```

### Option 2: Git Filter-Branch

```bash
# Backup first!
cp -r .git .git-backup

# Remove files from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch \
    lesociety/latest/home/node/secret-time-next-api/.env \
    lesociety/latest/home/node/secret-time-next/.env \
    .env.template" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: Destructive!)
git push origin --force --all
```

### After History Cleanup:

**All collaborators MUST:**
```bash
# Delete local repo
rm -rf v2

# Re-clone fresh
git clone https://github.com/Benzom666/v2.git
cd v2

# Verify .env files are gone from history
git log --all --full-history --oneline -- "*.env"
# Should return nothing
```

---

## ✅ VERIFICATION CHECKLIST

After rotation, verify everything works:

- [ ] MongoDB connection successful with new credentials
- [ ] Old MongoDB user deleted
- [ ] IP whitelist updated (no 0.0.0.0/0)
- [ ] Login works with new JWT secrets
- [ ] Old tokens are invalidated
- [ ] GitHub token revoked
- [ ] Git remote updated (no embedded token)
- [ ] .env files added to .gitignore
- [ ] Application starts without errors
- [ ] All tests pass (if any)

---

## 🔒 PREVENTION - NEVER DO THIS AGAIN

### 1. Use Environment Variable Management

**Production (Recommended):**
- AWS Secrets Manager
- HashiCorp Vault
- Google Secret Manager
- Azure Key Vault

**Deployment Platforms:**
- Vercel: Use environment variables in dashboard
- Render: Use environment groups
- Heroku: Use config vars
- Railway: Use environment variables

### 2. Use Pre-Commit Hooks

```bash
# Install git-secrets
# macOS: brew install git-secrets
# Linux: git clone https://github.com/awslabs/git-secrets.git && cd git-secrets && sudo make install

# Set up in repo
cd /path/to/v2
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add '(MONGO_PASS|JWT_SECRET|API_KEY)=[^\\s]+'
```

### 3. Use Secret Scanning

**GitHub:**
- Enable "Secret scanning" in repo settings (if using GitHub Advanced Security)

**GitGuardian:**
- Free for public repos: https://www.gitguardian.com

### 4. Review Before Committing

```bash
# Always check what you're committing
git status
git diff --cached

# Verify no secrets
git diff --cached | grep -iE "(password|secret|key|token)="
```

---

## 📞 INCIDENT RESPONSE

If you discover more exposed credentials:

1. **DO NOT PANIC**
2. **Immediately rotate the credential**
3. **Check logs for unauthorized access**
4. **Notify team/users if data accessed**
5. **Document the incident**
6. **Review security practices**

---

## 🎓 SECURITY BEST PRACTICES

### For Developers:

1. **Never commit:**
   - .env files
   - API keys
   - Passwords
   - Private keys
   - Tokens

2. **Always use:**
   - Environment variables
   - .env.example (with placeholders)
   - Secret management services
   - Encrypted storage for sensitive data

3. **Regularly:**
   - Rotate credentials (every 90 days)
   - Review access logs
   - Audit dependencies for vulnerabilities
   - Update security packages

### For Production:

1. **Use strong secrets:**
   - Minimum 32 characters
   - Random generated
   - Never reuse across services

2. **Implement:**
   - Role-based access control (RBAC)
   - Principle of least privilege
   - Network segmentation
   - Regular security audits

3. **Monitor:**
   - Failed authentication attempts
   - Unusual access patterns
   - Database queries
   - API usage

---

**Generated by:** Security Audit - Phase 1  
**Date:** April 3, 2026  
**Priority:** 🔴 CRITICAL

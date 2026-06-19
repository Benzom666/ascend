# 👥 Team Onboarding Guide - Le Society

**Welcome to the Le Society development team!**

**Last Updated:** April 4, 2026  
**Version:** 1.0

---

## 🎯 WELCOME

This guide will help you get up to speed with the Le Society platform in your first week. Follow the steps in order for the smoothest onboarding experience.

---

## DAY 1: SETUP & ACCESS

### Morning: Get Your Environment Ready

**1. Required Accounts & Access**
- [ ] GitHub/Bitbucket repository access
- [ ] MongoDB Atlas access (read-only to start)
- [ ] Supabase project access
- [ ] Slack/Discord team channel
- [ ] Email forwarding setup
- [ ] Password manager (1Password/LastPass)

**2. Install Development Tools**

```bash
# Required software
- Node.js 16+ (https://nodejs.org)
- MongoDB Compass (GUI client)
- VS Code or preferred IDE
- Git
- Postman or Insomnia (API testing)

# Recommended VS Code Extensions
- ESLint
- Prettier
- MongoDB for VS Code
- GitLens
- Thunder Client (API testing)
```

**3. Clone Repository**

```bash
# Clone the project
git clone <repository-url>
cd v2

# Review the structure
ls -la
```

### Afternoon: Read Documentation

**Must-Read Documents (in order):**

1. **START_HERE_FIRST.md** (15 min) - Quick overview
2. **AGENTS.md** (10 min) - Critical workflows and gotchas
3. **APPLICATION_ARCHITECTURE.md** (45 min) - Full system architecture
4. This file - TEAM_ONBOARDING_GUIDE.md

**Optional but Recommended:**
- DEPLOYMENT_GUIDE.md
- OPERATIONS_RUNBOOK.md
- SECURITY_AUDIT_PHASE1.md

### End of Day 1 Goals:
- ✅ All accounts created
- ✅ Development environment installed
- ✅ Repository cloned
- ✅ Core documentation read

---

## DAY 2: LOCAL SETUP

### Morning: Get the Application Running

**1. Backend Setup**

```bash
# Navigate to backend
cd lesociety/latest/home/node/secret-time-next-api

# Copy environment file
cp .env.example .env

# Add required secrets (ask team lead for credentials)
# Critical: JWT_SECRET_TOKEN must be set!

# Install dependencies
npm install

# Test database connection
cd ../../..
node check-user.js

# Start backend
cd lesociety/latest/home/node/secret-time-next-api
node bin/www
```

**Expected output:**
```
MongoDB connected successfully
Server running on port 3001
```

**2. Frontend Setup**

```bash
# Open new terminal
cd lesociety/latest/home/node/secret-time-next

# Copy environment file
cp .env.example .env

# Update with local backend URL
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Expected output:**
```
ready - started server on 0.0.0.0:3000
```

**3. Verify Everything Works**

- Open browser: http://localhost:3000
- Try to register a new account
- Try to login with test credentials:
  - Email: afro@yopmail.com
  - Password: 123456

### Afternoon: Explore the Codebase

**Backend Tour (1 hour):**

```bash
cd lesociety/latest/home/node/secret-time-next-api

# Key files to review:
app.js                    # Main Express app
bin/www                   # Server startup
routes/index.js           # Route registration
routes/user.js            # User endpoints
routes/date.js            # Date endpoints
controllers/v1/user.js    # User business logic
models/user.js            # User data model
```

**Frontend Tour (1 hour):**

```bash
cd lesociety/latest/home/node/secret-time-next

# Key files to review:
pages/_app.js             # App initialization
pages/index.js            # Home page
pages/auth/login.js       # Login page
pages/create-date/        # Date creation flow
core/header.js            # Main navigation
modules/auth/             # Authentication logic
```

### End of Day 2 Goals:
- ✅ Application running locally
- ✅ Successfully logged in
- ✅ Familiar with project structure
- ✅ Can navigate the codebase

---

## DAY 3: DEVELOPMENT WORKFLOW

### Morning: Make Your First Change

**Exercise 1: Add a console.log**

```javascript
// File: lesociety/latest/home/node/secret-time-next-api/routes/user.js
// Add logging to the login endpoint

router.post("/login", async (req, res) => {
  console.log("🔐 Login attempt:", req.body.email); // ADD THIS
  // ... rest of code
});
```

**Test it:**
```bash
# Restart backend
# Try logging in
# Check console for your log message
```

**Exercise 2: Update Frontend Text**

```javascript
// File: lesociety/latest/home/node/secret-time-next/pages/index.js
// Change the homepage heading

<h1>Welcome to Le Society - Updated by [Your Name]</h1>
```

**Test it:**
- Refresh http://localhost:3000
- See your change

### Afternoon: Git Workflow

**1. Create a Feature Branch**

```bash
git checkout -b feature/your-name-onboarding
```

**2. Commit Your Changes**

```bash
git add .
git commit -m "feat: onboarding exercise - added logging"
```

**3. Push Your Branch**

```bash
git push origin feature/your-name-onboarding
```

**4. Create Pull Request**
- Go to GitHub/Bitbucket
- Create PR from your branch to `develop`
- Request review from team lead

### End of Day 3 Goals:
- ✅ Made code changes
- ✅ Tested changes locally
- ✅ Created feature branch
- ✅ Submitted first PR

---

## DAY 4: UNDERSTANDING BUSINESS LOGIC

### Key Workflows to Understand

**1. User Registration Flow**

```
User fills signup form
  ↓
POST /api/v1/user/signup
  ↓
Create user in database (status: pending)
  ↓
Send verification email
  ↓
User clicks email link
  ↓
Email verified (email_verified: true)
  ↓
Admin reviews profile
  ↓
Profile approved (status: 1, verification_status: 2)
```

**2. Date Creation Flow**

```
Female user clicks "Create Date"
  ↓
Multi-step form:
  - Location
  - Experience type
  - Date/time
  - Duration
  - Earning expectations
  - Description
  ↓
POST /api/v1/date/create
  ↓
Date saved (status: pending)
  ↓
Admin reviews
  ↓
Date approved (status: 1) or rejected/warning
```

**3. Chat/Token Flow**

```
Male user views female profile
  ↓
Clicks "Send Message"
  ↓
Check tokens (need 10 to initiate)
  ↓
If no tokens → Redirect to payment
  ↓
Purchase tokens
  ↓
Deduct 10 tokens
  ↓
Create chat room
  ↓
Send message (2 tokens per message)
```

### Exercises

**Study these files:**
- `controllers/v1/user.js` - User logic
- `controllers/v1/date.js` - Date logic
- `controllers/v1/chat.js` - Chat logic
- `models/user.js` - User schema
- `models/dates.js` - Date schema

**Quiz yourself:**
- What are the different user statuses?
- What happens when a date is rejected?
- How many tokens does it cost to send a message?

### End of Day 4 Goals:
- ✅ Understand core business flows
- ✅ Can explain user lifecycle
- ✅ Know how token system works

---

## DAY 5: TESTING & DEBUGGING

### Morning: Testing Practices

**1. API Testing with Postman/curl**

```bash
# Test login
curl -X POST http://localhost:3001/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "afro@yopmail.com", "password": "123456"}'

# Save the token from response

# Test authenticated endpoint
curl -X GET http://localhost:3001/api/v1/user/detail \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**2. Frontend Testing**

```bash
# Run frontend tests (if available)
cd lesociety/latest/home/node/secret-time-next
npm test
```

### Afternoon: Common Debugging Scenarios

**Issue 1: "Something went wrong" on login**

**Diagnosis:**
```bash
# Check backend logs
# Look for JWT errors
# Verify JWT_SECRET_TOKEN in .env
grep JWT_SECRET_TOKEN lesociety/latest/home/node/secret-time-next-api/.env
```

**Solution:**
```bash
# Add if missing
echo "JWT_SECRET_TOKEN=your-secret-key" >> .env
# Restart backend
```

**Issue 2: CORS errors**

**Check:** Frontend and backend on correct ports?
- Frontend: 3000
- Backend: 3001

**Issue 3: Database connection failed**

**Diagnosis:**
```bash
# Test connection
node check-user.js
```

**Check:** MongoDB credentials in `.env`

### End of Day 5 Goals:
- ✅ Can test APIs with curl/Postman
- ✅ Know how to read logs
- ✅ Can debug common issues
- ✅ Completed first week!

---

## WEEK 2+: BECOMING PRODUCTIVE

### Your First Real Tasks

**Starter Tasks (Good First Issues):**

1. **Frontend:** Fix a UI bug or alignment issue
2. **Backend:** Add validation to an endpoint
3. **Documentation:** Update API examples
4. **Testing:** Add test cases
5. **Refactoring:** Extract duplicate code

### Development Best Practices

**1. Code Style**

```javascript
// Use consistent formatting
// Follow existing patterns
// Add comments for complex logic

// Good
const getUserById = async (userId) => {
  // Validate input
  if (!userId) throw new Error("User ID required");
  
  // Fetch from database
  const user = await User.findById(userId).lean();
  
  return user;
};

// Bad
const getUserById = async (userId) => {
  return await User.findById(userId);
};
```

**2. Error Handling**

```javascript
// Always handle errors
try {
  const result = await someAsyncOperation();
  res.json({ status: 200, data: result });
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ 
    status: 500, 
    message: "Operation failed" 
  });
}
```

**3. Git Commit Messages**

```bash
# Use conventional commits
feat: add user profile export feature
fix: resolve login token expiration issue
docs: update API documentation
refactor: extract user validation logic
test: add unit tests for date creation
```

**4. Pull Request Guidelines**

- Keep PRs small (<400 lines changed)
- Write clear descriptions
- Add screenshots for UI changes
- Request specific reviewers
- Respond to feedback promptly

---

## REFERENCE GUIDE

### Quick Commands

```bash
# Start everything
./start-production.sh

# Backend only
cd lesociety/latest/home/node/secret-time-next-api
node bin/www

# Frontend only
cd lesociety/latest/home/node/secret-time-next
npm run dev

# Stop everything
pkill -f node

# Check what's running
ps aux | grep node

# View logs
tail -f logs/*.log
```

### Test Credentials

```
# Male User
Email: afro@yopmail.com
Password: 123456

# Female User (create one or ask team)
Email: [ask team lead]
Password: [ask team lead]

# Admin
Email: [ask team lead]
Password: [ask team lead]
```

### Important URLs

- **Local Frontend:** http://localhost:3000
- **Local Backend:** http://localhost:3001
- **API Health:** http://localhost:3001/api/v1/
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Supabase:** https://app.supabase.com

### Who to Ask

- **Backend questions:** [Backend lead name]
- **Frontend questions:** [Frontend lead name]
- **DevOps/deployment:** [DevOps lead name]
- **Business logic:** [Product manager name]
- **Urgent issues:** [Team lead name]

### Communication Channels

- **Daily standup:** [Time] on [Zoom/Slack]
- **Code reviews:** GitHub/Bitbucket PRs
- **Questions:** #dev-help Slack channel
- **Bugs:** GitHub Issues
- **General:** #general Slack channel

---

## COMMON QUESTIONS

**Q: How do I reset my local database?**
```bash
# Restore from backup
node restore-db.js
```

**Q: Frontend not reflecting my changes?**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Q: Getting "port already in use"?**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Q: How do I test payment flow without real money?**
Ask team lead for test payment credentials.

**Q: Where are the logs?**
```bash
# Application logs
logs/

# Backend console
Check terminal where you ran 'node bin/www'

# Frontend console
Check browser developer tools console
```

---

## LEARNING RESOURCES

### Technologies Used

**Node.js & Express:**
- https://nodejs.org/docs
- https://expressjs.com/

**Next.js & React:**
- https://nextjs.org/docs
- https://react.dev/

**MongoDB & Mongoose:**
- https://www.mongodb.com/docs/
- https://mongoosejs.com/docs/

**Socket.IO:**
- https://socket.io/docs/

### Internal Documentation

- APPLICATION_ARCHITECTURE.md - Complete system overview
- DEPLOYMENT_GUIDE.md - How to deploy
- OPERATIONS_RUNBOOK.md - Day-to-day operations
- SECURITY_AUDIT_PHASE1.md - Security practices

---

## CHECKLIST: FIRST WEEK COMPLETED

By end of week 1, you should be able to:

- [ ] Run the application locally
- [ ] Navigate the codebase confidently
- [ ] Understand the main user flows
- [ ] Make and test code changes
- [ ] Create PRs following best practices
- [ ] Debug common issues
- [ ] Know where to find documentation
- [ ] Know who to ask for help

---

**Welcome aboard! 🚀**

We're excited to have you on the team. Don't hesitate to ask questions - we're all here to help!

---

**Document Maintained By:** Development Team  
**Last Updated:** April 4, 2026  
**Questions?** Contact [team-lead@lesociety.com]

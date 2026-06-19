# 💻 Development Workflow

Complete guide for developing on Le Society platform.

---

## 🚀 Getting Started

### 1. Set Up Local Environment

```bash
git clone https://github.com/Benzom666/v2.git
cd v2
./scripts/start-dev.sh
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

---

## 📝 Making Changes

### Backend Changes

**Location:** `lesociety/latest/home/node/secret-time-next-api/`

**Common Tasks:**

1. **Add New API Endpoint:**
   - Create route in `routes/`
   - Add controller logic in `controllers/v1/`
   - Update API documentation

2. **Add Database Model:**
   - Create schema in `models/`
   - Add indexes
   - Update database documentation

3. **Add Middleware:**
   - Create in `middleware/`
   - Register in `app.js`

### Frontend Changes

**Location:** `lesociety/latest/home/node/secret-time-next/`

**Common Tasks:**

1. **Add New Page:**
   - Create in `pages/`
   - Add route (automatic in Next.js)

2. **Add Component:**
   - Create in `components/` or `modules/`
   - Import and use

3. **Add Styles:**
   - Create/update SCSS in `styles/`

---

## 🧪 Testing

### Local Testing

```bash
# Start services
./scripts/start-dev.sh

# Test in browser
open http://localhost:3000

# Test API
curl http://localhost:3001/api/v1/
```

### Run Tests

```bash
# Backend tests
cd lesociety/latest/home/node/secret-time-next-api
npm test

# Frontend tests
cd lesociety/latest/home/node/secret-time-next
npm test
```

---

## 📦 Committing Changes

### 1. Stage Changes

```bash
git add .
```

### 2. Commit with Convention

```bash
git commit -m "feat: add user export feature"
```

**Commit Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

### 3. Push to GitHub

```bash
git push origin feature/your-feature-name
```

---

## 🔄 Pull Request Process

### 1. Create PR

- Go to GitHub
- Create Pull Request
- Fill out template
- Request reviewers

### 2. PR Checklist

- [ ] Code follows style guide
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console.log/debugger statements
- [ ] Meaningful commit messages

### 3. Review Process

- Address feedback
- Make requested changes
- Push updates
- Wait for approval

### 4. Merge

Once approved, merge via GitHub UI.

---

## 🛠️ Common Tasks

### Add Environment Variable

1. Add to `.env.example`
2. Add to `.env` locally
3. Document in README
4. Update deployment configs

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all (carefully)
npm update
```

### Debug Issues

1. Check logs: `tail -f logs/*.log`
2. Check console in browser DevTools
3. Add console.log statements
4. Use debugger in VS Code

---

## 📚 Resources

- [API Documentation](../api/API_DOCUMENTATION.md)
- [Architecture Guide](../architecture/APPLICATION_ARCHITECTURE.md)
- [Contributing Guide](../../CONTRIBUTING.md)

---

**Need Help?** Ask in team chat or open an issue!

# 🤝 Contributing to Le Society

Thank you for your interest in contributing! This guide will help you get started.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Commit Guidelines](#commit-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Style Guide](#style-guide)

---

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Keep discussions professional

---

## Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/v2.git
cd v2
```

### 3. Set Up Development Environment

```bash
# Follow the quick start guide
./scripts/start-dev.sh
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

---

## Development Workflow

### Making Changes

1. **Write code** that follows our style guide
2. **Add tests** for new features
3. **Update documentation** if needed
4. **Test locally** before committing

### Testing

```bash
# Backend tests
cd lesociety/latest/home/node/secret-time-next-api
npm test

# Frontend tests
cd lesociety/latest/home/node/secret-time-next
npm test
```

### Running the Application

```bash
# Backend
cd lesociety/latest/home/node/secret-time-next-api
node bin/www

# Frontend
cd lesociety/latest/home/node/secret-time-next
npm run dev
```

---

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

### Examples

```bash
feat(auth): add password reset functionality
fix(chat): resolve message duplication issue
docs(api): update authentication endpoints
refactor(user): extract validation logic
test(date): add integration tests for date creation
```

---

## Pull Request Process

### 1. Update Your Branch

```bash
git fetch upstream
git rebase upstream/main
```

### 2. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

- Go to GitHub and create a PR
- Fill out the PR template
- Link related issues
- Request reviewers

### 4. PR Review Checklist

- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Commits follow convention
- [ ] PR description is clear

### 5. Address Feedback

- Respond to review comments
- Make requested changes
- Push updates to the same branch

### 6. Merge

Once approved, a maintainer will merge your PR.

---

## Style Guide

### JavaScript/Node.js

```javascript
// Use const/let, not var
const user = await User.findById(userId);

// Use async/await over callbacks
async function getUser(id) {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Clear variable names
const isUserVerified = user.verification_status === 2;

// Add comments for complex logic
// Calculate tokens needed based on package size
const tokensNeeded = packageSize === 'large' ? 400 : 200;
```

### React/Next.js

```javascript
// Functional components with hooks
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId);
  }, [userId]);
  
  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};
```

### CSS/SCSS

```scss
// Use BEM naming convention
.user-card {
  &__header {
    font-size: 18px;
  }
  
  &__body {
    padding: 16px;
  }
  
  &--featured {
    border: 2px solid gold;
  }
}
```

---

## Code Review Guidelines

### For Authors

- Keep PRs small and focused
- Write clear descriptions
- Respond to feedback promptly
- Don't take criticism personally

### For Reviewers

- Be constructive and specific
- Approve if code meets standards
- Request changes if needed
- Respond within 24-48 hours

---

## Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-description` - Documentation
- `refactor/area-name` - Refactoring
- `test/test-description` - Tests

---

## Questions?

- Check [documentation](docs/README.md)
- Open an [issue](https://github.com/Benzom666/v2/issues)
- Ask in [discussions](https://github.com/Benzom666/v2/discussions)

---

**Thank you for contributing! 🎉**

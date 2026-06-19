# 🌟 Le Society - Premium Dating Marketplace Platform

[![Production Ready](https://img.shields.io/badge/production-ready-green.svg)](https://github.com/Benzom666/v2)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-5.0-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)

> A revolutionary dating platform where women create premium date experiences and men connect through a token-based system.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Benzom666/v2.git
cd v2

# Start the application (automated setup)
./scripts/start-dev.sh
```

**That's it!** Visit `http://localhost:3000` 🎉

**New to the project?** → Read the [**5-Minute Quick Start Guide**](docs/QUICK_START.md)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

### For Female Users (Date Creators)
- 📅 Create and manage premium date experiences
- ✅ Multi-stage profile verification (photo + admin review)
- 💬 Token-gated messaging (control who can contact you)
- 📸 Photo gallery and detailed profile customization
- 🔔 Real-time notifications for interest and messages

### For Male Users (Date Seekers)
- 🔍 Browse verified female profiles and curated dates
- ⭐ Express interest (free) or super-interest (premium)
- 💰 Token-based messaging system
- 💬 Real-time chat with message history
- 🎯 Advanced search and filtering

### For Administrators
- 👥 User verification workflow
- 📊 Analytics dashboard with key metrics
- 🛡️ Content moderation tools
- 💳 Payment transaction monitoring
- 🔔 Notification management system

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                │
│              Port 3000 - User Interface             │
└──────────────────┬──────────────────────────────────┘
                   │ REST API / WebSocket
┌──────────────────▼──────────────────────────────────┐
│              Backend (Express + Node.js)            │
│        Port 3001 - API & Business Logic             │
└──────┬──────────────────────┬───────────────────────┘
       │                      │
┌──────▼─────────┐    ┌──────▼──────────┐
│  MongoDB Atlas │    │ Supabase Storage│
│   (Database)   │    │  (File Storage) │
└────────────────┘    └─────────────────┘
```

**Tech Stack:**
- **Backend:** Node.js 16+, Express.js, Socket.IO
- **Frontend:** Next.js 11, React 17, Redux
- **Database:** MongoDB Atlas (cloud-hosted)
- **Storage:** Supabase (images & files)
- **Authentication:** JWT with bcrypt
- **Payments:** Stripe, PayPal, Bank Transfer

📖 **[Full Architecture Documentation](docs/architecture/APPLICATION_ARCHITECTURE.md)**

---

## 🎯 Getting Started

### Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **MongoDB Atlas Account** ([Sign up free](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### Installation

**Option 1: Automated Setup (Recommended)**

```bash
./scripts/start-dev.sh
```

**Option 2: Manual Setup**

```bash
# 1. Install backend dependencies
cd lesociety/latest/home/node/secret-time-next-api
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start backend
node bin/www &

# 4. Install frontend dependencies
cd ../secret-time-next
npm install

# 5. Start frontend
npm run dev
```

### Environment Configuration

Create `.env` files in both backend and frontend directories:

**Backend** (`secret-time-next-api/.env`):
```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/lesociety
JWT_SECRET_TOKEN=your-secret-key-change-in-production
PORT=3001
NODE_ENV=development
```

**Frontend** (`secret-time-next/.env`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

📚 **[Complete Setup Guide](docs/guides/SETUP_GUIDE.md)**

---

## 📚 Documentation

### Quick Links
- 🚀 [**Quick Start Guide**](docs/QUICK_START.md) - Get running in 5 minutes
- 🏗️ [**Architecture Overview**](docs/architecture/APPLICATION_ARCHITECTURE.md) - System design
- 📡 [**API Documentation**](docs/api/API_DOCUMENTATION.md) - Complete API reference
- 👥 [**Team Onboarding**](docs/guides/TEAM_ONBOARDING.md) - For new developers
- 🚢 [**Deployment Guide**](docs/operations/DEPLOYMENT.md) - Production deployment

### By Role

**For Developers:**
- [Development Workflow](docs/guides/DEVELOPMENT_WORKFLOW.md)
- [API Reference](docs/api/API_DOCUMENTATION.md)
- [Database Schema](docs/architecture/DATABASE_SCHEMA.md)
- [Performance Optimization](docs/guides/PERFORMANCE_OPTIMIZATION.md)

**For DevOps:**
- [Deployment Guide](docs/operations/DEPLOYMENT.md)
- [CI/CD Setup](docs/operations/CI_CD_PIPELINE.md)
- [Monitoring & Alerts](docs/operations/MONITORING.md)
- [Operations Runbook](docs/operations/RUNBOOK.md)

**For Product/Business:**
- [Executive Summary](docs/EXECUTIVE_SUMMARY.md)
- [Feature Overview](docs/FEATURES.md)
- [Analytics & Metrics](docs/ANALYTICS.md)

📖 **[Complete Documentation Index](docs/README.md)**

---

## 💻 Development

### Project Structure

```
v2/
├── lesociety/latest/home/node/
│   ├── secret-time-next-api/     # Backend API (Express)
│   │   ├── controllers/          # Business logic
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # API routes
│   │   └── middleware/           # Custom middleware
│   │
│   └── secret-time-next/         # Frontend (Next.js)
│       ├── pages/                # Next.js pages
│       ├── components/           # React components
│       ├── modules/              # Feature modules
│       └── styles/               # SCSS styles
│
├── docs/                         # Documentation
├── scripts/                      # Automation scripts
└── .github/workflows/            # CI/CD workflows
```

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and test locally
npm run dev

# Run tests
npm test

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature
```

### Testing

```bash
# Backend tests
cd lesociety/latest/home/node/secret-time-next-api
npm test

# Frontend tests
cd lesociety/latest/home/node/secret-time-next
npm test

# Integration tests
npm run test:integration
```

📖 **[Development Guide](docs/guides/DEVELOPMENT_WORKFLOW.md)**

---

## 🚢 Deployment

### Quick Deploy

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production (requires approval)
./scripts/deploy.sh production
```

### Supported Platforms

- ✅ **Render.com** (Recommended)
- ✅ **Railway.app**
- ✅ **Vercel** (Frontend)
- ✅ **Heroku**
- ✅ **AWS EC2**
- ✅ **DigitalOcean**

### Production Checklist

- [ ] Environment variables configured
- [ ] Database backup enabled
- [ ] SSL certificate installed
- [ ] Monitoring & alerts set up
- [ ] CI/CD pipeline configured
- [ ] Health checks passing

📖 **[Deployment Guide](docs/operations/DEPLOYMENT.md)**

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

📖 **[Contributing Guide](CONTRIBUTING.md)**

---

## 📊 Status & Metrics

### Platform Status
- **Backend:** ✅ Production Ready
- **Frontend:** ✅ Production Ready
- **Database:** ✅ Operational
- **Deployment:** ✅ Automated
- **Monitoring:** ✅ Configured

### Code Quality
- **Test Coverage:** 60% (target: 80%)
- **Code Quality:** A
- **Security:** Passing
- **Performance:** Good

---

## 🔒 Security

- 🔐 JWT token authentication
- 🔑 Bcrypt password hashing
- 🛡️ Input validation & sanitization
- 🚫 Rate limiting enabled
- ✅ CORS protection
- 🔒 Environment variable encryption

**Found a security issue?** Please email security@lesociety.com

---

## 📞 Support

- **Documentation:** [docs/README.md](docs/README.md)
- **Issues:** [GitHub Issues](https://github.com/Benzom666/v2/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Benzom666/v2/discussions)

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

Built with ❤️ by the Le Society team

- [Node.js](https://nodejs.org/)
- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Supabase](https://supabase.com/)

---

<div align="center">
  <strong>Le Society - Where Premium Connections Happen</strong>
</div>

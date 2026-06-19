# 📁 Project Structure

```
v2/
│
├── README.md                          # Main project documentation
├── CONTRIBUTING.md                    # Contribution guidelines
├── LICENSE                            # Proprietary license
├── package.json                       # Root package config
├── .gitignore                         # Git ignore rules
│
├── lesociety/latest/home/node/
│   │
│   ├── secret-time-next-api/         # 🔧 Backend API (Express + Node.js)
│   │   ├── bin/www                   # Server entry point
│   │   ├── app.js                    # Express app configuration
│   │   ├── controllers/v1/           # Business logic
│   │   ├── models/                   # Mongoose schemas (11 collections)
│   │   ├── routes/                   # API route definitions
│   │   ├── middleware/               # Custom middleware
│   │   ├── helpers/                  # Utility functions
│   │   ├── lib/                      # Libraries (auth, logger, etc.)
│   │   ├── services/                 # Business services
│   │   ├── config/                   # Configuration files
│   │   ├── views/mails/              # Email templates
│   │   ├── tests/                    # Test files
│   │   ├── package.json              # Backend dependencies
│   │   └── .env                      # Environment variables
│   │
│   └── secret-time-next/             # 🎨 Frontend (Next.js + React)
│       ├── pages/                    # Next.js pages (routing)
│       ├── components/               # Reusable React components
│       ├── modules/                  # Feature modules
│       ├── core/                     # Core components (header, footer)
│       ├── styles/                   # SCSS stylesheets
│       ├── utils/                    # Utility functions
│       ├── hooks/                    # Custom React hooks
│       ├── public/                   # Static assets
│       ├── package.json              # Frontend dependencies
│       └── .env                      # Environment variables
│
├── docs/                             # 📚 Documentation
│   ├── README.md                     # Documentation index
│   ├── QUICK_START.md                # 5-minute setup guide
│   ├── EXECUTIVE_SUMMARY.md          # Business overview
│   ├── FEATURES.md                   # Feature overview
│   ├── ANALYTICS.md                  # Metrics & KPIs
│   │
│   ├── architecture/                 # System architecture
│   │   ├── APPLICATION_ARCHITECTURE.md
│   │   ├── DATABASE_SCHEMA.md
│   │   └── SECURITY.md
│   │
│   ├── api/                          # API documentation
│   │   └── API_DOCUMENTATION.md
│   │
│   ├── guides/                       # Developer guides
│   │   ├── TEAM_ONBOARDING.md
│   │   ├── DEVELOPMENT_WORKFLOW.md
│   │   ├── PERFORMANCE_OPTIMIZATION.md
│   │   └── DATABASE_OPTIMIZATION.md
│   │
│   └── operations/                   # Operations docs
│       ├── DEPLOYMENT.md
│       ├── MONITORING.md
│       ├── CI_CD_PIPELINE.md
│       ├── RUNBOOK.md
│       ├── BACKUP_RECOVERY.md
│       └── CREDENTIAL_ROTATION.md
│
├── scripts/                          # 🔧 Automation scripts
│   ├── start-dev.sh                  # Quick development start
│   ├── deploy.sh                     # Deployment automation
│   ├── backup-database.sh            # Database backup
│   ├── restore-from-backup.sh        # Database restore
│   ├── rollback.sh                   # Rollback deployment
│   └── test-production-readiness.sh  # Production tests
│
├── .github/workflows/                # ⚙️ CI/CD workflows
│   ├── ci.yml                        # Continuous integration
│   ├── deploy-staging.yml            # Staging deployment
│   └── deploy-production.yml         # Production deployment
│
├── database/                         # 💾 Database backups
│   └── lesociety/                    # MongoDB dump files
│
├── logs/                             # 📝 Application logs
│   ├── backend.log
│   └── frontend.log
│
└── backups/                          # 💾 Backup files
    └── [timestamped backups]
```

## Key Directories

### Backend (`secret-time-next-api`)
- **Entry:** `bin/www` - Server startup
- **Core:** `app.js` - Express configuration
- **Logic:** `controllers/v1/` - Business logic
- **Data:** `models/` - Database schemas
- **API:** `routes/` - Endpoint definitions

### Frontend (`secret-time-next`)
- **Pages:** `pages/` - Next.js routing
- **Components:** `components/` - React components
- **Styles:** `styles/` - SCSS files
- **Utils:** `utils/` - Helper functions

### Documentation (`docs`)
- **Guides:** Developer onboarding & workflows
- **API:** Complete API reference
- **Architecture:** System design documents
- **Operations:** Deployment & monitoring

### Scripts (`scripts`)
- Development helpers
- Deployment automation
- Database management
- Testing utilities

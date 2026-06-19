# Codebase Report V2

Date: 2026-03-24
Scope: `/home/benzom/v2`

## Executive Summary

This repository is a monorepo-style delivery bundle for the Le Society platform with three runnable applications:

- User app: Next.js frontend in `lesociety/latest/home/node/secret-time-next`
- API: Express + MongoDB backend in `lesociety/latest/home/node/secret-time-next-api`
- Admin: React admin panel in `lesociety/latest/var/www/html/s_admin`

The codebase is operationally organized around a real product workflow, but it has three immediate concerns:

1. Secret handling and repository hygiene are weak. The repo tracks `.env` files and documentation includes concrete credential values.
2. The runtime stack is old and inconsistent. The frontend depends on Next 11 and uses `--openssl-legacy-provider`; it also declares `react` 17 with `react-dom` 16.
3. Automated verification is minimal. There is effectively no meaningful test coverage relative to the size of the system.

## Repository Shape

- Git repository root: `/home/benzom/v2`
- Tracked Markdown files: 73
- Approximate JS source files:
  - Frontend: 248
  - API: 61
  - Admin: 52

This is documentation-heavy relative to the level of executable verification.

## Application Inventory

### 1. User Frontend

Path: `lesociety/latest/home/node/secret-time-next`

Observed characteristics:

- Next.js app with page routing under `pages/`
- Authentication, profile, messaging, membership, payment, and multi-step date creation flows
- Redux + Saga architecture
- Socket.IO client initialized globally in `_app.js`

Notable routes from `pages/`:

- `auth/login`
- `auth/registration`
- `create-date/*`
- `messages/[chatRoomId]`
- `payment/success`
- `user/user-profile`

Technical signals:

- Uses Next 11.1.4 and legacy OpenSSL flags in scripts
- Declares `react` `^17.0.2` and `react-dom` `16.13.1`
- Production code suppresses `console.log`, `console.error`, and `console.warn`

References:

- `lesociety/latest/home/node/secret-time-next/package.json`
- `lesociety/latest/home/node/secret-time-next/pages/_app.js`

### 2. Backend API

Path: `lesociety/latest/home/node/secret-time-next-api`

Observed characteristics:

- Express app bootstrapped from `app.js`
- MongoDB via Mongoose
- Route modules for user, date, chat, request, payment, dashboard, country, influencer, notifications, and taxonomy data
- Rate limiting middleware is wired into route groups
- Health endpoint exists at `/api/v1/health`
- Cron job executes every minute and calls chat controller logic

References:

- `lesociety/latest/home/node/secret-time-next-api/app.js`
- `lesociety/latest/home/node/secret-time-next-api/routes/index.js`

### 3. Admin Panel

Path: `lesociety/latest/var/www/html/s_admin`

Observed characteristics:

- React app using `react-scripts`
- Protected routes for dashboard, user list, country management, photo verification, and document verification
- Lazy-loaded pages for some admin sections

References:

- `lesociety/latest/var/www/html/s_admin/package.json`
- `lesociety/latest/var/www/html/s_admin/src/router/index.js`

## Highest-Priority Findings

### 1. Secrets and sensitive config are handled unsafely

Priority: Critical

Evidence:

- Tracked env files exist in git:
  - `.env`
  - `lesociety/latest/var/www/html/s_admin/.env`
- `START_HERE_FIRST.md` includes concrete database credential values in the backend `.env` example.

Impact:

- Elevated risk of credential leakage, accidental reuse across environments, and compromised deployment posture.
- Documentation currently encourages direct editing of runtime env files inside the repo.

References:

- `.env`
- `lesociety/latest/var/www/html/s_admin/.env`
- `START_HERE_FIRST.md`

### 2. Frontend dependency stack is internally inconsistent

Priority: High

Evidence:

- The frontend declares `react` `^17.0.2` but `react-dom` `16.13.1`.
- All app scripts require `NODE_OPTIONS=--openssl-legacy-provider`.
- Next.js version is `^11.1.4`, which is materially behind current supported generations.

Impact:

- Higher risk of install/build instability, hydration/runtime edge cases, and Node version friction.
- The legacy OpenSSL flag suggests the runtime depends on compatibility behavior rather than a maintained upgrade path.

Reference:

- `lesociety/latest/home/node/secret-time-next/package.json`

### 3. CORS policy is effectively permissive despite comments implying restriction

Priority: High

Evidence:

- `allowedOrigins` is parsed from env but never used.
- `corsOptions.origin` is set to `true`, which reflects request origins broadly.

Impact:

- Increased exposure of authenticated API endpoints to unintended web origins.
- Current comments overstate actual restriction behavior.

Reference:

- `lesociety/latest/home/node/secret-time-next-api/app.js`

### 4. Documentation and code/config expectations are only partially aligned

Priority: Medium

Evidence:

- The onboarding docs emphasize `JWT_SECRET_TOKEN`.
- The backend env template documents `JWT_SECRET` and `JWT_EXPIRE`, while code and setup docs also reference `JWT_SECRET_TOKEN`.

Impact:

- Setup remains brittle and dependent on tribal knowledge.
- New contributors are likely to follow one source of truth and still get a broken login flow.

References:

- `START_HERE_FIRST.md`
- `lesociety/latest/home/node/secret-time-next-api/.env.template`
- `lesociety/latest/home/node/secret-time-next-api/helpers/validateApi.js`

### 5. Test coverage is insufficient for the size and risk profile of the system

Priority: Medium

Evidence:

- Top-level `package.json` has only a placeholder failing test script.
- The admin app contains the default CRA smoke test.
- The frontend has one ad hoc API script (`test-date-creation.js`), not an integrated test suite.

Impact:

- Core flows like login, payments, chat, and date creation are largely unprotected from regressions.
- The amount of documentation suggests manual validation is compensating for missing automated checks.

References:

- `package.json`
- `lesociety/latest/var/www/html/s_admin/src/App.test.js`
- `lesociety/latest/home/node/secret-time-next/test-date-creation.js`

## Secondary Observations

- The repository has no root `.gitignore`, despite tracking generated and environment-sensitive artifacts.
- The frontend and repo both include installed dependency directories and generated output directories such as `node_modules/` and `.next/` within the working tree.
- The admin app specifies `node: 24.x`, while the rest of the stack is based on substantially older package generations. That is a compatibility risk.
- The backend runs a cron task every minute from the web process, which can complicate horizontal scaling or duplicate background execution.
- The working tree is not clean; frontend package manifest/lock files have local modifications.

## Recommended Next Steps

### Immediate

1. Remove tracked `.env` files from version control and rotate any secrets that were ever committed.
2. Sanitize `START_HERE_FIRST.md` and related docs so examples use placeholders only.
3. Add a root `.gitignore` covering `.env*`, `node_modules/`, `.next/`, build artifacts, logs, and OS metadata.
4. Replace the permissive backend CORS setting with an explicit allowlist based on `ALLOWED_ORIGINS`.

### Short-Term

1. Normalize the frontend dependency set, starting with matching `react` and `react-dom`.
2. Decide the supported Node version across all three apps and document it once at repo root.
3. Add smoke tests for:
   - backend health and login
   - frontend login happy path
   - admin login and one protected route

### Medium-Term

1. Upgrade the frontend off the legacy Next 11 stack.
2. Separate runtime apps from archival documentation and bundled backups.
3. Move scheduled jobs out of the API web process if production deployment scales beyond one instance.

## Bottom Line

The codebase contains a real, moderately large product implementation, not a prototype. The main structural risk is not missing features but weak operational discipline around secrets, dependency age, and automated verification. If those three areas are addressed first, the codebase becomes substantially safer to maintain.

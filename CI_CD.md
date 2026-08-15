# CI/CD Pipeline Documentation

**Last Updated**: 2026-08-15  
**Status**: Active ✅

---

## 🚀 Overview

CornexConnect uses GitHub Actions for continuous integration and continuous deployment. The pipeline automatically:

1. ✅ Runs quality checks (TypeScript, tests, linting)
2. ✅ Performs security scans
3. ✅ Builds the application
4. ✅ Deploys to Vercel (frontend) and Railway (backend)
5. ✅ Sends notifications

---

## 📋 Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Trigger**: Push to `main` or `develop` branches, Pull Requests

**Jobs**:

#### Quality Checks
- **Runs on**: Ubuntu latest
- **Node versions**: 18.x, 20.x
- **Steps**:
  1. Checkout code
  2. Setup Node.js & npm cache
  3. Install dependencies (`npm ci`)
  4. TypeScript type checking (`npm run check`)
  5. ESLint validation (`npm run lint`)
  6. Run tests (`npm test`)
  7. Build application (`npm run build`)

#### Security Scan
- **Runs on**: Ubuntu latest
- **Steps**:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Run `npm audit` (moderate level)
  5. Run Snyk security scan (if token provided)

#### Deploy Frontend (Vercel)
- **Trigger**: Only on `main` branch pushes
- **Requires**: `quality-checks` job success
- **Environment Variables**:
  - `VITE_API_URL` (from secrets)
- **Action**: Uses official Vercel GitHub Action

#### Deploy Backend (Railway)
- **Trigger**: Only on `main` branch pushes
- **Requires**: `quality-checks` job success
- **Action**: Uses Railway CLI

#### Notifications
- **Trigger**: Always (after deploy jobs)
- **Sends**: Slack notification with deployment status

---

### 2. Dependency Updates (`dependencies.yml`)

**Trigger**: Every Monday at 9 AM UTC, Manual dispatch

**Jobs**:

#### Update Dependencies
- **Steps**:
  1. Checkout code
  2. Run `npm update`
  3. Run `npm audit fix`
  4. Create automated PR with changes

#### NPM Audit
- **Steps**:
  1. Checkout code
  2. Install dependencies
  3. Run `npm audit`
  4. Generate audit report JSON
  5. Upload report as artifact

---

### 3. Release (`release.yml`)

**Trigger**: When tag matching `v*` is pushed, Manual dispatch

**Jobs**:

#### Release
- **Steps**:
  1. Checkout code
  2. Run all tests
  3. Build application
  4. Create GitHub Release
  5. Publish Docker image

#### Notify Release
- **Steps**:
  1. Send Slack notification with release details

---

## 🔐 Required Secrets

Add these to GitHub repository settings → Secrets:

```
VERCEL_TOKEN              # Vercel API token
VERCEL_ORG_ID             # Your Vercel organization ID
VERCEL_PROJECT_ID         # CornexConnect Vercel project ID
RAILWAY_TOKEN             # Railway API token
SNYK_TOKEN                # Snyk security token (optional)
SLACK_WEBHOOK             # Slack webhook for notifications
DOCKER_USERNAME           # Docker Hub username
DOCKER_PASSWORD           # Docker Hub token
GITHUB_TOKEN              # Auto-provided by GitHub Actions
VITE_API_URL_PROD         # Production API URL
```

### Getting Secrets

**Vercel Token**:
```bash
# Visit: https://vercel.com/account/tokens
# Create new token
```

**Railway Token**:
```bash
# Visit: https://railway.app/account/tokens
# Create new token
```

**Slack Webhook**:
```
# Visit: https://api.slack.com/messaging/webhooks
# Create incoming webhook for your channel
```

**Docker Hub Token**:
```
# Visit: https://hub.docker.com/settings/security
# Create new access token
```

---

## 📊 Pipeline Status

### On Every Push

```
┌─ Push to GitHub
│
├─ Quality Checks (In Parallel)
│  ├─ TypeScript type checking
│  ├─ ESLint linting
│  ├─ Run tests
│  └─ Build verification
│
├─ Security Scan (In Parallel)
│  ├─ npm audit
│  └─ Snyk scan
│
├─ If All Checks Pass + main branch
│  ├─ Deploy to Vercel (frontend)
│  └─ Deploy to Railway (backend)
│
└─ Notify (Slack)
   └─ Deployment status
```

### On Tag Push (Release)

```
┌─ Push tag v*.*.*
│
├─ Run all tests
├─ Build application
├─ Create GitHub Release
├─ Publish Docker image
│
└─ Notify (Slack)
   └─ Release announcement
```

### Scheduled (Weekly)

```
┌─ Every Monday 9 AM UTC
│
├─ Update dependencies
│  └─ Create PR with changes
│
└─ Audit security
   └─ Generate report
```

---

## ✅ Status Checks

GitHub will require these checks to pass before merging PRs:

- ✅ `quality-checks / Tests`
- ✅ `quality-checks / Build`
- ✅ `security / npm audit`
- ✅ `security / snyk scan`

---

## 🔧 Local Development

### Pre-commit Checks

Run these locally before pushing:

```bash
# Type checking
npm run check

# Linting
npm run lint

# Tests
npm test

# Build
npm run build

# All checks
npm run ci
```

### Git Hooks (Optional)

Install Husky for automatic pre-commit checks:

```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run check && npm run lint"
```

---

## 📈 Monitoring

### GitHub Actions Dashboard

1. Go to repository → **Actions** tab
2. View all workflow runs
3. Click run to see detailed logs
4. Review job outputs and artifacts

### Deployment Monitoring

**Vercel**:
- Visit: https://vercel.com/dashboard
- View deployments, logs, analytics

**Railway**:
- Visit: https://railway.app
- View services, logs, metrics

---

## 🐛 Troubleshooting

### Deployment Fails

**Check**:
1. Verify secrets are set correctly
2. Review GitHub Actions logs
3. Check target platform (Vercel/Railway) status
4. Verify environment variables

**Debug**:
```bash
# Run locally
NODE_ENV=production npm run build

# Check for errors
npm audit
npm run check
```

### Tests Fail

**Check**:
1. Run locally: `npm test`
2. Review test output
3. Check for environment dependencies
4. Verify Node version compatibility

### Type Errors

**Fix**:
```bash
npm run check
# Fix TypeScript errors
```

### Security Audit Fails

**Review**:
```bash
npm audit
# Review vulnerabilities
# Update packages: npm update
# Force fix: npm audit fix --force
```

---

## 📝 Example Workflows

### Merge a Feature

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# Commit: git commit -m "..."

# Push branch
git push origin feature/my-feature

# Create Pull Request on GitHub

# GitHub Actions automatically:
# ✅ Runs quality checks
# ✅ Runs security scan
# ✅ Reports results

# After approval and merge:
# ✅ Deploys to staging (develop branch)
# ✅ Sends Slack notification
```

### Release New Version

```bash
# Create version tag
git tag -a v2.7.0 -m "Release version 2.7.0"

# Push tag
git push origin v2.7.0

# GitHub Actions automatically:
# ✅ Runs all tests
# ✅ Builds application
# ✅ Creates GitHub Release
# ✅ Publishes Docker image
# ✅ Notifies team
```

### Update Dependencies

```bash
# Wait for Monday 9 AM UTC
# GitHub Actions creates automated PR

# Review PR
# Run tests locally to verify
# Merge PR

# Auto-deployment triggers
```

---

## 🚀 Deployment Strategies

### Staging (develop branch)

- Automatically deploys to staging environment
- Useful for testing before production
- Optional: Use Vercel preview deployments

### Production (main branch)

- Automatically deploys to production
- After all quality checks pass
- Zero-downtime deployment (handled by platforms)

### Rollback

**Vercel**:
```
Dashboard → Deployments → Click previous → Redeploy
```

**Railway**:
```
Dashboard → Services → History → Redeploy previous version
```

---

## 📊 Pipeline Metrics

### Typical Execution Times

| Job | Duration |
|-----|----------|
| Quality Checks | ~3-5 minutes |
| Security Scan | ~2-3 minutes |
| Deploy Vercel | ~2-3 minutes |
| Deploy Railway | ~3-5 minutes |
| **Total** | **~10-15 minutes** |

### Success Rate Target

- **Quality Checks**: 99%+
- **Security Scans**: 100%
- **Deployments**: 99%+

---

## 🔔 Notifications

### Slack Channel Setup

1. Create channel: `#cornexconnect-deployments`
2. Create incoming webhook
3. Add webhook URL to GitHub Secrets
4. Messages automatically posted:
   - ✅ Deployment success
   - ❌ Build failures
   - ⚠️ Security warnings
   - 🔄 Dependency updates

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Manual deployment
- [PACKAGES.md](PACKAGES.md) - Dependencies
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design

---

## 🤝 Contributing

When contributing:

1. Create feature branch
2. Make changes
3. Commit with clear messages
4. Push branch
5. Create Pull Request
6. Wait for CI/CD to pass
7. Request review
8. Merge when approved

---

## 🔮 Future Enhancements

- [ ] Performance benchmarking
- [ ] Visual regression testing
- [ ] E2E testing (Cypress/Playwright)
- [ ] Code coverage reporting
- [ ] Documentation generation
- [ ] Automated changelogs
- [ ] Canary deployments
- [ ] Blue-green deployments

---

**Status**: ✅ Active and Monitoring  
**Last Updated**: 2026-08-15  
**Maintained By**: DevOps Team

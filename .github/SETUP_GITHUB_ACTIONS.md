# GitHub Actions Setup Guide

**Last Updated**: 2026-08-15

---

## 🚀 Quick Setup

Follow these steps to enable the CI/CD pipeline for your repository:

---

## Step 1: Create GitHub Secrets

### 1.1 Navigate to Secrets

1. Go to your repository: https://github.com/heyns1000/cornexconnect
2. Click **Settings** → **Secrets and variables** → **Actions**

### 1.2 Add Vercel Secrets

**Add `VERCEL_TOKEN`**:
1. Visit: https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: `github-actions`
4. Expiry: 90 days
5. Copy token
6. In GitHub Secrets, click **New repository secret**
7. Name: `VERCEL_TOKEN`
8. Paste token
9. Click **Add secret**

**Add `VERCEL_ORG_ID`**:
1. Visit: https://vercel.com/account
2. Go to **Settings** → **General**
3. Copy "Team ID" or "User ID"
4. In GitHub Secrets, add new secret
5. Name: `VERCEL_ORG_ID`
6. Paste ID

**Add `VERCEL_PROJECT_ID`**:
1. Visit: https://vercel.com/dashboard
2. Select CornexConnect project
3. Go to **Settings** → **General**
4. Copy "Project ID"
5. In GitHub Secrets, add new secret
6. Name: `VERCEL_PROJECT_ID`
7. Paste ID

**Add `VITE_API_URL_PROD`**:
1. Get your Railway backend URL (from [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md))
2. Example: `https://cornexconnect-prod.railway.app/api`
3. In GitHub Secrets, add new secret
4. Name: `VITE_API_URL_PROD`
5. Paste URL

### 1.3 Add Railway Secrets

**Add `RAILWAY_TOKEN`**:
1. Visit: https://railway.app/account/tokens
2. Click **Create Token**
3. Name: `github-actions`
4. Copy token
5. In GitHub Secrets, add new secret
6. Name: `RAILWAY_TOKEN`
7. Paste token

### 1.4 Add Slack Notifications (Optional)

**Add `SLACK_WEBHOOK`**:
1. Visit: https://api.slack.com/messaging/webhooks
2. Click **Create New App**
3. Select **From scratch**
4. Name: `CornexConnect Deployments`
5. Workspace: Select your workspace
6. Go to **Incoming Webhooks**
7. Click **Add New Webhook to Workspace**
8. Select channel: `#cornexconnect-deployments` (or create it)
9. Click **Allow**
10. Copy **Webhook URL**
11. In GitHub Secrets, add new secret
12. Name: `SLACK_WEBHOOK`
13. Paste URL

### 1.5 Add Security Scanning (Optional)

**Add `SNYK_TOKEN`**:
1. Visit: https://snyk.io/account/
2. Go to **Account settings** → **General** → **Auth Token**
3. Copy token
4. In GitHub Secrets, add new secret
5. Name: `SNYK_TOKEN`
6. Paste token

### 1.6 Add Docker Hub (Optional, for releases)

**Add `DOCKER_USERNAME`**:
1. GitHub Secrets → New secret
2. Name: `DOCKER_USERNAME`
3. Value: Your Docker Hub username

**Add `DOCKER_PASSWORD`**:
1. Visit: https://hub.docker.com/settings/security
2. Click **New Access Token**
3. Name: `github-actions`
4. Copy token
5. GitHub Secrets → New secret
6. Name: `DOCKER_PASSWORD`
7. Paste token

---

## Step 2: Verify Workflows

### 2.1 Check Workflow Files

```bash
# Verify files exist
ls -la .github/workflows/

# Should show:
# - ci-cd.yml
# - dependencies.yml
# - release.yml
```

### 2.2 Enable Workflows

1. Go to repository → **Actions** tab
2. All workflows should be visible
3. Click each workflow to enable (if needed)

---

## Step 3: Test CI/CD Pipeline

### 3.1 Trigger Quality Checks

```bash
# Create a test branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# Test CI/CD" >> README.md

# Commit and push
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin test/ci-pipeline
```

### 3.2 Create Pull Request

1. Go to repository → **Pull requests**
2. Click **New pull request**
3. Compare: `test/ci-pipeline` → `main`
4. Click **Create pull request**

### 3.3 Monitor Workflow

1. Go to **Actions** tab
2. See "CI/CD Pipeline" workflow running
3. Monitor status:
   - 🟡 Running
   - 🟢 Success
   - 🔴 Failed

### 3.4 Review Results

1. Click workflow run
2. Expand jobs to see:
   - TypeScript checks
   - Tests
   - Build output
   - Any errors

### 3.5 Merge Test PR

```bash
# After tests pass
git checkout main
git merge test/ci-pipeline
git push origin main

# Delete branch
git branch -d test/ci-pipeline
git push origin --delete test/ci-pipeline
```

---

## Step 4: Production Deployment

### 4.1 Verify Secrets Configured

```bash
# All secrets should be set
# Verify by checking GitHub Secrets page
```

### 4.2 Push to Main

```bash
# Any push to main will:
# ✅ Run quality checks
# ✅ Run security scan
# ✅ Deploy to Vercel (frontend)
# ✅ Deploy to Railway (backend)
# ✅ Send notifications
```

### 4.3 Monitor Deployment

1. Go to **Actions** tab
2. See "CI/CD Pipeline" workflow
3. Watch "Deploy Frontend" and "Deploy Backend" jobs
4. Check deployment status:
   - **Vercel**: https://vercel.com/dashboard
   - **Railway**: https://railway.app/dashboard

---

## 🔄 Automated Tasks

### Weekly Dependency Updates

**Every Monday at 9 AM UTC**:
- Automatically runs `npm update`
- Creates pull request with changes
- Review and merge when ready

### Manual Dependency Check

```bash
# Trigger manually
# Go to Actions → Dependencies → Run workflow
```

---

## 📊 Monitoring Deployments

### GitHub Actions Dashboard

1. Repository → **Actions** tab
2. See all workflow runs
3. Click run for details

### Slack Notifications

Messages will be sent to `#cornexconnect-deployments`:
- ✅ Deployment success
- ❌ Build failures
- ⚠️ Security warnings

---

## 🐛 Troubleshooting

### Workflow Not Running

**Check**:
1. Workflow files in `.github/workflows/`
2. GitHub Actions enabled (Settings → Actions)
3. Branch filter matches (main/develop)

### Deployment Fails

**Check**:
1. All secrets configured correctly
2. Vercel/Railway accounts active
3. Review workflow logs for errors

### Secrets Not Found

**Fix**:
1. Verify secret names match exactly (case-sensitive)
2. Ensure secrets are in repository, not organization
3. Regenerate tokens if expired

### API Errors

**Check**:
1. Vercel/Railway tokens are valid
2. Tokens have correct permissions
3. Project IDs are correct
4. Webhook URLs are valid

---

## ✅ Verification Checklist

After setup, verify:

- [ ] All GitHub Secrets added
- [ ] Workflow files in `.github/workflows/`
- [ ] Test PR created and passed
- [ ] Deployment to main successful
- [ ] Vercel deployment visible
- [ ] Railway deployment visible
- [ ] Slack notification received

---

## 📞 Support

If CI/CD pipeline issues arise:

1. Check GitHub Actions logs
2. Verify secrets are correct
3. Review workflow YAML syntax
4. Check platform status (Vercel, Railway)
5. Review error messages carefully

---

## 🔮 Next Steps

After CI/CD is configured:

1. ✅ Every push triggers automated checks
2. ✅ Main branch auto-deploys
3. ✅ Team gets notifications
4. ✅ Production stays secure
5. ✅ Dependencies stay updated

---

**Status**: Ready for Configuration  
**Setup Time**: ~30 minutes  
**Complexity**: Intermediate

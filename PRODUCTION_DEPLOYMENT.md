# CornexConnect v2.6 - Production Deployment Guide

## 🚀 Deployment Stack
- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Node.js + Express + PostgreSQL)
- **Database**: Neon PostgreSQL (serverless)
- **Git**: GitHub (heyns1000/cornexconnect)

---

## 📋 Prerequisites

Before deploying, ensure you have accounts on:
1. **Vercel** - https://vercel.com (sign up with GitHub)
2. **Railway** - https://railway.app (sign up with GitHub)
3. **Neon** - https://neon.tech (sign up with GitHub)

All three support GitHub OAuth for easy authentication.

---

## 🗄️ Step 1: Set Up Neon PostgreSQL Database

### 1.1 Create Neon Account & Project
1. Go to https://neon.tech and sign up with GitHub
2. Click **New project**
3. Name it: `cornexconnect-prod`
4. Region: Choose closest to your users
5. Click **Create project**

### 1.2 Get Database Connection String
1. In your Neon project, go to **Connection string**
2. Copy the connection string that looks like:
   ```
   postgresql://user:password@host/cornexconnect?sslmode=require
   ```
3. **Save this** - you'll need it for Railway

### 1.3 Initialize Database Schema
1. From your local machine, run:
   ```bash
   cd /Users/samantha/Documents/cornexconnect
   DATABASE_URL="your-neon-connection-string" npm run db:push
   ```
   This creates all necessary tables using Drizzle ORM

---

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project
1. Go to https://railway.app
2. Click **+ New Project**
3. Select **Deploy from GitHub repo**
4. Authorize GitHub and select `heyns1000/cornexconnect`
5. Railway will auto-detect the Node.js project

### 2.2 Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```env
DATABASE_URL=postgresql://user:password@neon-host/cornexconnect?sslmode=require
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://cornexconnect.vercel.app
```

### 2.3 Configure Build & Start Commands
In Railway, go to **Settings**:

**Build Command:**
```bash
npm install && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

**Start Command:**
```bash
node dist/index.js
```

### 2.4 Deploy
Click **Deploy** button. Railway will build and deploy automatically.

**Get your backend URL:**
- Once deployed, Railway will provide a public URL like: `https://cornexconnect-prod.railway.app`
- Your API will be at: `https://cornexconnect-prod.railway.app/api`

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project
1. Go to https://vercel.com
2. Click **Import Project**
3. Select GitHub → `heyns1000/cornexconnect`
4. Click **Import**

### 3.2 Configure Project Settings
**Root Directory:** Leave empty (Vercel auto-detects monorepo)

**Build & Output Settings:**
- Build Command: `NODE_ENV=production npx vite build --config vite.config.ts`
- Output Directory: `dist/public`
- Install Command: `npm install`

**Environment Variables:**
Go to **Settings** → **Environment Variables** and add:

```env
VITE_API_URL=https://cornexconnect-prod.railway.app/api
```

### 3.3 Deploy
Click **Deploy**. Vercel will:
1. Build your React frontend
2. Optimize assets
3. Deploy to global CDN

**Your app will be live at:** `https://cornexconnect.vercel.app`

---

## 🔗 Step 4: Connect Frontend to Backend

### 4.1 Update CORS Settings
On Railway backend, update the environment variable:
```env
ALLOWED_ORIGINS=https://cornexconnect.vercel.app
```

### 4.2 Verify API Connection
1. Visit https://cornexconnect.vercel.app
2. Open browser DevTools → **Network** tab
3. Make an API call and verify it reaches your Railway backend
4. Check the API response (should be from `cornexconnect-prod.railway.app`)

---

## 🧪 Post-Deployment Checklist

- [ ] Database initialized with Drizzle schema
- [ ] Backend running on Railway with environment variables set
- [ ] Frontend built and deployed on Vercel
- [ ] CORS configured to allow Vercel domain
- [ ] API calls working end-to-end
- [ ] Database connection stable
- [ ] SSL certificates valid (auto-managed by both platforms)

---

## 📊 Monitoring & Logs

### Railway Logs
```bash
# View live logs
railway logs
```

### Vercel Logs
1. Dashboard → Project → **Deployments** tab
2. Click latest deployment
3. View **Build Logs** and **Function Logs**

---

## 🔄 Redeploying After Code Changes

### Quick Deploy
```bash
cd /Users/samantha/Documents/cornexconnect
git add .
git commit -m "Production update: ..."
git push origin main
```

Both Vercel and Railway watch your GitHub repo and auto-deploy on push!

### Manual Rebuild
- **Vercel**: Dashboard → Deployments → **Redeploy**
- **Railway**: Dashboard → **Redeploy**

---

## 🚨 Troubleshooting

### Frontend not connecting to backend
1. Check `VITE_API_URL` environment variable in Vercel
2. Verify `ALLOWED_ORIGINS` in Railway includes Vercel domain
3. Check browser console for CORS errors

### Database connection failing
1. Verify Neon connection string is correct
2. Check `DATABASE_URL` in Railway matches Neon string
3. Run locally: `DATABASE_URL="..." npm run db:push`

### Build failing on Railway
1. Check build command uses `NODE_ENV=production`
2. Verify all dependencies in `package.json`
3. Check Railway build logs for errors

### 502 Bad Gateway errors
1. Check if backend is actually running on Railway
2. Verify `PORT` is set to `5000`
3. Check database connection is alive

---

## 💾 Database Backups

Neon PostgreSQL automatically backs up your data daily. To restore:
1. Go to Neon dashboard
2. Project → **Backups** tab
3. Select backup and click **Restore**

---

## 📈 Scaling & Production Best Practices

- **Auto-scaling**: Railway scales automatically
- **CDN**: Vercel serves frontend from 300+ global locations
- **Database**: Neon handles connections pooling automatically
- **Monitoring**: Both platforms provide uptime monitoring

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Neon Docs: https://neon.tech/docs
- Your Repository: https://github.com/heyns1000/cornexconnect

---

**Status**: ✅ Ready for Production
**Last Updated**: 2026-08-15
**Deployed By**: Heyns Schoeman

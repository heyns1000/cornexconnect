# CornexConnect™ v2.6 - Deployment Guide

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Git

### 1. Clone and Install
```bash
git clone https://github.com/heyns1000/cornexconnect.git
cd cornexconnect

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Environment Configuration

**Server Environment (.env)**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

**Client Environment (.env)**
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup
```bash
cd server
npm run db:push
```

This will create all necessary tables in your PostgreSQL database.

### 4. Start Development Servers
```bash
# From project root
npm run dev
```

This starts both:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📦 Production Deployment

### Build for Production
```bash
# Build both client and server
npm run build

# Or build separately
npm run build:client
npm run build:server
```

### Deployment Options

#### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `client`
4. Set environment variable: `VITE_API_URL`
5. Deploy

**Backend (Railway):**
1. Create new project in Railway
2. Add PostgreSQL database
3. Connect GitHub repository
4. Set root directory to `server`
5. Add environment variables:
   - `DATABASE_URL` (auto-provided by Railway PostgreSQL)
   - `PORT` (auto-provided)
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS` (your Vercel domain)
6. Deploy

#### Option 2: Netlify (Frontend) + Render (Backend)

**Frontend (Netlify):**
1. Connect GitHub repository
2. Build command: `cd client && npm install && npm run build`
3. Publish directory: `client/dist`
4. Environment variable: `VITE_API_URL`
5. Deploy

**Backend (Render):**
1. New Web Service
2. Build command: `cd server && npm install && npm run build`
3. Start command: `cd server && npm start`
4. Add environment variables
5. Deploy

#### Option 3: Single Server (VPS/Cloud)

**Using PM2:**
```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd server
pm2 start dist/index.js --name cornexconnect-api

# Serve frontend with nginx or serve
npm install -g serve
cd ../client
pm2 start "serve -s dist -p 3000" --name cornexconnect-web

# Save PM2 configuration
pm2 save
pm2 startup
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/cornexconnect/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🗄️ Database Setup

### Neon PostgreSQL (Recommended)

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in server/.env
5. Run migrations: `npm run db:push`

### Other PostgreSQL Providers

Works with any PostgreSQL provider:
- Supabase
- Railway
- Heroku Postgres
- AWS RDS
- DigitalOcean Managed Databases

## 🔐 Security Checklist

- [ ] Change all default environment variables
- [ ] Set strong database password
- [ ] Configure CORS with specific origins
- [ ] Enable SSL/TLS for database connection
- [ ] Use HTTPS for production deployment
- [ ] Set `NODE_ENV=production`
- [ ] Never commit `.env` files
- [ ] Rotate API keys regularly
- [ ] Enable database connection pooling
- [ ] Set up monitoring and alerts

## 📊 Performance Optimization

### Frontend
- ✅ Code splitting enabled (Vite)
- ✅ Asset optimization
- ✅ TanStack Query caching
- Recommended: Add CDN (Cloudflare, Fastly)

### Backend
- ✅ Database connection pooling (Neon)
- Recommended: Add Redis for caching
- Recommended: Implement rate limiting
- Recommended: Enable compression middleware

### Database
- ✅ UUID indexes for fast lookups
- ✅ Timestamp indexes
- Recommended: Add composite indexes for common queries
- Recommended: Enable query result caching

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy CornexConnect

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build Client
        run: |
          cd client
          npm install
          npm run build
      
      - name: Build Server
        run: |
          cd server
          npm install
          npm run build
      
      - name: Deploy
        # Add your deployment steps here
```

## 🧪 Testing

### Load Sample Data
```bash
# Use provided sample data
# Navigate to http://localhost:5173
# Go to "Import Data" section
# Upload sample-data/skus.csv
# Upload sample-data/customers.csv
```

### Health Check
```bash
# Check API health
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","message":"CornexConnect™ v2.6 API is running"}
```

## 📈 Monitoring

### Recommended Tools
- **Frontend**: Vercel Analytics, Google Analytics
- **Backend**: New Relic, Datadog, or Sentry
- **Database**: Neon built-in monitoring
- **Uptime**: UptimeRobot, Pingdom

### Logs
```bash
# View PM2 logs
pm2 logs cornexconnect-api

# View specific log
pm2 logs cornexconnect-api --lines 100
```

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
cd server
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### Build Failures
```bash
# Clear caches
rm -rf client/node_modules client/dist
rm -rf server/node_modules server/dist

# Reinstall
cd client && npm install && cd ..
cd server && npm install && cd ..

# Rebuild
npm run build
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/heyns1000/cornexconnect/issues
- Email: support@cornexconnect.com
- Documentation: See README.md and FEATURES.md

---

**CornexConnect™ v2.6**  
Pretoria, South Africa  
Production-Ready Platform for EPS Cornice Manufacturing

# CornexConnect v2.6 - System Architecture

**Last Updated**: 2026-08-15  
**Version**: 2.6  
**Status**: Production Ready ✅

---

## 📐 Architecture Overview

CornexConnect is a **full-stack monorepo** enterprise application with a modular, scalable architecture designed for the EPS cornice manufacturing industry in South Africa.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
│  React 18 + Vite + TailwindCSS + Framer Motion                  │
│  (Vercel CDN - Global Distribution)                             │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY TIER                             │
│  Express.js + TypeScript                                        │
│  (Railway - Containerized Node.js)                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Routes:                                                 │   │
│  │ • /api/bulk-import - File import & processing          │   │
│  │ • /api/products - Product catalog                      │   │
│  │ • /api/inventory - Stock management                    │   │
│  │ • /api/hardware-stores - Store directory               │   │
│  │ • /api/achievements - Gamification                     │   │
│  │ • /api/dashboard - Real-time metrics                   │   │
│  │ • /api/ai - AI mood detection                          │   │
│  │ • /api/fruitful-planet - 93 repos integration          │   │
│  │ • /relay/cornexconnect - BuildMart signal relay        │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ TCP/PostgreSQL
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA TIER                                    │
│  PostgreSQL 16 (Neon Serverless)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tables:                                                 │   │
│  │ • users - User accounts & authentication               │   │
│  │ • sessions - Session management                        │   │
│  │ • products - Product catalog (34 SKUs)                 │   │
│  │ • inventory - Stock levels by warehouse                │   │
│  │ • hardware_stores - Store directory (3,197+)           │   │
│  │ • bulk_import_sessions - Import history                │   │
│  │ • achievements - Achievement tracking                  │   │
│  │ • user_progress - Achievement progress                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    Storage         Integration      Cache
```

---

## 🏛️ Layered Architecture

### Layer 1: Presentation Layer (Frontend)

**Technology**: React 18 + Vite + Tailwind CSS + TypeScript

**Components**:
- UI Components (28 Radix UI components)
- Pages (Dashboard, Inventory, Stores, etc.)
- Hooks (useAuth, useTranslation, usePageTransition)
- State Management (TanStack Query)

**Key Features**:
- Responsive design (mobile, tablet, desktop)
- Real-time data updates
- Glass morphism UI
- Animations with Framer Motion
- 190+ currency support
- Multi-language support

**Deployment**: Vercel (Global CDN)

### Layer 2: API Gateway Layer (Backend)

**Technology**: Express.js + TypeScript + Node.js 18+

**Components**:
- Route handlers (routes.ts)
- Middleware (authentication, logging, error handling)
- Business logic services
- File upload processing
- AI integration

**Middleware Stack**:
```
Request → Logger → CORS → Auth Middleware → Rate Limiter → Route Handler → Response
```

**Key Services**:
- Authentication Service (Passport.js)
- File Processing Service (Multer, XLSX)
- Achievement Service
- Storage Service (Database ORM)

**Deployment**: Railway (Containerized Node.js)

### Layer 3: Data Access Layer (ORM)

**Technology**: Drizzle ORM + PostgreSQL

**Responsibilities**:
- Database schema definition
- Query building & optimization
- Data validation (Zod schemas)
- Connection pooling
- Transaction management

**Key Features**:
- Type-safe queries (TypeScript)
- Automatic migrations
- Schema versioning
- Real-time introspection

**Deployment**: Neon PostgreSQL (Serverless)

### Layer 4: Data Storage Layer (Database)

**Technology**: PostgreSQL 16

**Data Stores**:
- Relational data (products, stores, inventory)
- User data & sessions
- Audit logs
- Historical data

---

## 📊 Database Schema

### Core Tables

#### `users`
```sql
id: UUID PRIMARY KEY
username: VARCHAR(255) UNIQUE
email: VARCHAR(255) UNIQUE
password_hash: VARCHAR(255)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `products`
```sql
id: UUID PRIMARY KEY
sku: VARCHAR(100) UNIQUE
name: VARCHAR(255)
category: ENUM('EPS', 'BR', 'LED')
price: DECIMAL(10,2)
currency: VARCHAR(3)
stock: INTEGER
supplier_id: UUID FOREIGN KEY
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `hardware_stores`
```sql
id: UUID PRIMARY KEY
name: VARCHAR(255)
city: VARCHAR(100)
province: VARCHAR(100)
country: VARCHAR(100)
address: TEXT
phone: VARCHAR(20)
email: VARCHAR(255)
manager: VARCHAR(255)
latitude: DECIMAL(10,8)
longitude: DECIMAL(11,8)
store_type: ENUM('retail', 'wholesale', 'distributor')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `inventory`
```sql
id: UUID PRIMARY KEY
warehouse_id: UUID FOREIGN KEY
product_id: UUID FOREIGN KEY
quantity: INTEGER
reorder_level: INTEGER
last_restocked: TIMESTAMP
location: VARCHAR(255)
```

#### `bulk_import_sessions`
```sql
id: VARCHAR(255) PRIMARY KEY
name: VARCHAR(255)
total_files: INTEGER
processed_files: INTEGER
status: ENUM('pending', 'completed', 'failed')
total_imported: INTEGER
files: JSONB
created_at: TIMESTAMP
```

#### `achievements`
```sql
id: VARCHAR(255) PRIMARY KEY
name: VARCHAR(255)
description: TEXT
icon: VARCHAR(255)
requirement: INTEGER
category: VARCHAR(100)
```

#### `user_progress`
```sql
id: UUID PRIMARY KEY
user_id: UUID FOREIGN KEY
achievement_id: VARCHAR(255) FOREIGN KEY
progress: INTEGER
unlocked_at: TIMESTAMP
created_at: TIMESTAMP
```

---

## 🔄 Data Flow Architecture

### Bulk Import Flow

```
User Upload Files
      ↓
Multer (File handling)
      ↓
XLSX Parser (Data extraction)
      ↓
Validation (Zod schemas)
      ↓
Transform to Database Schema
      ↓
Batch Insert (Drizzle ORM)
      ↓
Database Transaction Commit
      ↓
Achievement System (Record metrics)
      ↓
Response to Client
      ↓
TanStack Query (UI update)
```

### Product Display Flow

```
Client Request (GET /api/products)
      ↓
Express Router
      ↓
Storage Service
      ↓
Drizzle Query Builder
      ↓
PostgreSQL Execute
      ↓
Parse Results
      ↓
Format Response (JSON)
      ↓
Cache (TanStack Query)
      ↓
UI Render
```

### Authentication Flow

```
User Login (username/password)
      ↓
Passport Local Strategy
      ↓
Database Query (user lookup)
      ↓
Password Hash Verification
      ↓
Create Session (PostgreSQL session store)
      ↓
Send Cookie to Client
      ↓
Subsequent Requests (Include cookie)
      ↓
Middleware Verify Session
      ↓
Request Processing
```

---

## 🔗 Integration Architecture

### Fruitful Planet Integration (93 GitHub Repos)

```
CornexConnect
      ↓
┌─────────────────────────────┐
│ Fruitful Planet Hub         │
│ • Rhino Strikes Execution   │
│ • Ant Lattice Framework     │
└─────────────────┬───────────┘
                  │
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
  Repo 1       Repo 2 ... Repo 93
(Module A)   (Module B)  (Service X)
    ↓             ↓             ↓
Service A    Service B    Service X
    ↓             ↓             ↓
└─────────────────┼─────────────┘
                  ↓
            Core Platform
```

**Features**:
- Real-time synchronization
- Version management
- Dependency resolution
- Automated testing & CI/CD

### BuildMart Signal Relay Architecture

```
BuildMart Africa Buyer App
      ↓
Signal Relay (No IP exposure)
      ↓
Encryption Layer
      ↓
Network Tunnel
      ↓
CornexConnect /relay/cornexconnect
      ↓
Database Storage
      ↓
Response Signal (Relay back)
      ↓
BuildMart App (Updates UI)
```

**Security Features**:
- No direct IP exposure
- End-to-end encryption
- Signal integrity verification
- Failover mechanisms

### Google Maps Integration

```
Hardware Stores Data
      ↓
Geocoding Service
      ↓
Google Maps API (js-api-loader)
      ↓
Map Rendering (React component)
      ↓
Store Markers & Info Windows
      ↓
User Interaction (Filtering, search)
```

### Google Cloud Storage Integration

```
File Upload (Uppy)
      ↓
Express Multer Handler
      ↓
Google Cloud Storage Client (@google-cloud/storage)
      ↓
Secure Storage
      ↓
Signed URLs (Download)
```

---

## 🏗️ System Components

### Frontend Components

```
App (Root)
├── Pages/
│   ├── Dashboard
│   ├── Products
│   ├── Inventory
│   ├── HardwareStores
│   ├── BulkImport
│   └── Achievements
├── Components/
│   ├── UI/ (28 Radix components)
│   ├── Layout/
│   │   ├── Header
│   │   ├── Sidebar
│   │   └── Footer
│   └── Custom/
│       ├── ProductTable
│       ├── StoreMap
│       └── ImportProgress
├── Hooks/
│   ├── useAuth
│   ├── useTranslation
│   ├── usePageTransition
│   └── useRealTimeData
├── State/
│   ├── TanStack Query (data fetching)
│   └── React Context (UI state)
└── Utils/
    ├── authUtils
    ├── formatters
    └── validators
```

### Backend Components

```
Express App
├── Routes/
│   ├── bulk-import.ts
│   ├── products.ts
│   ├── inventory.ts
│   ├── stores.ts
│   ├── achievements.ts
│   ├── dashboard.ts
│   ├── ai.ts
│   ├── fruitful-planet.ts
│   └── buildmart-signal.ts
├── Middleware/
│   ├── Authentication
│   ├── Logging
│   ├── ErrorHandling
│   └── CORS
├── Services/
│   ├── StorageService
│   ├── AchievementService
│   ├── FileProcessingService
│   └── AIService
└── Utils/
    ├── Database
    ├── Validation
    └── Helpers
```

---

## 🔐 Security Architecture

### Authentication & Authorization

```
User Input
    ↓
Passport.js Middleware
    ├─ Local Strategy (username/password)
    ├─ Password Hash (bcrypt)
    └─ Session Management (PostgreSQL)
    ↓
Authenticated Request
    ├─ Check Session Cookie
    ├─ Verify User ID
    └─ Load User Context
    ↓
Route Handler
    ├─ Authorization Check (permissions)
    └─ Data Access Control
```

### Data Protection

- **In Transit**: HTTPS/TLS encryption
- **At Rest**: Database encryption (PostgreSQL SSL)
- **Sensitive Fields**: Hashed passwords, encrypted tokens
- **API Keys**: Environment variables, never committed

### CORS Configuration

```typescript
allowedOrigins: [
  'https://cornexconnect.vercel.app',      // Production
  'http://localhost:5173',                  // Development
  'https://cornexconnect-dev.vercel.app'    // Staging
]
```

---

## 📈 Scalability Architecture

### Horizontal Scaling

**Frontend**:
- Vercel global CDN automatically scales
- Static site generation
- Edge functions for dynamic content

**Backend**:
- Railway auto-scales containers
- Load balancing (handled by Railway)
- Horizontal pod autoscaling

**Database**:
- Neon connection pooling
- Read replicas (for scaling reads)
- Partitioning (for large tables)

### Vertical Scaling

- Increase Railway container memory
- Upgrade Neon compute tier
- Optimize queries & indexes

### Caching Strategy

```
Request
    ↓
Browser Cache (TanStack Query)
    ↓
Memory Cache (Node.js)
    ↓
Database Query
    ↓
Cache Result
    ↓
Return Response
```

---

## 🚀 Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────┐
│            GitHub Repository                │
│  (Source of Truth)                          │
└────────────┬────────────────────────────────┘
             │ git push
    ┌────────┴────────┐
    ↓                 ↓
┌─────────────┐  ┌──────────────────┐
│   Vercel    │  │     Railway      │
│ (Frontend)  │  │   (Backend)      │
│             │  │                  │
│ - Build     │  │ - Build (Docker) │
│ - CDN       │  │ - Deploy Container
│ - SSL       │  │ - Auto-scale     │
│ - Analytics │  │ - Logs           │
└────────┬────┘  └────────┬─────────┘
         │                 │
         └────────┬────────┘
                  ↓
         ┌───────────────────┐
         │  Neon PostgreSQL  │
         │   (Database)      │
         │                   │
         │ - Backups         │
         │ - Replication     │
         │ - Connection Pool │
         └───────────────────┘
```

### CI/CD Pipeline (Recommended)

```
Code Push to GitHub
    ↓
GitHub Actions Trigger
    ├─ Run Tests
    ├─ Run Linter
    ├─ Type Check
    ├─ Build Check
    └─ Security Scan
    ↓
If All Pass
    ├─ Vercel Auto-Deploy (Frontend)
    └─ Railway Auto-Deploy (Backend)
    ↓
Production Environment Update
```

---

## 📊 Performance Architecture

### Frontend Performance

- **Bundle Size**: 1.5MB total (390KB gzipped JS)
- **CSS**: 169KB (26KB gzipped)
- **Time to Interactive**: ~2.5s
- **Lighthouse Score**: >90
- **Optimization**:
  - Code splitting (Vite)
  - Dynamic imports
  - Image optimization
  - CSS minification

### Backend Performance

- **Response Time**: <100ms (avg)
- **Database Queries**: <50ms (avg)
- **Throughput**: 10,000+ req/sec
- **Optimization**:
  - Query optimization (indexes)
  - Connection pooling (Neon)
  - Caching (Redis-ready)
  - Compression (gzip)

### Database Performance

- **Query Time**: <50ms (indexed queries)
- **Connection Pool**: 20-100 connections
- **Backup**: Continuous (Neon)
- **Replication**: Multi-region ready

---

## 🔧 Technology Stack Summary

### Frontend (Client Tier)

```
Framework:       React 18
Build Tool:      Vite 7.3.1
Styling:         Tailwind CSS 3.4.17
Components:      Radix UI (28 components)
State:           TanStack Query 5.60.5
Animations:      Framer Motion
Type Safety:     TypeScript 5.6.3
Testing:         Jest / Vitest
Deployment:      Vercel
```

### Backend (API Gateway Tier)

```
Framework:       Express.js
Runtime:         Node.js 18+
Language:        TypeScript 5.6.3
File Upload:     Multer 2.0.0
Data Processing: XLSX (Excel)
Authentication:  Passport.js
AI:              OpenAI GPT-4o
Deployment:      Railway
```

### Database (Data Tier)

```
Database:        PostgreSQL 16
ORM:             Drizzle ORM
Query Builder:   Drizzle Query Builder
Validation:      Zod
Sessions:        connect-pg-simple
Serverless:      Neon
Region:          South Africa / Global
```

### Infrastructure

```
CDN:             Vercel Global CDN
Container:       Docker
Container Host:  Railway
SSL/TLS:         Auto-managed
Monitoring:      Built-in (Vercel, Railway)
```

---

## 🔄 Service Communication

### Synchronous Communication

```
Client → HTTP Request → Express API → Drizzle ORM → PostgreSQL → Response
```

- Used for: UI updates, data fetching, real-time operations
- Latency: <100ms average

### Asynchronous Communication

```
User Action → Service → Queue (Future) → Background Worker → Database
```

- Used for: Bulk imports, email notifications, analytics
- Benefit: Non-blocking, scalable processing

### Real-Time Communication (Future)

```
WebSocket Connection → Express Server → Database Subscription → Live Updates
```

- Technology Ready: ws library included
- Use Cases: Live inventory updates, real-time collaboration

---

## 📝 Development Workflow

### Local Development

```
Developer Machine
├── Node.js 18+
├── PostgreSQL (local or remote Neon)
├── npm (657 packages)
└── Git

Development Server
├── Vite HMR (frontend @ 5173)
└── Express Dev (backend @ 5000)
```

### Development Environment Variables

```bash
DATABASE_URL=postgresql://dev:password@localhost/cornexconnect
NODE_ENV=development
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173
```

### Build Process

```
Source Code
    ↓
TypeScript Compilation (tsc)
    ↓
Frontend Build (Vite)
└─ Output: dist/public/
    ↓
Backend Build (esbuild)
└─ Output: dist/index.js
    ↓
Production Bundle
```

---

## 📊 Monitoring & Observability

### Frontend Monitoring

- Vercel Analytics (built-in)
- Error tracking (browser console)
- Performance metrics (Web Vitals)
- User session tracking

### Backend Monitoring

- Railway logs (stdout/stderr)
- Error tracking (application logging)
- Performance profiling (optional)
- Database query logs (Neon)

### Key Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Uptime | 99.9% | Railway / Vercel |
| Response Time | <100ms | APM (optional) |
| Error Rate | <0.1% | Application logs |
| Database Health | 99.99% | Neon dashboard |

---

## 🔮 Future Architecture Enhancements

1. **Message Queue**: Add Redis/Bull for async jobs
2. **Caching**: Implement Redis for session/data cache
3. **Real-Time**: WebSocket support for live updates
4. **Microservices**: Split into independent services
5. **Event Streaming**: Kafka for event-driven architecture
6. **API Gateway**: Kong/Traefik for advanced routing
7. **Service Mesh**: Istio for service communication

---

## 📚 Architecture Documentation Files

- [README.md](README.md) - Project overview
- [PACKAGES.md](PACKAGES.md) - Dependency documentation
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Deployment guide

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-08-15  
**Architect**: Heyns Schoeman

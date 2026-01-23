# 🎯 CornexConnect - Non-Functional Features Activation List

**Date:** 2026-01-23  
**Audit Scope:** All 30 pages + backend routes

---

## 📊 SUMMARY STATISTICS

- **Total Frontend Pages:** 30
- **Fully Functional (Frontend + Backend):** 5 pages (17%)
- **Frontend Complete, Backend Missing:** 20 pages (67%)
- **Static/Placeholder Pages:** 5 pages (17%)

- **Backend Endpoints Active:** 11
- **Backend Endpoints Needed:** ~50+
- **Backend Completion:** 18%

---

## 🚨 CRITICAL MISSING BACKEND (from Old Repo)

### Must Restore These Routes:
1. `server/src/routes/skus.ts` - SKU CRUD operations
2. `server/src/routes/customers.ts` - Customer management
3. `server/src/routes/wholesalers.ts` - Wholesaler management
4. `server/src/routes/orders.ts` - Order processing
5. `server/src/routes/logistics.ts` - Shipment tracking
6. `server/src/routes/currencies.ts` - Currency management
7. `server/src/routes/forecasts.ts` - AI forecasting (mock only)
8. `server/src/routes/analytics.ts` - Provincial analytics nexus
9. `server/src/routes/import.ts` - CSV upload for SKUs/customers/wholesalers

---

## ✅ FUNCTIONAL (Frontend + Backend Complete)

1. **BulkImport.tsx** - Multi-file upload system with health checks
2. **HardwareStores.tsx** - Store listing with province filtering
3. **ProductCatalog.tsx** - Product grid display
4. **Achievements.tsx** - Achievement tracking (minimal UI)
5. **Dashboard** - Partial (only /summary endpoint works)

---

## ⚠️ FRONTEND COMPLETE, NEEDS BACKEND ACTIVATION

### High Priority (Core Features):
6. **Dashboard.tsx** - Missing 6/7 endpoints:
   - ❌ `/api/sales-metrics/by-region`
   - ❌ `/api/sales-metrics/top-products`
   - ❌ `/api/production-schedule`
   - ❌ `/api/demand-forecast`
   - ❌ `/api/distributors`

7. **FactorySetup.tsx** - Factory management:
   - ❌ `/api/factories` (CRUD)
   - ❌ `/api/ai/insights`
   - ❌ `/api/production/metrics`
   - ❌ `/api/factories/recommendations`

8. **BusinessIntelligence.tsx** - Advanced analytics:
   - ❌ `/api/sales-metrics/advanced`
   - ❌ `/api/sales-metrics/trends`

9. **RouteManagement.tsx** - Sales route planning:
   - ❌ `/api/sales-routes` (CRUD)

10. **RouteOptimization.tsx** - AI route optimization:
    - ❌ `/api/routes/optimize`
    - ❌ `/api/routes/calculate`

11. **ExcelUpload.tsx** - Excel file processing:
    - ❌ `/api/excel-upload/history`
    - ❌ `/api/excel-upload` (POST)
    - ❌ `/api/sales-routes` (GET)

12. **InventoryAI.tsx** - AI inventory insights:
    - ❌ `/api/inventory/insights`
    - ❌ `/api/inventory/predictions`

13. **LogisticsIntegration.tsx** - Logistics providers:
    - ❌ `/api/logistics/*` endpoints

14. **MobileFieldApp.tsx** - Mobile sync:
    - ❌ `/api/field-app/sync`
    - ❌ `/api/field-app/offline-data`

15. **PurchaseOrders.tsx** - PO management:
    - ❌ `/api/purchase-orders` (CRUD)

16. **ProductionPlanning.tsx** - Production scheduling:
    - ❌ `/api/production/*` endpoints

17. **ProductLabels.tsx** - Label printing:
    - ❌ `/api/labels/generate`
    - ❌ `/api/labels/templates`

18. **CompanyManagement.tsx** - Distributor CRUD:
    - ❌ `/api/distributors/*` endpoints

19. **CompanySettings.tsx** - Company configuration:
    - ❌ `/api/companies/settings/*`

20. **UserManagement.tsx** - User CRUD:
    - ❌ `/api/users` (CRUD)

21. **AuditTrail.tsx** - Activity logging:
    - ❌ `/api/audit-logs` (GET/POST)

22. **ExtendedAutomation.tsx** - Workflow automation:
    - ❌ `/api/automation/rules`
    - ❌ `/api/automation/events`

23. **GlobalDistributors.tsx** - International network:
    - ❌ `/api/distributors/global`

24. **InventoryUpload.tsx** - Inventory file upload:
    - ❌ `/api/inventory/upload`

25. **StoreMapVisualization.tsx** - Geographic mapping (partial):
    - ✅ `/api/hardware-stores` (works)
    - ❌ Map enrichment endpoints

---

## 📌 STATIC/PLACEHOLDER PAGES (Need Full Development)

26. **Achievements.tsx** (13 lines)
    - Status: Minimal - just wrapper for AchievementSystem component
    - Needs: Full dashboard with leaderboards, progress tracking

27. **Profile.tsx** (137 lines)
    - Status: Basic display only
    - Missing: Profile editing, password change, avatar upload
    - Needs: `/api/users/profile` endpoints

28. **Login.tsx** (185 lines)
    - Status: UI complete
    - Missing: `/api/auth/login`, session management

29. **Register.tsx** (348 lines)
    - Status: Multi-step UI complete
    - Missing: `/api/auth/register`, email verification

30. **Landing.tsx** (181 lines)
    - Status: Static marketing page
    - Needs: CMS integration

31. **BrandDetail.tsx** (212 lines)
    - Status: Uses hardcoded CORNEX_BRANDS constant
    - Missing: `/api/brands/:id` dynamic endpoint

32. **not-found.tsx** (21 lines)
    - Status: Simple 404 page
    - Functional as-is

---

## 🔧 MOCK/STUB CODE FOUND

### Backend Mocks:
- `server/routes/forecasts.ts` - Line 45: Random number generator for AI predictions
- `server/routes/forecasts.ts` - Line 54: `model_version: 'v1.0-mock'`

### Frontend Static Data:
- `BrandDetail.tsx` - Uses `CORNEX_BRANDS` from `lib/constants`
- `BusinessIntelligence.tsx` - Uses `SOUTH_AFRICAN_PROVINCES` constant
- `ProductionPlanning.tsx` - Uses `PRODUCTION_LINES` constant
- `InventoryAI.tsx` - Uses `STOCK_STATUS_COLORS` constant
- `GlobalDistributors.tsx` - Uses `CORNEX_BRANDS, CURRENCIES` constants

---

## 🎯 ACTIVATION PRIORITY

### 🔴 CRITICAL (Week 1)
1. **Restore Old Backend Routes** → Copy `server/src/routes/` from old GitHub version
2. **Database Setup** → Configure DATABASE_URL, run `npm run db:push`
3. **Test Core Nexus** → CSV upload → SKUs → Customers → Analytics flow

### 🟠 HIGH PRIORITY (Week 2)
4. **Dashboard Metrics** → `/api/sales-metrics/*`, `/api/production-schedule`
5. **Authentication** → `/api/auth/login`, `/api/auth/register`
6. **Distributors** → `/api/distributors` CRUD

### 🟡 MEDIUM PRIORITY (Week 3-4)
7. **Factory & Production** → `/api/factories`, `/api/production/metrics`
8. **Route Optimization** → `/api/sales-routes`, AI algorithms
9. **Inventory Intelligence** → `/api/inventory/insights`, predictions

### 🟢 LOW PRIORITY (Month 2+)
10. **Purchase Orders** → Full PO system
11. **Audit Trail** → Comprehensive logging
12. **Automation** → Workflow engine
13. **Labels** → Barcode/QR generation
14. **Field App** → Mobile offline sync

---

## 📋 BACKEND COMPLETION MATRIX

| Feature | Frontend | Backend | Priority |
|---------|----------|---------|----------|
| Bulk Import | ✅ Complete | ✅ Complete | Done |
| Hardware Stores | ✅ Complete | ✅ Complete | Done |
| Products | ✅ Complete | ✅ Complete | Done |
| Achievements | ⚡ Minimal | ✅ Complete | Low |
| Dashboard | ✅ Complete | ⚠️ Partial (1/7) | 🔴 Critical |
| SKUs | ⚠️ In App.tsx | ❌ Missing | 🔴 Critical |
| Customers | ⚠️ In App.tsx | ❌ Missing | 🔴 Critical |
| Wholesalers | ⚠️ In App.tsx | ❌ Missing | 🔴 Critical |
| Orders | ⚠️ In App.tsx | ❌ Missing | 🔴 Critical |
| Logistics | ⚠️ In App.tsx | ❌ Missing | 🔴 Critical |
| Analytics Nexus | ⚠️ In App.tsx | ❌ Missing | 🔴 Critical |
| CSV Import | ⚠️ In App.tsx | ❌ Missing | 🔴 Critical |
| Factory Setup | ✅ Complete | ❌ Missing | 🟠 High |
| Routes | ✅ Complete | ❌ Missing | 🟠 High |
| Business Intel | ✅ Complete | ❌ Missing | 🟠 High |
| Purchase Orders | ✅ Complete | ❌ Missing | 🟡 Medium |
| User Management | ✅ Complete | ❌ Missing | 🟠 High |
| Auth | ✅ Complete | ⚠️ Replit Only | 🟠 High |

**Overall: 18% Backend Complete**

---

## 🚀 NEXT STEPS

1. **Merge Old + New Backend** - Restore missing routes from old repo
2. **Connect Database** - Set up Neon PostgreSQL, push schema
3. **Test CSV Upload** - Verify 8500 SKU import → analytics distribution
4. **Implement Missing Endpoints** - Start with dashboard, auth, distributors
5. **Full Integration Testing** - End-to-end validation

**Est. Time to 100% Functional:** 3-4 weeks

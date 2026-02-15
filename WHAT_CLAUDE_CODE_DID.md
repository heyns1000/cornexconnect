# What Claude Code Did - CornexConnect

> **Read this like a story** - from start to finish, here's everything that was built for you.

---

## The Short Version

Claude Code turned your messy Google Drive spreadsheets and ideas into a full working business app with **3,468 real client records**, **34 Cornex products**, **30 app pages**, and everything wired together.

---

## 1. Translation System (First thing built)

**What it does:** Your app works in multiple languages.

- Added Spanish, Turkish, Portuguese, Italian translations
- Every page title, button, and label can switch language instantly
- Country selector picks the right language automatically

**Files:**
- `client/src/lib/translations.ts` - all the translated words
- `client/src/hooks/useTranslation.ts` - the switching logic
- `client/src/components/CountrySelector.tsx` - country picker

---

## 2. Bulk Import System (The big one)

**What it does:** You upload Excel/CSV files and the app reads them, shows you what's inside, and imports the data.

**What was built step by step:**
1. File upload that accepts `.xlsx`, `.xls`, `.csv`
2. Intelligent column mapping (figures out which column is "Store Name" vs "STORE NAME" vs "Name")
3. Batch processing with progress bar
4. Health check indicators (green/red lights showing if data is good)
5. Session tracking (keeps history of every import)
6. Unique store codes generated automatically (CC00001, CC00002, etc.)
7. Company context shown during import

**Files:**
- `server/bulkImport.ts` - the brain that reads Excel files
- `client/src/pages/BulkImport.tsx` - the upload page
- `client/src/pages/ExcelUpload.tsx` - Excel file handler

---

## 3. Hardware Store Database (3,468 real stores)

**What it does:** All your client stores from every spreadsheet - searchable, viewable, on a map.

**What was built:**
1. Store restoration system - loads all stores from JSON into database
2. Each store has: name, owner, phone, email, address, city, province, store type, credit rating, monthly potential
3. Unique store codes for every single store
4. Province breakdown across 9 SA provinces + 8 African countries
5. Map visualization with Google Maps

**Files:**
- `server/restoreStores.ts` - loads stores into database
- `server/extract-all-stores.cjs` - extracts from Excel files
- `client/src/pages/HardwareStores.tsx` - store listing page
- `client/src/pages/StoreMapVisualization.tsx` - map view

---

## 4. Product Catalog (34 Cornex products)

**What it does:** Your full product lineup with specs, pricing, and categories.

**Products added:**
- **13 EPS Premium Range** - cornices with dimensions and pricing
- **13 BR XPS Budget Range** - budget cornices
- **8 LED Ready Series** - LED-compatible cornices

**What was built:**
1. Emergency restore button (one click = all 34 products back)
2. Category filtering (EPS / BR / LED)
3. Product display with images, specs, pricing

**Files:**
- `server/restoreProducts.ts` - product data and restore logic
- `client/src/pages/ProductCatalog.tsx` - catalog page

---

## 5. Dashboard & Business Intelligence

**What it does:** One page showing your whole business at a glance.

**What's on the dashboard:**
- Total stores, total products, active orders
- Province breakdown chart
- AI insights panel
- Demand forecasting chart
- Quick links to everything

**Files:**
- `client/src/pages/Dashboard.tsx` - main dashboard
- `client/src/pages/BusinessIntelligence.tsx` - detailed analytics
- `client/src/components/MetricCard.tsx` - the number cards
- `client/src/components/DemandChart.tsx` - demand graph

---

## 6. Sales & Route Management

**What it does:** Your sales reps have routes, visit stores, and track orders.

**What was built:**
- Route plans with store assignments
- Store visit reports
- AI-powered order suggestions
- Route optimization
- Sales rep profiles with territories

**Files:**
- `client/src/pages/RouteManagement.tsx` - route planning
- `client/src/pages/RouteOptimization.tsx` - smart routing
- `client/src/components/RouteMap.tsx` - route visualization

---

## 7. Purchase Order System

**What it does:** Create, approve, and track purchase orders.

**What was built:**
- Full PO workflow: Draft > Submitted > Approved > Shipped > Delivered
- Line items with quantities and pricing
- Status history tracking
- Document attachments

**Files:**
- `client/src/pages/PurchaseOrders.tsx` - PO management page

---

## 8. Factory Setup & Automation

**What it does:** Track factory ownership phases and automate repetitive tasks.

**Factory tracking:**
- Investment phases
- AI optimization levels
- Production metrics

**Automation rules:**
- Threshold-based (e.g., "reorder when stock below 50")
- Scheduled (e.g., "generate report every Monday")
- Event-driven (e.g., "notify when order placed")
- Predictive (e.g., "forecast demand spike")

**Files:**
- `client/src/pages/FactorySetup.tsx` - factory management
- `client/src/pages/ExtendedAutomation.tsx` - automation builder

---

## 9. User Management & Security

**What it does:** Control who can access what.

**What was built:**
- Login/register with Replit Auth (Google/Microsoft/Facebook)
- User roles: Admin, Manager, Staff, Viewer
- Department assignments
- Regional access control
- Complete audit trail (every action logged)
- Profile page with personal and company details

**Files:**
- `server/replitAuth.ts` - authentication
- `client/src/pages/UserManagement.tsx` - user admin
- `client/src/pages/AuditTrail.tsx` - audit log
- `client/src/pages/Profile.tsx` - user profile

---

## 10. Achievement System (Gamification)

**What it does:** Staff earn points and badges for doing their work well.

**Achievement types:**
- Accuracy achievements (clean data imports)
- Volume achievements (lots of records processed)
- Streak achievements (consecutive days of activity)
- Speed achievements (fast processing)
- Quality achievements (high data quality)

**Files:**
- `server/achievementService.ts` - achievement logic
- `client/src/pages/Achievements.tsx` - achievement display

---

## 11. AI Features

**What was built:**
1. **Mood Selector** - floating button, picks energy/focus/creativity levels, tracks history
2. **FruitfulAssist Chatbot** - floating chat bubble for help
3. **AI Order Suggestions** - recommends what stores should order based on history
4. **Demand Forecasting** - predicts future demand with confidence scores
5. **AI Insights Panel** - recommendations on dashboard

**Files:**
- `client/src/components/MoodFloatingButton.tsx`
- `client/src/components/FruitfulAssistChatbot.tsx`
- `client/src/components/AIInsightsPanel.tsx`

---

## 12. Product Labeling & Printing

**What it does:** Design labels and send them to printers.

**Label types:** Product, Insert, Packaging, Barcode, Safety

**What was built:**
- Label designer
- Printer management (add/remove network printers)
- Print job queue
- Reusable label templates

**Files:**
- `client/src/pages/ProductLabels.tsx` - label management

---

## 13. BuildMart Africa Sub-App

**What it does:** A separate buyer-facing app for BuildMart distributors.

**What was built:**
- Signal sync with main server (no IP exposure)
- Ad generator
- Analytics dashboard
- Compliance checker
- Document vault
- Market leader analysis
- Tier selection

**Files:** Everything in `apps/south-africa/distributors/buildmart-africa/`

---

## 14. Spreadsheet Normalizer (Latest)

**The problem:** You had 17 spreadsheets from different staff members. Every single one had different column names, different spellings, different layouts.

**What Claude Code did:**
1. Read ALL 17 files (35,070 raw records)
2. Mapped 60+ column name variations to 25 standard fields
3. Fixed 57 different province spellings (e.g., "KWAZULU-NATAL" vs "kzn" vs "Kwa-Zulu Natal")
4. Fixed 25 different rep name spellings (e.g., "HEYNS" vs "Heyns" vs "heyns")
5. Removed duplicates
6. Output: **3,468 unique client records** in one clean format

**Before (7 different layouts):**
```
File 1: "Name", "Contact Name", "Telephone"
File 2: "STORE NAME", "AREA", "CITY", "PROVINCE"
File 3: "Company Name", "PROVINCE", "Date of last inv"
File 4: "STORE NAME", "CUSTOMER NAME", "CUSTOMER NUMBER"
... and 3 more formats
```

**After (1 standard layout):**
```
store_code, store_name, owner_name, contact_person, phone, email,
address, area, city, province, store_type, store_size, credit_rating,
monthly_potential, group_name, wholesaler, rep_name, customer_number,
product, active_status, last_visit_date, last_invoice_date,
last_phone_date, notes, source_file
```

**Files:**
- `server/normalize-all-spreadsheets.cjs` - the normalizer script
- `server/normalized-clients.json` - clean JSON output (3,468 records)
- `server/normalized-clients.csv` - clean CSV for Excel download

---

## 15. Major Cleanup & Security Fix

**What was done:**
- Removed dead/unused code
- Wired all routes properly
- Fixed security issues
- Added pagination to large data views
- Cleaned up imports

---

## Database Schema (60+ tables)

The full database has tables for:

| Category | Tables |
|----------|--------|
| Users | users, sessions, userRegistrations, userAuditTrail |
| Products | products, inventory, productLabels, labelTemplates |
| Stores | hardwareStores, hardwareStoresFromExcel |
| Sales | salesReps, routePlans, routeStores, storeVisits |
| Orders | orders, orderItems, purchaseOrders, purchaseOrderItems |
| Production | productionSchedule, demandForecast, salesMetrics |
| Factory | factorySetups, productionMetrics, factoryRecommendations |
| Automation | automationRules, automationEvents, maintenanceSchedules |
| AI | aiInsights, aiOrderSuggestions, aiMoodAnalytics |
| Printing | printers, printJobs |
| Import | bulkImportSessions, excelUploads, importAccuracyMetrics |
| Gamification | importAchievements, userAchievementProgress |
| Settings | companySettings, userMoodPreferences, userMoodHistory |
| Distribution | distributors, brands |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| UI Components | shadcn/ui (50+ components) + Tailwind CSS |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL (Neon serverless) + Drizzle ORM |
| Auth | Replit Auth (Google/Microsoft/Facebook) |
| Maps | Google Maps API |
| Storage | Google Cloud Storage |
| State | React Query (TanStack) |
| Routing | Wouter |
| Forms | React Hook Form + Zod |

---

## API Endpoints

| Endpoint | What it does |
|----------|-------------|
| `GET /api/clients/normalized` | All 3,468 clients as JSON |
| `GET /api/clients/normalized/csv` | Download clients as CSV |
| `GET /api/hardware-stores/analytics` | Store stats by province/group/rep |
| `POST /api/hardware-stores/restore` | Reload all stores into database |
| `POST /api/products/restore` | Reload all 34 products |
| `POST /api/bulk-import/upload` | Upload Excel/CSV for import |
| `GET /api/bulk-import/sessions` | Import history |
| Plus 20+ more for orders, users, settings, etc. |

---

## Files in attached_assets/ (Your raw data)

| File | Records | What it is |
|------|---------|-----------|
| Homemart Customer List (x5) | ~3,400 each | Main store database |
| MERGED SHEET | 4,176 | Combined store list |
| INDEPENDANT NW AND MP (x3) | ~2,100 each | NW + Mpumalanga stores |
| Hardware list | 127 | Store addresses + emails |
| CLIENTS VISITED | 220 | January visit log |
| Buildmart costing (x3) | 11-24 each | Product pricing |
| Buildmart pricing (x2) | 24 each | Product pricing |
| + PDFs, screenshots, SQL batches | - | Supporting documents |

---

## How to Add More Spreadsheets

1. Drop any `.xlsx` or `.xls` file into `attached_assets/`
2. Run: `node server/normalize-all-spreadsheets.cjs`
3. Done - the normalizer handles any column layout automatically

---

*Generated by Claude Code - February 2026*

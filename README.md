# CornexConnect™ v2.6

**EPS Cornice Manufacturing Platform**

A production-ready enterprise platform for managing EPS cornice manufacturing, inventory, logistics, and demand forecasting. Built with modern web technologies and designed for Pretoria, South Africa operations.

## 🚀 Features

### Core Functionality
- **31+ SKU Management** - Complete inventory management for EPS cornice products
- **190+ Currency Support** - Global currency conversion with live exchange rates
- **Excel/CSV Import** - Drag & drop bulk data import with validation
- **RouteMesh™ Integration** - Advanced logistics routing and optimization
- **Unitrans Logistics** - Seamless integration with Unitrans delivery services
- **AI Forecasting** - Machine learning powered demand prediction
- **Real-time Data Tables** - Interactive shadcn/ui DataTables with sorting and filtering

### Technology Stack

#### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **TanStack Query** - Powerful data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Framer Motion** - Smooth animations and transitions
- **Glass Morphism** - Modern UI design with emerald→blue gradients

#### Backend
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe backend development
- **Drizzle ORM** - Lightweight TypeScript ORM
- **Neon PostgreSQL** - Serverless Postgres database
- **Zod** - Schema validation for data imports
- **Multer** - File upload handling

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/heyns1000/CornexConnect-.git
   cd CornexConnect-
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install
   ```

3. **Environment Configuration**

   **Server (.env)**
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `server/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host/database
   PORT=5000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173
   ```

   **Client (.env)**
   ```bash
   cd ../client
   cp .env.example .env
   ```
   Edit `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Database Setup**
   ```bash
   cd server
   npm run db:push
   ```

## 🚀 Running the Application

### Development Mode
```bash
# Run both client and server concurrently (from root)
npm run dev

# Or run separately:
npm run dev:client  # Client on http://localhost:5173
npm run dev:server  # Server on http://localhost:5000
```

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
CornexConnect-/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   └── FileUpload.tsx
│   │   ├── services/      # API services
│   │   ├── lib/           # Utilities
│   │   ├── App.tsx        # Main application
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── src/
│   │   ├── db/            # Database schema and config
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── drizzle.config.ts
├── package.json           # Root package.json
└── README.md
```

## 🔌 API Endpoints

### SKUs
- `GET /api/skus` - Get all SKUs
- `GET /api/skus/:id` - Get single SKU
- `POST /api/skus` - Create SKU
- `PUT /api/skus/:id` - Update SKU
- `DELETE /api/skus/:id` - Delete SKU

### Currencies
- `GET /api/currencies` - Get all currencies
- `GET /api/currencies/:code` - Get currency by code
- `POST /api/currencies` - Create/update currency
- `PATCH /api/currencies/:code/rate` - Update exchange rate

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order with items
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status

### Logistics (RouteMesh™ & Unitrans)
- `GET /api/logistics` - Get all logistics
- `GET /api/logistics/order/:orderId` - Get logistics by order
- `POST /api/logistics` - Create logistics entry
- `PATCH /api/logistics/:id/status` - Update logistics status
- `GET /api/logistics/track/:trackingNumber` - Track shipment

### Forecasts (AI)
- `GET /api/forecasts` - Get all forecasts
- `GET /api/forecasts/sku/:skuId` - Get forecasts for SKU
- `POST /api/forecasts` - Create forecast
- `POST /api/forecasts/generate/:skuId` - Generate AI forecast

### Import
- `POST /api/import/skus` - Import SKUs from CSV/Excel
- `POST /api/import/customers` - Import customers from CSV/Excel
- `GET /api/import/history` - Get import history

## 📊 Database Schema

The platform uses the following main tables:
- **skus** - Product inventory (31+ EPS cornice products)
- **currencies** - Currency definitions (190+ supported)
- **customers** - Customer information
- **orders** - Order management
- **order_items** - Order line items
- **logistics** - Shipping and delivery tracking
- **forecasts** - AI-generated demand predictions
- **import_history** - Bulk import audit trail

## 🎨 Design System

### Glass Morphism
The UI features modern glass morphism effects with:
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders and shadows

### Gradient Colors
Emerald to Blue gradient theme:
- Primary: Emerald (#10b981)
- Secondary: Blue (#3b82f6)
- Animated gradient backgrounds

### Components
All UI components follow shadcn/ui design principles:
- Accessible by default
- Customizable with Tailwind
- Consistent styling across the platform

## 🔐 Security

- Zod validation for all imports
- SQL injection protection via Drizzle ORM
- CORS configuration
- Environment variable protection
- Input sanitization

## 📦 Data Import Format

### SKU Import (CSV/Excel)
```csv
sku_code,name,description,category,unit_price,currency,stock_quantity,reorder_level
CRN-001,Classic Cornice 100mm,Standard EPS cornice,Interior,125.50,ZAR,150,20
```

### Customer Import (CSV/Excel)
```csv
customer_code,name,email,phone,address,city,country,preferred_currency
CUST-001,ABC Builders,info@abc.com,+27123456789,123 Main St,Pretoria,South Africa,ZAR
```

## 🚢 Deployment

The platform is production-ready for PR #35. Deploy to:
- **Frontend**: Vercel, Netlify, or any static host
- **Backend**: Railway, Render, or any Node.js host
- **Database**: Neon, Supabase, or any PostgreSQL provider

## 📝 License

ISC

## 🏢 Company

CornexConnect™  
Pretoria, South Africa

---

**Built with ❤️ using React 18, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui, Framer Motion, Express.js, Drizzle ORM, and Neon PostgreSQL**

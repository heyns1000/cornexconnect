# CornexConnect™ v2.6 - Features Documentation

## 🎯 Core Features

### 1. SKU Management (31+ Products)
Comprehensive inventory management for EPS cornice products:
- **CRUD Operations**: Create, Read, Update, Delete SKUs
- **Product Details**: SKU code, name, description, category
- **Pricing**: Multi-currency support with unit prices
- **Inventory**: Stock quantity tracking and reorder level alerts
- **Dimensions**: JSON storage for length, width, height, weight
- **Status**: Active/inactive product management

**API Endpoints:**
```
GET    /api/skus          - List all SKUs
GET    /api/skus/:id      - Get single SKU
POST   /api/skus          - Create new SKU
PUT    /api/skus/:id      - Update SKU
DELETE /api/skus/:id      - Delete SKU
```

### 2. Currency Support (190+ Currencies)
Global multi-currency platform:
- **ISO 4217** compliant currency codes
- **Exchange Rates**: Real-time exchange rate management
- **Currency Symbols**: Display proper currency symbols
- **Base Currency**: ZAR (South African Rand) as default
- **Active Status**: Enable/disable currencies

**API Endpoints:**
```
GET   /api/currencies           - List all currencies
GET   /api/currencies/:code     - Get currency by code
POST  /api/currencies           - Create/update currency
PATCH /api/currencies/:code/rate - Update exchange rate
```

### 3. Excel/CSV Bulk Import
Powerful drag & drop data import system:
- **Drag & Drop UI**: Modern file upload with react-dropzone
- **File Types**: Support for .csv, .xlsx, .xls
- **Validation**: Zod schema validation for data integrity
- **Upsert Logic**: Update existing or insert new records
- **Error Handling**: Detailed error reporting per row
- **Import History**: Audit trail of all imports
- **Batch Processing**: Handle large datasets efficiently

**Features:**
- Visual feedback during upload
- Success/failure statistics
- Row-level error messages
- Automatic conflict resolution (upsert)

**API Endpoints:**
```
POST /api/import/skus      - Import SKUs from file
POST /api/import/customers - Import customers from file
GET  /api/import/history   - View import history
```

### 4. Order Management
Complete order processing system:
- **Order Creation**: Multi-item orders with line items
- **Customer Association**: Link orders to customers
- **Status Tracking**: pending, processing, shipped, delivered, cancelled
- **Multi-Currency**: Order totals in customer's preferred currency
- **Shipping Details**: Address management
- **Order Items**: Quantity, pricing, discounts, subtotals
- **Timestamps**: Created and updated tracking

**API Endpoints:**
```
GET   /api/orders             - List all orders
GET   /api/orders/:id         - Get order with items
POST  /api/orders             - Create new order
PATCH /api/orders/:id/status  - Update order status
```

### 5. Logistics Integration (RouteMesh™ & Unitrans)
Advanced logistics and delivery tracking:
- **RouteMesh™**: Optimized routing and delivery management
- **Unitrans**: Integration with Unitrans Logistics
- **Tracking**: Real-time shipment tracking numbers
- **Status Updates**: pending, in_transit, delivered, etc.
- **Route Data**: JSON storage for routing information
- **Delivery Estimates**: Estimated and actual delivery dates
- **Cost Tracking**: Logistics cost per shipment

**API Endpoints:**
```
GET   /api/logistics                      - List all logistics
GET   /api/logistics/order/:orderId       - Get by order
POST  /api/logistics                      - Create entry
PATCH /api/logistics/:id/status           - Update status
GET   /api/logistics/track/:trackingNumber - Track shipment
```

### 6. AI-Powered Demand Forecasting
Machine learning demand predictions:
- **Predictive Analytics**: Forecast future product demand
- **Confidence Levels**: AI confidence scoring (75-95%)
- **Historical Tracking**: Compare predictions vs actual demand
- **SKU-Specific**: Forecasts per individual product
- **Model Versioning**: Track forecast model versions
- **Date-Based**: Time series forecasting by date

**API Endpoints:**
```
GET  /api/forecasts              - List all forecasts
GET  /api/forecasts/sku/:skuId   - Get SKU forecasts
POST /api/forecasts              - Manual forecast entry
POST /api/forecasts/generate/:skuId - Generate AI forecast
```

### 7. Customer Management
Customer relationship management:
- **Contact Information**: Email, phone, address
- **Location Tracking**: City and country
- **Currency Preferences**: Default currency per customer
- **Customer Codes**: Unique identifiers
- **Order History**: View customer orders

**API Endpoints:**
```
GET  /api/customers     - List all customers
GET  /api/customers/:id - Get single customer
POST /api/customers     - Create customer
PUT  /api/customers/:id - Update customer
```

## 🎨 Design System

### Glass Morphism
Modern glassmorphism effects throughout the UI:
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders and shadows
- Frosted glass appearance

### Gradient Theme
Beautiful emerald to blue gradient color scheme:
- **Primary**: Emerald (#10b981)
- **Secondary**: Blue (#3b82f6)
- **Animated**: Flowing gradient backgrounds
- **Text Gradients**: Gradient text effects
- **Buttons**: Gradient hover states

### Animations
Smooth Framer Motion animations:
- Page transitions
- Component entrance animations
- Hover effects
- Loading states
- Interactive feedback

## 📊 Data Tables
Interactive shadcn/ui DataTables:
- Sortable columns
- Responsive design
- Clean typography
- Hover states
- Empty states with helpful messages

## 🔐 Security Features
- **Zod Validation**: Schema validation for all imports
- **SQL Injection Protection**: Drizzle ORM parameterized queries
- **CORS Configuration**: Cross-origin request handling
- **Environment Variables**: Secure configuration management
- **Input Sanitization**: Client and server-side validation

## 🚀 Performance
- **TanStack Query**: Intelligent caching and data fetching
- **Code Splitting**: Optimized bundle sizes with Vite
- **Lazy Loading**: On-demand resource loading
- **Database Indexing**: Optimized queries with UUIDs
- **Build Optimization**: Production-ready minified builds

## 🌍 Internationalization
- Multi-currency support (190+ currencies)
- Localized pricing
- South African market focus (Pretoria)
- Expandable to global markets

## 📱 Responsive Design
- Mobile-first approach
- Tailwind CSS responsive utilities
- Adaptive layouts
- Touch-friendly interactions

## 🔧 Developer Experience
- **TypeScript**: Type-safe development
- **Hot Module Replacement**: Instant development feedback
- **ESLint**: Code quality enforcement
- **Concurrent Development**: Run client + server together
- **API Documentation**: Clear endpoint documentation

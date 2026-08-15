# CornexConnect v2.6 - API Documentation

**Base URL**: `https://cornexconnect-prod.railway.app/api` (Production)  
**Development URL**: `http://localhost:5000/api`  
**API Version**: 1.0  
**Last Updated**: 2026-08-15

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Bulk Import](#bulk-import)
3. [Products](#products)
4. [Inventory](#inventory)
5. [Hardware Stores](#hardware-stores)
6. [Achievements](#achievements)
7. [Dashboard](#dashboard)
8. [AI & Mood Detection](#ai--mood-detection)
9. [Fruitful Planet Integration](#fruitful-planet-integration)
10. [BuildMart Signal Relay](#buildmart-signal-relay)
11. [Error Handling](#error-handling)

---

## 🔐 Authentication

### Overview
CornexConnect uses Passport.js with local strategy (username/password) and session management.

### Session Management
- Sessions stored in PostgreSQL via `connect-pg-simple`
- Cookie-based sessions with secure flags
- Default session timeout: 24 hours

### Authenticated Routes
Most endpoints require authentication. Include session cookie in requests:

```bash
curl -X GET http://localhost:5000/api/products \
  -H "Cookie: connect.sid=..." \
  -H "Content-Type: application/json"
```

---

## 📁 Bulk Import

### POST - Upload Files

**Endpoint**: `POST /api/bulk-import/upload`

**Description**: Import bulk data from Excel/CSV files

**Parameters**:
- `files` (multipart/form-data) - Multiple files (max 50 files, 10MB total)

**Request**:
```bash
curl -X POST http://localhost:5000/api/bulk-import/upload \
  -F "files=@stores.xlsx" \
  -F "files=@products.csv"
```

**Response** (200 OK):
```json
{
  "success": true,
  "sessionId": "sess_abc123xyz",
  "totalImported": 1250,
  "results": [
    {
      "file": "stores.xlsx",
      "type": "hardware_stores",
      "imported": 1200,
      "errors": 0,
      "status": "success"
    },
    {
      "file": "products.csv",
      "type": "products",
      "imported": 50,
      "errors": 0,
      "status": "success"
    }
  ],
  "message": "Successfully imported 1250 stores from 2 files"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "No files uploaded"
}
```

### GET - Import History

**Endpoint**: `GET /api/bulk-import/history`

**Description**: Retrieve last 10 bulk import sessions

**Query Parameters**: None

**Response** (200 OK):
```json
[
  {
    "id": "sess_abc123xyz",
    "name": "Import 8/15/2026",
    "totalFiles": 2,
    "processedFiles": 2,
    "status": "completed",
    "totalImported": 1250,
    "files": "[{...}]",
    "createdAt": "2026-08-15T10:30:00Z"
  },
  {
    "id": "sess_def456uvw",
    "name": "Import 8/14/2026",
    "totalFiles": 1,
    "processedFiles": 1,
    "status": "completed",
    "totalImported": 890,
    "files": "[{...}]",
    "createdAt": "2026-08-14T14:22:00Z"
  }
]
```

### GET - Session Status

**Endpoint**: `GET /api/bulk-import/status/:id`

**Description**: Get status of specific import session

**Parameters**:
- `id` (path) - Session ID

**Response** (200 OK):
```json
{
  "id": "sess_abc123xyz",
  "name": "Import 8/15/2026",
  "totalFiles": 2,
  "processedFiles": 2,
  "status": "completed",
  "totalImported": 1250,
  "files": "[{...}]",
  "createdAt": "2026-08-15T10:30:00Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Session not found"
}
```

---

## 🏭 Products

### GET - List All Products

**Endpoint**: `GET /api/products`

**Description**: Retrieve all products in catalog

**Query Parameters**: None (optional: add pagination in future)

**Response** (200 OK):
```json
[
  {
    "id": "prod_001",
    "sku": "EPS-CORN-25",
    "name": "EPS Cornice 25mm",
    "category": "EPS",
    "price": 2500.00,
    "currency": "ZAR",
    "stock": 450,
    "supplier": "BuildMart Africa",
    "createdAt": "2025-01-15T08:00:00Z",
    "updatedAt": "2026-08-15T14:30:00Z"
  },
  {
    "id": "prod_002",
    "sku": "BR-CORN-30",
    "name": "Brass Cornice 30mm",
    "category": "BR",
    "price": 3800.00,
    "currency": "ZAR",
    "stock": 320,
    "supplier": "BuildMart Africa",
    "createdAt": "2025-01-16T09:15:00Z",
    "updatedAt": "2026-08-15T12:45:00Z"
  }
]
```

### POST - Restore Products

**Endpoint**: `POST /api/products/restore`

**Description**: Emergency endpoint - restore complete product catalog

**Request Body**: None (empty body)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Product catalog fully restored",
  "totalProducts": 34,
  "categories": {
    "EPS": 13,
    "BR": 13,
    "LED": 8
  }
}
```

---

## 📊 Inventory

### GET - List Inventory

**Endpoint**: `GET /api/inventory`

**Description**: Get current inventory levels across all warehouses

**Response** (200 OK):
```json
[
  {
    "id": "inv_001",
    "warehouseId": "wh_pretoria",
    "warehouseName": "Pretoria Central",
    "productId": "prod_001",
    "productSku": "EPS-CORN-25",
    "quantity": 450,
    "reorderLevel": 100,
    "lastRestocked": "2026-08-10T08:00:00Z",
    "location": "Shelf A-15"
  },
  {
    "id": "inv_002",
    "warehouseId": "wh_johannesburg",
    "warehouseName": "Johannesburg Hub",
    "productId": "prod_001",
    "productSku": "EPS-CORN-25",
    "quantity": 320,
    "reorderLevel": 100,
    "lastRestocked": "2026-08-12T10:30:00Z",
    "location": "Shelf B-08"
  }
]
```

---

## 🏪 Hardware Stores

### GET - List Hardware Stores

**Endpoint**: `GET /api/hardware-stores`

**Description**: Retrieve all registered hardware stores

**Query Parameters**: None (optional: add filtering by region, city)

**Response** (200 OK):
```json
[
  {
    "id": "store_001",
    "name": "BuildMart Pretoria Central",
    "city": "Pretoria",
    "province": "Gauteng",
    "country": "South Africa",
    "address": "123 Church Street",
    "phone": "+27 12 123 4567",
    "email": "pretoria@buildmart.co.za",
    "manager": "John Smith",
    "openingHours": "08:00 - 17:00",
    "latitude": -25.7455,
    "longitude": 28.2285,
    "storeType": "retail",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUpdated": "2026-08-15T09:00:00Z"
  }
]
```

### POST - Restore Stores

**Endpoint**: `POST /api/hardware-stores/restore`

**Description**: Emergency endpoint - restore complete hardware stores database

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Hardware stores database fully restored",
  "totalStores": 3197,
  "message2": "All 3,197+ stores restored across South African provinces"
}
```

---

## 🏆 Achievements

### GET - User Achievements

**Endpoint**: `GET /api/achievements/user/:userId`

**Description**: Get achievement progress and unlocked badges for a user

**Parameters**:
- `userId` (path) - User ID

**Response** (200 OK):
```json
{
  "userId": "user_123",
  "totalAchievements": 15,
  "unlockedAchievements": 8,
  "level": 3,
  "points": 2450,
  "achievements": [
    {
      "id": "ach_bulk_master",
      "name": "Bulk Import Master",
      "description": "Import over 10,000 records",
      "icon": "🏆",
      "unlocked": true,
      "unlockedAt": "2026-07-20T14:30:00Z",
      "progress": 100,
      "requirement": 10000
    },
    {
      "id": "ach_speed_demon",
      "name": "Speed Demon",
      "description": "Complete import in under 5 minutes",
      "icon": "⚡",
      "unlocked": true,
      "unlockedAt": "2026-08-10T09:15:00Z",
      "progress": 100,
      "requirement": 300
    },
    {
      "id": "ach_accuracy",
      "name": "Accuracy Expert",
      "description": "Import with 0 errors",
      "icon": "🎯",
      "unlocked": false,
      "progress": 75,
      "requirement": 100
    }
  ]
}
```

### POST - Record Import Metrics

**Endpoint**: `POST /api/achievements/record-import`

**Description**: Record import performance for achievement tracking

**Request Body**:
```json
{
  "userId": "user_123",
  "sessionId": "sess_abc123xyz",
  "fileName": "stores.xlsx",
  "performance": {
    "duration": 245000,
    "recordsImported": 1250,
    "errors": 0,
    "accuracy": 100
  }
}
```

**Response** (200 OK):
```json
{
  "userId": "user_123",
  "totalAchievements": 15,
  "unlockedAchievements": 9,
  "level": 3,
  "points": 2550,
  "newAchievements": [
    {
      "id": "ach_accuracy",
      "name": "Accuracy Expert",
      "icon": "🎯",
      "message": "Congratulations! You unlocked Accuracy Expert!"
    }
  ],
  "achievements": [...]
}
```

---

## 📈 Dashboard

### GET - Dashboard Summary

**Endpoint**: `GET /api/dashboard/summary`

**Description**: Get real-time dashboard metrics and KPIs

**Response** (200 OK):
```json
{
  "hardwareStores": 3197,
  "products": 34,
  "distributors": 125,
  "revenue": 57800000,
  "timestamp": "2026-08-15T14:30:00Z"
}
```

---

## 🤖 AI & Mood Detection

### POST - Generate Mood Recommendation

**Endpoint**: `POST /api/ai/generate-mood`

**Description**: Use AI to recommend optimal mood/theme based on context

**Request Body**:
```json
{
  "currentTime": "2026-08-15T14:30:00Z",
  "userActivity": "data_import",
  "preferences": {
    "energy": 70,
    "focus": 85,
    "creativity": 60
  }
}
```

**Response** (200 OK):
```json
{
  "recommendedMood": "focused",
  "reasoning": "You're in a focused activity with high focus preference. The 'focused' mood provides smooth, minimal transitions to maintain concentration.",
  "confidence": 0.92,
  "adaptations": {
    "energy": 60,
    "focus": 95,
    "creativity": 50
  },
  "moodProfile": {
    "id": "focused",
    "name": "Focused",
    "description": "Smooth, minimal transitions for maximum concentration",
    "colors": ["#1e293b", "#3b82f6"],
    "animationSpeed": "slow"
  }
}
```

### Available Moods

| Mood | Energy | Focus | Creativity | Best For |
|------|--------|-------|------------|----------|
| **Energetic** | 90% | 70% | 80% | Active tasks, team collaboration |
| **Focused** | 60% | 95% | 50% | Deep work, data analysis |
| **Creative** | 75% | 60% | 95% | Design, brainstorming |
| **Calm** | 40% | 80% | 70% | Strategic planning, review |
| **Productive** | 85% | 90% | 60% | Project execution, deadlines |

---

## 🌍 Fruitful Planet Integration

**Endpoint**: `/api/fruitful-planet/*`

**Description**: Integration with 93 GitHub repositories via Fruitful Planet  
Rhino Strikes + Ant Lattice execution model

**Sub-routes** (see separate Fruitful Planet documentation)

---

## 📡 BuildMart Signal Relay

**Endpoint**: `/relay/cornexconnect/*`

**Description**: Signal relay for BuildMart Africa buyer app  
Maintains signal integrity without exposing IP addresses

**Features**:
- Uninterrupted signal relay to database
- No IP exposure
- Real-time synchronization
- Failover mechanisms

---

## ❌ Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2026-08-15T14:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |
| 503 | Service Unavailable | Database connection failed |

### Common Errors

**Missing Authentication**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHENTICATED"
}
```

**File Upload Failed**
```json
{
  "error": "No files uploaded",
  "code": "NO_FILES"
}
```

**Session Not Found**
```json
{
  "error": "Session not found",
  "code": "SESSION_NOT_FOUND"
}
```

---

## 🔄 Rate Limiting

Currently not enforced but recommended for production:

- **Bulk Import**: 10 requests per minute
- **Products**: 100 requests per minute
- **Dashboard**: 60 requests per minute

---

## 🔑 Request/Response Headers

### Recommended Headers

**Request**:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token> (if applicable)
```

**Response**:
```
Content-Type: application/json
X-Request-Id: <unique-id>
X-Response-Time: <ms>
Cache-Control: no-cache
```

---

## 🧪 Testing Endpoints

### Using curl

```bash
# Get all products
curl -X GET http://localhost:5000/api/products \
  -H "Content-Type: application/json"

# Upload files
curl -X POST http://localhost:5000/api/bulk-import/upload \
  -F "files=@data.xlsx"

# Get dashboard summary
curl -X GET http://localhost:5000/api/dashboard/summary

# Get user achievements
curl -X GET http://localhost:5000/api/achievements/user/user_123

# Generate mood recommendation
curl -X POST http://localhost:5000/api/ai/generate-mood \
  -H "Content-Type: application/json" \
  -d '{
    "currentTime": "2026-08-15T14:30:00Z",
    "userActivity": "data_import",
    "preferences": {"energy": 70, "focus": 85, "creativity": 60}
  }'
```

### Using Postman

1. Import collection from `docs/postman-collection.json`
2. Set environment variables (base URL, auth tokens)
3. Run requests from collection

### Using VS Code REST Client

Create `.rest` files:
```rest
@baseUrl = http://localhost:5000/api

GET {{baseUrl}}/products

###

GET {{baseUrl}}/hardware-stores

###

POST {{baseUrl}}/bulk-import/upload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="files"; filename="data.xlsx"
< ./data.xlsx
------WebKitFormBoundary--
```

---

## 📞 Support & Maintenance

- **Issues**: Report on GitHub: https://github.com/heyns1000/cornexconnect/issues
- **Security**: Contact: security@cornexconnect.app
- **Documentation**: https://cornexconnect.dev/docs

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-15 | Initial API documentation |
| 0.9 | 2026-08-10 | Beta API endpoints |

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-08-15  
**Maintainer**: Heyns Schoeman

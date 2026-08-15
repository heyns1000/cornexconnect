# CornexConnect v2.6 - Software Packages & Dependencies

**Total Dependencies**: 657 packages installed  
**Package Manager**: npm  
**Node Version**: 18+  
**Last Updated**: 2026-08-15

---

## 📋 Quick Overview

| Category | Count | Purpose |
|----------|-------|---------|
| **UI Components** | 28 | Radix UI - Accessible, unstyled components |
| **React & State** | 3 | Core React + TanStack Query for data fetching |
| **Backend Framework** | 2 | Express.js + TypeScript support |
| **Database** | 2 | Drizzle ORM + Neon PostgreSQL client |
| **Styling** | 3 | Tailwind CSS + PostCSS + Autoprefixer |
| **File Handling** | 4 | Uppy (file uploads) + Multer + AWS S3 |
| **Authentication** | 3 | Passport.js + Session management |
| **Build Tools** | 5 | Vite, esbuild, TypeScript, TSX |
| **Maps & Geo** | 1 | Google Maps API |
| **Cloud Storage** | 1 | Google Cloud Storage |
| **Utilities** | 15+ | Various utility libraries |

---

## 🎨 Frontend Dependencies

### UI Framework
- **react** `^18.3.1` - Modern React with concurrent features
- **react-dom** `^18.3.1` - React DOM rendering

### UI Component Library (Radix UI)
Complete set of 28+ accessible, unstyled components:

```
@radix-ui/react-accordion           ^1.2.4     - Accordion component
@radix-ui/react-alert-dialog        ^1.1.7     - Alert dialog
@radix-ui/react-aspect-ratio        ^1.1.3     - Aspect ratio container
@radix-ui/react-avatar              ^1.1.4     - Avatar display
@radix-ui/react-checkbox            ^1.1.5     - Checkbox control
@radix-ui/react-collapsible         ^1.1.4     - Collapsible content
@radix-ui/react-context-menu        ^2.2.7     - Context menu
@radix-ui/react-dialog              ^1.1.7     - Dialog/Modal
@radix-ui/react-dropdown-menu       ^2.1.7     - Dropdown menu
@radix-ui/react-hover-card          ^1.1.7     - Hover card
@radix-ui/react-label               ^2.1.3     - Form label
@radix-ui/react-menubar             ^1.1.7     - Menu bar
@radix-ui/react-navigation-menu     ^1.2.6     - Navigation
@radix-ui/react-popover             ^1.1.7     - Popover
@radix-ui/react-progress            ^1.1.3     - Progress bar
@radix-ui/react-radio-group         ^1.2.4     - Radio buttons
@radix-ui/react-scroll-area         ^1.2.4     - Scrollable area
@radix-ui/react-select              ^2.1.7     - Select dropdown
@radix-ui/react-separator           ^1.1.3     - Visual separator
@radix-ui/react-slider              ^1.2.4     - Slider control
@radix-ui/react-slot                ^1.2.0     - Slot mechanism
@radix-ui/react-switch              ^1.1.4     - Toggle switch
@radix-ui/react-tabs                ^1.1.4     - Tabbed interface
@radix-ui/react-toast               ^1.2.7     - Toast notifications
@radix-ui/react-toggle              ^1.1.3     - Toggle button
@radix-ui/react-toggle-group        ^1.1.3     - Toggle group
@radix-ui/react-tooltip             ^1.2.0     - Tooltip
```

### Data Management & Fetching
- **@tanstack/react-query** `^5.60.5` - Powerful async state management, caching, and synchronization

### Styling & CSS
- **tailwindcss** `^3.4.17` - Utility-first CSS framework
- **postcss** `^8.4.47` - CSS processing
- **autoprefixer** `^10.4.20` - Autoprefixes CSS
- **@tailwindcss/typography** `^0.5.15` - Typography plugin
- **@tailwindcss/vite** `^4.1.11` - Vite plugin for Tailwind

### Form Handling
- **react-hook-form** - Form state management
- **@hookform/resolvers** `^3.10.0` - Form validation resolvers
- **zod** - Schema validation library

### File Upload
- **@uppy/core** `^4.5.2` - Uppy core file upload
- **@uppy/dashboard** `^4.4.2` - Uppy dashboard UI
- **@uppy/drag-drop** `^4.2.2` - Drag & drop handler
- **@uppy/aws-s3** `^4.3.2` - AWS S3 upload integration

### Animations
- **framer-motion** - Smooth animations and transitions

### Maps
- **@googlemaps/js-api-loader** `^1.16.10` - Google Maps API loader
- **@types/google.maps** `^3.58.1` - TypeScript types for Google Maps

### Type Definitions
```
@types/react              ^18.3.11
@types/react-dom         ^18.3.1
@types/memoizee          ^0.4.12
@types/google.maps       ^3.58.1
@types/ws                ^8.5.13
```

---

## ⚙️ Backend Dependencies

### Web Framework
- **express** - Fast, minimalist web server framework
- **@types/express** `4.17.21` - TypeScript types for Express

### Database & ORM
- **drizzle-orm** - Lightweight TypeScript ORM
- **@neondatabase/serverless** `^0.10.4` - Neon PostgreSQL client
- **drizzle-kit** `^0.31.9` - Drizzle schema management CLI
- **@types/pg** `^8.15.5` - PostgreSQL types

### Session Management
- **express-session** - Session middleware
- **@types/express-session** `^1.18.0` - Session types
- **connect-pg-simple** - PostgreSQL session store
- **@types/connect-pg-simple** `^7.0.3` - Session store types

### Authentication
- **passport** - Authentication middleware
- **passport-local** - Local strategy (username/password)
- **@types/passport** `^1.0.16` - Passport types
- **@types/passport-local** `^1.0.38` - Local strategy types

### File Upload & Processing
- **multer** `^2.0.0` - Middleware for file uploads
- **@types/multer** `^2.0.0` - Multer types
- **xlsx** - Excel file processing
- **@types/xlsx** `^0.0.35` - Excel types

### Cloud Storage
- **@google-cloud/storage** `^7.19.0` - Google Cloud Storage client

### WebSocket
- **ws** `^8.18.0` - WebSocket library
- **@types/ws** `^8.5.13` - WebSocket types

### Server Type Definitions
```
@types/node                ^20.16.11
@types/express-session     ^1.18.0
@types/connect-pg-simple   ^7.0.3
```

---

## 🛠️ Development & Build Tools

### Language & Compilation
- **typescript** `5.6.3` - TypeScript language
- **tsx** `^4.21.0` - TypeScript executor for Node.js
- **@vitejs/plugin-react** `^4.7.0` - React plugin for Vite

### Bundling & Building
- **vite** `^7.3.1` - Modern frontend build tool & dev server
- **esbuild** `^0.25.0` - JavaScript bundler (backend builds)
- **@jridgewell/trace-mapping** `^0.3.25` - Source map tracing

### Utilities
- **memoizee** - Memoization library
- **@types/memoizee** `^0.4.12` - Memoizee types

---

## 📦 Optional Dependencies

- **bufferutil** `^4.0.8` - Optional performance optimization for WebSocket buffers

---

## 📊 Dependency Breakdown

### By Weight (Popularity)
1. **React Ecosystem** (35%) - React, React DOM, React Query
2. **Radix UI Components** (20%) - 28 accessible UI components
3. **Styling** (15%) - Tailwind CSS + PostCSS
4. **Database & Backend** (15%) - Express, Drizzle, PostgreSQL
5. **Utilities & Tools** (15%) - TypeScript, Build tools, etc.

### Security Status
- **High Risk**: 19 vulnerabilities (review security advisories)
- **Moderate Risk**: 12 vulnerabilities (monitor updates)
- **Low Risk**: 4 vulnerabilities (non-blocking)
- **Total**: 35 vulnerabilities (as of 2026-08-15)

**Action**: Run `npm audit` to view details and `npm audit fix` to resolve fixable vulnerabilities.

---

## 🔄 Version Strategy

- **Core Libraries**: Latest stable (React 18, Vite 7)
- **Radix UI**: Consistent minor versions (1.x)
- **TypeScript**: Pinned to `5.6.3` for stability
- **Others**: Caret ranges (`^x.y.z`) for minor/patch updates

---

## 📚 Scripts

```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server (React + Express HMR) |
| `npm run build` | Build for production (client + server) |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push Drizzle schema to database |

---

## 🚀 Production Optimization

### Frontend Bundle
- Minified: 1.5MB total
- Gzipped: ~390KB JavaScript
- Code splitting: Vite handles automatically
- CSS: 169KB minified, 26KB gzipped

### Backend Bundle
- Bundled size: 149KB
- Format: ES modules (ESM)
- Compression: esbuild optimization
- Platform: Node.js 18+

---

## 🔍 Package Updates

To check for outdated packages:
```bash
npm outdated
```

To update to latest compatible versions:
```bash
npm update
```

To audit security vulnerabilities:
```bash
npm audit
npm audit fix
```

---

## 📄 License

**Project License**: MIT  
**All Dependencies**: Mix of MIT, Apache 2.0, ISC, and other open-source licenses

See individual package licenses by running:
```bash
npm ls --all --depth=0
```

---

## 🔗 Useful Links

| Package | URL | Docs |
|---------|-----|------|
| React | https://react.dev | React Documentation |
| Radix UI | https://www.radix-ui.com | Component Library |
| Tailwind | https://tailwindcss.com | CSS Framework |
| Vite | https://vitejs.dev | Build Tool |
| Express | https://expressjs.com | Web Framework |
| Drizzle ORM | https://orm.drizzle.team | Database ORM |
| TanStack Query | https://tanstack.com/query | Data Fetching |
| TypeScript | https://www.typescriptlang.org | Language |
| Passport | http://www.passportjs.org | Authentication |

---

**Generated**: 2026-08-15  
**Status**: Production Ready ✅  
**Total Size**: 657 packages, ~500MB node_modules

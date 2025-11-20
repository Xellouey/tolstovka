# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TOLSTOVKA is a Telegram Mini App e-commerce platform featuring a Vue.js frontend, Express.js backend, and SQLite database. The project implements a streetwear store with mobile-first design, admin panel, and Telegram bot integration.

**Production URL**: https://tolstovka.vercel.app  
**Development Stack**: Vue 3 + TypeScript + UnoCSS + Express.js + SQLite + Telegram Bot API  
**Architecture**: Monorepo with separate frontend/server workspaces

## Core Architecture

### Project Structure
```
/
├── frontend/           # Vue.js 3 + TypeScript SPA
│   ├── src/
│   │   ├── components/ # Vue components (admin/, product/, icons/)
│   │   ├── views/      # Page components (HomeView, AdminView, etc.)
│   │   ├── stores/     # Pinia stores (catalog, admin)
│   │   ├── router/     # Vue Router configuration
│   │   ├── utils/      # HTTP client and utilities
│   │   └── types/      # TypeScript definitions
│   └── tests/          # Vitest unit tests
├── server/             # Express.js backend
│   ├── routes/         # API routes (admin.js, public.js)
│   ├── migrations/     # Database migrations
│   ├── seed/          # Initial data (categories, products, banners)
│   ├── data/          # SQLite database location
│   ├── auth.js        # JWT authentication
│   ├── db.js          # Database initialization & queries
│   ├── bot.js         # Telegram bot logic
│   └── upload.js      # File upload handling
├── api/               # Vercel serverless functions (production)
├── uploads/           # Static file storage
├── scripts/           # Development utilities
└── ops/              # Deployment configuration
```

### Technology Stack

**Frontend**:
- Vue 3 with Composition API + TypeScript
- Pinia for state management  
- Vue Router for SPA routing
- UnoCSS for utility-first styling
- Vite for build tooling
- Vitest for testing
- HeadlessUI Vue + VueUse composables

**Backend**:
- Express.js (NOT Fastify - see critical rules below)
- better-sqlite3 for database
- JWT for authentication
- Multer for file uploads
- Telegraf for bot integration

**Key Dependencies**:
- `embla-carousel-vue` - banner carousels
- `sharp` - image processing
- `slugify` - URL-friendly slugs
- `vee-validate` + `zod` - form validation

## Development Commands

### Full Development Environment
```bash
# Start both frontend and backend
npm run dev

# Start with Telegram bot
npm run dev -- --bot

# Alternative: individual services
npm run dev:frontend    # Vite dev server (port 5173)
npm run dev:server      # Express server (port 8081)  
npm run dev:bot         # Telegram bot only
```

### Frontend Commands
```bash
cd frontend
npm run dev             # Development server
npm run build           # Production build
npm run preview         # Preview production build
npm run type-check      # TypeScript validation
npm run lint            # ESLint check + fix
npm run test:unit       # Run Vitest tests
```

### Server Commands  
```bash
cd server
npm run start           # Production server
npm run dev             # Development server
npm run start:bot       # Start Telegram bot
```

### Testing & Quality
```bash
# Run all tests
npm test

# Lint all code
npm run lint

# Format code
npm run format
```

## Database & Seeding

Database is SQLite with automatic initialization and seeding on first run. Schema includes:
- `categories` - product categories with ordering
- `products` - main product data
- `product_images` - image URLs with positioning
- `banners` - homepage promotional banners
- `settings` - application configuration

Seed data located in `server/seed/` (categories.json, products.json, banners.json).

## API Architecture

### Public Endpoints (no auth required)
- `GET /api/categories` - list categories with product counts
- `GET /api/products` - paginated product list with filtering/sorting
- `GET /api/product/:id` - individual product details
- `GET /api/banners` - active homepage banners
- `GET /api/settings` - public settings (manager contact)

### Admin Endpoints (JWT auth required)
- `POST /api/admin/login` - authentication
- `POST /api/admin/password` - change password
- CRUD for banners: `/api/admin/banners`
- CRUD for categories: `/api/admin/categories` 
- CRUD for products: `/api/admin/products`
- `POST /api/admin/upload` - file upload to `/uploads`
- Reordering endpoints for banners/categories/product images

## State Management (Pinia)

### Catalog Store (`useCatalogStore`)
- Product browsing, filtering, sorting
- Category navigation and counts
- Banner management
- Shopping cart functionality
- Pagination and lazy loading

### Admin Store (`useAdminStore`) 
- Authentication state management
- CRUD operations for all entities
- File upload handling
- Error handling and loading states

## Critical Development Rules

### 🔥 ABSOLUTE PROHIBITIONS

1. **NO FASTIFY** - Only Express.js allowed. Any Fastify code must be immediately refactored to Express.
2. **NO DEMO COMPONENTS** - Never create components with "Demo" suffix or demo routes like `/demo`, `/showcase`. Update existing components instead.
3. **NO IN-MEMORY WORKAROUNDS** - All data must persist properly through the database.
4. **NO BYPASSING ARCHITECTURE** - Follow the established patterns for stores, API routes, and component structure.

### Express.js Requirements
- Development port: 8081 (not 8080)
- Use Express Router for all routes
- Express-compatible middleware only
- Proper error handling and CORS configuration

### Code Quality Standards
- All comments and documentation in English
- TypeScript strict mode enabled
- Follow existing naming conventions
- Use established component patterns
- Maintain mobile-first responsive design

## Styling System (UnoCSS)

### Brand Colors
- Primary: `#ffc81a` (yellow accent) 
- Dark: `#383b3d` (main text)
- White: `#ffffff`
- Black: `#0a0a0a` (streetwear contrast)

### Key Shortcuts
- `btn-primary` - main action buttons with shadow
- `chip-active/inactive` - category filter buttons
- `product-card` - product display cards
- `card-hover` - interactive card effects
- Typography: `text-brand-primary`, `product-title`, `section-header`

### Responsive Design
- Mobile-first approach
- Telegram WebApp safe areas
- Touch-optimized interactions
- Aspect ratios: banners (12:5), products (3:4)

## Deployment

### Development
Uses local Express server with SQLite database and file uploads to `uploads/` directory.

### Production (Vercel)
- Serverless functions in `/api` directory
- Static frontend build
- External database required (Vercel KV/Postgres recommended)
- File uploads via external service (Cloudinary/Vercel Blob)

### Telegram Bot
Requires separate hosting (VPS recommended). Bot handles:
- Welcome menu with info sections
- Web App launcher button for catalog
- Manager contact integration (@dmitriy_mityuk)

## Testing Strategy

- Unit tests with Vitest + Happy DOM
- Component testing for Vue components
- API endpoint testing for critical paths
- Test files: `*.spec.ts` in `frontend/tests/unit/`

## Common Workflows

### Adding New Product Category
1. Use admin panel at `/admin` (login: admin/admin by default)
2. Categories auto-generate slugs from names
3. Support manual ordering via drag-and-drop
4. Toggle visibility for empty categories

### Managing Products  
1. Create via admin form with image upload
2. Images stored with position ordering
3. Support drag-and-drop reordering
4. Hard delete removes from catalog immediately

### Customizing Design
1. Modify brand colors in `uno.config.ts`
2. Update component styles using UnoCSS shortcuts
3. Maintain 12:5 banner and 3:4 product aspect ratios
4. Ensure mobile-first responsive behavior

## Error Handling

The project uses comprehensive error handling:
- Frontend: Pinia store error states with user-friendly messages
- Backend: Express error middleware with proper HTTP status codes  
- Validation: VeeValidate + Zod for form validation
- Authentication: JWT with secure cookie handling

Remember: This is a production e-commerce platform requiring attention to security, performance, and user experience. Always test changes thoroughly in both mobile and desktop Telegram environments.
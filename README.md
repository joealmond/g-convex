# G-Matrix (g-convex)

A gluten-free product rating app built with TanStack Start, Convex, and better-auth.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development (frontend + backend)
npm run dev

# Or run separately:
npm run dev:convex   # Convex backend in terminal 1
npm run dev:web      # Vite frontend in terminal 2
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | TanStack Start (React + SSR) |
| Backend | Convex (serverless functions + database) |
| Auth | better-auth with Convex adapter |
| Styling | Tailwind CSS v4 |
| Hosting | Netlify (frontend) + Convex Cloud (backend) |

---

## 🛠️ Available Scripts

### Development
```bash
npm run dev           # Start both frontend and Convex dev server
npm run dev:web       # Start only Vite frontend (port 3000)
npm run dev:convex    # Start only Convex dev server
npm run dev:ts        # TypeScript watch mode
```

### Build & Lint
```bash
npm run build         # Production build (Vite + TypeScript check)
npm run lint          # Run ESLint + TypeScript
npm run format        # Format code with Prettier
```

### Deployment
```bash
npm run deploy            # Full deploy: Convex backend + Netlify frontend
npm run deploy:backend    # Deploy only Convex functions
npm run deploy:frontend   # Build and deploy only to Netlify
npm run deploy:preview    # Deploy to Netlify preview URL (not production)
```

### Convex CLI
```bash
npm run convex:push       # Push functions to dev deployment
npm run convex:logs       # View function logs
npm run convex:dashboard  # Open Convex dashboard in browser
npm run convex:env:list   # List environment variables
npm run convex:env:set    # Set an environment variable (interactive)
npm run convex:seed       # Seed database with test products
npm run convex:migrate    # Run database migrations
```

### Netlify CLI
```bash
npm run netlify:logs      # View SSR function logs
npm run netlify:open      # Open Netlify admin panel
npm run netlify:env       # List Netlify environment variables
```

---

## 🌐 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │   Netlify (Frontend) │    │   Convex Cloud (Backend) │  │
│  │   g-matrix-app.      │───▶│   dependable-grasshopper │  │
│  │   netlify.app        │    │   -67.convex.cloud       │  │
│  │                      │    │                          │  │
│  │  • TanStack SSR      │    │  • Functions (votes,     │  │
│  │  • Static assets     │    │    products, users)      │  │
│  │  • Edge functions    │    │  • Database              │  │
│  └──────────────────────┘    │  • File storage          │  │
│                              │  • Auth HTTP endpoints   │  │
│                              │    (.convex.site)        │  │
│                              └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key URLs
| Environment | Frontend | Backend API | Auth Endpoints |
|-------------|----------|-------------|----------------|
| Production | `g-matrix-app.netlify.app` | `*.convex.cloud` | `*.convex.site` |
| Development | `localhost:3000` | Dev deployment | Dev deployment |

---

## ⚙️ Environment Variables

### Convex (Backend)
Set via `npx convex env set VAR_NAME` or Convex Dashboard:

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Gemini API key for AI image analysis |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SITE_URL` | Production site URL for auth callbacks |

### Local Development (`.env.local`)
```bash
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-dev.convex.cloud
VITE_CONVEX_SITE_URL=https://your-dev.convex.site
```

### Netlify (Frontend)
Set in Netlify Dashboard → Site settings → Environment variables:

| Variable | Value |
|----------|-------|
| `VITE_CONVEX_URL` | `https://dependable-grasshopper-67.convex.cloud` |

---

## 🚢 Deployment Setup (What We Configured)

### 1. Netlify Plugin for TanStack Start SSR
Installed the official Netlify Vite plugin to enable SSR:

```bash
npm install @netlify/vite-plugin-tanstack-start
```

Added to `vite.config.ts`:
```typescript
import netlifyPlugin from '@netlify/vite-plugin-tanstack-start'

export default defineConfig({
  plugins: [
    // ... other plugins
    netlifyPlugin(),
  ],
})
```

This plugin:
- Bundles SSR code into Netlify Functions
- Writes entry point to `.netlify/v1/functions/server.mjs`
- Handles routing for SPA + SSR hybrid

### 2. Convex HTTP Actions for Auth
Auth callbacks are handled by Convex HTTP actions at `*.convex.site`:

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();
authComponent.registerRoutes(http, createAuth);

export default http;
```

### 3. Deploy Commands
```bash
# Deploy everything
npm run deploy

# This runs:
# 1. npx convex deploy --cmd 'npm run build'  (backend + build with prod env)
# 2. netlify deploy --prod                     (upload to Netlify)
```

---

## 📁 Project Structure

```
g-convex/
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── products.ts         # Product queries/mutations
│   ├── votes.ts            # Vote logic + gamification
│   ├── users.ts            # User queries
│   ├── auth.ts             # better-auth setup
│   ├── http.ts             # HTTP action routes
│   ├── ai.ts               # Gemini AI integration
│   ├── migrations.ts       # Database migrations
│   └── lib/                # Shared utilities
├── src/
│   ├── routes/             # TanStack Router pages
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities + auth client
│   └── styles/             # CSS
├── dist/                   # Build output
│   ├── client/             # Static assets
│   └── server/             # SSR bundle
├── .netlify/               # Netlify build artifacts
└── vite.config.ts          # Vite + plugins config
```

---

## 🔧 Troubleshooting

### "Schema validation failed" on deploy
Run the cleanup migration:
```bash
npx convex run migrations:cleanupVoteCount
```

### "HTTP actions not enabled"
Deploy to production:
```bash
npx convex deploy
```

### 404 on Netlify
Ensure the Netlify plugin is installed and rebuild:
```bash
npm run deploy
```

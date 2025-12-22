# Architecture & Features

This document outlines the current architecture and feature implementation of the `g-convex` application.

> **Last Updated**: December 2024

## 1. Core Architecture

### Backend (Convex)
- **Database**: Relational-style tables (`products`, `votes`, `profiles`, `user`, `session`, `account`, `verification`)
- **Logic**: Type-safe mutations, queries, and actions in `convex/`
- **Search**: Built-in indexing (e.g., `by_name`, `by_user_product`, `by_user`)
- **Auth**: Better-Auth component with Google OAuth integration
- **Crons**: Scheduled jobs for time decay in `convex/crons.ts`

### Frontend (TanStack Start)
- **Framework**: Vite + TanStack Start + React 19
- **State Management**: Convex React Client (`useQuery`, `useMutation`) + TanStack Query
- **Routing**: File-based routing with `@tanstack/react-router`
- **UI**: Shadcn/ui components with Radix primitives
- **Charts**: Recharts for Matrix visualization
- **i18n**: Custom implementation with EN/HU translations

## 2. Feature Implementation

### A. Authentication System
**Files**: `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts`, `src/lib/auth-client.ts`

- **Provider**: Better-Auth with Convex adapter
- **OAuth**: Google Sign-In configured
- **Anonymous Users**: UUID-based localStorage IDs for guest voting
- **Migration**: `migrateAnonymousVotes` mutation transfers votes on signup

### B. Voting System
**File**: `convex/votes.ts`

- **Weighted Averages**: Registered votes 2x weight vs anonymous
- **Transactional Consistency**: Atomic vote updates with product recalculation
- **Combined Flow**: `createProductAndVote` for new products
- **Gamification Integration**: Points/badges awarded on vote

### C. Gamification
**Files**: `src/lib/gamification.ts`, `convex/votes.ts`

- **Points**: Base 10 + bonuses for price/store/GPS/new products
- **Streaks**: Consecutive daily voting tracked
- **Badges**: 6 badges (first_scout, trailblazer, location_pro, etc.)
- **UI**: ScoutCard in header popover, profile page

### D. AI Product Analysis
**File**: `convex/ai.ts`

- **Model**: Google Gemini 2.0 Flash
- **Input**: Image from Convex storage
- **Output**: Product name, gluten-free status, risk level, tags

### E. Internationalization
**Files**: `src/lib/i18n.ts`, `src/locales/en.json`, `src/locales/hu.json`

- **Languages**: English (EN) and Hungarian (HU)
- **Storage**: Locale preference in localStorage
- **Hook**: `useTranslations(namespace)` for component translations

### F. Admin Features
**Files**: `convex/users.ts`, `src/hooks/use-admin.ts`, `src/components/layout/admin-toolbar.tsx`

- **Detection**: `isAdmin` query checks profile role
- **Toolbar**: Floating admin badge with impersonation toggle
- **Impersonation**: View app as different user for debugging

## 3. Data Schema
**File**: `convex/schema.ts`

| Table | Purpose |
|-------|---------|
| `products` | Aggregated ratings, metadata, store availability |
| `votes` | Individual vote records with timestamps |
| `profiles` | Gamification stats (points, badges, streaks) |
| `user` | Auth identity (managed by Better-Auth) |
| `session` | Auth sessions |
| `account` | OAuth account links |

## 4. Scheduled Jobs
**File**: `convex/crons.ts`

- **Daily Time Decay**: Runs at midnight UTC, applies 0.5% decay to product averages

## 5. Environment Configuration

### Convex Environment Variables
- `BETTER_AUTH_SECRET` - Encryption key for auth
- `SITE_URL` - Application URL (http://localhost:3000)
- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API key

### Client Environment (.env.local)
- `VITE_CONVEX_URL` - Convex cloud URL (.convex.cloud)
- `VITE_CONVEX_SITE_URL` - Convex site URL (.convex.site)
- `VITE_SITE_URL` - Local dev URL

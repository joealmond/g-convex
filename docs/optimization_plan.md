# Optimization & Modernization Plan

This plan outlines how to leverage the new stack (Convex + TanStack Start) to simplify architecture and improve performance.

> **Last Updated**: December 2024

## 1. Dependency Reduction

Libraries removed from g-matrix as their functionality is replaced:

| Library | Replacement | Status |
|---------|-------------|--------|
| `firebase`, `firebase-admin` | **Convex** | ✅ Done |
| `@genkit-ai/*` | **Direct Gemini API** | ✅ Done |
| `next-intl` | **Custom i18n** | ✅ Done |
| `swr` | **Convex React Client** | ✅ Done |
| `zod` (Client-side) | **Convex Validators** | ✅ Done |

**Kept**: `@tanstack/react-query` for non-Convex APIs and SSR hydration.

## 2. Architectural Improvements

### A. Real-time Gamification
- ✅ **Implemented**: `castVote` triggers gamification updates transactionally
- ✅ **Implemented**: Points, badges, streaks updated atomically

### B. Intelligent Caching & Aggregation
- ✅ **Implemented**: Aggregate fields on `products` table for fast reads
- ✅ **Implemented**: Time decay cron job runs nightly

### C. Type-Safe AI Actions
- ✅ **Implemented**: `convex/ai.ts` uses Google Gemini SDK
- ✅ **Implemented**: Structured response (productName, riskLevel, tags)

### D. Simplified Auth State
- ✅ **Implemented**: Better-Auth component with Convex adapter
- ✅ **Implemented**: Role and gamification stats in `profiles` table
- ✅ **Implemented**: Anonymous user support with vote migration

### E. Internationalization
- ✅ **Implemented**: Lightweight custom i18n with localStorage
- ✅ **Implemented**: EN/HU translation files ported

## 3. Execution Status

| Task | Status |
|------|--------|
| Backend: Weighted voting (`convex/votes.ts`) | ✅ Complete |
| Backend: Gamification engine | ✅ Complete |
| Backend: Time decay cron | ✅ Complete |
| AI: Gemini analysis (`convex/ai.ts`) | ✅ Complete |
| Auth: Better-Auth with Google OAuth | ✅ Complete |
| Auth: Anonymous users | ✅ Complete |
| Frontend: VotingPanel with store/GPS | ✅ Complete |
| Frontend: ScoutCard in header | ✅ Complete |
| Frontend: Profile page | ✅ Complete |
| Frontend: i18n language switcher | ✅ Complete |
| Frontend: Admin toolbar | ✅ Complete |
| Migration: Firebase to Convex scripts | ✅ Complete |

## 4. Performance Optimizations Applied

- **Indexes**: `by_name`, `by_user`, `by_user_product` for fast queries
- **Atomic Updates**: Single-transaction vote + gamification updates
- **Lazy Loading**: TanStack Router code-splitting
- **Real-time**: Convex subscriptions instead of polling

## 5. Remaining Optimizations

- [ ] **Bundle Splitting**: Large main.js chunk (611KB) needs manual chunking
- [ ] **Image Optimization**: Add client-side WebP conversion before upload
- [ ] **Rate Limiting**: Implement per-user limits on image analysis

# G-Matrix → G-Convex Migration

> **Status**: ✅ Complete | **Last Updated**: January 2026

## Stack Comparison

| | g-matrix | g-convex |
|--|----------|----------|
| Database | Firestore | Convex |
| Auth | Firebase | Better-Auth |
| Framework | Next.js 14 | TanStack Start |
| AI | Genkit | Direct Gemini API |

## Completed Features

- ✅ Google OAuth authentication
- ✅ Anonymous user voting
- ✅ Weighted vote averages
- ✅ Admin dashboard with delete
- ✅ View as User impersonation
- ✅ FineTunePanel (draggable dot)
- ✅ Gamification (points, badges, streaks)
- ✅ i18n (EN/HU)
- ✅ Time decay cron job
- ✅ AI image analysis
- ✅ Store freshness indicators
- ✅ Design system (Space Grotesk + Inter)

## Key Files

| Purpose | File |
|---------|------|
| Auth | `convex/auth.ts` |
| Admin check | `convex/users.ts` (ADMIN_EMAILS) |
| Delete products | `convex/products.ts` |
| Voting | `convex/votes.ts` |
| Admin UI | `src/components/dashboard/admin-product-list.tsx` |
| Impersonate | `src/hooks/use-impersonate.tsx` |

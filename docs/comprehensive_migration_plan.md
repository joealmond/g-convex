# G-Matrix → G-Convex Migration Plan

> **Status**: Migration Complete | **Last Updated**: December 2024  
> **Stack**: Convex + TanStack Start + Better-Auth

---

## Executive Summary

The migration from g-matrix (Firebase/Next.js) to g-convex (Convex/TanStack Start) is **substantially complete**. All major features have been ported with improvements.

---

## ✅ Completed Features

### Authentication
- [x] Better-Auth with Convex adapter
- [x] Google OAuth integration
- [x] Anonymous user system (localStorage UUID)
- [x] Vote migration on account creation
- [x] Session management

### Voting System
- [x] Safety/Taste/Price voting
- [x] Weighted averages (2x registered)
- [x] Store and GPS tagging
- [x] Transactional updates
- [x] Combined product creation + vote

### Gamification
- [x] Points calculation engine
- [x] Badge awarding (6 badges)
- [x] Streak tracking
- [x] ScoutCard UI
- [x] Profile page stats

### Internationalization
- [x] EN/HU translation files
- [x] useTranslations hook
- [x] Language switcher
- [x] localStorage persistence

### Admin Features
- [x] isAdmin query
- [x] AdminToolbar component
- [x] Impersonation mode

### Scheduled Jobs
- [x] Time decay cron (daily)

### UI Components
- [x] MatrixChart (Vibe/Value modes)
- [x] ProductList with thumbnails
- [x] ProductSearch
- [x] VotingPanel
- [x] ImageUploadDialog
- [x] DynamicHeaderButtons

---

## 🟡 Remaining Work

### Low Priority
- [ ] FineTunePanel (draggable dot voting)
- [ ] Design system polish (fonts, CSS variables)
- [ ] Store freshness opacity indicators
- [ ] Bundle size optimization

---

## Environment Setup

### Convex Environment Variables
```bash
npx convex env set BETTER_AUTH_SECRET $(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:3000
npx convex env set GOOGLE_CLIENT_ID "your-client-id"
npx convex env set GOOGLE_CLIENT_SECRET "your-secret"
npx convex env set GOOGLE_GENERATIVE_AI_API_KEY "your-api-key"
```

### Local Environment (.env.local)
```
CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
VITE_SITE_URL=http://localhost:3000
```

### Google OAuth Console
**Authorized JavaScript origins:**
- `http://localhost:3000`
- `https://your-deployment.convex.site`

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google`
- `https://your-deployment.convex.site/api/auth/callback/google`

---

## Key File Mappings

| Original (g-matrix) | Target (g-convex) |
|---------------------|-------------------|
| Firebase Auth | Better-Auth + Convex |
| `src/app/[locale]/page.tsx` | `src/routes/index.tsx` |
| `src/app/[locale]/product/[name]/page.tsx` | `src/routes/product/$name.tsx` |
| `messages/en.json` | `src/locales/en.json` |
| Server Actions | `convex/*.ts` mutations |
| Firestore | Convex tables |

---

## Tech Stack Comparison

| Feature | g-matrix | g-convex |
|---------|----------|----------|
| Database | Firestore | Convex |
| Auth | Firebase Auth | Better-Auth |
| Hosting | Vercel | Any Node host |
| AI | Genkit | Direct Gemini API |
| i18n | next-intl | Custom hooks |
| Routing | Next.js App Router | TanStack Router |
| State | SWR + Context | Convex + TanStack Query |

---

*This document reflects the current state of the migration. All critical features are complete.*

# Architecture & Features

> **Last Updated**: December 2024

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Convex |
| Auth | Better-Auth + Google OAuth |
| Frontend | TanStack Start + React 19 |
| Styling | TailwindCSS v4 + Shadcn/ui |
| Charts | Recharts |

## Database Schema

| Table | Purpose |
|-------|---------|
| `products` | Product data + aggregated ratings |
| `votes` | Individual vote records |
| `profiles` | Gamification stats |
| `betterAuth:user` | Auth users (component-managed) |
| `betterAuth:session` | Auth sessions |

## Key Features

### Authentication
- Google OAuth via Better-Auth component
- Email-based admin whitelist (`ADMIN_EMAILS` in `convex/users.ts`)
- Anonymous users with localStorage UUID

### Admin Features
- `isAdmin` query with email whitelist
- `AdminProductList` with delete/recalculate buttons
- `AdminToolbar` with "View as User" impersonation
- `deleteProduct` mutation (cascades to votes)

### Voting
- Weighted averages (registered = 2x)
- Store + GPS tagging
- FineTunePanel with draggable dot

### Gamification
- Points, badges, streaks
- ScoutCard in header

### i18n
- EN/HU translations
- `useTranslations` hook

## Design System

- **Fonts**: Space Grotesk (headlines), Inter (body)
- **Theme**: Dark mode default
- **Colors**: Purple primary, Green accent

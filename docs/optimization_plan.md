# Optimization & Modernization Plan

This plan outlines how to leverage the new stack (Convex + TanStack Start) to simplify architecture and improve performance.

## 1. Dependency Reduction (Throw Away)

We can remove the following libraries from `g-matrix` as their functionality is replaced by the platform:

| Library | Replacement | Benefit |
|---------|-------------|---------|
| `firebase`, `firebase-admin` | **Convex** | Real-time database, Auth, Storage, and Functions in one type-safe platform. |
| `@genkit-ai/*` | **Direct API Calls (fetch)** | Genkit is powerful but heavy. For simple image analysis, a direct call to Gemini API in a Convex Action is lighter and faster. |
| `next-intl` | **Typesafe i18n** | Consider a lighter-weight i18n solution or native TanStack Router search params for simple locale handling. |
| `swr` / `react-query` | **Convex React Client** | Convex handles caching, real-time subscriptions, and optimistic updates out of the box. (Note: `react-query` is still useful for non-Convex APIs). |
| `zod` (Client-side) | **Convex Validators** | Convex `v` validators provide runtime validation at the API boundary, reducing need for heavy client-side schema duplication. |

## 2. Architectural Improvements

### A. Real-time Gamification
**Old Way**: Transactional updates in Firebase.
**New Way**: 
- **Convex Internal Mutations**: Decouples complex logic if needed.
- [x] **Implemented**: `castVote` now triggers gamification updates transactionally, ensuring data consistency.

### B. Intelligent Caching & Aggregation
**Old Way**: Manual `avgSafety`, `avgTaste` fields updated on every write.
**New Way**: 
- [x] **Implemented**: Keep aggregate fields on the `products` table for performance.
- **Pending**: Use **Convex Crons** for the Time Decay logic (run nightly).

### C. Type-Safe AI Actions
**Old Way**: Server Action with generic `fetch` or SDK.
**New Way**: 
- [x] **Implemented**: `convex/ai.ts` uses Google Gemini SDK.
- [x] **Implemented**: Returns structured, type-safe data (Risk Level, Tags, etc.) directly to the frontend.

### D. Simplified Auth State
**Old Way**: Firebase Context Providers + complex User streams.
**New Way**: 
- [x] **Implemented**: `ConvexAuthProvider` wrapping Better-Auth.
- [x] **Implemented**: Role and Gamification stats attached to `profiles` table, easily queried.

## 3. Execution Status

1.  [x] **Backend**: Implement `convex/votes.ts` (Weighted voting) and `convex/lib/gamification.ts`.
2.  [x] **AI**: Move Gemini logic to `convex/ai.ts`.
3.  [x] **Frontend**: Update `VotingPanel` to include Location/Price inputs and AI integration.
4.  [x] **Migration**: Basic migration scripts in `convex/migrations.ts` created.
5.  [ ] **Maintenance**: Implement `convex/crons.ts` for time decay.
6.  [ ] **Profile UI**: Build the user profile page to display the new gamification stats.

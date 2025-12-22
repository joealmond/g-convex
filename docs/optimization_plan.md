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
- Use **Convex Internal Mutations** to decouple voting speed from gamification logic.
- `castVote` -> triggers `internal.gamification.awardPoints` asynchronously.
- UI updates point balance in real-time without refreshing.

### B. Intelligent Caching & Aggregation
**Old Way**: Manual `avgSafety`, `avgTaste` fields updated on every write.
**New Way**: 
- Keep the aggregate fields for performance (Convex indexing).
- Use **Convex Crons** for the Time Decay logic (run nightly).
- Use `convex-helpers` specifically `aggregates` if simple counting is needed, but for weighted averages, custom mutations are best.

### C. Type-Safe AI Actions
**Old Way**: Server Action with generic `fetch` or SDK.
**New Way**: 
- **Convex Action**: `convex/actions.ts:analyzeImage`
- Returns type-safe `ImageAnalysisState` object.
- Runs on V8 isolated environment (fast startup).

### D. Simplified Auth State
**Old Way**: Firebase Context Providers + complex User streams.
**New Way**: 
- `ConvexAuthProvider` (wrapping Better-Auth).
- `useQuery(api.users.current)` gives fully typed user profile + gamification stats instantly available anywhere.

## 3. Next Steps Execution Plan

1.  **Backend**: Implement `convex/gamification.ts` and `convex/crons.ts`.
2.  **AI**: Move Gemini logic to `convex/actions/ai.ts`.
3.  **Frontend**: Update `VotingPanel` to include Location/Price inputs.
4.  **Migration**: Write a script to port existing Firebase data to Convex (if needed).

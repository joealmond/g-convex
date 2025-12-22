# Architecture & Features

This document outlines the current architecture and feature implementation of the `g-convex` application.

## 1. Core Architecture

### Backend (Convex)
- **Database**: Relational-style using Convex tables (`products`, `votes`, `profiles`, `users`).
- **Logic**: Type-safe mutations and actions found in `convex/`.
- **Search**: Leverages Convex's built-in indexing (e.g., `by_name`, `by_user_product`).

### Frontend (TanStack Start)
- **Framework**: Vite + TanStack Start.
- **State Management**: Convex React Client (`useQuery`, `useMutation`).
- **Routing**: File-based routing with `@tanstack/react-router`.

## 2. Feature Implementation

### A. Voting System
**File**: `convex/votes.ts`

The voting system is designed to be robust and weighted:
- **Weighted Averages**: Registered user votes carry more weight (80%) compared to anonymous votes (20%).
- **Transactional Consistency**: When a vote is cast:
  1. Old vote (if any) is subtracted.
  2. New vote is added.
  3. Product averages (Safety, Taste, Price) are recalculated immediately.
- **Combined Flow**: The `createProductAndVote` mutation allows users to create a product and cast their first vote in a single atomic operation.

### B. Gamification
**File**: `convex/lib/gamification.ts`, `convex/votes.ts`

Gamification is tightly integrated into the voting loop:
- **Triggers**: Every valid vote by a registered user triggers `processGamification`.
- **Stats Tracked**:
  - `points`: Total score based on actions.
  - `streaks`: Consecutive days of activity.
  - `badges`: Unlocked achievements (stored as ID strings).
- **Point System**:
  - Base Vote: 10 pts
  - Price/Location/Store info: Bonus points
  - New Product Discovery: 25 pts

### C. AI Product Analysis
**File**: `convex/ai.ts`

Leverages Google Gemini 2.0 Flash for instant image recognition:
1. **Input**: Image `storageId` from Convex file storage.
2. **Process**: Sends image prompt to Gemini API.
3. **Output**: Structured JSON containing:
   - Partial Product Name
   - Gluten-Free assessment (Boolean)
   - Risk Level (Safe/Sketchy/Unsafe)
   - Tags & Reasoning

### D. Data Schema
**File**: `convex/schema.ts`

- **`products`**: Stores aggregates (`avgSafety`, `avgTaste`, `voteCount`) and metadata.
- **`votes`**: Individual vote records per user/product. Indexed for fast lookup.
- **`profiles`**: Gamification stats linked to `users`.
- **`users`**: Auth identity and basic info (managed by Better-Auth usage).

## 3. Environment & Config
- **Auth**: Better-Auth handling `users` and sessions.
## 4. Known Regressions
- **Broken Navigation**: The image upload dialog redirects to a legacy `/vibe-check/` route instead of the current `/product/` route.
- **Placeholder Login**: The `/login` route is currently a placeholder and needs to be connected to Better-Auth.
- **Time Decay**: The automated time-decay logic for votes is defined in the roadmap but not yet active in Convex Crons.

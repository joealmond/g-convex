# Migration Gap Analysis

This document identifies features from `g-matrix` that are **MISSING** or **INCOMPLETE** in the current `g-convex` implementation.

## 🔴 Critical Gaps (Must Implement)

### 1. AI Product Analysis
- **Missing**: The `analyzeAndUploadProduct` action logic is missing.
- **Requirement**: Use Convex Actions (`node` environment) to call Google Gemini API with the image prompt.
- **Action**: Port `src/app/actions.ts:analyzeAndUploadProduct` to a Convex Action.

### 2. Advanced Voting Logic
- **Missing**: 
  - Weighted Averages (Registered vs Anonymous).
  - Time Decay calculation (Cron job).
  - Store/GPS tagging in `submitVote`.
- **Current State**: `convex/votes.ts` has a simple `castVote` mutation but lacks the complex math and transactional logic of the original.

### 3. Gamification Engine
- **Missing**: Entire point calculation, badge awarding, and streak tracking logic.
- **Requirement**: Port `src/lib/gamification.ts` logic to Convex mutations.
- **Strategy**: Trigger a `processGamification` internal mutation after a successful vote.

### 4. Scheduled Maintenance
- **Missing**: `recalculateAllProductsWithTimeDecay`.
- **Requirement**: Use Convex Cron (`convex/crons.ts`) to run daily recalculations for time decay.

## 🟡 UI/UX Gaps

### 1. Store & Location Tagging
- **Missing**: UI inputs in `VotingPanel` for Store Name and GPS coordinates.

### 2. Profile & Badges UI
- **Missing**: User profile page showing Points, Badges, and Streaks.
- **Current State**: Basic user profile exists but no gamification stats.

## ✅ Completed / In Progress
- [x] Basic Product Listing
- [x] Matrix Chart Visualization
- [x] Authentication (Better-Auth replaced Firebase)
- [x] Image Upload (Basic)

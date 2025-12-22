# Migration Gap Analysis

This document identifies features from `g-matrix` that are **MISSING** or **INCOMPLETE** in the current `g-convex` implementation.

## 🔴 Critical Gaps (Must Implement)

### 1. Scheduled Maintenance
- **Missing**: `recalculateAllProductsWithTimeDecay`.
- **Requirement**: Use Convex Cron (`convex/crons.ts`) to run daily recalculations for time decay.

## 🟠 Current Issues & Regressions

### 1. Scan Dialog & Product Creation Flow
- **Bug**: In `src/components/product/image-upload-dialog.tsx`, the `handleProductIdentified` function currently navigates to `/vibe-check/$name`, which is a non-existent route.
- **Root Cause**: The route should be `/product/$name`. However, `src/routes/product/$name.tsx` currently displays "Product not found" if the product doesn't exist, instead of integrating the `VotingPanel` for new product submission.
- **Requirement**: 
  - Fix the redirect path in `ImageUploadDialog`.
  - Update `ProductPage` to handle new products by showing the `VotingPanel` when the product is not in the database but an `analysisResult` is available (e.g., from session storage).
  - Replace placeholder voting logic in `ProductPage` with the shared `VotingPanel` component.

### 2. Login Page Failure
- **Bug**: The login route at `src/routes/login.tsx` is currently a placeholder returning "Hello /login!".
- **Root Cause**: Integration with Better-Auth components and `authClient` is missing.
- **Requirement**: Implement a functional login form using the `authClient`.

## 🟡 UI/UX Gaps

### 1. Profile & Badges UI
- **Missing**: User profile page showing Points, Badges, and Streaks.
- **Current State**: Backend logic stores stats in `profiles` table, but no dedicated frontend page exists to visualize them.

## ✅ Completed

### 1. AI Product Analysis
- [x] **Implemented**: `convex/ai.ts` handles image analysis using Google Gemini.
- [x] **Integration**: Integrated into `VotingPanel` for new product creation.

### 2. Advanced Voting Logic
- [x] **Implemented**: `convex/votes.ts` handles Weighted Averages (Registered vs Anonymous).
- [x] **Implemented**: Store and GPS tagging supported in `castVote`.
- [x] **Implemented**: Transactional updates for consistency.

### 3. Gamification Engine
- [x] **Implemented**: Points calculation and Badge awarding logic in `convex/lib/gamification.ts`.
- [x] **Implemented**: Real-time updates triggered transactionally via `castVote`.

### 4. General
- [x] Basic Product Listing
- [x] Matrix Chart Visualization
- [x] Authentication (Better-Auth replaced Firebase)
- [x] Image Upload (Basic)
- [x] Store & Location Tagging UI Inputs

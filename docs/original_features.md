# Original Feature List (g-matrix)

This document outlines the complete feature set of the original `g-matrix` application based on code analysis.

## 1. Core Core (The Matrix)
- **Vibe Check Matrix**: Visualizing products implementation on a 2D axis:
  - **X-Axis**: Taste (1-5)
  - **Y-Axis**: Safety (1-5)
  - **Z-Axis**: Price (1-5) (color/size coded)
- **Dynamic Voting**: Users can vote on "Vibe" (Taste/Safety) and "Value" (Price).
- **Time Decay**: Vote weight decreases over time (exponential decay per year) to prioritize recent feedback.
- **Weighted Voting**: Registered users' votes have higher weight than anonymous users.

## 2. Product Management
- **Image Analysis (AI)**:
  - Uses Google Gemini 2.0 Flash to analyze product images.
  - Automatically extracts: `productName`, `isLikelyGlutenFree`, `riskLevel` (Safe/Sketchy/Unsafe), `tags`, and `reasoning`.
- **Duplicate Detection**: Prevents duplicate product submissions by normalizing specific names.
- **Location Tracking**: Users can tag specific stores and add GPS coordinates to product availability.

## 3. Gamification System
A comprehensive system to incentivize user contributions (`src/lib/gamification.ts`).
- **Scout Points**:
  - Base Vote: 10 pts
  - Price Bonus: +5 pts
  - Store Tag Bonus: +10 pts
  - GPS Bonus: +5 pts
  - New Product Discovery: +25 pts
  - Daily Streak Bonus: +15 pts
- **Badges**:
  - `First Scout`: First vote cast.
  - `Trailblazer`: First to vote on 5 new products.
  - `Location Pro`: Added GPS to 10 votes.
  - `Store Hunter`: Tagged 10 different stores.
  - `Century Scout`: Earned 100 points.
  - `Streak Master`: Voted 7 consecutive days.
- **Streaks**: Tracks daily voting streaks.

## 4. Authentication (Firebase)
- **Anonymous Login**: Users can start voting immediately without an account.
- **Social Login**: Google Auth integration.
- **Profile Management**: Profile tracking statistics (total votes, points, badges).

## 5. Implementation Details
- **Stack**: Next.js (App Router), Firebase (Auth, Firestore, Storage, Functions).
- **Libraries**: `recharts` (Charts), `lucide-react` (Icons), `zod` (Validation), `shadcn/ui` (Components), `genkit` (AI), `next-intl` (i18n).

# Migration Gap Analysis

This document identifies features from `g-matrix` that are **MISSING** or **INCOMPLETE** in the current `g-convex` implementation.

> **Last Updated**: December 2024

## ✅ Completed Features

### Authentication
- [x] Google OAuth via Better-Auth
- [x] Anonymous user support (localStorage UUID)
- [x] Vote migration from anonymous to registered accounts
- [x] Session management

### Voting System
- [x] Safety/Taste/Price voting with weighted averages
- [x] Store and GPS tagging
- [x] Transactional vote updates
- [x] Combined product creation + voting flow

### Gamification
- [x] Points calculation engine
- [x] Badge awarding logic
- [x] Streak tracking
- [x] ScoutCard UI in header
- [x] Profile page with stats

### Internationalization
- [x] EN/HU translation files
- [x] useTranslations hook
- [x] Language switcher component
- [x] localStorage persistence

### Admin Features
- [x] isAdmin detection from profiles
- [x] AdminToolbar component
- [x] Impersonation mode (useImpersonate)

### Scheduled Maintenance
- [x] Time decay cron job (daily at midnight UTC)

### UI/UX
- [x] Matrix chart (Vibe & Value modes)
- [x] Product list with thumbnails
- [x] Product search
- [x] Image upload dialog
- [x] Dynamic header buttons

## 🟡 Partially Complete

### 1. FineTunePanel
- **Status**: Not ported
- **Description**: Draggable dot interface for precise vote adjustment
- **Priority**: Medium

### 2. Design System Alignment
- **Status**: Partial
- **Description**: CSS variables, fonts (Space Grotesk, Inter) need syncing with g-matrix
- **Priority**: Low

### 3. Store Freshness Indicators
- **Status**: Not implemented
- **Description**: Opacity fade based on `lastSeenAt` (30+ days = 30%, 7+ days = 60%)
- **Priority**: Low

## 🔴 Known Issues

### 1. Google OAuth Configuration
- **Issue**: Requires correct redirect URIs in Google Cloud Console
- **Fix**: Add `https://<deployment>.convex.site/api/auth/callback/google`

### 2. Chart Dimension Warnings
- **Issue**: Console warnings about width(-1) and height(-1)
- **Impact**: Visual only, doesn't affect functionality

## 📊 Feature Parity Summary

| Category | g-matrix | g-convex | Status |
|----------|----------|----------|--------|
| Auth (Google) | ✅ | ✅ | Complete |
| Anonymous Voting | ✅ | ✅ | Complete |
| Weighted Votes | ✅ | ✅ | Complete |
| Time Decay | ✅ | ✅ | Complete |
| Gamification | ✅ | ✅ | Complete |
| i18n | ✅ | ✅ | Complete |
| Admin Dashboard | ✅ | ⚠️ | Basic |
| FineTunePanel | ✅ | ❌ | Missing |
| AI Analysis | ✅ | ✅ | Complete |

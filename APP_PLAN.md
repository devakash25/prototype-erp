# DEV ERP - Mobile App Execution Plan

## Tech Stack
- **Framework:** Expo SDK 52+ (React Native)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **State:** Zustand (same as web)
- **API:** Axios (same base URL, shared types)
- **UI Kit:** Custom components + NativeWind (Tailwind CSS for RN) or React Native Paper
- **Storage:** expo-secure-store (replaces localStorage)
- **Build:** EAS Build (Play Store + App Store)

## Project Structure
```
app/                          # Mobile app root (parallel to client/)
├── app/                      # Expo Router file-based routes
│   ├── _layout.tsx           # Root layout (auth check, theme)
│   ├── index.tsx             # Redirect to login/dashboard
│   ├── login.tsx             # Login screen
│   ├── (auth)/               # Auth group
│   │   └── ...
│   ├── (main)/               # Main app group (authenticated)
│   │   ├── _layout.tsx       # Tab/stack navigator
│   │   ├── dashboard.tsx     # Role-based dashboard redirect
│   │   ├── profile.tsx       # Shared profile screen
│   │   ├── notifications.tsx
│   │   ├── chief-head/       # Chief Head screens
│   │   ├── director/         # Director screens
│   │   ├── principal/        # Principal screens
│   │   ├── hod/              # HOD screens
│   │   ├── teacher/          # Teacher screens
│   │   ├── student/          # Student screens
│   │   ├── parent/           # Parent screens
│   │   ├── accountant/       # Accountant screens
│   │   ├── admission/        # Admission screens
│   │   ├── transport/        # Transport screens
│   │   ├── administrative/   # Administrative screens
│   │   ├── librarian/        # Librarian screens
│   │   ├── hostel/           # Hostel screens
│   │   └── ceo/              # CEO screens (Users + Pricing)
├── components/               # Reusable UI components
│   ├── ui/                   # Base components (Button, Card, Input, etc.)
│   ├── dashboard/            # Dashboard-specific components
│   └── shared/               # Shared components (Header, Sidebar, etc.)
├── services/                 # API layer
│   ├── api.ts                # Axios instance (same as web)
│   └── auth.ts               # Auth API calls
├── store/                    # Zustand stores
│   ├── authStore.ts          # Auth state (same logic as web)
│   └── settingsStore.ts      # Theme/settings
├── hooks/                    # Custom hooks
├── utils/                    # Helper functions
├── types/                    # TypeScript types (can share with web)
├── constants/                # Colors, config
├── assets/                   # Icons, splash screens
├── app.json                  # Expo config
├── package.json
└── tsconfig.json
```

## Execution Phases

### Phase 1: Foundation (Day 1)
1. Initialize Expo project with `npx create-expo-app`
2. Set up Expo Router with file-based routing
3. Configure NativeWind (Tailwind for RN)
4. Create base UI components:
   - Button, Card, Input, Badge, Avatar
   - Header, LoadingSpinner, EmptyState
5. Set up Axios API service (same base URL)
6. Set up Zustand stores (auth, settings)
7. Implement SecureStore for token storage
8. Login screen with JWT auth flow

### Phase 2: Shared Infrastructure (Day 2)
1. Auth flow: Login → Token storage → Auto-restore session
2. Role-based navigation system (same logic as web Sidebar)
3. Profile screen (view/edit profile, change password)
4. Notifications screen
5. Dark mode support
6. Push notification setup (expo-notifications)

### Phase 3: Role Dashboards - Wave 1 (Days 3-5)
1. Chief Head Dashboard + Navigation
2. Director Dashboard (11 pages)
3. Principal Dashboard (21 pages)
4. HOD Dashboard (21 pages)

### Phase 4: Role Dashboards - Wave 2 (Days 6-8)
1. Teacher Dashboard (15 pages)
2. Student Dashboard (18 pages)
3. Parent Dashboard (17 pages)
4. CEO Dashboard (2 pages: Users + Pricing)

### Phase 5: Role Dashboards - Wave 3 (Days 9-11)
1. Accountant Dashboard (9 pages)
2. Admission Dashboard (7 pages)
3. Transport Dashboard (11 pages)
4. Administrative Dashboard (9 pages)
5. Librarian Dashboard (8 pages)
6. Hostel Dashboard (8 pages)

### Phase 6: Native Features (Day 12)
1. Push notifications (FCM/APNs)
2. Biometric auth (fingerprint/face)
3. Offline data caching
4. Deep linking
5. Splash screen + app icon

### Phase 7: Build & Deploy (Day 13)
1. EAS Build setup
2. Android APK/AAB build
3. iOS IPA build
4. Store listings (screenshots, descriptions)
5. Submit to Play Store + App Store

## API Reuse
- Same backend (localhost:5001 in dev)
- Same endpoints, same auth flow
- Share TypeScript types between web and app
- API base URL configurable per environment

## Key Differences from Web
| Feature | Web (client/) | App (app/) |
|---------|---------------|------------|
| Routing | React Router | Expo Router |
| Storage | localStorage | expo-secure-store |
| UI | Tailwind CSS | NativeWind (Tailwind RN) |
| Navigation | Sidebar + Router | Tab Bar + Stack Navigator |
| Push | Browser notifications | expo-notifications (FCM/APNs) |
| Auth | JWT + refresh | JWT + refresh + Biometric |
| Build | Vite | EAS Build |

## Role-Based Navigation (App)
- **Bottom Tab Bar** for primary navigation (Dashboard, Users, etc.)
- **Stack Navigator** for nested screens (Detail pages)
- Role detected from JWT → appropriate tab set loaded
- Same as web Sidebar but adapted for mobile UX

## Screen Count Summary
| Role | Pages | Priority |
|------|-------|----------|
| CEO | 2 | Wave 2 |
| Chief Head | ~12 | Wave 1 |
| Director | 11 | Wave 1 |
| Principal | 21 | Wave 1 |
| HOD | 21 | Wave 1 |
| Teacher | 15 | Wave 2 |
| Student | 18 | Wave 2 |
| Parent | 17 | Wave 2 |
| Accountant | 9 | Wave 3 |
| Admission | 7 | Wave 3 |
| Transport | 11 | Wave 3 |
| Administrative | 9 | Wave 3 |
| Librarian | 8 | Wave 3 |
| Hostel | 8 | Wave 3 |
| **Total** | **~168** | |

## Environment Config
```typescript
// app/config.ts
const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:5001/api/v1',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.deverp.com/api/v1',
  },
  production: {
    API_BASE_URL: 'https://api.deverp.com/api/v1',
  },
};
```

## Start Command
```bash
cd app
npx expo start          # Dev server
npx expo run:android    # Android emulator
npx expo run:ios        # iOS simulator
eas build --platform all  # Production build
```

# CharAI Frontend

React + TypeScript SPA for the CharAI precision-agriculture platform. Users draw or upload field boundaries, configure crop and biochar settings, and view AI-generated prescription maps.

---

## Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite (rolldown) | latest | Build tool / dev server |
| Material UI | 7 | Component library |
| React Router | 7 | Client-side routing |
| Leaflet + react-leaflet | latest | Interactive maps |
| @turf/turf | latest | Client-side geospatial operations |
| Playwright | latest | End-to-end testing |

---

## Directory Structure

```
frontend/
├── src/
│   ├── main.tsx                    # App entry point — mounts context providers
│   ├── index.css                   # Global styles
│   │
│   ├── api/
│   │   └── fetch.ts                # All backend API calls (POSTFieldData, GETFields, etc.)
│   │
│   ├── components/                 # Shared, reusable UI components
│   │   ├── AppRoutes.tsx           # Route definitions
│   │   ├── Header.tsx              # Navigation bar with theme toggle and auth menu
│   │   ├── FormTextField.tsx       # Controlled MUI text field wrapper
│   │   └── LoadingProgress.tsx     # Full-page spinner
│   │
│   ├── contexts/                   # React context providers (global state)
│   │   ├── AuthContext.tsx         # Authentication state (user, login, logout, register)
│   │   ├── CoordinateContext.tsx   # Field boundary GeoJSON shared across components
│   │   ├── ThemeContext.tsx        # Light/dark mode toggle (persisted to localStorage)
│   │   └── ToastContext.tsx        # App-wide notification toasts
│   │
│   ├── features/                   # Feature-based modules (barrel-exported via index.ts)
│   │   ├── auth/                   # Route guards
│   │   │   ├── ProtectedRoute.tsx  # Redirects unauthenticated users to /login
│   │   │   ├── PublicRoute.tsx     # Redirects authenticated users away from /login and /signup
│   │   │   └── index.ts
│   │   ├── farm/                   # Field creation workflow (modal form)
│   │   │   ├── FarmBiocharForm.tsx # Full modal form orchestrating the field creation flow
│   │   │   ├── FieldsList.tsx      # Field metadata inputs (name, description, crop type, price)
│   │   │   ├── FileUploadSection.tsx # Upload tab container (wraps ManualCoordinateUpload)
│   │   │   ├── ManualCoordinateUpload.tsx # Interactive Leaflet map for drawing field boundaries
│   │   │   ├── BudgetSettings.tsx  # Biochar cost/rate inputs
│   │   │   ├── SubmitSection.tsx   # Submit button with validation state
│   │   │   └── index.ts
│   │   ├── fieldtable/             # Field list with status polling and prescription viewer
│   │   │   └── FieldTable.tsx
│   │   ├── map/                    # Standalone interactive Leaflet map widget
│   │   │   ├── InteractiveFarmMap.tsx
│   │   │   └── index.ts
│   │   ├── prescriptions/          # Prescription map viewer
│   │   │   ├── PrescriptionMapViewer.tsx # Main map viewer (Leaflet + canvas layer)
│   │   │   ├── Dialog.tsx          # Field detail modal that hosts the viewer
│   │   │   ├── StatsPanel.tsx      # Grid statistics summary
│   │   │   ├── PaybackLegend.tsx   # Payback-period color legend
│   │   │   ├── EmptyPrescriptionData.tsx # Empty-state placeholder
│   │   │   ├── GridCanvasLayer.ts  # Custom Leaflet canvas layer for prescription grid
│   │   │   ├── helpers.ts          # Utility functions for prescription data
│   │   │   ├── types.ts            # TypeScript interfaces for prescription data
│   │   │   └── index.ts
│   │   └── index.ts                # Re-exports all feature modules
│   │
│   ├── pages/                      # Route-level page components (thin wrappers)
│   │   ├── LandingPage.tsx         # Public landing page with hero, features, and field creation CTA
│   │   ├── HomePage.tsx            # Authenticated dashboard with quick-action cards
│   │   ├── LoginPage.tsx           # Login form
│   │   ├── SignupPage.tsx          # Registration form
│   │   ├── ProfilePage.tsx         # User profile, password change, account deletion
│   │   └── FieldPage.tsx           # Fields list page (wraps FieldTable)
│   │
│   ├── services/                   # Business-logic helpers (non-UI)
│   │   ├── authService.ts          # Auth API calls and token management
│   │   └── coordinateService.ts    # parseFileToGeoJSON — converts uploaded files to GeoJSON
│   │
│   ├── styles/                     # MUI theme and color constants
│   │   ├── theme.ts                # createAppTheme(mode) — MUI theme factory
│   │   └── colors.ts               # Named color palette constants (COLORS)
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── auth.ts                 # Auth-related interfaces (User, LoginRequest, FieldErrors, etc.)
│   │   └── fetch.ts                # API response types (CropType, etc.)
│   │
│   └── utils/                      # Shared utility functions
│       ├── errors.ts               # normalizeSignupErrors, normalizeErrors
│       ├── format.ts               # formatTimestamp, formatPrice, truncateId, capitalize
│       └── theme.ts                # getPageGradientBg(theme) — standard page background helper
│
├── tests/
│   ├── charai.spec.ts              # Playwright E2E tests
│   └── playwright.config.ts        # Playwright configuration
│
├── public/                         # Static assets
├── index.html                      # HTML entry template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Routes

| Path | Auth | Component |
|------|------|-----------|
| `/` | Adaptive | `HomePage` (authenticated) or `LandingPage` (anonymous) |
| `/login` | Public only | `LoginPage` |
| `/signup` | Public only | `SignupPage` |
| `/profile` | Protected | `ProfilePage` |
| `/fields` | Protected | `FieldPage` → `FieldTable` |
| `*` | Adaptive | Same as `/` |

---

## Authentication

- **Token storage**: Auth token stored in `localStorage` under `authToken`
- **Protected routes**: Guarded by `ProtectedRoute` / `PublicRoute` components in `features/auth/`
- **Auth context**: Centralized state via `AuthContext` (`login`, `logout`, `register`, `checkAuth`, `isAuthenticated`, `user`, `isLoading`)
- **API auth**: All authenticated requests include `Authorization: Token <token>` header

---

## Coding Conventions

- **Feature-based organization**: Group related components, hooks, and types under `features/<name>/` with barrel `index.ts` exports
- **Pages are thin**: Page components compose feature components. Business logic stays in features/services/contexts
- **Context for global state**: `AuthContext`, `CoordinateContext`, `ThemeContext`, `ToastContext` — no Redux
- **API layer**: All backend calls go through `src/api/fetch.ts` using native `fetch()`
- **TypeScript strict mode**: All types defined in `src/types/`. Avoid `any`
- **MUI theming**: Use MUI components and `@emotion/styled`. Avoid raw CSS where MUI handles it
- **`data-testid` attributes**: Add to all interactive elements — Playwright E2E tests depend on them
- **Logging**: Use `console.debug` for dev-only output. No `console.log` in production paths

---

## Testing

E2E tests use Playwright in `frontend/tests/`. Selectors rely on `data-testid` attributes.

```bash
# Run headless
cd tests && npx playwright test

# Run headed (for debugging)
cd tests && HEADLESS=false npx playwright test
```

Always update `charai.spec.ts` when changing `data-testid` values, form inputs, API payload shapes, or UI flow.

---

## Theme

The app supports light and dark modes, toggled from the header. The selected mode is persisted to `localStorage`.

- Theme is created by `createAppTheme(mode)` in `src/styles/theme.ts`
- Color constants live in `src/styles/colors.ts`
- `ThemeContext` wraps the app and provides the toggle
- Page-level background gradients use `getPageGradientBg(theme)` from `src/utils/theme.ts`

